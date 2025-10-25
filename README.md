# 🕵️‍♀️ Scout.io

Scout.io to inteligentna aplikacja webowa, która pomaga menedżerom błyskawicznie uzyskać najważniejsze wiadomości ze swojej branży.  
System automatycznie zbiera, analizuje i porządkuje newsy — od najbardziej istotnych po najmniej ważne — z możliwością filtrowania po dacie i zapisywania ulubionych artykułów.

---

## 🚀 Funkcje

- 🔍 Inteligentne zbieranie wiadomości  
  Automatyczne pobieranie najnowszych artykułów z wiarygodnych źródeł branżowych.  

- 🧠 Ranking ważności (AI/NLP)  
  Model językowy ocenia znaczenie wiadomości na podstawie ich treści, kontekstu branżowego i aktualności.  

- 📅 Filtrowanie po dacie  
  Przeglądaj wiadomości w ujęciu dziennym, tygodniowym lub miesięcznym.  

- 💾 Zapisywanie artykułów  
  Możliwość dodawania newsów do listy „Zapisane”, aby wrócić do nich później.  

- 📊 Przejrzysty interfejs  
  Dashboard prezentujący najnowsze wiadomości, ich znaczenie i trendy w branży.  

---

## 🏗️ Stos technologiczny

| Warstwa | Technologie |
|----------|--------------|
| Frontend | React / Vite.js |
| Backend | Python (FastAPI) |
| Baza danych | MongoDB |
| AI / NLP | Transformers (Bert), OpenAPI |
| Zbieranie danych | własny crawler oparty na aiohttps|
| Deploy | Docker |

---

## ⚙️ Jak to działa

1. Zbieranie danych – System pobiera wiadomości z wielu zaufanych źródeł.  
2. Analiza NLP – Modele AI wyodrębniają słowa kluczowe, analizują ton i istotność tematyczną.  
3. Ranking ważności – Każdy artykuł otrzymuje ocenę „importance score” zależną od kontekstu branżowego i daty.  
4. Prezentacja – Wyniki są wyświetlane w prostym interfejsie z możliwością filtrowania.  
5. Zapisywanie – Użytkownik może zapisać wybrane artykuły w osobistej kolekcji.  

---

## 💡 Przykładowy scenariusz użycia

Menedżer z branży telekomunikacyjnej loguje się do Scout.io → widzi 10 najważniejszych wiadomości dnia → filtruje je po tygodniu → zapisuje dwa artykuły o nowych regulacjach, aby wrócić do nich później.

---

## 🧭 Roadmap

- [ ] Personalizowane rekomendacje na podstawie historii użytkownika  
- [ ] Codzienny newsletter z najważniejszymi wiadomościami  
- [ ] Wsparcie dla wielu języków  
- [ ] Eksport zapisanych artykułów do PDF/CSV  

---

## 🤝 Wkład i rozwój projektu

Każdy może pomóc w rozwoju projektu!  
Zgłaszaj pomysły, błędy i nowe funkcje poprzez Issues lub Pull Requesty.  

Aby uruchomić projekt lokalnie:
```bash
docker compose build
docker compose up -d
