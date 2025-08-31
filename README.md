# Survey System

Ein modernes, vollständiges Survey-System entwickelt mit Next.js 15, TypeScript, Prisma, und Shadcn UI.

## 🚀 Features

- **Moderne UI**: Dunkelblaue Farbpalette mit Shadcn UI Komponenten
- **Responsive Design**: Optimiert für alle Geräte
- **TypeScript**: Vollständige Typsicherheit
- **Prisma ORM**: Sichere Datenbankoperationen
- **Next.js 15**: App Router mit Server Components
- **Tailwind CSS**: Utility-first Styling

## 📋 Umfrage-Features

- ✅ Umfragen erstellen und bearbeiten
- ✅ Verschiedene Fragetypen (Text, Multiple Choice, Checkbox, Bewertung)
- ✅ Pflichtfragen markieren
- ✅ Antworten sammeln und analysieren
- ✅ Übersichtliche Dashboard-Ansicht

## 🛠️ Technologie-Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI, Radix UI
- **Datenbank**: PostgreSQL mit Prisma ORM
- **Icons**: Lucide React
- **State Management**: React Hooks

## 🚀 Installation

1. **Repository klonen**
   ```bash
   git clone <repository-url>
   cd survey
   ```

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **Umgebungsvariablen konfigurieren**
   ```bash
   cp .env.example .env.local
   ```
   
   Füge deine Datenbank-URL hinzu:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/survey_db"
   ```

4. **Datenbank einrichten**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Entwicklungsserver starten**
   ```bash
   npm run dev
   ```

6. **Anwendung öffnen**
   Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

## 📁 Projektstruktur

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Globale Styles
│   ├── layout.tsx         # Root Layout
│   ├── page.tsx           # Homepage
│   └── surveys/           # Survey-Routen
│       ├── create/        # Umfrage erstellen
│       └── page.tsx       # Survey-Übersicht
├── components/            # React Komponenten
│   └── ui/               # Shadcn UI Komponenten
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── ...
└── lib/                  # Utility-Funktionen
    ├── prisma.ts         # Prisma Client
    └── utils.ts          # Allgemeine Utils
```

## 🎨 Design-System

Das System verwendet eine konsistente dunkelblaue Farbpalette:

- **Primär**: `#1e3a8a` (Dunkelblau)
- **Sekundär**: `#dbeafe` (Helles Blau)
- **Akzent**: `#3b82f6` (Standard Blau)
- **Hintergrund**: `#f0f9ff` (Sehr helles Blau)

## 📊 Datenbank-Schema

Das Prisma Schema umfasst:

- **User**: Benutzerverwaltung
- **Survey**: Umfrage-Details
- **Question**: Fragen mit verschiedenen Typen
- **Option**: Antwortoptionen für Multiple Choice
- **Response**: Umfrage-Antworten
- **Answer**: Einzelne Antworten

## 🔧 Entwicklung

### Neue Komponenten hinzufügen

```bash
# Shadcn UI Komponente hinzufügen
npx shadcn@latest add [component-name]
```

### Datenbank-Migrationen

```bash
# Neue Migration erstellen
npx prisma migrate dev --name [migration-name]

# Migrationen anwenden
npx prisma migrate deploy
```

### TypeScript-Typen generieren

```bash
# Prisma Client neu generieren
npx prisma generate
```

## 🚀 Deployment

### Vercel (Empfohlen)

1. Verbinde dein Repository mit Vercel
2. Setze die Umgebungsvariablen in Vercel
3. Deploy automatisch bei jedem Push

### Andere Plattformen

```bash
# Build erstellen
npm run build

# Produktionsserver starten
npm start
```

## 📝 API-Routen

Das System verwendet Next.js 15 App Router mit Route Handlers:

- `POST /api/surveys` - Neue Umfrage erstellen
- `GET /api/surveys` - Alle Umfragen abrufen
- `GET /api/surveys/[id]` - Einzelne Umfrage abrufen
- `PUT /api/surveys/[id]` - Umfrage aktualisieren
- `DELETE /api/surveys/[id]` - Umfrage löschen

## 🤝 Beitragen

1. Fork das Repository
2. Erstelle einen Feature-Branch (`git checkout -b feature/amazing-feature`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Push zum Branch (`git push origin feature/amazing-feature`)
5. Öffne einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT-Lizenz lizenziert.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfe die [Issues](../../issues)
2. Erstelle ein neues Issue mit detaillierter Beschreibung
3. Kontaktiere das Entwicklungsteam

---

**Entwickelt mit ❤️ und Next.js 15**
