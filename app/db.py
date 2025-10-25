import motor.motor_asyncio
import hashlib
import os
from app.logger import setup_logger

class MongoDB:
    _instance = None

    def __init__(self, url: str, db_name: str):
        self.url = url
        self.db_name = db_name
        self.logger = setup_logger("MongoDB")
        self.client = motor.motor_asyncio.AsyncIOMotorClient(self.url)
        self.db = self.client[self.db_name]
        self.raw_data_collection = None


    @classmethod
    async def create(cls):
        """
        Creates one instance of an object.
        Subsequent calls return the same object.
        """
        if cls._instance is None:
            cls._instance = cls(
                os.getenv("MONGO_URL", "mongodb://mongo:27017"),
                os.getenv("MONGO_DB", "scraper_db")
            )
            cls._instance.raw_data_collection = await cls._instance._init_collection("raw_data", [("hash", True), ("lang", False), ("published", False)])
            cls._instance.processed_data_collection = await cls._instance._init_collection("processed_data", [("hash", True), ("processed_at", False)])
        return cls._instance


    async def _init_collection(self, collection_name: str, indexes:list):
        collection = self.db[collection_name]
        for index, is_unique in indexes:
            await collection.create_index(index, unique=is_unique)
        self.logger.info(f"Collection '{collection_name}' initialized with indexes.")
        return collection


    async def save_data(self, data: list[dict]):
        if not data:
            return
        try:
            await self.raw_data_collection.insert_many(data, ordered=False)
            self.logger.info(f"Saved {len(data)} documents.")
        except Exception as e:
            self.logger.warning(f"Error inserting documents: {e}")

    
    async def save_processed_data(self, data:list[dict]):
        if not data:
            return 
        try:
            await self.processed_data_collection.insert_many(data, ordered=False)
            self.logger.info(f"Saved{len(data)} documents")
        except Exception as e:
            self.logger.warning(f"Error inserting documents: {e}")


    async def get_data(self):
        self.logger.info("Going to retrieve docs:")
        cursor = self.processed_data_collection.find({})
        docs = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            docs.append(doc)
        return docs


    async def get_filtered_data(self, *, lang=None, source=None, days=None, text_contains=None, limit=50):
        query = {}

        if lang:
            query["lang"] = lang

        if source:
            query["source"] = source

        if days:
            since = datetime.utcnow() - timedelta(days=days)
            query["published"] = {"$gte": since.isoformat()}

        if text_contains:
            query["text"] = {"$regex": text_contains, "$options": "i"}

        cursor = self.processed_data_collection.find(query).limit(limit)
        docs = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            docs.append(doc)
        return docs