import asyncio
import aiohttp
import feedparser
import hashlib
from datetime import datetime
import trafilatura
from langdetect import detect
from app.logger import setup_logger
from app.db import MongoDB 
from app.llm import PostAnalyzer

class NewsScraper:
    def __init__(self, feeds: list[str], concurrency: int = 15):
        self.feeds = feeds
        self.sem = asyncio.Semaphore(concurrency)
        self.logger = setup_logger("NewsScraper")
        self.session: aiohttp.ClientSession | None = None
        self.mongo: MongoDB | None = None


    async def init(self):
        """Async initialization Mongo and HTTP-session"""
        self.mongo = await MongoDB.create()
        self.post_analyzer = PostAnalyzer(self.mongo)
        self.session = aiohttp.ClientSession(headers={"User-Agent": "async-trafilatura/1.0"})
        self.logger.info("Scraper initialized.")


    async def close(self):
        """Closes connection"""
        if self.session:
            await self.session.close()
        self.logger.info("Scraper closed.")


    async def fetch_html(self, url: str) -> str | None:
        async with self.sem:
            try:
                async with self.session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        return await resp.text()
            except Exception as e:
                self.logger.warning(f"Error fetching {url}: {e}")
        return None


    def parse_article(self, url: str, html: str) -> dict | None:
        try:
            text = trafilatura.extract(html)
            if not text or len(text) < 300:
                return None

            metadata = trafilatura.extract_metadata(html)
            title = metadata.title if metadata else None

            doc = {
                "url": url,
                "title": title,
                "text": text.strip(),
                "lang": detect(text),
                "hash": hashlib.md5(text.encode()).hexdigest(),
                "published": datetime.utcnow().isoformat(),
                "source": url.split("/")[2],
            }
            return doc
        except Exception as e:
            self.logger.warning(f"Error parsing {url}: {e}")
            return None


    async def process_url(self, url: str):
        html = await self.fetch_html(url)
        if not html:
            return None
        doc = self.parse_article(url, html)
        if not doc or doc["lang"] not in ("pl", "en", "de", "fr"):
            return None
        return doc


    async def run(self):
        if not self.session or not self.mongo:
            await self.init()

        tasks = []
        for feed_url in self.feeds:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                tasks.append(self.process_url(entry.link))

        results = await asyncio.gather(*tasks, return_exceptions=True)
        articles = [r for r in results if isinstance(r, dict)]

        for art in articles:
            art["status"] = "new"
            art["created_at"] = datetime.utcnow()

        if articles:
            await self.mongo.save_data(articles)
            self.logger.info(f"Saved {len(articles)} new articles.")
        else:
            self.logger.info("No new valid articles.")
        
        await asyncio.sleep(1)

        await self.close()



async def main():
    FEEDS = [
        "https://www.finextra.com/rss/headlines.aspx",
        "https://www.fintechfutures.com/feed/",
        "https://www.pymnts.com/feed/",
        "https://www.thefintechtimes.com/feed/",
        "https://www.telecomstechnews.com/feed/",
        "https://www.telecomlead.com/feed",
        "https://telecoms.com/feed/",
        "https://www.mobileworldlive.com/latest-stories/feed/"
    ]
    scraper = NewsScraper(FEEDS, concurrency=15)
    await scraper.init()
    await asyncio.gather(
        scraper.run(),          
        scraper.post_analyzer.analyze()  
    )

if __name__ == '__main__':
    asyncio.run(main())