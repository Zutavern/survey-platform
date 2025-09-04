# Neon Database Setup für Survey Platform

Dieses Projekt nutzt [Neon](https://neon.tech) als PostgreSQL-Datenbank sowohl für Development als auch Production.

## Warum Neon?

- ✅ **Konsistente Umgebung**: Gleiche Datenbank-Engine in Dev und Prod
- ✅ **Branches**: Separate Branches für Development und Production
- ✅ **Serverless**: Automatisches Scaling und Connection Pooling
- ✅ **Kosteneffizient**: Pay-per-use, automatisches Hibernation
- ✅ **Backup & Recovery**: Automatische Point-in-time Recovery

## Setup für Development

### 1. Neon Projekt (bereits vorhanden)
```bash
# Ihr Projekt ist bereits konfiguriert:
# Project: ep-calm-hat-ag3ra08i (eu-central-1)
# Console: https://console.neon.tech/app/projects
```

### 2. Development Branch erstellen
```bash
# Gehe zur Neon Console:
# 1. Öffne https://console.neon.tech/app/projects
# 2. Wähle dein Projekt: ep-calm-hat-ag3ra08i
# 3. Klicke auf "Branches" in der Seitenleiste  
# 4. Klicke "Create Branch"
# 5. Branch Name: "development"
# 6. Basierend auf: "main" branch
# 7. Kopiere die neue Connection URL (wird ähnlich aussehen wie):
#    postgresql://neondb_owner:npg_XYZ@ep-dev-branch-xyz.c-2.eu-central-1.aws.neon.tech/neondb
```

### 3. Environment Setup
```bash
# Kopiere die Development-Umgebung
cp .env.local.example .env.local

# Editiere .env.local mit deiner Neon Development Database URL
DATABASE_URL="postgresql://username:password@ep-dev-branch-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-dev-branch-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### 4. Prisma Migration ausführen
```bash
# Schema in die Development-Datenbank pushen
npx prisma db push

# Test-User erstellen
node scripts/create-test-users.js
```

## Setup für Production

### 1. Production Branch
```bash
# In der Neon Console:
# - Verwende den Main Branch für Production
# - Oder erstelle einen separaten "production" Branch
```

### 2. Vercel Environment Variables
In der Vercel Console unter Project Settings → Environment Variables:

```bash
# Production Database
DATABASE_URL="postgresql://username:password@ep-main-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://username:password@ep-main-xyz.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Security Keys (generiere neue für Production!)
JWT_SECRET="your-production-jwt-secret-key-here"
ENCRYPTION_KEY="your-32-char-production-encryption-key!"
```

## Neon Branch Strategie

```
neon-project/
├── main (production)           # Produktions-Datenbank
├── development                 # Development-Datenbank
├── feature/new-feature         # Feature-Branch für spezielle Features
└── staging                     # Optional: Staging-Umgebung
```

## Development Workflow

### Lokale Entwicklung
```bash
# 1. Hole die neuesten Änderungen
git pull origin main

# 2. Starte den Development Server
npm run dev
# -> Nutzt automatisch die Neon Development Database

# 3. Schema-Änderungen
npx prisma db push  # Für Development
# Oder für Production-Ready Changes:
npx prisma migrate dev --name add-feature-x
```

### Deployment
```bash
# 1. Push zu Git main
git push origin main

# 2. Vercel deployed automatisch mit Production Neon Database
# 3. Führe Production Migrations aus (falls nötig):
npx prisma migrate deploy
```

## Migration zwischen Environments

### Development → Production
```bash
# 1. Migrations in Development testen
npx prisma migrate dev --name new-feature

# 2. Git commit und push
git add . && git commit -m "feat: add new feature with database changes"
git push origin main

# 3. Production Migration (automatisch via Vercel oder manuell)
npx prisma migrate deploy
```

## Monitoring und Debugging

### Neon Console
- Gehe zu https://console.neon.tech
- Überwache Database Usage, Connections
- Sieh Query Performance und Logs

### Prisma Studio
```bash
# Für Development Database
npx prisma studio

# Für Production (vorsichtig verwenden!)
DATABASE_URL="production-url" npx prisma studio
```

## Backup & Recovery

Neon bietet automatische Backups:
- **Point-in-time Recovery**: Bis zu 7 Tage (Free Tier) / 30 Tage (Pro)
- **Branch-based Recovery**: Erstelle Branch von beliebigem Zeitpunkt
- **Export**: Manueller SQL Export möglich

## Troubleshooting

### Connection Issues
```bash
# Teste Verbindung
npx prisma db seed --preview-feature

# Checke Connection String Format
# Muss enthalten: ?sslmode=require
```

### Schema Sync Issues
```bash
# Reset Development Database
npx prisma migrate reset

# Regenerate Prisma Client
npx prisma generate
```

### Performance
```bash
# Connection Pooling ist automatisch aktiv
# Bei vielen Connections: Nutze DIRECT_URL für Migrations
# Bei wenigen: DATABASE_URL reicht
```

## Best Practices

1. **Niemals Production-Daten in Development verwenden**
2. **Migrations immer in Development testen**
3. **Environment Variables niemals in Code committen**
4. **Regelmäßige Backups via Neon Console**
5. **Monitoring der Database Performance**
6. **Connection Limits beachten (Free: 20, Pro: 100+)**