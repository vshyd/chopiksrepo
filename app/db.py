import motor.motor_asyncio
import os
from app.logger import setup_logger

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongo:27017")
MONGO_DB = os.getenv("MONGO_DB", "scraper_db")

logger = setup_logger('db')

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)
db = client[MONGO_DB]

async def save_data(data: list[dict]):
    await db.results.insert_many(data)

async def get_data():
    logger.info(f"Going to retrieve docs:")

    cursor = db.results.find({})
    docs = []
    async for doc in cursor:
        logger.info(doc)
        doc["_id"] = str(doc["_id"])
        docs.append(doc)

    
    return docs
