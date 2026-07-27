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
    status: str = "completed"

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

class JournalEntry(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    date: str
    content: str
    created_at: str
    updated_at: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Note(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: Optional[str] = None
    title: str
    content: str
    folder: Optional[str] = "General"
    tags: Optional[List[str]] = []
    created_at: str
    updated_at: Optional[str] = None

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
    has_completed_onboarding: bool = False

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserPublic(BaseModel):
    """Returned to the client — never exposes hashed_password."""
    id: str
    name: str
    email: str
    has_completed_onboarding: bool = False
    access_token: Optional[str] = None

class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# ── Social Models ──────────────────────────────────────────────────────────

class VisibilitySettings(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    calendar: str = "private"  # public, followers, private
    goals: str = "private"
    habits: str = "private"

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Follow(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    follower_id: str
    followed_id: str
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Post(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    content: str
    created_at: str
    deleted_at: Optional[str] = None
    community_id: Optional[str] = None
    activity_type: Optional[str] = None
    activity_ref_id: Optional[str] = None
    activity_snapshot: Optional[dict] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Community(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    name: str
    description: Optional[str] = None
    tag: Optional[str] = None
    created_by: str
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CommunityMembership(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    community_id: str
    user_id: str
    joined_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Reaction(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    post_id: str
    user_id: str
    type: str = "cheer"
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Comment(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    post_id: str
    user_id: str
    content: str
    created_at: str
    deleted_at: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Notification(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_id: str
    type: str  # follow, comment, reaction, community
    reference_id: Optional[str] = None
    is_read: bool = False
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Conversation(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    user_one_id: str
    user_two_id: str
    created_at: str

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class Message(BaseModel):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    conversation_id: str
    sender_id: str
    content: str
    created_at: str
    read_at: Optional[str] = None

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserProfile(BaseModel):
    id: str
    name: str
    follower_count: int = 0
    following_count: int = 0
    is_following: bool = False
    calendar: Optional[List[dict]] = None
    goals: Optional[List[dict]] = None
    habits: Optional[List[dict]] = None
