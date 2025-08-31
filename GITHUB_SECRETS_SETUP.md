# 🔐 GitHub Secrets & Vercel Deployment Setup

## Übersicht
Diese Anleitung führt Sie durch die komplette Konfiguration aller Secrets und API-Keys für automatisches Deployment mit GitHub Actions und Vercel.

## 📋 Benötigte Secrets/Keys

### 1. **OpenAI API Key**
- **Was:** API-Schlüssel für KI-Formular-Generierung
- **Wo erhalten:** https://platform.openai.com/api-keys
- **Kosten:** Pay-per-use (ca. $0.01-0.03 pro generiertes Formular)

### 2. **Vercel Token & IDs**
- **Was:** Für automatisches Deployment
- **Wo erhalten:** Vercel Dashboard

### 3. **Tally API Key**
- **Was:** Für Tally-Integration (optional, da Fallback vorhanden)
- **Wo erhalten:** Tally Dashboard

## 🔧 Schritt-für-Schritt Setup

### **Schritt 1: OpenAI API Key erstellen**

1. **Gehen Sie zu:** https://platform.openai.com/api-keys
2. **Melden Sie sich an** oder erstellen Sie einen Account
3. **Klicken Sie:** "Create new secret key"
4. **Name:** `survey-platform-production`
5. **Kopieren Sie den Key** (beginnt mit `sk-...`)
6. **⚠️ WICHTIG:** Key sofort speichern - wird nur einmal angezeigt!

### **Schritt 2: Vercel Setup**

#### **A) Vercel CLI einrichten (falls nicht schon geschehen)**
```bash
# Bereits installiert, aber falls nötig:
npm install -g vercel

# Login (falls nicht schon gemacht)
vercel login

# Projekt verbinden
vercel
```

#### **B) Vercel Token erhalten**
1. **Gehen Sie zu:** https://vercel.com/account/tokens
2. **Klicken Sie:** "Create Token"
3. **Name:** `GitHub Actions Survey Platform`
4. **Scope:** Ihr Account/Team
5. **Expiry:** Custom → 1 Jahr
6. **Kopieren Sie den Token**

#### **C) Vercel Project IDs erhalten**
```bash
# Im Projektverzeichnis ausführen:
vercel project ls

# Oder schauen Sie in .vercel/project.json nach dem Setup
cat .vercel/project.json
```

### **Schritt 3: GitHub Repository Secrets konfigurieren**

1. **Gehen Sie zu:** https://github.com/Zutavern/survey-platform
2. **Klicken Sie:** Settings → Secrets and variables → Actions
3. **Klicken Sie:** "New repository secret"

#### **Fügen Sie folgende Secrets hinzu:**

| Secret Name | Wert | Beschreibung |
|-------------|------|--------------|
| `OPENAI_API_KEY` | `sk-...` | Ihr OpenAI API Key |
| `VERCEL_TOKEN` | `vercel_...` | Ihr Vercel Token |
| `VERCEL_ORG_ID` | `team_...` oder `your_username` | Vercel Org/Team ID |
| `VERCEL_PROJECT_ID` | `prj_...` | Vercel Project ID |
| `TALLY_API_KEY` | `tly-...` | Aktueller Tally Key (bereits vorhanden) |
| `DATABASE_URL` | `postgresql://...` | Database URL (für zukünftige Features) |

### **Schritt 4: Vercel Environment Variables**

1. **Gehen Sie zu:** https://vercel.com/dashboard
2. **Wählen Sie Ihr Projekt:** survey-platform  
3. **Klicken Sie:** Settings → Environment Variables
4. **Fügen Sie hinzu für ALLE Environments (Production, Preview, Development):**

| Variable | Wert |
|----------|------|
| `OPENAI_API_KEY` | `sk-...` |
| `TALLY_API_KEY` | `tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE` |
| `DATABASE_URL` | `postgresql://username:password@localhost:5432/survey_db` |
| `NODE_ENV` | `production` |

## 🚀 Automatisches Deployment testen

### **Option 1: Push auf main branch**
```bash
# Kleine Änderung machen
echo "# Deployment Test" >> DEPLOYMENT_TEST.md
git add .
git commit -m "Test: Trigger automated deployment"
git push origin main
```

### **Option 2: Pull Request erstellen**
```bash
# Neuen Branch erstellen
git checkout -b test-deployment
echo "Test deployment feature" > test.txt
git add .
git commit -m "Test: Create PR deployment"
git push origin test-deployment

# Dann auf GitHub einen PR erstellen
```

## 🔍 Deployment überwachen

### **GitHub Actions Logs:**
- **Gehen Sie zu:** https://github.com/Zutavern/survey-platform/actions
- **Schauen Sie:** Workflow-Status und Logs

### **Vercel Deployment Logs:**
- **Gehen Sie zu:** https://vercel.com/dashboard → Ihr Projekt
- **Schauen Sie:** Deployments Tab

## ✅ Erwartete Ergebnisse

### **Bei erfolgreichem Setup:**

1. **Pull Requests erhalten:**
   - ✅ Automatische Tests
   - ✅ Security Scan
   - ✅ Preview-Deployment
   - ✅ Kommentar mit Preview-URL

2. **Main Branch Push:**
   - ✅ Production Deployment
   - ✅ Alle Tests + Security
   - ✅ Live unter Ihrer Domain

3. **AI-Features funktionieren:**
   - ✅ KI-Formular-Generator verfügbar
   - ✅ OpenAI API Integration aktiv
   - ✅ Alle Tally-Features funktional

## 🚨 Troubleshooting

### **Häufige Probleme:**

#### **"Invalid OpenAI API Key"**
```bash
# API Key prüfen:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key-here"
```

#### **"Vercel deployment failed"**
```bash
# Lokale Vercel-Logs prüfen:
vercel logs https://your-deployment-url.vercel.app
```

#### **"GitHub Actions failing"**
- Prüfen Sie alle Secret-Namen (case-sensitive!)
- Vergewissern Sie sich, dass alle Secrets gesetzt sind
- Schauen Sie in die Actions-Logs für Details

#### **"Build fails on Vercel"**
- Environment Variables in Vercel korrekt gesetzt?
- Node.js Version compatible (18.x oder 20.x)?

## 📊 Kosten-Übersicht

### **OpenAI API (GPT-4 Turbo):**
- **Input:** ~$0.01 pro 1K tokens
- **Output:** ~$0.03 pro 1K tokens
- **Pro Formular:** Ca. $0.01-0.05 (je nach Komplexität)
- **100 Formulare/Monat:** Ca. $1-5

### **Vercel (Hobby Plan):**
- **Kostenlos für:** Persönliche Projekte
- **Limits:** 100GB Bandwidth, Unlimited Deployments

### **GitHub Actions:**
- **Kostenlos für:** Public Repositories
- **2000 Minuten/Monat** für Private Repos

## 🎯 Finale Validierung

Nach dem Setup testen Sie:

1. **AI-Generator:** http://your-domain.vercel.app/tally/ai-create
2. **Dashboard:** http://your-domain.vercel.app/tally
3. **Login:** http://your-domain.vercel.app/login

**Login-Daten:** 
- Email: `admin@admin.com`
- Password: `admin123`

## 🔐 Security Best Practices

1. **API Keys niemals in Code committen**
2. **Regelmäßige Key-Rotation** (alle 6 Monate)
3. **Monitoring:** OpenAI Usage Dashboard im Auge behalten
4. **Rate Limits:** Implementiert für API-Missbrauch-Schutz
5. **HTTPS Only:** Alle Secrets nur über sichere Verbindungen

---

**🎉 Nach diesem Setup haben Sie eine vollautomatische, professional CI/CD Pipeline mit KI-Features!**

Bei Problemen schauen Sie in:
- GitHub Actions Logs
- Vercel Deployment Logs  
- Browser Developer Console