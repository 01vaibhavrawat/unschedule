import asyncio
from routers.social import get_profile

async def test():
    try:
        profile = await get_profile("69f34d1484fd2d278cef0229", "69f34d1484fd2d278cef0229")
        print(profile)
    except Exception as e:
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())
