# 🔄 v8.7.14 - KOMPLETT REN INSTALLATION

## 📦 **DETTA PAKET INNEHÅLLER:**

```
v8.7.14-COMPLETE/
├── index.html              # Frontend (v8.7.14 - senast fungerande)
├── app.py                  # Backend (Flask)
├── requirements.txt        # Python dependencies
├── Procfile               # Railway deployment
├── railway.json           # Railway config
├── README_v8.7.14.md     # Version info
└── js/
    ├── config.js          # Konfiguration (v8.7.0)
    └── security.js        # Säkerhet (v8.7.14 - fixed extraction)
```

---

## 🚀 **INSTALLATIONS-INSTRUKTIONER:**

### **Steg 1: Rensa GitHub Repo**

```bash
cd ditt-lokala-repo
git checkout dev  # eller main, beroende på vilken branch

# TA BORT ALLT (utom .git)
rm -rf *
rm -rf .gitignore  # Om du vill
```

### **Steg 2: Kopiera Alla Filer**

```bash
# Packa upp v8.7.14-COMPLETE.zip
unzip v8.7.14-COMPLETE.zip

# Kopiera ALLT till ditt repo
cp -r v8.7.14-COMPLETE/* ditt-repo/

# Verifiera struktur
cd ditt-repo
ls -la
# Du ska se:
# index.html
# app.py
# requirements.txt
# Procfile
# railway.json
# js/config.js
# js/security.js
```

### **Steg 3: Git Commit**

```bash
git add .
git commit -m "v8.7.14: Clean installation - last working version"
git push origin dev  # force push om nödvändigt: git push -f origin dev
```

### **Steg 4: Vänta på Railway Deploy**

Railway kommer automatiskt bygga om när du pushat.

Vänta ~1-2 minuter tills build är klar.

### **Steg 5: Testa**

Öppna din Railway URL och testa:
1. Skapa rådata med protected blocks
2. Generera dokument
3. Verifiera att det fungerar

---

## ⚙️ **KONFIGURERA (VIKTIGT!):**

### **1. Uppdatera js/config.js:**

Öppna `js/config.js` och uppdatera:

```javascript
// Rad 7-8: Dina Supabase credentials
const SUPABASE_URL = 'DIN_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'DIN_SUPABASE_KEY';

// Rad 11-13: Backend URL
const BACKEND_URL = window.location.hostname.includes('github.io')
    ? 'https://DIN_RAILWAY_URL.up.railway.app'  // Uppdatera denna!
    : window.location.origin;
```

### **2. Railway Environment Variable:**

I Railway dashboard:
```
CLAUDE_API_KEY = din_anthropic_api_key
```

---

## 🧪 **TESTFALL:**

### **Test 1: Basic Generation**
```
Rådata: "Projekt X lanseras 2025-01-15. Budget 5 MSEK."
Generera: Veckorapport
Förväntat: Dokument genereras utan errors
```

### **Test 2: Protected Blocks (Single)**
```
Rådata:
Text före

[[PROTECTED]]
Secret info
[[/PROTECTED]]

Text efter

Generera: Veckorapport
Förväntat: Secret info syns i slutdokument, inte {{PROTECTED_BLOCK_1}}
```

### **Test 3: Protected Blocks (Multiple)**
```
Rådata:
[[PROTECTED]]
Secret 1
[[/PROTECTED]]

Normal text

[[PROTECTED]]
Secret 2
[[/PROTECTED]]

Generera: Veckorapport
Förväntat: Båda secrets syns, inga placeholders
```

---

## 📊 **FÖRVÄNTAT RESULTAT:**

### **Console ska visa:**
```
✅ Supabase loaded: object
✅ Config loaded: [function/object]
✅ Security loaded: object
✅ Config loaded
✅ Security functions loaded
```

### **Ska INTE visa:**
```
❌ already declared
❌ undefined is not an object
❌ Cannot read properties of undefined
```

---

## 🐛 **OM PROBLEM KVARSTÅR:**

### **Problem 1: "already declared" errors**
→ Browser cache från gamla versioner
→ Lösning: Ctrl + Shift + Delete → Rensa ALLT

### **Problem 2: Supabase undefined**
→ config.js inte laddad korrekt
→ Lösning: Kolla Network tab, verifiera js/config.js Status 200

### **Problem 3: Protected blocks syns som {{PROTECTED_BLOCK_1}}**
→ Merge failade
→ Lösning: Kolla Console för "🔓 Protected blocks merged"

---

## 📋 **FILERNAS URSPRUNG:**

- `index.html` - v8.7.14 (sista fungerande, fixed extraction)
- `js/security.js` - v8.7.14 (single regex replace för multiple blocks)
- `js/config.js` - v8.7.0 (original code split)
- `app.py` - v8.7.0 (oförändrad)
- `requirements.txt` - v8.7.0 (oförändrad)
- `Procfile` - v8.7.0 (oförändrad)
- `railway.json` - v8.7.0 (oförändrad)

---

## 🎯 **VARFÖR v8.7.14?**

**v8.7.14 var sista fungerande versionen enligt dig!**

- ✅ Extraction fungerade
- ✅ Multiple blocks fungerade
- ✅ Inga JavaScript errors
- ⚠️ AI expanderade placeholders (kan fixas senare om nödvändigt)

**Men appen FUNGERADE!**

---

## 💡 **EFTER INSTALLATION:**

Om allt fungerar, kan vi:
1. Fixa AI instruction för att inte expandera placeholders
2. Men BARA den ändringen
3. Ingen mer "fixes" som break things

**En sak i taget, testa mellan varje ändring!** ✅

---

## 🆘 **SUPPORT:**

Om du får errors efter ren installation:
1. Skicka hela console output
2. Skicka Network tab screenshot (vilka filer laddas)
3. Berätta exakt vad som händer

Vi fixar då MED MINIMAL ÄNDRINGAR! 🎯

---

**Lycka till med ren installation!** 🚀
