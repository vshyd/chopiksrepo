import json
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT
from openai import OpenAI
import os
import time

SCW_ACCESS_KEY = os.getenv("SCW_ACCESS_KEY")
SCW_SECRET_KEY = os.getenv("SCW_SECRET_KEY")
SCW_DEFAULT_ORGANIZATION_ID = os.getenv("SCW_DEFAULT_ORGANIZATION_ID")
SCW_DEFAULT_PROJECT_ID = os.getenv("SCW_DEFAULT_PROJECT_ID")
SCW_DEFAULT_REGION = os.getenv("SCW_DEFAULT_REGION")
SCW_DEFAULT_ZONE = os.getenv("SCW_DEFAULT_ZONE")

def run():
    # 1️⃣ Wczytanie postów z pliku JSON
    with open("app/data.json", "r", encoding="utf-8") as f:
        data = json.load(f) 

    if isinstance(data[0], dict) and "text" in data[0]:
        posts = [p["text"] for p in data]
    
    print("-------")
    print("POSTS")
    print(posts)
    print("-------")

    categories = {
        "Market Trends": "Posts about telecom market trends, consumer behavior, market insights, competitive analysis",
        "Product Launches": "Posts about new products, services, features, technology releases in telecom",
        "Customer Feedback": "Posts about customer reviews, complaints, satisfaction, opinions",
        "Marketing Campaigns": "Posts about marketing campaigns, ads, promotions, social media strategies",
        "Sales & Partnerships": "Posts about sales deals, partnerships, collaborations, revenue updates"
    }

    # 3️⃣ Modele embeddings
    model = SentenceTransformer('all-MiniLM-L6-v2')
    kw_model = KeyBERT('all-MiniLM-L6-v2')

    # 4️⃣ Embeddings kategorii
    category_embeddings = {cat: model.encode(desc, convert_to_tensor=True) 
                        for cat, desc in categories.items()}

    client = OpenAI(base_url=f"https://api.scaleway.ai/{SCW_DEFAULT_PROJECT_ID}/v1", api_key=SCW_SECRET_KEY)
    
    # 5️⃣ Przetwarzanie postów
    results = []
    for post in posts:
        # klasyfikacja
        post_emb = model.encode(post, convert_to_tensor=True)
        sims = {cat: util.cos_sim(post_emb, emb).item() for cat, emb in category_embeddings.items()}
        best_cat = max(sims, key=sims.get)
        if sims[best_cat] < 0.3:
            best_cat = "Uncategorized"
        
        # kluczowe słowa
        keywords = kw_model.extract_keywords(post, keyphrase_ngram_range=(1,2), stop_words='english', top_n=5)

        prompt = f"""
        You are an expert in marketing and sales within the telecommunications industry.
        Evaluate, on a scale from 0 to 10, how important this post is for a C-level manager.
        By "important," we mean how much the information in this post could influence the company's strategy, revenue, customer relations, or brand reputation, and must get a areaction very fast.
        By "summary", we mean the short description of the whole text, 1 sentence with main idea, that might be interested for the manager.
        Post text:
        "{post}"

        Respond in JSON format:
        {{"importance": number between 0 and 10, "summary": "one-sentence post description"}}
        """

        try:
            response = client.chat.completions.create(
                model="qwen3-235b-a22b-instruct-2507", 
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=100
            )

            reply = response.choices[0].message.content.strip()
      
            try:
                parsed = json.loads(reply)
            except json.JSONDecodeError:
                parsed = {"importance": None, "summary": reply}

            importance = parsed.get("importance")
            justification = parsed.get("summary")
            results.append(post)

        except Exception as e:
            print(f"❌ Error {e}")

        print("\n🎯 Done! Saved importance scores to posts_with_importance.json")
        results.append({
            "text": post,
            "category": best_cat,
            "keywords": [k[0] for k in keywords],
            "importance": importance,
            "summary": justification,

        })

    # 6️⃣ Zapis wyników do pliku JSON
    with open("posts_categorized.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("Done! Wyniki zapisane w 'posts_categorized.json'")
