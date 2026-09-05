from typing import Optional, List, Dict, Any
from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from database import get_db
from bson import ObjectId
from models import Note, JournalEntry, Task, MiniHabit, Goal
from datetime import datetime
import json

# --- Helper functions ---
def get_user_id(config: RunnableConfig) -> str:
    user_id = config.get("configurable", {}).get("user_id")
    if not user_id:
        raise ValueError("Error: user_id not found in configuration.")
    return user_id

def serialize_doc(doc: Dict[str, Any]) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

# --- Tasks Tools ---
@tool
async def create_task(title: str, start_time: str, end_time: str, config: RunnableConfig, status: str = "pending", recurrence: str = "none") -> str:
    """Creates a new task/event. start_time and end_time should be ISO 8601 strings (e.g. 2023-10-25T10:00:00Z)."""
    user_id = get_user_id(config)
    db = get_db()
    task = Task(user_id=user_id, title=title, start_time=start_time, end_time=end_time, status=status, recurrence=recurrence)
    res = await db.tasks.insert_one(task.model_dump(by_alias=True, exclude={"id"}))
    return f"Task '{title}' created successfully with ID: {res.inserted_id}."

@tool
async def get_tasks(config: RunnableConfig) -> str:
    """Retrieves all tasks for the user. Useful for finding the ID of a task before updating or deleting it."""
    user_id = get_user_id(config)
    db = get_db()
    tasks = await db.tasks.find({"user_id": user_id}).to_list(length=100)
    return json.dumps([serialize_doc(t) for t in tasks])

@tool
async def update_task(task_id: str, config: RunnableConfig, title: Optional[str] = None, start_time: Optional[str] = None, end_time: Optional[str] = None, status: Optional[str] = None) -> str:
    """Updates an existing task by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    update_data = {}
    if title: update_data["title"] = title
    if start_time: update_data["start_time"] = start_time
    if end_time: update_data["end_time"] = end_time
    if status: update_data["status"] = status
    if not update_data:
        return "No fields to update provided."
    res = await db.tasks.update_one({"_id": ObjectId(task_id), "user_id": user_id}, {"$set": update_data})
    if res.modified_count == 1:
        return f"Task {task_id} updated successfully."
    return f"Task {task_id} not found or no changes made."

@tool
async def delete_task(task_id: str, config: RunnableConfig) -> str:
    """Deletes a task by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    res = await db.tasks.delete_one({"_id": ObjectId(task_id), "user_id": user_id})
    if res.deleted_count == 1:
        return f"Task {task_id} deleted successfully."
    return f"Task {task_id} not found."

# --- MiniHabit Tools ---
@tool
async def create_habit(title: str, config: RunnableConfig, trigger: str = "", identity: str = "", frequency: list[str] = None) -> str:
    """Creates a new habit. frequency is a list of days e.g. ['monday', 'wednesday']."""
    user_id = get_user_id(config)
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    habit = MiniHabit(user_id=user_id, title=title, trigger=trigger, identity=identity, frequency=frequency or [], created_at=now_str)
    res = await db.mini_habits.insert_one(habit.model_dump(by_alias=True, exclude={"id"}))
    return f"Habit '{title}' created successfully with ID: {res.inserted_id}."

@tool
async def get_habits(config: RunnableConfig) -> str:
    """Retrieves all habits for the user. Useful for finding the ID before updating/deleting."""
    user_id = get_user_id(config)
    db = get_db()
    habits = await db.mini_habits.find({"user_id": user_id}).to_list(length=100)
    return json.dumps([serialize_doc(h) for h in habits])

@tool
async def update_habit(habit_id: str, config: RunnableConfig, title: Optional[str] = None, trigger: Optional[str] = None, identity: Optional[str] = None, frequency: list[str] = None) -> str:
    """Updates an existing habit by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    update_data = {}
    if title: update_data["title"] = title
    if trigger is not None: update_data["trigger"] = trigger
    if identity is not None: update_data["identity"] = identity
    if frequency is not None: update_data["frequency"] = frequency
    if not update_data:
        return "No fields to update provided."
    res = await db.mini_habits.update_one({"_id": ObjectId(habit_id), "user_id": user_id}, {"$set": update_data})
    if res.modified_count == 1:
        return f"Habit {habit_id} updated successfully."
    return f"Habit {habit_id} not found or no changes made."

@tool
async def delete_habit(habit_id: str, config: RunnableConfig) -> str:
    """Deletes a habit by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    res = await db.mini_habits.delete_one({"_id": ObjectId(habit_id), "user_id": user_id})
    if res.deleted_count == 1:
        return f"Habit {habit_id} deleted successfully."
    return f"Habit {habit_id} not found."

# --- Goal Tools ---
@tool
async def create_goal(title: str, config: RunnableConfig, description: str = "", color: str = "#000000", deadline: str = "") -> str:
    """Creates a new goal."""
    user_id = get_user_id(config)
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    goal = Goal(user_id=user_id, title=title, description=description, color=color, deadline=deadline, created_at=now_str)
    res = await db.goals.insert_one(goal.model_dump(by_alias=True, exclude={"id"}))
    return f"Goal '{title}' created successfully with ID: {res.inserted_id}."

@tool
async def get_goals(config: RunnableConfig) -> str:
    """Retrieves all goals for the user. Useful for finding the ID before updating/deleting."""
    user_id = get_user_id(config)
    db = get_db()
    goals = await db.goals.find({"user_id": user_id}).to_list(length=100)
    return json.dumps([serialize_doc(g) for g in goals])

@tool
async def update_goal(goal_id: str, config: RunnableConfig, title: Optional[str] = None, description: Optional[str] = None, color: Optional[str] = None, deadline: Optional[str] = None) -> str:
    """Updates an existing goal by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    update_data = {}
    if title: update_data["title"] = title
    if description is not None: update_data["description"] = description
    if color: update_data["color"] = color
    if deadline is not None: update_data["deadline"] = deadline
    if not update_data:
        return "No fields to update provided."
    res = await db.goals.update_one({"_id": ObjectId(goal_id), "user_id": user_id}, {"$set": update_data})
    if res.modified_count == 1:
        return f"Goal {goal_id} updated successfully."
    return f"Goal {goal_id} not found or no changes made."

@tool
async def delete_goal(goal_id: str, config: RunnableConfig) -> str:
    """Deletes a goal by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    res = await db.goals.delete_one({"_id": ObjectId(goal_id), "user_id": user_id})
    if res.deleted_count == 1:
        return f"Goal {goal_id} deleted successfully."
    return f"Goal {goal_id} not found."

# --- Note Tools ---
@tool
async def create_note(title: str, content: str, config: RunnableConfig, folder: str = "General", tags: list[str] = None) -> str:
    """Creates a new note."""
    user_id = get_user_id(config)
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    note = Note(user_id=user_id, title=title, content=content, folder=folder, tags=tags or [], created_at=now_str, updated_at=now_str)
    res = await db.notes.insert_one(note.model_dump(by_alias=True, exclude={"id"}))
    return f"Note '{title}' created successfully with ID: {res.inserted_id}."

@tool
async def get_notes(config: RunnableConfig) -> str:
    """Retrieves all notes for the user. Useful for finding the ID before updating/deleting."""
    user_id = get_user_id(config)
    db = get_db()
    notes = await db.notes.find({"user_id": user_id}).to_list(length=100)
    return json.dumps([serialize_doc(n) for n in notes])

@tool
async def update_note(note_id: str, config: RunnableConfig, title: Optional[str] = None, content: Optional[str] = None, folder: Optional[str] = None, tags: list[str] = None) -> str:
    """Updates an existing note by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    if title: update_data["title"] = title
    if content is not None: update_data["content"] = content
    if folder: update_data["folder"] = folder
    if tags is not None: update_data["tags"] = tags
    res = await db.notes.update_one({"_id": ObjectId(note_id), "user_id": user_id}, {"$set": update_data})
    if res.modified_count == 1:
        return f"Note {note_id} updated successfully."
    return f"Note {note_id} not found or no changes made."

@tool
async def delete_note(note_id: str, config: RunnableConfig) -> str:
    """Deletes a note by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    res = await db.notes.delete_one({"_id": ObjectId(note_id), "user_id": user_id})
    if res.deleted_count == 1:
        return f"Note {note_id} deleted successfully."
    return f"Note {note_id} not found."

# --- Journal Tools ---
@tool
async def create_journal_entry(content: str, config: RunnableConfig) -> str:
    """Creates a journal entry for today."""
    user_id = get_user_id(config)
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    date_str = datetime.utcnow().strftime("%Y-%m-%d")
    journal = JournalEntry(user_id=user_id, content=content, date=date_str, created_at=now_str, updated_at=now_str)
    res = await db.journal_entries.insert_one(journal.model_dump(by_alias=True, exclude={"id"}))
    return f"Journal entry created successfully with ID: {res.inserted_id}."

@tool
async def get_journal_entries(config: RunnableConfig) -> str:
    """Retrieves all journal entries for the user. Useful for finding the ID before updating/deleting."""
    user_id = get_user_id(config)
    db = get_db()
    journals = await db.journal_entries.find({"user_id": user_id}).to_list(length=100)
    return json.dumps([serialize_doc(j) for j in journals])

@tool
async def update_journal_entry(journal_id: str, config: RunnableConfig, content: Optional[str] = None) -> str:
    """Updates an existing journal entry by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    update_data = {"updated_at": datetime.utcnow().isoformat()}
    if content is not None: update_data["content"] = content
    if not content: return "No fields to update."
    res = await db.journal_entries.update_one({"_id": ObjectId(journal_id), "user_id": user_id}, {"$set": update_data})
    if res.modified_count == 1:
        return f"Journal entry {journal_id} updated successfully."
    return f"Journal entry {journal_id} not found or no changes made."

@tool
async def delete_journal_entry(journal_id: str, config: RunnableConfig) -> str:
    """Deletes a journal entry by its ID."""
    user_id = get_user_id(config)
    db = get_db()
    res = await db.journal_entries.delete_one({"_id": ObjectId(journal_id), "user_id": user_id})
    if res.deleted_count == 1:
        return f"Journal entry {journal_id} deleted successfully."
    return f"Journal entry {journal_id} not found."

# List of tools to be bound to the model and executed by ToolNode
tools = [
    create_task, get_tasks, update_task, delete_task,
    create_habit, get_habits, update_habit, delete_habit,
    create_goal, get_goals, update_goal, delete_goal,
    create_note, get_notes, update_note, delete_note,
    create_journal_entry, get_journal_entries, update_journal_entry, delete_journal_entry
]
