from fastapi import APIRouter, HTTPException, status
from models import MiniHabit
from database import habits_collection
from bson import ObjectId

router = APIRouter()

@router.post("/", response_description="Add new mini habit", response_model=MiniHabit)
async def create_habit(habit: MiniHabit):
    habit_dict = habit.dict(by_alias=True, exclude={"id"})
    new_habit = await habits_collection.insert_one(habit_dict)
    created_habit = await habits_collection.find_one({"_id": new_habit.inserted_id})
    return created_habit

@router.get("/", response_description="List all habits", response_model=list[dict])
async def list_habits():
    habits = []
    async for habit in habits_collection.find():
        habit["_id"] = str(habit["_id"])
        habits.append(habit)
    return habits

@router.put("/{id}", response_description="Update a habit")
async def update_habit(id: str, habit: MiniHabit):
    update_data = habit.dict(by_alias=True, exclude={"id"}, exclude_unset=True)
    update_result = await habits_collection.update_one({"_id": ObjectId(id)}, {"$set": update_data})
    if update_result.modified_count == 1:
        if (updated_habit := await habits_collection.find_one({"_id": ObjectId(id)})) is not None:
            updated_habit["_id"] = str(updated_habit["_id"])
            return updated_habit
    if (existing_habit := await habits_collection.find_one({"_id": ObjectId(id)})) is not None:
        existing_habit["_id"] = str(existing_habit["_id"])
        return existing_habit
    raise HTTPException(status_code=404, detail="Habit not found")

@router.delete("/{id}", response_description="Delete a habit")
async def delete_habit(id: str):
    delete_result = await habits_collection.delete_one({"_id": ObjectId(id)})
    if delete_result.deleted_count == 1:
        return {"status": "success"}
    raise HTTPException(status_code=404, detail="Habit not found")
