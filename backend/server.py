from fastapi import FastAPI, APIRouter, HTTPException, Header, Query, File, UploadFile, WebSocket, WebSocketDisconnect
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import requests
from fastapi.responses import Response
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Object Storage Setup
STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "campuscrave"
storage_key = None

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_personal_message(self, message: dict, client_id: str):
        if client_id in self.active_connections:
            try:
                await self.active_connections[client_id].send_json(message)
            except:
                pass
    
    async def broadcast(self, message: dict, role: str = None):
        for client_id, connection in list(self.active_connections.items()):
            try:
                if role is None or client_id.startswith(role):
                    await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# Storage functions
def init_storage():
    global storage_key
    if storage_key:
        return storage_key
    resp = requests.post(f"{STORAGE_URL}/init", json={"emergent_key": EMERGENT_KEY}, timeout=30)
    resp.raise_for_status()
    storage_key = resp.json()["storage_key"]
    return storage_key

def put_object(path: str, data: bytes, content_type: str) -> dict:
    key = init_storage()
    resp = requests.put(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key, "Content-Type": content_type},
        data=data, timeout=120
    )
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(
        f"{STORAGE_URL}/objects/{path}",
        headers={"X-Storage-Key": key}, timeout=60
    )
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Models
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str  # student, outlet_staff, admin
    venue_id: Optional[str] = None  # for outlet_staff

class UserLogin(BaseModel):
    email: str
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    name: str
    role: str
    credits: int = 100
    venue_id: Optional[str] = None
    created_at: str

class Venue(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    name: str
    type: str  # food_court, provision_store
    banner_url: str
    description: str = ""
    rating: float = 0.0
    is_active: bool = True

class MenuItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    venue_id: str
    name: str
    description: str
    price: float
    image_url: str
    video_url: Optional[str] = None
    category: str
    ingredients: Optional[str] = None
    health_score: Optional[int] = None
    nutritional_info: Optional[str] = None
    allergens: Optional[str] = None
    stock: Optional[int] = None  # for provision stores
    is_available: bool = True

class CartItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    menu_item_id: str
    quantity: int
    special_instructions: Optional[str] = None

class Order(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    items: List[dict]
    total_amount: float
    delivery_location: str
    status: str  # incoming, preparing, ready, picked_up, delivered
    agent_location: Optional[dict] = None  # {x: float, y: float}
    created_at: str
    updated_at: str
    venue_id: str
    estimated_time: int = 20

class Review(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    order_id: str
    user_id: str
    venue_id: str
    rating: int
    comment: str
    created_at: str

class ExternalOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    screenshot_url: str
    delivery_time: str
    delivery_location: str
    status: str  # requested, agent_assigned, picked_up, delivered
    agent_location: Optional[dict] = None
    created_at: str

# API Routes
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": user_data.password,  # In production, hash this
        "name": user_data.name,
        "role": user_data.role,
        "credits": 100,
        "venue_id": user_data.venue_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_dict)
    user_dict.pop("password")
    user_dict.pop("_id", None)
    return {"user": user_dict, "token": user_dict["id"]}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email, "password": credentials.password})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    user.pop("password")
    user.pop("_id", None)
    return {"user": user, "token": user["id"]}

@api_router.get("/venues")
async def get_venues(type: Optional[str] = None):
    query = {"is_active": True}
    if type:
        query["type"] = type
    venues = await db.venues.find(query, {"_id": 0}).to_list(1000)
    return venues

@api_router.get("/venues/{venue_id}/menu")
async def get_menu(venue_id: str):
    items = await db.menu_items.find({"venue_id": venue_id, "is_available": True}, {"_id": 0}).to_list(1000)
    return items

@api_router.post("/cart")
async def add_to_cart(item: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    
    cart_item = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "menu_item_id": item["menu_item_id"],
        "quantity": item["quantity"],
        "special_instructions": item.get("special_instructions", "")
    }
    await db.cart.insert_one(cart_item)
    cart_item.pop("_id", None)
    return cart_item

@api_router.get("/cart")
async def get_cart(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    cart_items = await db.cart.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    # Populate with menu item details
    for item in cart_items:
        menu_item = await db.menu_items.find_one({"id": item["menu_item_id"]}, {"_id": 0})
        if menu_item:
            item["menu_item"] = menu_item
    
    return cart_items

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await db.cart.delete_one({"id": item_id})
    return {"success": True}

@api_router.post("/orders")
async def create_order(order_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    
    order = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "items": order_data["items"],
        "total_amount": order_data["total_amount"],
        "delivery_location": order_data["delivery_location"],
        "venue_id": order_data["venue_id"],
        "status": "incoming",
        "agent_location": {"x": 50, "y": 50},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "estimated_time": 20
    }
    await db.orders.insert_one(order)
    
    # Clear cart
    await db.cart.delete_many({"user_id": user_id})
    
    # Broadcast to outlet staff
    await manager.broadcast({"type": "new_order", "order": order}, role="outlet")
    
    order.pop("_id", None)
    return order

@api_router.get("/orders")
async def get_orders(authorization: str = Header(None), venue_id: Optional[str] = None):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["role"] == "student":
        orders = await db.orders.find({"user_id": user_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    elif user["role"] == "outlet_staff":
        orders = await db.orders.find({"venue_id": user["venue_id"]}, {"_id": 0}).to_list(1000)
    else:  # admin
        query = {"venue_id": venue_id} if venue_id else {}
        orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    
    return orders

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": status_data["status"], "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    
    # Notify student
    await manager.send_personal_message({"type": "order_update", "order": order}, order["user_id"])
    
    return order

@api_router.patch("/orders/{order_id}/location")
async def update_agent_location(order_id: str, location: dict):
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"agent_location": location}}
    )
    
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    await manager.send_personal_message({"type": "location_update", "order": order}, order["user_id"])
    
    return {"success": True}

@api_router.post("/reviews")
async def create_review(review_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    
    review = {
        "id": str(uuid.uuid4()),
        "order_id": review_data["order_id"],
        "user_id": user_id,
        "venue_id": review_data["venue_id"],
        "rating": review_data["rating"],
        "comment": review_data["comment"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    
    # Update venue average rating
    reviews = await db.reviews.find({"venue_id": review_data["venue_id"]}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.venues.update_one({"id": review_data["venue_id"]}, {"$set": {"rating": avg_rating}})
    
    review.pop("_id", None)
    return review

@api_router.get("/reviews/{venue_id}")
async def get_reviews(venue_id: str):
    reviews = await db.reviews.find({"venue_id": venue_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    for review in reviews:
        user = await db.users.find_one({"id": review["user_id"]}, {"_id": 0, "name": 1})
        review["user_name"] = user["name"] if user else "Anonymous"
    return reviews

@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    path = f"{APP_NAME}/uploads/{uuid.uuid4()}.{ext}"
    data = await file.read()
    result = put_object(path, data, file.content_type or "application/octet-stream")
    
    file_doc = {
        "id": str(uuid.uuid4()),
        "storage_path": result["path"],
        "original_filename": file.filename,
        "content_type": file.content_type,
        "size": result["size"],
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.files.insert_one(file_doc)
    file_doc.pop("_id", None)
    
    return {"url": f"/api/files/{result['path']}", "path": result["path"]}

@api_router.get("/files/{path:path}")
async def download_file(path: str):
    record = await db.files.find_one({"storage_path": path, "is_deleted": False})
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    data, content_type = get_object(path)
    return Response(content=data, media_type=record.get("content_type", content_type))

@api_router.post("/external-orders")
async def create_external_order(order_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    
    external_order = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "screenshot_url": order_data["screenshot_url"],
        "delivery_time": order_data["delivery_time"],
        "delivery_location": order_data["delivery_location"],
        "status": "requested",
        "agent_location": {"x": 10, "y": 10},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.external_orders.insert_one(external_order)
    external_order.pop("_id", None)
    return external_order

@api_router.get("/analytics")
async def get_analytics(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    total_orders = await db.orders.count_documents({})
    total_revenue = sum([o["total_amount"] async for o in db.orders.find({}, {"total_amount": 1})])
    
    # Orders by venue
    venues = await db.venues.find({}, {"_id": 0}).to_list(1000)
    venue_stats = []
    for venue in venues:
        count = await db.orders.count_documents({"venue_id": venue["id"]})
        venue_stats.append({"name": venue["name"], "orders": count})
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "venue_stats": venue_stats
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        manager.disconnect(client_id)

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup():
    try:
        init_storage()
        logger.info("Storage initialized")
    except Exception as e:
        logger.error(f"Storage init failed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
