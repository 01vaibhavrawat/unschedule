import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from routers.auth import create_access_token
import urllib.request
import json

async def test():
    token = create_access_token({"sub": "69f34d1484fd2d278cef0229", "email": "test@example.com", "name": "Test"})
    print("Generated token:", token)
    
    req = urllib.request.Request(
        "http://localhost:8000/social/profile/69f34d1484fd2d278cef0229",
        headers={"Authorization": f"Bearer {token}"}
    )
    try:
        with urllib.request.urlopen(req) as res:
            print("Status:", res.status)
            print("Body:", res.read().decode())
    except urllib.error.HTTPError as e:
        print("Status:", e.code)
        print("Body:", e.read().decode())

if __name__ == "__main__":
    asyncio.run(test())

