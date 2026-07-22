from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime, timezone
from bson import ObjectId
from models import Community, CommunityMembership
from database import (
    communities_collection, community_memberships_collection, users_collection, posts_collection,
    reactions_collection, comments_collection
)
from routers.auth import get_current_user_id

router = APIRouter()

@router.post("/", response_model=Community)
async def create_community(community_data: dict, current_user_id: str = Depends(get_current_user_id)):
    name = community_data.get("name", "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="Community name is required")

    doc = {
        "name": name,
        "description": community_data.get("description"),
        "tag": community_data.get("tag"),
        "created_by": current_user_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await communities_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    
    # Auto-join the creator
    await community_memberships_collection.insert_one({
        "community_id": str(result.inserted_id),
        "user_id": current_user_id,
        "joined_at": datetime.now(timezone.utc).isoformat()
    })
    
    return Community(**doc)

@router.get("/")
async def list_communities(search: str = None):
    query = {}
    if search:
        query = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"tag": {"$regex": search, "$options": "i"}}
        ]}
        
    cursor = communities_collection.find(query).sort("created_at", -1)
    communities = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        
        # Get member count
        member_count = await community_memberships_collection.count_documents({"community_id": doc["id"]})
        doc["member_count"] = member_count
        communities.append(doc)
        
    return communities

@router.get("/{community_id}")
async def get_community(community_id: str, current_user_id: str = Depends(get_current_user_id)):
    community = await communities_collection.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    community["id"] = str(community["_id"])
    del community["_id"]
    
    member_count = await community_memberships_collection.count_documents({"community_id": community_id})
    community["member_count"] = member_count
    
    # Check if current user is a member
    membership = await community_memberships_collection.find_one({
        "community_id": community_id,
        "user_id": current_user_id
    })
    community["is_member"] = membership is not None
    
    return community

@router.post("/{community_id}/join")
async def join_community(community_id: str, current_user_id: str = Depends(get_current_user_id)):
    community = await communities_collection.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    existing = await community_memberships_collection.find_one({
        "community_id": community_id,
        "user_id": current_user_id
    })
    
    if not existing:
        await community_memberships_collection.insert_one({
            "community_id": community_id,
            "user_id": current_user_id,
            "joined_at": datetime.now(timezone.utc).isoformat()
        })
        
    return {"status": "joined"}

@router.post("/{community_id}/leave")
async def leave_community(community_id: str, current_user_id: str = Depends(get_current_user_id)):
    await community_memberships_collection.delete_one({
        "community_id": community_id,
        "user_id": current_user_id
    })
    return {"status": "left"}

@router.get("/{community_id}/feed")
async def get_community_feed(community_id: str, current_user_id: str = Depends(get_current_user_id), limit: int = 50):
    community = await communities_collection.find_one({"_id": ObjectId(community_id)})
    if not community:
        raise HTTPException(status_code=404, detail="Community not found")
        
    # Posts made to this community
    posts_cursor = posts_collection.find({
        "community_id": community_id,
        "deleted_at": None
    }).sort("created_at", -1).limit(limit)
    
    posts = []
    async for doc in posts_cursor:
        user = await users_collection.find_one({"_id": ObjectId(doc["user_id"])})
        doc["user_name"] = user.get("name", "Unknown") if user else "Unknown"
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        
        doc["reaction_count"] = await reactions_collection.count_documents({"post_id": doc["id"]})
        doc["comment_count"] = await comments_collection.count_documents({"post_id": doc["id"], "deleted_at": None})
        user_reacted = await reactions_collection.find_one({"post_id": doc["id"], "user_id": current_user_id})
        doc["user_reacted"] = user_reacted is not None
        
        posts.append(doc)

    return posts
