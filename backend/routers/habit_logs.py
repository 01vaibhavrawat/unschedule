from fastapi import APIRouter, HTTPException, status, Depends
from models import HabitLog
from database import habit_logs_collection
from bson import ObjectId
from datetime import datetime, timedelta
from .auth import get_current_user_id

router = APIRouter()

@router.post("/", response_description="Toggle habit log")
async def toggle_habit_log(log: HabitLog, user_id: str = Depends(get_current_user_id)):
    log_dict = log.dict(by_alias=True, exclude={"id"})
    log_dict["user_id"] = user_id
    
    # Check if already exists
    existing_log = await habit_logs_collection.find_one({"habit_id": log_dict["habit_id"], "date": log_dict["date"], "user_id": user_id})
    
    if existing_log:
        # Toggle completed status
        new_status = not existing_log["completed"]
        await habit_logs_collection.update_one({"_id": existing_log["_id"]}, {"$set": {"completed": new_status}})
        updated = await habit_logs_collection.find_one({"_id": existing_log["_id"]})
        updated["_id"] = str(updated["_id"])
        return updated
    else:
        new_log = await habit_logs_collection.insert_one(log_dict)
        created_log = await habit_logs_collection.find_one({"_id": new_log.inserted_id})
        created_log["_id"] = str(created_log["_id"])
        return created_log

@router.get("/{habit_id}", response_description="Get habit logs and streak")
async def get_habit_logs(habit_id: str, user_id: str = Depends(get_current_user_id)):
    logs = []
    async for log in habit_logs_collection.find({"habit_id": habit_id, "user_id": user_id}):
        log["_id"] = str(log["_id"])
        logs.append(log)
    
    # Simple streak calculation (count consecutive past days completed = true)
    # Sort logs by date descending
    sorted_logs = sorted([l for l in logs if l["completed"]], key=lambda x: x["date"], reverse=True)
    streak = 0
    if sorted_logs:
        current_date_str = sorted_logs[0]["date"]
        current_date = datetime.strptime(current_date_str, "%Y-%m-%d").date()
        today = datetime.now().date()
        
        # if the most recent log is older than yesterday, streak is 0
        if (today - current_date).days > 1:
            streak = 0
        else:
            streak = 1
            expected_date = current_date - timedelta(days=1)
            for i in range(1, len(sorted_logs)):
                log_date = datetime.strptime(sorted_logs[i]["date"], "%Y-%m-%d").date()
                if log_date == expected_date:
                    streak += 1
                    expected_date -= timedelta(days=1)
                elif log_date < expected_date:
                    break # gap found
                # If log_date == expected_date+x (shouldn't happen since sorted descending without duplicates)
                
    return {"logs": logs, "streak": streak}
