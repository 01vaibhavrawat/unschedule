from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from assistant.state import GraphState
from assistant.nodes import agent
from assistant.tools import tools

# Initialize the ToolNode
tool_node = ToolNode(tools)

# Define routing function after agent
def route_after_agent(state: GraphState):
    messages = state.get("messages", [])
    if not messages:
        return END
    
    last_message = messages[-1]
    # If the LLM makes a tool call, we route to the "tools" node
    if last_message.tool_calls:
        return "tools"
    # Otherwise, we finish
    return END

# Build Graph
builder = StateGraph(GraphState)

builder.add_node("agent", agent)
builder.add_node("tools", tool_node)

builder.add_edge(START, "agent")

builder.add_conditional_edges(
    "agent",
    route_after_agent,
    {"tools": "tools", END: END}
)

builder.add_edge("tools", "agent")

# Compile the graph
assistant_graph = builder.compile()
