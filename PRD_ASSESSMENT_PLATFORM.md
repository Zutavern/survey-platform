# PRD: Assessment Platform für Beratungsprojekte

## 1. Produktübersicht

### Vision
Eine spezialisierte Assessment-Platform für die Ersteinschätzung in Beratungsprojekten, die sowohl Einzelkunden als auch Kundenteams strukturierte Bewertungen ermöglicht. Die Platform nutzt KI-gestützte Formularerstellung und automatisierte Analyse für optimale Beratungsergebnisse.

### Zielgruppe
- **Berater**: Erstellen und verwalten Assessments für Kundenprojekte
- **Einzelkunden**: Führen individuelle Bewertungen durch
- **Kundenteams**: Mehrere Teammitglieder pro Unternehmen bewerten kollaborativ

## 2. Kernfunktionalitäten

### 2.1 Assessment-Modi
- **Individual Assessment**: Ein Kunde pro Unternehmen
- **Team Assessment**: Mehrere Teilnehmer pro Unternehmen mit aggregierten Ergebnissen

### 2.2 AI-Gestützte Features
- **Intelligente Formularerstellung**: KI-generierte Assessments basierend auf Textbeschreibungen
- **Automatisierte Analyse**: KI-powered Auswertung von Antworten und Trends
- **Smart Recommendations**: Personalisierte Empfehlungen basierend auf Assessment-Ergebnissen
- **Sentiment Analysis**: Automatische Stimmungsanalyse in Textantworten

### 2.3 Form Persistence System
- **Universelle Speicherung**: Einheitliche Speicherung für Tally- und lokale Formulare
- **Flexible Datenstruktur**: JSON-basierte Antwortenspeicherung für maximale Flexibilität
- **Provider-Agnostic**: Unabhängigkeit von spezifischen Formular-Anbietern
- **Vollständige Audit-Trails**: Komplette Nachverfolgung aller Änderungen

### 2.4 Benutzerrollen
- **Berater/Admin**: Vollzugriff auf alle Assessments und Ergebnisse
- **Kunde (Individual)**: Zugriff auf eigene Assessments
- **Team-Member**: Zugriff auf Team-Assessments des eigenen Unternehmens
- **Team-Lead**: Erweiterte Rechte für Team-Management

## 3. Funktionale Anforderungen

### 3.1 Assessment-Management
- **KI-Generierung**: Automatische Erstellung von Assessments aus Textbeschreibungen
- **Strukturierte Vorlagen**: Vordefinierte Assessment-Templates für verschiedene Beratungsbereiche
- **Kategorisierung**: Themenbereich-spezifische Fragenkataloge
- **Konfiguration**: Individual vs. Team-Modus pro Assessment
- **Aktivierung**: Zeitgesteuerte Verfügbarkeit von Assessments
- **Form Persistence**: Einheitliche Speicherung aller Formular-Typen in der Datenbank

### 3.2 Teilnehmer-Management
- **Unternehmen**: Zentrale Verwaltung von Kundenunternehmen
- **Einladungen**: E-Mail-basierte Einladungen mit Zugangslinks
- **Team-Zuordnung**: Mitarbeiter zu Unternehmen zuordnen
- **Berechtigungen**: Rollbasierte Zugriffskontrolle

### 3.3 Assessment-Durchführung
- **Progressive Speicherung**: Zwischenspeichern während der Bearbeitung
- **Validierung**: Pflichtfelder und Datenvalidierung
- **Multi-Device**: Responsive Design für alle Geräte
- **Offline-Fähigkeit**: Lokale Speicherung und Synchronisation

### 3.4 Datensammlung & Auswertung
- **Strukturierte Antworten**: Verschiedene Fragetypen (Text, Multiple Choice, Skala, Matrix)
- **KI-Analyse**: Automatisierte Auswertung von Antworten mit GPT-4
- **Sentiment Analysis**: Stimmungsanalyse für Textantworten
- **Team-Aggregation**: Automatische Zusammenfassung von Team-Antworten
- **Vergleichsanalyse**: KI-gestützte Bewertung zwischen Teammitgliedern
- **Smart Insights**: Automatische Erkennung von Mustern und Trends
- **Export-Funktionen**: PDF-Reports, Excel-Export, API-Schnittstellen

## 4. Datenmodell (Erweiterung des bestehenden Systems)

### 4.1 Form Persistence System

```prisma
model FormDefinition {
  id          String   @id @default(cuid())
  sourceId    String?  // external provider id (e.g., Tally ID)
  title       String
  description String?
  status      String   @default("draft")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  fields      FormField[]
  submissions FormSubmission[]
}

model FormField {
  id          String   @id @default(cuid())
  formId      String
  key         String   // stable programmatic key
  label       String
  type        String   // text, email, textarea, radio, checkbox, rating, etc.
  required    Boolean  @default(false)
  order       Int      @default(0)
  options     Json?    // field configuration as JSON

  form        FormDefinition @relation(fields: [formId], references: [id], onDelete: Cascade)
  answers     FormAnswer[]
}

model FormSubmission {
  id          String   @id @default(cuid())
  formId      String
  submittedAt DateTime @default(now())
  respondent  String?  // identifier for the respondent
  meta        Json?    // additional metadata

  form        FormDefinition @relation(fields: [formId], references: [id], onDelete: Cascade)
  answers     FormAnswer[]
  analyses    Analysis[]     // AI analysis results
}

model FormAnswer {
  id           String   @id @default(cuid())
  submissionId String
  fieldId      String
  value        Json     // normalized answer value as JSON

  submission   FormSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  field        FormField      @relation(fields: [fieldId], references: [id], onDelete: Cascade)
}

model Analysis {
  id            String   @id @default(cuid())
  submissionId  String
  model         String   // AI model used (e.g., "gpt-4")
  result        Json     // analysis results as JSON
  createdAt     DateTime @default(now())

  submission    FormSubmission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
}

model ApiCredential {
  id           String   @id @default(cuid())
  userEmail    String   @unique
  
  // Encrypted API key components (AES-256-GCM)
  tallyCipher  String?
  tallyIv      String?
  tallyTag     String?
  
  openaiCipher String?
  openaiIv     String?
  openaiTag    String?
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### 4.2 Assessment-Spezifische Entitäten

```prisma
model Company {
  id              String    @id @default(cuid())
  name            String
  industry        String?
  size            CompanySize?
  contactEmail    String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  assessments     Assessment[]
  teamMembers     TeamMember[]
  individualResponses Response[]
}

model Assessment {
  id              String    @id @default(cuid())
  title           String
  description     String?
  category        AssessmentCategory
  mode            AssessmentMode  // INDIVIDUAL, TEAM
  isActive        Boolean   @default(true)
  startDate       DateTime?
  endDate         DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  consultantId    String
  consultant      User      @relation(fields: [consultantId], references: [id])
  companies       AssessmentCompany[]
  questions       AssessmentQuestion[]
  responses       Response[]
}

model AssessmentCompany {
  id              String    @id @default(cuid())
  inviteCode      String    @unique
  invitedAt       DateTime  @default(now())
  completedAt     DateTime?
  
  // Relations
  assessmentId    String
  assessment      Assessment @relation(fields: [assessmentId], references: [id])
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id])
  
  @@unique([assessmentId, companyId])
}

model TeamMember {
  id              String    @id @default(cuid())
  email           String
  name            String?
  role            TeamRole  @default(MEMBER)
  invitedAt       DateTime  @default(now())
  joinedAt        DateTime?
  
  // Relations
  companyId       String
  company         Company   @relation(fields: [companyId], references: [id])
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  responses       Response[]
}

model AssessmentQuestion {
  id              String    @id @default(cuid())
  text            String
  type            QuestionType
  category        String?
  weight          Float?    @default(1.0)
  required        Boolean   @default(false)
  order           Int
  
  // Relations
  assessmentId    String
  assessment      Assessment @relation(fields: [assessmentId], references: [id])
  options         AssessmentOption[]
  answers         AssessmentAnswer[]
}

model AssessmentOption {
  id              String    @id @default(cuid())
  text            String
  value           Int?      // For scoring
  order           Int
  
  // Relations
  questionId      String
  question        AssessmentQuestion @relation(fields: [questionId], references: [id])
  answers         AssessmentAnswer[]
}

model AssessmentAnswer {
  id              String    @id @default(cuid())
  textAnswer      String?
  numericAnswer   Float?
  
  // Relations
  responseId      String
  response        Response  @relation(fields: [responseId], references: [id])
  questionId      String
  question        AssessmentQuestion @relation(fields: [questionId], references: [id])
  optionId        String?
  option          AssessmentOption? @relation(fields: [optionId], references: [id])
}

enum AssessmentMode {
  INDIVIDUAL
  TEAM
}

enum AssessmentCategory {
  STRATEGY
  OPERATIONS  
  TECHNOLOGY
  HR
  FINANCE
  MARKETING
  CUSTOM
}

enum CompanySize {
  STARTUP
  SMALL
  MEDIUM
  LARGE
  ENTERPRISE
}

enum TeamRole {
  MEMBER
  LEAD
  ADMIN
}
```

### 4.2 Erweiterte Response-Entity

```prisma
model Response {
  id              String    @id @default(cuid())
  mode            AssessmentMode
  isCompleted     Boolean   @default(false)
  startedAt       DateTime  @default(now())
  completedAt     DateTime?
  
  // Relations
  assessmentId    String
  assessment      Assessment @relation(fields: [assessmentId], references: [id])
  
  // Individual Mode
  userId          String?
  user            User?     @relation(fields: [userId], references: [id])
  companyId       String?
  company         Company?  @relation(fields: [companyId], references: [id])
  
  // Team Mode
  teamMemberId    String?
  teamMember      TeamMember? @relation(fields: [teamMemberId], references: [id])
  
  answers         AssessmentAnswer[]
}
```

## 5. User Stories

### 5.1 Berater/Admin
- Als Berater möchte ich Assessment-Vorlagen erstellen und verwalten
- Als Berater möchte ich KI nutzen, um Assessments aus Textbeschreibungen zu generieren
- Als Berater möchte ich automatisierte Analysen von Antworten erhalten
- Als Berater möchte ich Unternehmen zu Assessments einladen
- Als Berater möchte ich Individual- und Team-Modi konfigurieren
- Als Berater möchte ich Ergebnisse analysieren und exportieren
- Als Berater möchte ich Team-Aggregationen und KI-gestützte Vergleiche einsehen
- Als Berater möchte ich sentiment-analysierte Texteingaben auswerten

### 5.2 Einzelkunde
- Als Einzelkunde möchte ich ein Assessment für mein Unternehmen durchführen
- Als Einzelkunde möchte ich meine Antworten zwischenspeichern
- Als Einzelkunde möchte ich meine Ergebnisse einsehen

### 5.3 Team-Mitglieder
- Als Team-Mitglied möchte ich zu einem Unternehmens-Assessment eingeladen werden
- Als Team-Mitglied möchte ich meine individuelle Bewertung abgeben
- Als Team-Mitglied möchte ich anonymisierte Team-Ergebnisse einsehen

### 5.4 Team-Lead
- Als Team-Lead möchte ich weitere Teammitglieder einladen
- Als Team-Lead möchte ich den Fortschritt des Teams verfolgen
- Als Team-Lead möchte ich detaillierte Team-Analysen einsehen

## 6. Technische Anforderungen

### 6.1 Performance
- Unterstützung für bis zu 100 gleichzeitige Team-Teilnehmer pro Assessment
- Antwortzeiten unter 2 Sekunden für Assessment-Loading
- Offline-Fähigkeit für kritische Funktionen

### 6.2 Security
- End-to-End-Verschlüsselung für sensible Assessment-Daten
- Rollbasierte Zugriffskontrolle (RBAC)
- Audit-Logging für alle kritischen Aktionen
- GDPR-konforme Datenhaltung

### 6.3 Integration
- REST-API für externe Systeme
- Webhook-Support für Completion-Events
- Export-APIs (JSON, CSV, PDF)
- Single Sign-On (SSO) Integration

## 7. UI/UX Anforderungen

### 7.1 Assessment-Dashboard
- Übersicht über alle aktiven Assessments
- Fortschrittsanzeige für Team-Assessments
- Schnellzugriff auf Ergebnisse und Analysen

### 7.2 Assessment-Durchführung
- Intuitive, schrittweise Navigation
- Fortschrittsbalken und Speicher-Indikatoren
- Mobile-optimierte Eingabeformen
- Accessibility-konforme Bedienelemente

### 7.3 Ergebnisdarstellung
- Interactive Dashboards mit Diagrammen
- Vergleichsansichten für Team-Ergebnisse
- Filterbare und sortierbare Tabellen
- Export-Funktionen mit Vorschau

## 8. Erfolgs-Metriken

### 8.1 Nutzungsmetriken
- Assessment-Completion-Rate: >85%
- Time-to-Complete: <30 Minuten durchschnittlich
- Team-Participation-Rate: >80% der eingeladenen Mitglieder

### 8.2 Qualitätsmetriken
- System-Uptime: >99.5%
- Datengenauigkeit: >99.9%
- User-Satisfaction-Score: >4.5/5

## 9. Implementierungsplan

### Phase 1: Foundation & Form Persistence (4-6 Wochen)
- Datenmodell-Migration mit FormDefinition, FormField, FormSubmission
- Form Persistence System Implementation
- Grundlegende Assessment-Erstellung
- Individual-Modus Implementation

### Phase 2: AI Integration (6-8 Wochen)
- OpenAI GPT-4 Integration für Form-Generierung
- KI-gestützte Submission-Analyse
- Sentiment Analysis für Textantworten
- API Key Management mit Verschlüsselung

### Phase 3: Team Features (6-8 Wochen)  
- Team-Management System
- Kollaborative Assessment-Durchführung
- KI-gestützte Aggregations-Engine

### Phase 4: Analytics & Reporting (4-6 Wochen)
- Erweiterte KI-Auswertungen
- Smart Insights und Pattern Recognition
- Export-Funktionen mit AI-generierten Berichten
- Dashboard-Verbesserungen

### Phase 5: Advanced Features (6-8 Wochen)
- API-Integration
- Mobile App (optional)
- Advanced AI Analytics
- Predictive Insights

## 10. Risiken & Mitigation

### 10.1 Technische Risiken
- **Datenkonsistenz** bei Team-Assessments → Transactional Updates
- **Performance** bei großen Teams → Optimierte Queries & Caching
- **Offline-Sync** Konflikte → Conflict Resolution Strategie
- **AI API Ausfälle** → Fallback-Mechanismen und Caching
- **API Key Security** → AES-256-GCM Verschlüsselung und sichere Speicherung
- **KI-Analyse Qualität** → Model Versioning und Qualitätskontrolle

### 10.2 Business Risiken
- **User Adoption** → Extensive User Testing & Feedback Loops
- **Data Privacy** Bedenken → Transparente Privacy Policy
- **Consultant Workflow** Integration → Enge Zusammenarbeit mit Stakeholdern