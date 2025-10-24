import json
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT

# 1️⃣ Wczytanie postów z pliku JSON
with open("posts.json", "r", encoding="utf-8") as f:
    posts = json.load(f)  # zakładam, że plik zawiera listę obiektów typu [{"text": "..."}, ...] lub listę stringów

# Jeśli lista jest z obiektami, wyciągamy same teksty:
if isinstance(posts[0], dict) and "text" in posts[0]:
    posts = [p["text"] for p in posts]

# 2️⃣ Kategorie dla C-level menadżera marketingu i sprzedaży
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
    
    results.append({
        "text": post,
        "category": best_cat,
        "keywords": [k[0] for k in keywords]
    })

# 6️⃣ Zapis wyników do pliku JSON
with open("posts_categorized.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)

print("Done! Wyniki zapisane w 'posts_categorized.json'")
