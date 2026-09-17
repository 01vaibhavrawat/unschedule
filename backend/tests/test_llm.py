import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

gemini_key = os.getenv("GEMINI_API_KEY", "")

def test_model(model_name):
    print(f"Testing {model_name}...")
    llm = ChatGoogleGenerativeAI(model=model_name, temperature=0.7, google_api_key=gemini_key)
    try:
        response = llm.invoke([HumanMessage(content="Hello")])
        print(f"Success for {model_name}: {response.content}")
    except Exception as e:
        print(f"Failed for {model_name}: {e}")

if __name__ == "__main__":
    test_model("gemini-1.5-flash")
