import os
from fastapi import APIRouter, Depends, HTTPException, Body
from typing import List, Dict, Any, Optional
from datetime import datetime
from database import get_db
from models import AssistantMessage, Task, MiniHabit, JournalEntry, Note, User
from routers.auth import get_current_user

from langchain_core.messages import HumanMessage, AIMessage
from assistant.graph import assistant_graph

router = APIRouter()

@router.get("/history", response_model=List[AssistantMessage])
async def get_chat_history(user: User = Depends(get_current_user)):
    db = get_db()
    cursor = db.assistant_messages.find({"user_id": str(user.id)}).sort("created_at", 1)
    messages = await cursor.to_list(length=100)
    return messages

@router.post("/chat", response_model=AssistantMessage)
async def chat_with_assistant(
    message: str = Body(..., embed=True),
    user: User = Depends(get_current_user)
):
    db = get_db()
    now_str = datetime.utcnow().isoformat()
    
    # Save user message
    user_msg = AssistantMessage(
        user_id=str(user.id),
        role="user",
        content=message,
        created_at=now_str
    )
    await db.assistant_messages.insert_one(user_msg.model_dump(by_alias=True, exclude={"id"}))
    
    # Build history for context
    cursor = db.assistant_messages.find({"user_id": str(user.id)}).sort("created_at", -1).limit(20)
    recent_messages = await cursor.to_list(length=20)
    recent_messages.reverse()
    
    lc_messages = []
    for m in recent_messages[:-1]: # exclude the one we just added
        if m["role"] == "user":
            lc_messages.append(HumanMessage(content=m["content"]))
        else:
            lc_messages.append(AIMessage(content=m["content"]))
            
    lc_messages.append(HumanMessage(content=message))
    
    try:
        # Run the LangGraph orchestration
        # We pass user_id in the configurable so that the tools can access it
        result = await assistant_graph.ainvoke(
            {"messages": lc_messages, "user_id": str(user.id)},
            config={"configurable": {"user_id": str(user.id)}}
        )
        
        final_messages = result.get("messages", [])
        if not final_messages:
            raise ValueError("No messages returned from the graph")
            
        final_msg = final_messages[-1]
        
        # Super simple check for tool actions executed (for frontend display)
        action_data = None
        # LangChain AIMessage tool calls are in final_msg.tool_calls?
        # Wait, if the tool was executed, the final message might be from the tool,
        # or the LLM's final response after the tool. 
        # In our graph, `tools` routes back to `agent`, so the final message is an AIMessage.
        # But we can check if there was a tool executed recently in the result messages.
        
        # Let's see if any tool was called in the output sequence (only looking at new messages)
        new_msgs = final_messages[len(lc_messages):]
        for msg in new_msgs:
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                # We capture the first tool call action for the UI
                tc = msg.tool_calls[0]
                action_data = {
                    "action": tc["name"],
                    "data": tc["args"]
                }
                break

        content_str = ""
        if isinstance(final_msg.content, list):
            for part in final_msg.content:
                if isinstance(part, dict) and part.get("type") == "text":
                    content_str += part.get("text", "")
                elif isinstance(part, str):
                    content_str += part
        else:
            content_str = str(final_msg.content)

        asst_msg = AssistantMessage(
            user_id=str(user.id),
            role="assistant",
            content=content_str,
            action_data=action_data,
            created_at=datetime.utcnow().isoformat()
        )
        
        res = await db.assistant_messages.insert_one(asst_msg.model_dump(by_alias=True, exclude={"id"}))
        asst_msg.id = res.inserted_id
        
        return asst_msg
        
    except Exception as e:
        print(f"Assistant graph execution failed: {e}")
        raise HTTPException(status_code=500, detail="Assistant failed to respond")
