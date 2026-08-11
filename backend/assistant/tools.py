from langchain_core.tools import tool
from langchain_core.runnables.config import RunnableConfig
from database import get_db
from models import Note
from datetime import datetime

@tool
async def create_note(title: str, content: str, config: RunnableConfig, folder: str = "General", tags: list[str] = None) -> str:
    """
    Creates a new note for the user in the Unschedule application.
    
    Args:
        title: The title of the note.
        content: The main text content of the note.
        folder: The folder to categorize the note into (default: "General").
        tags: A list of tags for the note.
    """
    user_id = config.get("configurable", {}).get("user_id")
    if not user_id:
        return "Error: user_id not found in configuration."

    db = get_db()
    now_str = datetime.utcnow().isoformat()
    
    note = Note(
        user_id=user_id,
        title=title,
        content=content,
        folder=folder,
        tags=tags or [],
        created_at=now_str,
        updated_at=now_str
    )
    
    await db.notes.insert_one(note.model_dump(by_alias=True, exclude={"id"}))
    return f"Note '{title}' created successfully."

# List of tools to be bound to the model and executed by ToolNode
tools = [create_note]
