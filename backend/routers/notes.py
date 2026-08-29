from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from models import Note, NoteUpdate
from database import get_db
from routers.auth import get_current_user_id
from bson import ObjectId
import datetime

router = APIRouter(tags=["notes"])

@router.get("/", response_model=List[Note])
async def get_notes(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    notes = await db["notes"].find({"user_id": user_id}).to_list(1000)
    return notes

@router.post("/", response_model=Note)
async def create_note(note: Note, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    note_dict = note.dict(by_alias=True, exclude={"id"})
    note_dict["user_id"] = user_id
    note_dict["created_at"] = datetime.datetime.utcnow().isoformat()
    note_dict["updated_at"] = note_dict["created_at"]
    
    result = await db["notes"].insert_one(note_dict)
    note_dict["_id"] = result.inserted_id
    return note_dict

@router.put("/{id}", response_model=Note)
async def update_note(id: str, note: NoteUpdate, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    update_data = note.dict(exclude_unset=True, by_alias=True, exclude={"id", "user_id", "created_at"})
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    result = await db["notes"].update_one(
        {"_id": ObjectId(id), "user_id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Note not found or not modified")
        
    updated_note = await db["notes"].find_one({"_id": ObjectId(id)})
    return updated_note

@router.delete("/{id}")
async def delete_note(id: str, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    if not ObjectId.is_valid(id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db["notes"].delete_one({"_id": ObjectId(id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found")
        
    return {"status": "success"}
