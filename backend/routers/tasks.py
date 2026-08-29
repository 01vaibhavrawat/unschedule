from fastapi import APIRouter, HTTPException, status, Depends
from models import Task, TaskUpdate
from database import tasks_collection
from bson import ObjectId
from .auth import get_current_user_id

router = APIRouter()

@router.post("/", response_description="Add new task", response_model=Task)
async def create_task(task: Task, user_id: str = Depends(get_current_user_id)):
    task_dict = task.dict(by_alias=True, exclude={"id"})
    task_dict["user_id"] = user_id
    new_task = await tasks_collection.insert_one(task_dict)
    created_task = await tasks_collection.find_one({"_id": new_task.inserted_id})
    return created_task

@router.get("/", response_description="List all tasks", response_model=list[dict])
async def list_tasks(user_id: str = Depends(get_current_user_id)):
    tasks = []
    async for task in tasks_collection.find({"user_id": user_id}):
        task["_id"] = str(task["_id"])
        tasks.append(task)
    return tasks

@router.put("/{id}", response_description="Update a task")
async def update_task(id: str, task: TaskUpdate, user_id: str = Depends(get_current_user_id)):
    update_data = task.dict(by_alias=True, exclude={"id", "user_id"}, exclude_unset=True)
    update_result = await tasks_collection.update_one({"_id": ObjectId(id), "user_id": user_id}, {"$set": update_data})
    if update_result.modified_count == 1:
        if (updated_task := await tasks_collection.find_one({"_id": ObjectId(id), "user_id": user_id})) is not None:
            updated_task["_id"] = str(updated_task["_id"])
            return updated_task
    if (existing_task := await tasks_collection.find_one({"_id": ObjectId(id), "user_id": user_id})) is not None:
        existing_task["_id"] = str(existing_task["_id"])
        return existing_task
    raise HTTPException(status_code=404, detail="Task not found")

@router.delete("/{id}", response_description="Delete a task")
async def delete_task(id: str, user_id: str = Depends(get_current_user_id)):
    delete_result = await tasks_collection.delete_one({"_id": ObjectId(id), "user_id": user_id})
    if delete_result.deleted_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Task not found")
