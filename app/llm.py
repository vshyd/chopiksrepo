import os
import json
import asyncio
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT
from openai import AsyncOpenAI
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
import hashlib

from app.db import MongoDB 
from app.logger import setup_logger

class PostAnalyzer:
    def __init__(self, mongo: MongoDB, concurrency: int = 5):
        self.mongo = mongo
        self.semaphore = asyncio.Semaphore(concurrency)

        self.scw_secret_key = os.getenv("SCW_SECRET_KEY")
        self.scw_project_id = os.getenv("SCW_DEFAULT_PROJECT_ID")

        self.client = AsyncOpenAI(
            base_url=f"https://api.scaleway.ai/{self.scw_project_id}/v1",
            api_key=self.scw_secret_key,
        )

        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.kw_model = KeyBERT('all-MiniLM-L6-v2')

        self.categories = {
            "Regulatory": "Posts about regulations, policies, and government decisions",
            "Competition": "Posts about competitors, market rivalry, and industry players",
            "Technology": "Posts about technology, innovations, and infrastructure",
            "Market": "Posts about market trends, growth, and consumer dynamics"
        }

        self.category_embeddings = {
            cat: self.model.encode(desc, convert_to_tensor=True)
            for cat, desc in self.categories.items()
        }

        self.logger = setup_logger("PostAnalyzer")


    def categorize_post(self, post: str) -> str:
        """Defines category by an embedding"""
        post_emb = self.model.encode(post, convert_to_tensor=True)
        sims = {cat: util.cos_sim(post_emb, emb).item() for cat, emb in self.category_embeddings.items()}
        best_cat = max(sims, key=sims.get)
        return best_cat if sims[best_cat] >= 0.3 else "Uncategorized"


    def extract_keywords(self, post: str) -> list[str]:
        return [
            kw[0]
            for kw in self.kw_model.extract_keywords(
                post, keyphrase_ngram_range=(1, 2), stop_words='english', top_n=5
            )
        ]

    async def evaluate_post(self, post: str) -> dict:
        """sends a request to LLM"""
        prompt = f"""
        You are an expert in marketing and sales within the telecommunications industry.
        Evaluate, on a scale from 0 to 5, how relevant this post is to the Play brand under brand recognition or strategic context.
        Keep the summary concise and factual, main idea of the post must be noticed.
        Just give the driest summary possible. 
        Don't mention relevance to Play
        Post text:
        "{post}"

        Respond in JSON format:
        {{"title":title of the article simplified without 'noise'", "importance": number between 0 and 5, "summary": "one-sentence brief description"}}
        """

        async with self.semaphore:
            try:
                response = await self.client.chat.completions.create(
                    model="qwen3-235b-a22b-instruct-2507",
                    messages=[{"role": "user", "content": prompt}],
                    temperature=0.4,
                    max_tokens=100
                )

                reply = response.choices[0].message.content.strip()
                try:
                    parsed = json.loads(reply)
                except json.JSONDecodeError:
                    parsed = {"importance": None, "summary": reply}
                return parsed

            except Exception as e:
                print(f"Error LLM: {e}")
                return {"importance": None, "summary": None}


    async def process_post(self, post: dict) -> dict:
        text = post.get('text')
        source = post.get('url')
        if not text:
            return None

        category = self.categorize_post(text)
        keywords = self.extract_keywords(text)
        evaluation = await self.evaluate_post(text)

        post = {}
        post["title"] = evaluation.get("title")
        post["category"] = category
        post["keywords"] = keywords
        post["importance"] = evaluation.get("importance")
        post["summary"] = evaluation.get("summary")
        post["hash"] = hashlib.md5(post["summary"].encode()).hexdigest()
        post["processed_at"] = datetime.utcnow().isoformat()
        post["status"] = "done"
        post["source"] = source

        return post


    async def analyze(self):
        """Main func, reads from db, analyses and writes back"""
        while True:
            doc = await self.mongo.raw_data_collection.find_one_and_update(
                    {"status": "new"},
                    {"$set": {"status": "processing"}},
                    return_document=False
                )

            if not doc:
                await asyncio.sleep(10)
                continue

            
            self.logger.info(f"Found 1 documents for analysis")
            processed = await self.process_post(doc)
            
            if processed:
                await self.mongo.save_processed_data([processed])
            else:
                self.logger.info("Nothing to save")
