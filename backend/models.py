from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v, handler=None):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid objectid")
        return ObjectId(v)

    @classmethod
    def __get_pydantic_json_schema__(cls, core_schema, handler):
        return {"type": "string"}


class Task(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    title: str
    start_time: str
    end_time: str
    status: str = "pending"
    type: str = "task"
    recurrence: Optional[str] = "none"

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class MiniHabit(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    title: str
    frequency: List[str]
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class HabitLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    habit_id: str
    date: str
    completed: bool

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Goal(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    color: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


# ── Auth Models ────────────────────────────────────────────────────────────

class User(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    email: str
    hashed_password: str
    created_at: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserPublic(BaseModel):
    """Returned to the client — never exposes hashed_password."""
    id: str
    name: str
    email: str

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str
