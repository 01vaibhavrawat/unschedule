from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage
import operator

class GraphState(TypedDict):
    """
    State for the Assistant Graph.
    """
    user_id: str
    messages: Annotated[Sequence[BaseMessage], operator.add]
    is_safe: bool
