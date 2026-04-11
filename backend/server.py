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
from datetime import datetime, timezone, timedelta
import requests
from fastapi.responses import Response
import json
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

STORAGE_URL = "https://integrations.emergentagent.com/objstore/api/v1/storage"
EMERGENT_KEY = os.environ.get("EMERGENT_LLM_KEY")
APP_NAME = "campuscrave"
storage_key = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

PLATFORM_COMMISSION = 0.12  # 12% commission

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
    resp = requests.put(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key, "Content-Type": content_type}, data=data, timeout=120)
    resp.raise_for_status()
    return resp.json()

def get_object(path: str) -> tuple:
    key = init_storage()
    resp = requests.get(f"{STORAGE_URL}/objects/{path}", headers={"X-Storage-Key": key}, timeout=60)
    resp.raise_for_status()
    return resp.content, resp.headers.get("Content-Type", "application/octet-stream")

# Models
class UserRegister(BaseModel):
    email: str
    password: str
    name: str
    role: str
    venue_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

# ── AUTH ──
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    referral_code = f"CC{uuid.uuid4().hex[:6].upper()}"
    user_dict = {
        "id": str(uuid.uuid4()),
        "email": user_data.email,
        "password": user_data.password,
        "name": user_data.name,
        "role": user_data.role,
        "credits": 100,
        "loyalty_points": 0,
        "venue_id": user_data.venue_id,
        "referral_code": referral_code,
        "referred_by": None,
        "referral_count": 0,
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

@api_router.get("/auth/me")
async def get_me(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ── REFERRAL ──
@api_router.post("/referral/apply")
async def apply_referral(data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    code = data.get("code", "").strip().upper()
    referrer = await db.users.find_one({"referral_code": code})
    if not referrer:
        raise HTTPException(status_code=404, detail="Invalid referral code")
    if referrer["id"] == user_id:
        raise HTTPException(status_code=400, detail="Cannot refer yourself")
    me = await db.users.find_one({"id": user_id})
    if me.get("referred_by"):
        raise HTTPException(status_code=400, detail="You have already used a referral code")
    await db.users.update_one({"id": user_id}, {"$set": {"referred_by": referrer["id"]}, "$inc": {"credits": 25}})
    await db.users.update_one({"id": referrer["id"]}, {"$inc": {"credits": 50, "referral_count": 1}})
    return {"message": "Referral applied! You got 25 credits, your friend got 50 credits."}

# ── VENUES ──
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

# ── SEARCH (for voice) ──
@api_router.get("/search")
async def search_items(q: str):
    items = await db.menu_items.find(
        {"name": {"$regex": q, "$options": "i"}, "is_available": True},
        {"_id": 0}
    ).to_list(50)
    return items

# ── OFFERS ──
@api_router.get("/offers")
async def get_offers():
    offers = await db.offers.find({"is_active": True}, {"_id": 0}).to_list(100)
    return offers

# ── TRENDING / SPECIALS ──
@api_router.get("/trending")
async def get_trending():
    # Get top-ordered items from order history
    pipeline = [
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.menu_item_id", "count": {"$sum": "$items.quantity"}, "name": {"$first": "$items.name"}, "image_url": {"$first": "$items.image_url"}, "price": {"$first": "$items.price"}}},
        {"$sort": {"count": -1}},
        {"$limit": 6}
    ]
    trending = []
    async for doc in db.orders.aggregate(pipeline):
        doc.pop("_id", None)
        trending.append(doc)
    # If no orders yet, return random menu items
    if not trending:
        items = await db.menu_items.find({"is_available": True}, {"_id": 0}).to_list(1000)
        trending = random.sample(items, min(6, len(items)))
    return trending

@api_router.get("/specials")
async def get_specials(authorization: str = Header(None)):
    # Random specials (in real app, personalized)
    items = await db.menu_items.find({"is_available": True}, {"_id": 0}).to_list(1000)
    specials = random.sample(items, min(4, len(items)))
    return specials

# ── CART ──
@api_router.post("/cart")
async def add_to_cart(item: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    # Check if item already in cart
    existing = await db.cart.find_one({"user_id": user_id, "menu_item_id": item["menu_item_id"]})
    if existing:
        await db.cart.update_one({"id": existing["id"]}, {"$inc": {"quantity": item["quantity"]}})
        updated = await db.cart.find_one({"id": existing["id"]}, {"_id": 0})
        return updated
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
    for item in cart_items:
        menu_item = await db.menu_items.find_one({"id": item["menu_item_id"]}, {"_id": 0})
        if menu_item:
            item["menu_item"] = menu_item
    return cart_items

@api_router.patch("/cart/{item_id}")
async def update_cart_item(item_id: str, data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await db.cart.update_one({"id": item_id}, {"$set": {"quantity": data["quantity"]}})
    return {"success": True}

@api_router.delete("/cart/{item_id}")
async def remove_from_cart(item_id: str, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await db.cart.delete_one({"id": item_id})
    return {"success": True}

# ── PAYMENT (mock) ──
@api_router.post("/payment/process")
async def process_payment(data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    method = data.get("method", "upi")  # upi, card, wallet, credits
    amount = data.get("amount", 0)

    if method == "credits":
        user = await db.users.find_one({"id": user_id})
        if user["credits"] < amount:
            raise HTTPException(status_code=400, detail="Insufficient credits")
        await db.users.update_one({"id": user_id}, {"$inc": {"credits": -int(amount)}})

    payment = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "amount": amount,
        "method": method,
        "status": "success",
        "transaction_id": f"TXN{uuid.uuid4().hex[:12].upper()}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payments.insert_one(payment)
    payment.pop("_id", None)
    return payment

# ── ORDERS ──
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
        "payment_method": order_data.get("payment_method", "upi"),
        "status": "incoming",
        "agent_location": {"x": 50, "y": 50},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "estimated_time": 20
    }
    await db.orders.insert_one(order)
    await db.cart.delete_many({"user_id": user_id})
    # Award loyalty points (1 point per 10 rupees)
    points = int(order_data["total_amount"] / 10)
    await db.users.update_one({"id": user_id}, {"$inc": {"loyalty_points": points}})
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
        orders = await db.orders.find({"venue_id": user.get("venue_id")}, {"_id": 0}).to_list(1000)
    else:
        query = {"venue_id": venue_id} if venue_id else {}
        orders = await db.orders.find(query, {"_id": 0}).to_list(1000)
    return orders

@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    await db.orders.update_one({"id": order_id}, {"$set": {"status": status_data["status"], "updated_at": datetime.now(timezone.utc).isoformat()}})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    await manager.send_personal_message({"type": "order_update", "order": order}, order["user_id"])
    return order

@api_router.patch("/orders/{order_id}/location")
async def update_agent_location(order_id: str, location: dict):
    await db.orders.update_one({"id": order_id}, {"$set": {"agent_location": location}})
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    await manager.send_personal_message({"type": "location_update", "order": order}, order["user_id"])
    return {"success": True}

# ── REVIEWS ──
@api_router.post("/reviews")
async def create_review(review_data: dict, authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "name": 1})
    review = {
        "id": str(uuid.uuid4()),
        "order_id": review_data["order_id"],
        "user_id": user_id,
        "user_name": user["name"] if user else "Anonymous",
        "venue_id": review_data["venue_id"],
        "rating": review_data["rating"],
        "comment": review_data["comment"],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.reviews.insert_one(review)
    reviews = await db.reviews.find({"venue_id": review_data["venue_id"]}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.venues.update_one({"id": review_data["venue_id"]}, {"$set": {"rating": round(avg_rating, 1)}})
    review.pop("_id", None)
    return review

@api_router.get("/reviews/{venue_id}")
async def get_reviews(venue_id: str):
    reviews = await db.reviews.find({"venue_id": venue_id}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return reviews

# ── UPLOAD ──
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

# ── EXTERNAL ORDERS ──
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

# ── OUTLET ANALYTICS ──
@api_router.get("/outlet/analytics")
async def get_outlet_analytics(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user_id = authorization.replace("Bearer ", "")
    user = await db.users.find_one({"id": user_id})
    if not user or user["role"] != "outlet_staff":
        raise HTTPException(status_code=403, detail="Forbidden")
    venue_id = user.get("venue_id")
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    all_orders = await db.orders.find({"venue_id": venue_id}, {"_id": 0}).to_list(10000)
    today_orders = [o for o in all_orders if o["created_at"] >= today_start]
    
    total_earnings = sum(o["total_amount"] for o in all_orders)
    today_earnings = sum(o["total_amount"] for o in today_orders)
    commission_paid = total_earnings * PLATFORM_COMMISSION
    net_earnings = total_earnings - commission_paid
    
    reviews = await db.reviews.find({"venue_id": venue_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews) if reviews else 0
    
    # Top items
    item_counts = {}
    for o in all_orders:
        for item in o.get("items", []):
            name = item.get("name", "Unknown")
            item_counts[name] = item_counts.get(name, 0) + item.get("quantity", 1)
    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "total_orders": len(all_orders),
        "today_orders": len(today_orders),
        "total_earnings": total_earnings,
        "today_earnings": today_earnings,
        "commission_paid": commission_paid,
        "net_earnings": net_earnings,
        "commission_rate": PLATFORM_COMMISSION * 100,
        "avg_rating": round(avg_rating, 1),
        "total_reviews": len(reviews),
        "recent_reviews": reviews[:5],
        "top_items": [{"name": n, "count": c} for n, c in top_items]
    }

# ── ADMIN ANALYTICS (enhanced) ──
@api_router.get("/analytics")
async def get_analytics(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
    
    total_orders = await db.orders.count_documents({})
    total_revenue = sum([o["total_amount"] async for o in db.orders.find({}, {"total_amount": 1})])
    platform_profit = total_revenue * PLATFORM_COMMISSION
    
    today_orders_count = await db.orders.count_documents({"created_at": {"$gte": today_start}})
    today_revenue = sum([o["total_amount"] async for o in db.orders.find({"created_at": {"$gte": today_start}}, {"total_amount": 1})])
    
    total_users = await db.users.count_documents({"role": "student"})
    total_referrals = sum([u.get("referral_count", 0) async for u in db.users.find({}, {"referral_count": 1})])
    
    venues = await db.venues.find({}, {"_id": 0}).to_list(1000)
    venue_stats = []
    for venue in venues:
        count = await db.orders.count_documents({"venue_id": venue["id"]})
        rev = sum([o["total_amount"] async for o in db.orders.find({"venue_id": venue["id"]}, {"total_amount": 1})])
        venue_stats.append({"name": venue["name"], "orders": count, "revenue": rev})
    
    # Top items across platform
    pipeline = [
        {"$unwind": "$items"},
        {"$group": {"_id": "$items.name", "count": {"$sum": "$items.quantity"}}},
        {"$sort": {"count": -1}},
        {"$limit": 5}
    ]
    top_items = []
    async for doc in db.orders.aggregate(pipeline):
        top_items.append({"name": doc["_id"], "count": doc["count"]})
    
    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "platform_profit": platform_profit,
        "commission_rate": PLATFORM_COMMISSION * 100,
        "today_orders": today_orders_count,
        "today_revenue": today_revenue,
        "total_users": total_users,
        "total_referrals": total_referrals,
        "venue_stats": venue_stats,
        "top_items": top_items
    }

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
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

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
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
