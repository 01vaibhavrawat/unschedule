from fastapi import APIRouter, HTTPException, status, Depends
from models import HabitLog
from database import habit_logs_collection, tasks_collection, habits_collection
from bson import ObjectId
from datetime import datetime, timedelta
from .auth import get_current_user_id

router = APIRouter()

@router.put("/status", response_description="Set habit log status")
async def set_habit_log_status(log: dict, user_id: str = Depends(get_current_user_id)):
    habit_id = log["habit_id"]
    date = log["date"]
    status_val = log["status"]
    completed = log.get("completed", status_val == "completed")
    
    if status_val == "none":
        await habit_logs_collection.delete_one({"habit_id": habit_id, "date": date, "user_id": user_id})
        return {"msg": "deleted"}
        
    existing_log = await habit_logs_collection.find_one({"habit_id": habit_id, "date": date, "user_id": user_id})
    if existing_log:
        await habit_logs_collection.update_one(
            {"_id": existing_log["_id"]}, 
            {"$set": {"completed": completed, "status": status_val}}
        )
        updated = await habit_logs_collection.find_one({"_id": existing_log["_id"]})
        updated["_id"] = str(updated["_id"])
        return updated
    else:
        new_log_dict = {
            "habit_id": habit_id,
            "date": date,
            "completed": completed,
            "status": status_val,
            "user_id": user_id
        }
        new_log = await habit_logs_collection.insert_one(new_log_dict)
        created_log = await habit_logs_collection.find_one({"_id": new_log.inserted_id})
        created_log["_id"] = str(created_log["_id"])
        return created_log

@router.post("/", response_description="Toggle habit log")
async def toggle_habit_log(log: HabitLog, user_id: str = Depends(get_current_user_id)):
    log_dict = log.dict(by_alias=True, exclude={"id"})
    log_dict["user_id"] = user_id
    
    existing_log = await habit_logs_collection.find_one({"habit_id": log_dict["habit_id"], "date": log_dict["date"], "user_id": user_id})
    
    if existing_log:
        new_status = not existing_log["completed"]
        await habit_logs_collection.update_one({"_id": existing_log["_id"]}, {"$set": {"completed": new_status, "status": "completed" if new_status else "none"}})
        if not new_status:
            # If toggled off, maybe we should just delete it or mark it none. Let's keep it as status="none"
            pass
        updated = await habit_logs_collection.find_one({"_id": existing_log["_id"]})
        updated["_id"] = str(updated["_id"])
        return updated
    else:
        new_log = await habit_logs_collection.insert_one(log_dict)
        created_log = await habit_logs_collection.find_one({"_id": new_log.inserted_id})
        created_log["_id"] = str(created_log["_id"])
        return created_log

def is_expected_day(date_obj: datetime.date, recurrence: str, frequency: list) -> bool:
    if frequency:
        day_name = date_obj.strftime("%a")
        full_day = date_obj.strftime("%A")
        return (day_name in frequency) or (full_day in frequency)
    if recurrence != "none":
        if recurrence == "daily":
            return True
        elif recurrence == "weekdays":
            return date_obj.weekday() < 5
        else:
            js_day = (date_obj.weekday() + 1) % 7
            try:
                days = [int(x) for x in recurrence.split(",")]
                return js_day in days
            except:
                return False
    return True

@router.get("/{habit_id}", response_description="Get habit logs and streak")
async def get_habit_logs(habit_id: str, user_id: str = Depends(get_current_user_id)):
    logs = []
    async for log in habit_logs_collection.find({"habit_id": habit_id, "user_id": user_id}):
        log["_id"] = str(log["_id"])
        logs.append(log)
    
    task = await tasks_collection.find_one({"_id": ObjectId(habit_id)})
    recurrence = "none"
    frequency = []
    if task:
        recurrence = task.get("recurrence", "none")
    else:
        mini_habit = await habits_collection.find_one({"_id": ObjectId(habit_id)})
        if mini_habit:
            frequency = mini_habit.get("frequency", [])
            
    today = datetime.now().date()
    log_map = {l["date"]: l for l in logs}
    
    streak = 0
    check_date = today
    
    while True:
        date_str = check_date.strftime("%Y-%m-%d")
        log = log_map.get(date_str)
        expected = is_expected_day(check_date, recurrence, frequency)
        
        if log:
            status = log.get("status", "completed" if log.get("completed") else "none")
            if status == "completed" or log.get("completed") is True:
                streak += 1
            elif status == "skipped":
                pass
            else:
                if check_date != today:
                    break
        else:
            if expected:
                if check_date != today:
                    break
            else:
                pass
                
        check_date -= timedelta(days=1)
        if (today - check_date).days > 3650:
            break
            
    return {"logs": logs, "streak": streak}
