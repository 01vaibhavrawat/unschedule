from fastapi import APIRouter, HTTPException, status, Depends
from models import Goal, GoalUpdate
from database import goals_collection
from bson import ObjectId
from .auth import get_current_user_id

import re
from datetime import datetime

router = APIRouter()

def clean_description(desc: str | None) -> str | None:
    if not desc:
        return desc
    normalized = desc.replace("&nbsp;", " ")
    text_only = re.sub(r'<[^>]*>', '', normalized).strip()
    if not text_only:
        return ""
    cleaned = re.sub(r'<br[^>]*\/?>', '\n', normalized, flags=re.IGNORECASE)
    cleaned = re.sub(r'</p>\s*<p[^>]*>', '\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'</?p[^>]*>', '', cleaned, flags=re.IGNORECASE)
    return cleaned.strip()

@router.post("/", response_description="Add new goal", response_model=Goal)
async def create_goal(goal: Goal, user_id: str = Depends(get_current_user_id)):
    goal_dict = goal.dict(by_alias=True, exclude={"id"})
    goal_dict["user_id"] = user_id
    if "description" in goal_dict and goal_dict["description"] is not None:
        goal_dict["description"] = clean_description(goal_dict["description"])
    if not goal_dict.get("created_at"):
        goal_dict["created_at"] = datetime.utcnow().isoformat() + "Z"
    new_goal = await goals_collection.insert_one(goal_dict)
    created_goal = await goals_collection.find_one({"_id": new_goal.inserted_id})
    return created_goal

@router.get("/", response_description="List all goals", response_model=list[dict])
async def list_goals(user_id: str = Depends(get_current_user_id)):
    goals = []
    async for goal in goals_collection.find({"user_id": user_id}):
        goal["_id"] = str(goal["_id"])
        goals.append(goal)
    return goals

@router.put("/{id}", response_description="Update a goal")
async def update_goal(id: str, goal: GoalUpdate, user_id: str = Depends(get_current_user_id)):
    goal_dict = {k: v for k, v in goal.dict(by_alias=True, exclude={"id", "user_id"}).items() if v is not None}
    if "description" in goal_dict and goal_dict["description"] is not None:
        goal_dict["description"] = clean_description(goal_dict["description"])
    update_result = await goals_collection.update_one({"_id": ObjectId(id), "user_id": user_id}, {"$set": goal_dict})
    if update_result.matched_count == 1:
        updated_goal = await goals_collection.find_one({"_id": ObjectId(id), "user_id": user_id})
        updated_goal["_id"] = str(updated_goal["_id"])
        return updated_goal
    raise HTTPException(status_code=404, detail="Goal not found")

@router.delete("/{id}", response_description="Delete a goal")
async def delete_goal(id: str, user_id: str = Depends(get_current_user_id)):
    delete_result = await goals_collection.delete_one({"_id": ObjectId(id), "user_id": user_id})
    if delete_result.deleted_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Goal not found")
