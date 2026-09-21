import os
import json
import asyncio
from datetime import datetime
import redis.asyncio as redis
from typing import List, Dict, Any
from database import get_db

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Initialize Redis client pool
try:
    redis_client = redis.from_url(REDIS_URL, decode_responses=True)
except Exception as e:
    print(f"Failed to connect to Redis: {e}")
    redis_client = None

def get_chat_history_key(user_id: str) -> str:
    return f"chat:history:{user_id}"

async def sync_to_mongo(user_id: str, message_data: dict):
    """Asynchronously saves a message to MongoDB."""
    db = get_db()
    try:
        if "_id" in message_data:
            message_data.pop("_id", None)
        await db.assistant_messages.insert_one(message_data)
    except Exception as e:
        print(f"Background MongoDB sync failed: {e}")

async def get_recent_messages(user_id: str, limit: int = 20) -> List[dict]:
    """
    Fetches the recent 20 messages. 
    Reads from Redis in <1ms. On cache miss, fetches from Mongo and populates Redis.
    """
    if not redis_client:
        return await _fallback_mongo_read(user_id, limit)

    key = get_chat_history_key(user_id)
    try:
        messages = await redis_client.lrange(key, 0, -1)
        if messages:
            # Cache hit
            return [json.loads(m) for m in messages]
        
        # Cache miss
        db = get_db()
        cursor = db.assistant_messages.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
        mongo_messages = await cursor.to_list(length=limit)
        mongo_messages.reverse() # chronological order
        
        if mongo_messages:
            # Populate cache
            pipeline = redis_client.pipeline()
            for msg in mongo_messages:
                msg_copy = msg.copy()
                if "_id" in msg_copy:
                    msg_copy["_id"] = str(msg_copy["_id"])
                pipeline.rpush(key, json.dumps(msg_copy))
            pipeline.expire(key, 86400) # 24h TTL
            await pipeline.execute()
            
            return mongo_messages
        return []
        
    except Exception as e:
        print(f"Redis get_recent_messages failed: {e}")
        return await _fallback_mongo_read(user_id, limit)

async def push_message(user_id: str, message_data: dict) -> dict:
    """
    Pushes a message to Redis history, trims to limit, and launches a background Mongo sync.
    Returns the message_data (with _id stringified if present).
    """
    msg_copy = message_data.copy()
    if "_id" in msg_copy:
        msg_copy["_id"] = str(msg_copy["_id"])
        
    # Dispatch background task for MongoDB durability
    asyncio.create_task(sync_to_mongo(user_id, message_data.copy()))

    if not redis_client:
        return msg_copy

    key = get_chat_history_key(user_id)
    try:
        pipeline = redis_client.pipeline()
        pipeline.rpush(key, json.dumps(msg_copy))
        pipeline.ltrim(key, -20, -1)
        pipeline.expire(key, 86400)
        await pipeline.execute()
    except Exception as e:
        print(f"Redis push_message failed: {e}")
        
    return msg_copy

async def _fallback_mongo_read(user_id: str, limit: int) -> List[dict]:
    db = get_db()
    cursor = db.assistant_messages.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
    messages = await cursor.to_list(length=limit)
    messages.reverse()
    for m in messages:
        if "_id" in m:
            m["_id"] = str(m["_id"])
    return messages
