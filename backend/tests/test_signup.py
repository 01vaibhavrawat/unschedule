import asyncio
import httpx
from main import app
from fastapi.testclient import TestClient

client = TestClient(app)
response = client.post("/auth/signup", json={"name": "Test", "email": "test1234@example.com", "password": "Password123!"})
print(response.status_code)
print(response.text)
