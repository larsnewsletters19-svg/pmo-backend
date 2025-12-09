# AI PMO Generator v7.0 - Backend

Backend för AI PMO Generator v7.0 med Claude API integration.

## 🚀 Deploy till Railway

### Steg 1: Förbered Railway
1. Gå till [railway.app](https://railway.app)
2. Logga in på ditt konto
3. Skapa nytt projekt eller använd befintligt

### Steg 2: Deploy från GitHub
1. Skapa ett nytt GitHub repository
2. Ladda upp dessa filer:
   - `app.py`
   - `requirements.txt`
   - `Procfile`
   - `railway.json`
3. I Railway: "New Project" → "Deploy from GitHub repo"
4. Välj ditt repo

### Steg 3: Konfigurera Environment Variables
I Railway projekt-inställningar, lägg till:
- **CLAUDE_API_KEY**: `din-claude-api-nyckel`
- **PORT**: `8080` (sätts automatiskt av Railway)

### Steg 4: Kopiera URL
Efter deployment, kopiera din Railway URL (t.ex. `https://ditt-projekt.up.railway.app`)

### Steg 5: Uppdatera Frontend
I din v7.0 frontend, ändra:
```javascript
const BACKEND_URL = 'https://ditt-projekt.up.railway.app';
```

## 📝 API Endpoints

### GET /health
Health check endpoint
```bash
curl https://ditt-projekt.up.railway.app/health
```

### POST /generate
Generera dokument
```bash
curl -X POST https://ditt-projekt.up.railway.app/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "Du är en PMO assistent...",
    "user_prompt": "Skapa veckorapport...",
    "max_tokens": 4096
  }'
```

## 🔒 Säkerhet
- API-nyckeln finns ENDAST på servern
- Frontend kan INTE komma åt nyckeln
- CORS aktiverat för din frontend

## ⚡ Testning Lokalt
```bash
# Installera dependencies
pip install -r requirements.txt

# Sätt environment variable
export CLAUDE_API_KEY='din-nyckel'

# Kör servern
python app.py
```

Servern startar på `http://localhost:8080`
