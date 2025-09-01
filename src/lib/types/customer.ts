// Customer Management Types

export interface Customer {
  id: string;
  // Firmendaten
  companyName: string;
  street: string;
  postalCode: string;
  city: string;
  // Hauptansprechpartner
  primaryContact: {
    firstName: string;
    lastName: string;
    role: string;
    email: string;
    phone: string;
  };
  // Zusätzliche Kontakte
  additionalContacts: ContactPerson[];
  // Zugewiesene Umfragen
  assignedSurveys: CustomerSurvey[];
  // Metadaten
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'inactive';
}

export interface ContactPerson {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

export interface CustomerSurvey {
  id: string;
  customerId: string;
  originalSurveyId: string; // ID der Template-Umfrage
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  assignedTo: string[]; // Contact Person IDs
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  tallyFormId?: string; // ID des kopierten Tally-Formulars
  responses: number;
  // Individual evaluation data
  individualResults?: {
    totalResponses: number;
    completionRate: number;
    averageCompletionTime: number;
    lastResponseAt?: string;
  };
}

export interface SurveyTemplate {
  id: string;
  title: string;
  description: string;
  category: 'assessment' | 'feedback' | 'evaluation' | 'survey';
  questions: any[];
  settings: any;
  isActive: boolean;
  createdAt: string;
}