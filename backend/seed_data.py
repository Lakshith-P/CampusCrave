import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def seed_data():
    await db.venues.delete_many({})
    await db.menu_items.delete_many({})
    await db.users.delete_many({})
    await db.cart.delete_many({})
    await db.orders.delete_many({})
    await db.reviews.delete_many({})

    # Users
    users = [
        {
            "id": "admin-001",
            "email": "admin@campuscrave.com",
            "password": "admin123",
            "name": "Admin User",
            "role": "admin",
            "credits": 0,
            "venue_id": None,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "staff-001",
            "email": "dominos@campuscrave.com",
            "password": "staff123",
            "name": "Dominos Staff",
            "role": "outlet_staff",
            "venue_id": "venue-001",
            "credits": 0,
            "created_at": "2025-01-01T00:00:00Z"
        },
        {
            "id": "student-001",
            "email": "student@lpu.in",
            "password": "student123",
            "name": "Rahul Sharma",
            "role": "student",
            "credits": 100,
            "venue_id": None,
            "created_at": "2025-01-01T00:00:00Z"
        }
    ]
    await db.users.insert_many(users)

    # Venues
    venues = [
        {
            "id": "venue-001", "name": "Dominos", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1773620496832-9b62e8912452?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw0fHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85",
            "description": "Delicious pizzas delivered hot!", "rating": 4.5, "is_active": True
        },
        {
            "id": "venue-002", "name": "Punjabi Tadka", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1559561724-732dbca7be1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB0aGFsaSUyMGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3NzU5MTkzMjN8MA&ixlib=rb-4.1.0&q=85",
            "description": "Authentic North Indian cuisine", "rating": 4.3, "is_active": True
        },
        {
            "id": "venue-003", "name": "Hangouts", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1763689389824-dd2cea2e5772?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxidXJnZXIlMjBhbmQlMjBmcmllcyUyMGNvbWJvfGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85",
            "description": "Burgers, fries, and chill vibes!", "rating": 4.2, "is_active": True
        },
        {
            "id": "venue-004", "name": "Subway", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1764344815160-0e2afc6939a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxzdWJ3YXklMjBzYW5kd2ljaCUyMHJlc3RhdXJhbnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85",
            "description": "Fresh subs made your way", "rating": 4.1, "is_active": True
        },
        {
            "id": "venue-005", "name": "Amul Ice Creams", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1702564696095-ba5110856bf2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxpY2UlMjBjcmVhbSUyMHN1bmRhZSUyMGRlc3NlcnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85",
            "description": "Cool desserts and ice cream treats", "rating": 4.6, "is_active": True
        },
        {
            "id": "venue-006", "name": "Hungry Pandas", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1716535232835-6d56282dfe8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlcyUyMGZvb2R8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85",
            "description": "Chinese & pan-Asian street food", "rating": 4.0, "is_active": True
        },
        {
            "id": "venue-007", "name": "Oven Express", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1767065603803-a41d2e25a34c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85",
            "description": "Quick bites, toast, and bakery items", "rating": 3.9, "is_active": True
        },
        {
            "id": "venue-008", "name": "Kitchette", "type": "food_court",
            "banner_url": "https://images.unsplash.com/photo-1657225953401-5f95007fc8e0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwxfHxpY2UlMjBjcmVhbSUyMHN1bmRhZSUyMGRlc3NlcnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85",
            "description": "Multi-cuisine comfort food", "rating": 4.4, "is_active": True
        },
        {
            "id": "venue-009", "name": "Campus Mart", "type": "provision_store",
            "banner_url": "https://images.unsplash.com/photo-1739065882957-7db99eaf9a08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85",
            "description": "Your daily essentials store", "rating": 4.1, "is_active": True
        },
        {
            "id": "venue-010", "name": "Night Store", "type": "provision_store",
            "banner_url": "https://images.unsplash.com/photo-1765741836929-af2f9e1968e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85",
            "description": "Open late for midnight cravings", "rating": 4.4, "is_active": True
        },
        {
            "id": "venue-011", "name": "Stationery Hub", "type": "provision_store",
            "banner_url": "https://images.unsplash.com/photo-1739065882957-7db99eaf9a08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85",
            "description": "Pens, notebooks, and campus essentials", "rating": 4.0, "is_active": True
        }
    ]
    await db.venues.insert_many(venues)

    # Menu Items
    menu_items = [
        # Dominos
        {"id": "item-001", "venue_id": "venue-001", "name": "Margherita Pizza", "description": "Classic cheese and tomato pizza", "price": 199.0, "image_url": "https://images.unsplash.com/photo-1773620496832-9b62e8912452?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw0fHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85", "category": "Pizza", "ingredients": "Mozzarella, Tomato Sauce, Fresh Basil", "health_score": 75, "nutritional_info": "Calories: 250 | Protein: 12g | Carbs: 30g", "allergens": "Gluten, Dairy", "is_available": True},
        {"id": "item-002", "venue_id": "venue-001", "name": "Pepperoni Pizza", "description": "Loaded with spicy pepperoni slices", "price": 249.0, "image_url": "https://images.unsplash.com/photo-1767065603803-a41d2e25a34c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHwyfHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85", "category": "Pizza", "ingredients": "Mozzarella, Pepperoni, Tomato Sauce", "health_score": 65, "nutritional_info": "Calories: 300 | Protein: 15g | Carbs: 32g", "allergens": "Gluten, Dairy", "is_available": True},
        {"id": "item-003", "venue_id": "venue-001", "name": "Garlic Breadsticks", "description": "Crispy garlic bread with dip", "price": 99.0, "image_url": "https://images.unsplash.com/photo-1773620496832-9b62e8912452?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODF8MHwxfHNlYXJjaHw0fHxkZWxpY2lvdXMlMjBwaXp6YSUyMHNsaWNlJTIwcGhvdG9ncmFwaHl8ZW58MHx8fHwxNzc1OTE5MzIzfDA&ixlib=rb-4.1.0&q=85", "category": "Sides", "ingredients": "Bread, Garlic, Butter, Herbs", "health_score": 55, "nutritional_info": "Calories: 180 | Protein: 5g | Carbs: 22g", "allergens": "Gluten, Dairy", "is_available": True},

        # Punjabi Tadka
        {"id": "item-004", "venue_id": "venue-002", "name": "Dal Makhani Thali", "description": "Complete thali with dal, rice, roti, raita", "price": 150.0, "image_url": "https://images.unsplash.com/photo-1559561724-732dbca7be1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB0aGFsaSUyMGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3NzU5MTkzMjN8MA&ixlib=rb-4.1.0&q=85", "category": "Thali", "ingredients": "Dal, Rice, Roti, Raita, Pickle", "health_score": 80, "nutritional_info": "Calories: 400 | Protein: 18g | Carbs: 65g", "allergens": "Gluten, Dairy", "is_available": True},
        {"id": "item-005", "venue_id": "venue-002", "name": "Paneer Butter Masala", "description": "Rich and creamy paneer in butter gravy", "price": 180.0, "image_url": "https://images.unsplash.com/photo-1559561724-732dbca7be1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB0aGFsaSUyMGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3NzU5MTkzMjN8MA&ixlib=rb-4.1.0&q=85", "category": "Curry", "ingredients": "Paneer, Tomatoes, Cream, Butter, Spices", "health_score": 70, "nutritional_info": "Calories: 350 | Protein: 16g | Carbs: 25g", "allergens": "Dairy", "is_available": True},
        {"id": "item-006", "venue_id": "venue-002", "name": "Chole Bhature", "description": "Spicy chickpeas with fluffy fried bread", "price": 120.0, "image_url": "https://images.unsplash.com/photo-1559561724-732dbca7be1e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxpbmRpYW4lMjB0aGFsaSUyMGZvb2QlMjBwaG90b2dyYXBoeXxlbnwwfHx8fDE3NzU5MTkzMjN8MA&ixlib=rb-4.1.0&q=85", "category": "Main", "ingredients": "Chickpeas, Flour, Spices, Oil", "health_score": 60, "nutritional_info": "Calories: 450 | Protein: 14g | Carbs: 55g", "allergens": "Gluten", "is_available": True},

        # Hangouts
        {"id": "item-007", "venue_id": "venue-003", "name": "Classic Burger Combo", "description": "Burger with crispy fries and a cold drink", "price": 120.0, "image_url": "https://images.unsplash.com/photo-1763689389824-dd2cea2e5772?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxidXJnZXIlMjBhbmQlMjBmcmllcyUyMGNvbWJvfGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Combo", "ingredients": "Bun, Patty, Lettuce, Cheese, Fries", "health_score": 55, "nutritional_info": "Calories: 650 | Protein: 25g | Carbs: 70g", "allergens": "Gluten, Dairy", "is_available": True},
        {"id": "item-008", "venue_id": "venue-003", "name": "Chicken Wings (6pc)", "description": "Crispy fried chicken wings with dip", "price": 180.0, "image_url": "https://images.unsplash.com/photo-1763689389824-dd2cea2e5772?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwzfHxidXJnZXIlMjBhbmQlMjBmcmllcyUyMGNvbWJvfGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Snacks", "ingredients": "Chicken, Flour, Spices, Oil", "health_score": 50, "nutritional_info": "Calories: 420 | Protein: 30g | Carbs: 20g", "allergens": "Gluten", "is_available": True},

        # Subway
        {"id": "item-009", "venue_id": "venue-004", "name": "Veggie Delight Sub", "description": "Fresh vegetables on Italian bread", "price": 179.0, "image_url": "https://images.unsplash.com/photo-1764344815160-0e2afc6939a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxzdWJ3YXklMjBzYW5kd2ljaCUyMHJlc3RhdXJhbnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Sub", "ingredients": "Italian Bread, Lettuce, Tomato, Onion, Peppers", "health_score": 85, "nutritional_info": "Calories: 230 | Protein: 8g | Carbs: 44g", "allergens": "Gluten", "is_available": True},
        {"id": "item-010", "venue_id": "venue-004", "name": "Chicken Teriyaki Sub", "description": "Glazed chicken with teriyaki sauce", "price": 249.0, "image_url": "https://images.unsplash.com/photo-1764344815160-0e2afc6939a0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxzdWJ3YXklMjBzYW5kd2ljaCUyMHJlc3RhdXJhbnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Sub", "ingredients": "Italian Bread, Chicken, Teriyaki Sauce, Veggies", "health_score": 70, "nutritional_info": "Calories: 350 | Protein: 22g | Carbs: 45g", "allergens": "Gluten, Soy", "is_available": True},

        # Amul Ice Creams
        {"id": "item-011", "venue_id": "venue-005", "name": "Chocolate Sundae", "description": "Rich chocolate ice cream with hot fudge", "price": 80.0, "image_url": "https://images.unsplash.com/photo-1702564696095-ba5110856bf2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxpY2UlMjBjcmVhbSUyMHN1bmRhZSUyMGRlc3NlcnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Dessert", "ingredients": "Milk, Chocolate, Sugar, Cream", "health_score": 40, "nutritional_info": "Calories: 320 | Protein: 5g | Carbs: 45g", "allergens": "Dairy", "is_available": True},
        {"id": "item-012", "venue_id": "venue-005", "name": "Mango Kulfi", "description": "Traditional Indian mango ice cream", "price": 60.0, "image_url": "https://images.unsplash.com/photo-1702564696095-ba5110856bf2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2OTV8MHwxfHNlYXJjaHwyfHxpY2UlMjBjcmVhbSUyMHN1bmRhZSUyMGRlc3NlcnR8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Dessert", "ingredients": "Milk, Mango, Sugar, Cardamom", "health_score": 50, "nutritional_info": "Calories: 200 | Protein: 4g | Carbs: 30g", "allergens": "Dairy", "is_available": True},

        # Hungry Pandas
        {"id": "item-013", "venue_id": "venue-006", "name": "Hakka Noodles", "description": "Stir-fried noodles with vegetables", "price": 110.0, "image_url": "https://images.unsplash.com/photo-1716535232835-6d56282dfe8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlcyUyMGZvb2R8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Noodles", "ingredients": "Noodles, Vegetables, Soy Sauce, Chili", "health_score": 65, "nutritional_info": "Calories: 380 | Protein: 10g | Carbs: 55g", "allergens": "Gluten, Soy", "is_available": True},
        {"id": "item-014", "venue_id": "venue-006", "name": "Manchurian Dry", "description": "Crispy veggie balls in spicy sauce", "price": 130.0, "image_url": "https://images.unsplash.com/photo-1716535232835-6d56282dfe8a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxjaGluZXNlJTIwbm9vZGxlcyUyMGZvb2R8ZW58MHx8fHwxNzc1OTIwNDgxfDA&ixlib=rb-4.1.0&q=85", "category": "Starter", "ingredients": "Cabbage, Corn Flour, Soy Sauce, Chili", "health_score": 55, "nutritional_info": "Calories: 280 | Protein: 6g | Carbs: 30g", "allergens": "Gluten, Soy", "is_available": True},

        # Provision Stores
        {"id": "item-015", "venue_id": "venue-009", "name": "Notebook Bundle (3 pack)", "description": "200-page ruled notebooks", "price": 80.0, "image_url": "https://images.unsplash.com/photo-1739065882957-7db99eaf9a08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Stationery", "stock": 50, "is_available": True},
        {"id": "item-016", "venue_id": "venue-009", "name": "Maggi Noodles (4 pack)", "description": "Instant noodles for quick meals", "price": 56.0, "image_url": "https://images.unsplash.com/photo-1765741836929-af2f9e1968e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Food", "stock": 200, "is_available": True},
        {"id": "item-017", "venue_id": "venue-009", "name": "Toothpaste + Brush Combo", "description": "Colgate toothpaste with brush", "price": 95.0, "image_url": "https://images.unsplash.com/photo-1739065882957-7db99eaf9a08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Toiletries", "stock": 75, "is_available": True},
        {"id": "item-018", "venue_id": "venue-010", "name": "Midnight Snack Box", "description": "Chips, biscuits, and a juice box", "price": 120.0, "image_url": "https://images.unsplash.com/photo-1765741836929-af2f9e1968e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Food", "stock": 30, "is_available": True},
        {"id": "item-019", "venue_id": "venue-010", "name": "Energy Drink Can", "description": "Red Bull 250ml energy drink", "price": 125.0, "image_url": "https://images.unsplash.com/photo-1765741836929-af2f9e1968e8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwxfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Beverages", "stock": 60, "is_available": True},
        {"id": "item-020", "venue_id": "venue-011", "name": "Pen Set (5 pens)", "description": "Blue and black ballpoint pens", "price": 40.0, "image_url": "https://images.unsplash.com/photo-1739065882957-7db99eaf9a08?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwyfHxncm9jZXJ5JTIwc3RvcmUlMjBzbmFja3MlMjBzdGF0aW9ufGVufDB8fHx8MTc3NTkxOTMyOXww&ixlib=rb-4.1.0&q=85", "category": "Stationery", "stock": 150, "is_available": True},
    ]
    await db.menu_items.insert_many(menu_items)

    print("Database seeded with 11 venues, 20 menu items, 3 users")

if __name__ == "__main__":
    asyncio.run(seed_data())
    client.close()
