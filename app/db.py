import motor.motor_asyncio
import os

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "scraper_db")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB]

async def save_data(data: list[dict]):
    await db.results.insert_many(data)

async def get_data():
    cursor = db.results.find({})
    return [doc async for doc in cursor]
