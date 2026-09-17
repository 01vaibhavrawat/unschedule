import asyncio
from database import users_collection, visibility_collection

async def migrate():
    print("Starting social migration...")
    users = users_collection.find({})
    
    count = 0
    async for user in users:
        user_id = str(user["_id"])
        
        # Check if they have visibility settings
        existing = await visibility_collection.find_one({"user_id": user_id})
        if not existing:
            await visibility_collection.insert_one({
                "user_id": user_id,
                "calendar": "private",
                "goals": "private",
                "habits": "private"
            })
            count += 1
            print(f"Added default visibility for user {user_id}")
            
    print(f"Migration complete. Added defaults for {count} users.")

if __name__ == "__main__":
    asyncio.run(migrate())
