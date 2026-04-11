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
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class Task(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
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
    title: str
    frequency: List[str]
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class HabitLog(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    habit_id: str
    date: str
    completed: bool

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Goal(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    title: str
    description: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}
