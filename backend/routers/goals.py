from fastapi import APIRouter, HTTPException, status
from models import Goal
from database import goals_collection
from bson import ObjectId

router = APIRouter()

@router.post("/", response_description="Add new goal", response_model=Goal)
async def create_goal(goal: Goal):
    goal_dict = goal.dict(by_alias=True, exclude={"id"})
    new_goal = await goals_collection.insert_one(goal_dict)
    created_goal = await goals_collection.find_one({"_id": new_goal.inserted_id})
    return created_goal

@router.get("/", response_description="List all goals", response_model=list[dict])
async def list_goals():
    goals = []
    async for goal in goals_collection.find():
        goal["_id"] = str(goal["_id"])
        goals.append(goal)
    return goals

@router.delete("/{id}", response_description="Delete a goal")
async def delete_goal(id: str):
    delete_result = await goals_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Goal not found")
