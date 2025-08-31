# ✅ Deployment Checklist - Survey Platform

## 🎯 Schritt-für-Schritt Anleitung

### **Phase 1: OpenAI API Setup (5 Minuten)**

- [ ] **OpenAI Account erstellen/anmelden:** https://platform.openai.com
- [ ] **API Key generieren:** https://platform.openai.com/api-keys
- [ ] **Key kopieren:** Beginnt mit `sk-...` (wird nur einmal angezeigt!)
- [ ] **Billing Setup:** Zahlungsmethode hinzufügen (ca. $5 Guthaben für Tests)

### **Phase 2: Vercel Setup (10 Minuten)**

- [ ] **Vercel Account:** https://vercel.com (GitHub Login empfohlen)
- [ ] **CLI Installation:** `npm install -g vercel` (bereits installiert)
- [ ] **Login:** `vercel login`
- [ ] **Projekt verbinden:** `vercel` im Projektverzeichnis
- [ ] **Domain notieren:** z.B. `survey-platform-abc123.vercel.app`

#### **Vercel Token erstellen:**
- [ ] **Gehen Sie zu:** https://vercel.com/account/tokens
- [ ] **Token erstellen:** Name: "GitHub Actions Survey Platform"
- [ ] **Token kopieren:** Beginnt mit `vercel_...`

#### **Vercel IDs ermitteln:**
```bash
# Nach 'vercel' setup ausführen:
cat .vercel/project.json
```
- [ ] **ORG_ID:** Ihr Username oder Team-ID
- [ ] **PROJECT_ID:** Beginnt mit `prj_...`

### **Phase 3: GitHub Secrets konfigurieren (5 Minuten)**

**Gehen Sie zu:** https://github.com/Zutavern/survey-platform/settings/secrets/actions

**Klicken Sie:** "New repository secret" für jeden:

| ✅ | Secret Name | Beispielwert | Quelle |
|---|-------------|--------------|---------|
| [ ] | `OPENAI_API_KEY` | `sk-abc123...` | OpenAI Dashboard |
| [ ] | `VERCEL_TOKEN` | `vercel_abc123...` | Vercel Tokens |
| [ ] | `VERCEL_ORG_ID` | `Zutavern` oder `team_xyz` | .vercel/project.json |
| [ ] | `VERCEL_PROJECT_ID` | `prj_abc123...` | .vercel/project.json |
| [ ] | `TALLY_API_KEY` | `tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE` | Bereits gesetzt |
| [ ] | `DATABASE_URL` | `postgresql://...` | Für zukünftige Features |

### **Phase 4: Vercel Environment Variables (5 Minuten)**

**Gehen Sie zu:** https://vercel.com/dashboard → survey-platform → Settings → Environment Variables

**Für ALLE Environments (Production, Preview, Development) hinzufügen:**

| ✅ | Variable | Wert | Environment |
|---|----------|------|-------------|
| [ ] | `OPENAI_API_KEY` | `sk-abc123...` | All |
| [ ] | `TALLY_API_KEY` | `tly-nTdwwmUSXJdfZ7CTdz3SqJHF0BnE5SgE` | All |
| [ ] | `DATABASE_URL` | `postgresql://...` | All |
| [ ] | `NODE_ENV` | `production` | Production only |

### **Phase 5: Deployment Test (2 Minuten)**

- [ ] **Änderung committen:**
```bash
echo "✅ Deployment configured" >> DEPLOYMENT_STATUS.md
git add .
git commit -m "Configure: Complete deployment setup with all secrets"
git push origin main
```

- [ ] **GitHub Actions überwachen:** https://github.com/Zutavern/survey-platform/actions
- [ ] **Vercel Deployment überwachen:** https://vercel.com/dashboard

### **Phase 6: Funktionalitäts-Check (3 Minuten)**

Nach erfolgreichem Deployment testen Sie:

- [ ] **Live App:** https://your-domain.vercel.app
- [ ] **Login funktioniert:** admin@admin.com / admin123
- [ ] **Dashboard lädt:** /tally
- [ ] **KI-Generator verfügbar:** /tally/ai-create
- [ ] **AI-Feature funktioniert:** Test-Prompt eingeben

## 🚨 Troubleshooting

### **"GitHub Actions failed"**
- [ ] Alle Secrets korrekt benannt? (Case-sensitive!)
- [ ] Alle 6 Secrets gesetzt?
- [ ] Actions-Logs prüfen für Details

### **"Vercel build failed"**
- [ ] Environment Variables in Vercel gesetzt?
- [ ] Alle 4 Variables für alle Environments?
- [ ] Vercel-Logs prüfen

### **"OpenAI API not working"**
```bash
# API Key testen:
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer sk-your-key"
```
- [ ] API Key korrekt?
- [ ] Billing eingerichtet?
- [ ] Quota nicht überschritten?

### **"App shows errors"**
- [ ] Browser Developer Console prüfen
- [ ] Alle Environment Variables deployed?
- [ ] Hard-Refresh: Ctrl+Shift+R / Cmd+Shift+R

## ✅ Erfolgs-Indikatoren

### **GitHub Actions zeigt:**
- ✅ All checks passed
- ✅ Tests completed  
- ✅ Security scan passed
- ✅ Production deployment successful

### **Vercel Dashboard zeigt:**
- ✅ Deployment Status: Ready
- ✅ Functions: All operational
- ✅ Build Logs: No errors

### **Live App funktioniert:**
- ✅ Login-Seite lädt
- ✅ Authentication funktioniert
- ✅ Dashboard zeigt Formulare
- ✅ KI-Generator ist verfügbar
- ✅ Formular-Generierung funktioniert

## 🎉 Nach erfolgreichem Setup haben Sie:

- 🤖 **KI-powered Formular-Generator** mit OpenAI GPT-4
- 🚀 **Automatisches CI/CD** bei jedem Git Push
- 🔒 **Sichere Secret-Verwaltung** via GitHub/Vercel
- 📊 **Production-ready App** mit professionellem UI
- 🔄 **Preview-Deployments** für jeden Pull Request
- 📈 **Performance Monitoring** und Health Checks

## 📞 Support

Bei Problemen:
1. **GitHub Issues:** https://github.com/Zutavern/survey-platform/issues
2. **Logs prüfen:** GitHub Actions + Vercel Dashboard
3. **Documentation:** Siehe README.md, DEPLOYMENT.md, AI_FEATURES.md

---

**⏱️ Gesamtzeit: ~30 Minuten**
**💰 Kosten: ~$5-10/Monat für OpenAI API bei normalem Gebrauch**