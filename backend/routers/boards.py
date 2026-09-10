from fastapi import APIRouter, Depends, HTTPException, status
from models import Board, BoardUpdate
from database import get_db
from routers.auth import get_current_user_id
import datetime

router = APIRouter(tags=["boards"])

@router.get("/", response_model=Board)
async def get_board(user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    board = await db["boards"].find_one({"user_id": user_id})
    if board:
        return board
    
    # Create empty board if it doesn't exist
    new_board = {
        "user_id": user_id,
        "content": "",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "updated_at": datetime.datetime.utcnow().isoformat()
    }
    result = await db["boards"].insert_one(new_board)
    new_board["_id"] = result.inserted_id
    return new_board

@router.put("/", response_model=Board)
async def update_board(board_update: BoardUpdate, user_id: str = Depends(get_current_user_id), db=Depends(get_db)):
    update_data = board_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()
    
    result = await db["boards"].update_one(
        {"user_id": user_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        # Should not happen if GET was called first, but just in case
        new_board = {
            "user_id": user_id,
            "content": update_data.get("content", ""),
            "created_at": datetime.datetime.utcnow().isoformat(),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }
        res = await db["boards"].insert_one(new_board)
        new_board["_id"] = res.inserted_id
        return new_board
        
    updated_board = await db["boards"].find_one({"user_id": user_id})
    return updated_board
