# 🤖 KI-gesteuerte Formular-Generierung

## Übersicht
Die Survey Platform verfügt über eine fortschrittliche KI-Integration mit OpenAI GPT-4, die automatisch professionelle Formulare basierend auf natürlichsprachigen Prompts erstellt.

## ✨ Features

### 🎯 Intelligente Formular-Generierung
- **Natural Language Processing**: Beschreiben Sie einfach, was Sie benötigen
- **Kontextbewusstes Design**: Die KI versteht Ihren Use Case und erstellt angemessene Felder
- **Professionelle Struktur**: Automatische Optimierung von Fragenreihenfolge und -typ

### 📋 Vollständige Tally-Integration
**Unterstützte Feldtypen:**
- ✅ **Basic Fields**: Text, Textarea, Email, URL, Phone, Number
- ✅ **Choice Fields**: Radio, Checkbox, Select, Multiselect
- ✅ **Advanced Fields**: Rating, Scale, Ranking, Matrix
- ✅ **Date/Time**: Date, Time, DateTime with restrictions
- ✅ **File Handling**: File Upload with type/size restrictions
- ✅ **Special Fields**: Signature, Address, Payment Integration
- ✅ **Logic Fields**: Conditional Logic, Hidden Fields, Calculations
- ✅ **Structure**: Section Breaks, Page Breaks

### 🔧 Erweiterte Konfiguration
**Automatische Validierung:**
- Min/Max Länge und Werte
- Regex-Pattern für custom Validation
- Custom Error Messages
- Required Field Detection

**Design & Styling:**
- Theme Configuration (Colors, Fonts)
- Mobile-optimized Layouts
- Progress Bars und Navigation
- Custom Button Texts

**Integration Features:**
- Email Notifications
- Webhook Configuration
- Slack Integration
- Payment Processing (Stripe)

## 🚀 Verwendung

### 1. KI-Generator öffnen
- Gehen Sie zum Tally Dashboard
- Klicken Sie auf **"KI-Generator"** (lila Button)

### 2. Prompt eingeben
Beschreiben Sie das gewünschte Formular in natürlicher Sprache:

**Beispiele:**
```
"Erstelle eine Kundenzufriedenheits-Umfrage für ein Restaurant mit 
Bewertungsskalen für Service, Essen und Atmosphäre, plus Freitext-
Feedback und Kontaktdaten für Follow-up"

"Bewerber-Assessment für Software-Developer Position mit 
technischen Fragen, Portfolio-Upload und Gehaltsvorstellung"

"Event-Anmeldung mit Teilnehmerdetails, Catering-Optionen, 
Zahlungsintegration und automatischer Bestätigungs-Email"

"Medizinisches Intake-Formular mit Patientendaten, 
Symptom-Checkliste, Upload für Versicherungskarte und 
Terminvereinbarung"
```

### 3. Konfiguration (Optional)
- **Eigener API Key**: Verwenden Sie Ihren eigenen OpenAI API Key
- **Erweiterte Optionen**: Die KI wählt automatisch optimale Einstellungen

### 4. Vorschau & Bearbeitung
- **Live Preview**: Sehen Sie das generierte Formular sofort
- **Detaillierte Übersicht**: Alle Felder, Validierung und Einstellungen
- **Metadaten**: Fragen-Anzahl, geschätzte Bearbeitungszeit

### 5. Speichern & Verwenden
- Das Formular wird direkt in Ihr Tally-Dashboard integriert
- Sofort einsatzbereit mit allen Features

## 🎨 KI-Prompt Best Practices

### ✅ Gute Prompts
```
"Erstelle ein Kundenfeedback-Formular für eine Zahnarztpraxis mit:
- Patientendaten (Name, Kontakt)
- Bewertungsskalen für Service-Qualität (1-5)
- Spezifische Fragen zu Behandlung und Praxis
- Freitext für Verbesserungsvorschläge
- Optional: Weiterempfehlungs-Wahrscheinlichkeit"
```

### ❌ Zu vage
```
"Mache ein Formular für Kunden"
```

### 💡 Tipps für optimale Ergebnisse
1. **Kontext angeben**: Branche, Zielgruppe, Zweck
2. **Spezifische Felder**: Listen Sie gewünschte Datentypen auf
3. **Validierung erwähnen**: "Pflichtfelder", "E-Mail-Validierung"
4. **Design-Wünsche**: "Professionell", "Benutzerfreundlich"
5. **Integration**: "Mit Payment", "E-Mail-Bestätigung"

## ⚙️ Setup & Konfiguration

### OpenAI API Key einrichten
1. **API Key erhalten**: https://platform.openai.com/api-keys
2. **Environment Variable setzen**:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. **Alternative**: API Key direkt in der UI eingeben

### Kosten-Optimierung
- **GPT-4 Turbo**: Optimiert für Qualität und Kosteneffizienz
- **Token-Management**: Intelligente Prompt-Optimierung
- **Fallback**: Graceful degradation bei API-Fehlern

## 🔍 Erweiterte Features

### Conditional Logic
Die KI erstellt automatisch bedingte Logik:
```json
{
  "conditionalLogic": {
    "showIf": {
      "questionId": "satisfaction_rating", 
      "operator": "less_than",
      "value": "3"
    }
  }
}
```

### Matrix Questions
Komplexe Bewertungsmatrizen für detailliertes Feedback:
```json
{
  "type": "matrix_radio",
  "matrix": {
    "rows": ["Service", "Qualität", "Preis"],
    "columns": ["Sehr gut", "Gut", "Befriedigend", "Schlecht"]
  }
}
```

### Payment Integration
Automatische Zahlungsintegration für Events/Services:
```json
{
  "type": "payment",
  "payment": {
    "currency": "EUR",
    "amount": 50.00,
    "description": "Workshop-Teilnahme",
    "allowCustomAmount": false
  }
}
```

## 📊 Qualitätssicherung

### Automatische Validierung
- **Schema-Validation**: Alle generierten Formulare entsprechen Tally-Standards
- **Field-Type-Matching**: Intelligente Zuordnung von Datentypen
- **UX-Optimierung**: Automatische Verbesserung der Benutzerführung

### Fallback-Mechanismen
- **API-Errors**: Graceful handling von OpenAI-Ausfällen
- **Invalid JSON**: Automatische Korrektur und Retry-Logic  
- **Quota-Management**: Intelligente Rate-Limiting

## 🎯 Use Cases

### 🏢 Business
- Lead-Qualifizierung
- Kundenzufriedenheits-Umfragen
- Mitarbeiter-Feedback
- Marktforschung

### 🎓 Bildung
- Kurs-Evaluationen
- Studenten-Assessment
- Anmeldeverfahren
- Lernfortschritts-Tracking

### 🏥 Healthcare  
- Patienten-Intake
- Symptom-Tracking
- Therapie-Feedback
- Terminbuchung

### 🎉 Events
- Anmeldungen mit Payment
- Feedback-Collection
- Catering-Management
- Teilnehmer-Koordination

## 🚀 Technische Details

### API Endpoint
```
POST /api/ai/generate-form
{
  "prompt": "Ihr Formular-Prompt",
  "apiKey": "optional-custom-api-key"
}
```

### Response Format
```json
{
  "success": true,
  "form": { /* Vollständiges Tally-Formular */ },
  "metadata": {
    "questionCount": 8,
    "estimatedCompletionTime": 4,
    "model": "gpt-4-1106-preview"
  }
}
```

### Supported Models
- **GPT-4 Turbo** (Empfohlen): Beste Qualität, JSON-Mode
- **GPT-4**: Hohe Qualität, etwas langsamer
- **GPT-3.5 Turbo**: Schnell, grundlegende Formulare

---

**🎉 Die KI-Integration macht Formular-Erstellung so einfach wie ein Gespräch!**

Probieren Sie es aus und lassen Sie sich von der Intelligenz und Flexibilität überraschen.