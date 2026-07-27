from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models import JournalEntry
from database import get_db
from routers.auth import get_current_user_id
from bson import ObjectId
import datetime

router = APIRouter(tags=["journals"])

@router.get("/", response_model=List[JournalEntry])
async def get_journals(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    journals = await db["journals"].find({"user_id": user_id}).to_list(1000)
    return journals

@router.get("/{date}", response_model=JournalEntry)
async def get_journal_by_date(date: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    journal = await db["journals"].find_one({"user_id": user_id, "date": date})
    if journal:
        return journal
    raise HTTPException(status_code=404, detail="Journal entry not found")

@router.post("/", response_model=JournalEntry)
async def create_journal(entry: JournalEntry, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    entry_dict = entry.dict(by_alias=True, exclude={"id"})
    entry_dict["user_id"] = user_id
    
    # Check if entry already exists for this date
    existing = await db["journals"].find_one({"user_id": entry_dict["user_id"], "date": entry_dict["date"]})
    if existing:
        raise HTTPException(status_code=400, detail="Journal entry for this date already exists")

    entry_dict["created_at"] = datetime.datetime.utcnow().isoformat()
    entry_dict["updated_at"] = entry_dict["created_at"]
    
    result = await db["journals"].insert_one(entry_dict)
    entry_dict["_id"] = result.inserted_id
    return entry_dict

@router.put("/{id}", response_model=JournalEntry)
async def update_journal(id: str, entry: JournalEntry, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = entry.dict(exclude_unset=True, by_alias=True, exclude={"id", "user_id", "created_at"})
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    result = await db["journals"].update_one(
        {"_id": ObjectId(id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found or not modified")
        
    updated_entry = await db["journals"].find_one({"_id": ObjectId(id)})
    return updated_entry

@router.delete("/{id}")
async def delete_journal(id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db["journals"].delete_one({"_id": ObjectId(id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal entry not found")
        
    return {"status": "success"}
