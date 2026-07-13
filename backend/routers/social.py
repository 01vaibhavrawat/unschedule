from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime, timezone
from bson import ObjectId
from models import (
    VisibilitySettings, Follow, Post, Conversation, Message, UserProfile, UserPublic, Task, Goal, MiniHabit
)
from database import (
    users_collection, visibility_collection, follows_collection,
    posts_collection, conversations_collection, messages_collection,
    tasks_collection, goals_collection, habits_collection
)
from routers.auth import get_current_user_id

router = APIRouter()

async def get_visibility(user_id: str) -> dict:
    vis = await visibility_collection.find_one({"user_id": user_id})
    if not vis:
        return {"calendar": "private", "goals": "private", "habits": "private"}
    return vis

async def is_follower(follower_id: str, followed_id: str) -> bool:
    if follower_id == followed_id:
        return True
    return await follows_collection.find_one({
        "follower_id": follower_id,
        "followed_id": followed_id
    }) is not None

@router.get("/profile/{target_user_id}", response_model=UserProfile)
async def get_profile(target_user_id: str, current_user_id: str = Depends(get_current_user_id)):
    user = await users_collection.find_one({"_id": ObjectId(target_user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    follower_count = await follows_collection.count_documents({"followed_id": target_user_id})
    following_count = await follows_collection.count_documents({"follower_id": target_user_id})
    
    is_following_target = await is_follower(current_user_id, target_user_id) if current_user_id != target_user_id else False

    profile = UserProfile(
        id=target_user_id,
        name=user.get("name", "Unknown"),
        follower_count=follower_count,
        following_count=following_count,
        is_following=is_following_target
    )

    vis = await get_visibility(target_user_id)
    can_view = lambda v: v == "public" or (v == "followers" and is_following_target) or (current_user_id == target_user_id)

    if can_view(vis.get("calendar", "private")):
        tasks_cursor = tasks_collection.find({"user_id": target_user_id})
        calendar_data = []
        async for doc in tasks_cursor:
            doc["_id"] = str(doc["_id"])
            calendar_data.append(doc)
        profile.calendar = calendar_data
        
    if can_view(vis.get("goals", "private")):
        goals_cursor = goals_collection.find({"user_id": target_user_id})
        goals_data = []
        async for doc in goals_cursor:
            doc["_id"] = str(doc["_id"])
            goals_data.append(doc)
        profile.goals = goals_data
        
    if can_view(vis.get("habits", "private")):
        habits_cursor = habits_collection.find({"user_id": target_user_id})
        habits_data = []
        async for doc in habits_cursor:
            doc["_id"] = str(doc["_id"])
            habits_data.append(doc)
        profile.habits = habits_data

    return profile

@router.post("/follow/{target_user_id}")
async def follow_user(target_user_id: str, current_user_id: str = Depends(get_current_user_id)):
    if target_user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    existing = await follows_collection.find_one({
        "follower_id": current_user_id,
        "followed_id": target_user_id
    })
    
    if not existing:
        await follows_collection.insert_one({
            "follower_id": current_user_id,
            "followed_id": target_user_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    return {"status": "following"}

@router.delete("/follow/{target_user_id}")
async def unfollow_user(target_user_id: str, current_user_id: str = Depends(get_current_user_id)):
    await follows_collection.delete_one({
        "follower_id": current_user_id,
        "followed_id": target_user_id
    })
    return {"status": "unfollowed"}

@router.post("/posts", response_model=Post)
async def create_post(post_data: dict, current_user_id: str = Depends(get_current_user_id)):
    content = post_data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Post content cannot be empty")
    
    doc = {
        "user_id": current_user_id,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "deleted_at": None
    }
    result = await posts_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return Post(**doc)

@router.delete("/posts/{post_id}")
async def delete_post(post_id: str, current_user_id: str = Depends(get_current_user_id)):
    result = await posts_collection.update_one(
        {"_id": ObjectId(post_id), "user_id": current_user_id},
        {"$set": {"deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Post not found or unauthorized")
    return {"status": "deleted"}

@router.get("/feed")
async def get_feed(current_user_id: str = Depends(get_current_user_id), limit: int = 50):
    # get who the user follows
    follows = follows_collection.find({"follower_id": current_user_id})
    followed_ids = [f["followed_id"] async for f in follows]
    followed_ids.append(current_user_id)  # include own posts

    posts_cursor = posts_collection.find({
        "user_id": {"$in": followed_ids},
        "deleted_at": None
    }).sort("created_at", -1).limit(limit)
    
    posts = []
    async for doc in posts_cursor:
        user = await users_collection.find_one({"_id": ObjectId(doc["user_id"])})
        doc["user_name"] = user.get("name", "Unknown") if user else "Unknown"
        doc["id"] = str(doc["_id"])
        posts.append(doc)

    return posts

@router.get("/conversations")
async def list_conversations(current_user_id: str = Depends(get_current_user_id)):
    cursor = conversations_collection.find({
        "$or": [{"user_one_id": current_user_id}, {"user_two_id": current_user_id}]
    }).sort("created_at", -1)
    
    convos = []
    async for doc in cursor:
        other_user_id = doc["user_two_id"] if doc["user_one_id"] == current_user_id else doc["user_one_id"]
        other_user = await users_collection.find_one({"_id": ObjectId(other_user_id)})
        
        convos.append({
            "id": str(doc["_id"]),
            "other_user_id": other_user_id,
            "other_user_name": other_user.get("name", "Unknown") if other_user else "Unknown",
            "created_at": doc["created_at"]
        })
    return convos

@router.post("/conversations")
async def start_conversation(data: dict, current_user_id: str = Depends(get_current_user_id)):
    target_user_id = data.get("target_user_id")
    if not target_user_id or target_user_id == current_user_id:
        raise HTTPException(status_code=400, detail="Invalid target user")
    
    # check if exists
    existing = await conversations_collection.find_one({
        "$or": [
            {"user_one_id": current_user_id, "user_two_id": target_user_id},
            {"user_one_id": target_user_id, "user_two_id": current_user_id}
        ]
    })
    
    if existing:
        return {"id": str(existing["_id"])}
        
    doc = {
        "user_one_id": current_user_id,
        "user_two_id": target_user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    result = await conversations_collection.insert_one(doc)
    return {"id": str(result.inserted_id)}

@router.get("/conversations/{conversation_id}/messages")
async def get_messages(conversation_id: str, current_user_id: str = Depends(get_current_user_id)):
    convo = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not convo or current_user_id not in [convo["user_one_id"], convo["user_two_id"]]:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    cursor = messages_collection.find({"conversation_id": conversation_id}).sort("created_at", 1)
    messages = [Message(**doc).dict(by_alias=True) async for doc in cursor]
    
    # Mark as read
    await messages_collection.update_many(
        {"conversation_id": conversation_id, "sender_id": {"$ne": current_user_id}, "read_at": None},
        {"$set": {"read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return messages

@router.post("/conversations/{conversation_id}/messages", response_model=Message)
async def send_message(conversation_id: str, data: dict, current_user_id: str = Depends(get_current_user_id)):
    convo = await conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not convo or current_user_id not in [convo["user_one_id"], convo["user_two_id"]]:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    content = data.get("content", "").strip()
    if not content:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    doc = {
        "conversation_id": conversation_id,
        "sender_id": current_user_id,
        "content": content,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "read_at": None
    }
    result = await messages_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return Message(**doc)

@router.get("/visibility")
async def get_my_visibility(current_user_id: str = Depends(get_current_user_id)):
    vis = await get_visibility(current_user_id)
    # Exclude _id 
    if "_id" in vis:
        vis["_id"] = str(vis["_id"])
    return vis

@router.put("/visibility")
async def update_visibility(data: dict, current_user_id: str = Depends(get_current_user_id)):
    calendar = data.get("calendar", "private")
    goals = data.get("goals", "private")
    habits = data.get("habits", "private")
    
    valid = ["public", "followers", "private"]
    if calendar not in valid or goals not in valid or habits not in valid:
        raise HTTPException(status_code=400, detail="Invalid visibility setting")
        
    await visibility_collection.update_one(
        {"user_id": current_user_id},
        {"$set": {
            "calendar": calendar,
            "goals": goals,
            "habits": habits
        }},
        upsert=True
    )
    return {"status": "updated"}
