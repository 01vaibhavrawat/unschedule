from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from models import Notification
from database import notifications_collection
from routers.auth import get_current_user_id

router = APIRouter()

@router.get("/")
async def get_notifications(current_user_id: str = Depends(get_current_user_id)):
    cursor = notifications_collection.find({"user_id": current_user_id}).sort("created_at", -1).limit(50)
    
    notifications = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        notifications.append(doc)
        
    return notifications

@router.put("/{notification_id}/read")
async def mark_read(notification_id: str, current_user_id: str = Depends(get_current_user_id)):
    result = await notifications_collection.update_one(
        {"_id": ObjectId(notification_id), "user_id": current_user_id},
        {"$set": {"is_read": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return {"status": "read"}

@router.put("/read-all")
async def mark_all_read(current_user_id: str = Depends(get_current_user_id)):
    await notifications_collection.update_many(
        {"user_id": current_user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"status": "all_read"}
