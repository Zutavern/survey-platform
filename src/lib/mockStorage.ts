// Simple in-memory storage for development
// In production, this would be replaced with a real database

interface StoredForm {
  id: string;
  title: string;
  description: string;
  status: string;
  questions: any[];
  settings: any;
  createdAt: string;
  updatedAt: string;
  aiGenerated?: boolean;
  originalPrompt?: string;
}

// In-memory storage (will reset on server restart)
const formsStorage: Map<string, StoredForm> = new Map();

// Initialize with some mock data
const initializeMockData = () => {
  if (formsStorage.size === 0) {
    const mockForms = [
      {
        id: 'mock-1',
        title: 'Kunden-Assessment - Ersteinschätzung',
        description: 'Erfassung der wichtigsten Kundeninformationen für Beratungsprojekte',
        status: 'published',
        questions: [
          {
            id: 'q1',
            type: 'text',
            title: 'Unternehmensname',
            description: 'Bitte geben Sie den vollständigen Namen Ihres Unternehmens an',
            required: true,
            placeholder: 'z.B. Mustermann GmbH',
            order: 1
          },
          {
            id: 'q2',
            type: 'radio',
            title: 'Unternehmensgröße',
            description: 'Wie viele Mitarbeiter hat Ihr Unternehmen?',
            required: true,
            options: ['1-10 Mitarbeiter', '11-50 Mitarbeiter', '51-250 Mitarbeiter', '251-1000 Mitarbeiter', '1000+ Mitarbeiter'],
            order: 2
          },
          {
            id: 'q3',
            type: 'email',
            title: 'Kontakt E-Mail',
            description: 'Ihre primäre Kontakt-E-Mail-Adresse',
            required: true,
            placeholder: 'max.mustermann@example.com',
            order: 3
          }
        ],
        settings: {
          allowMultipleSubmissions: false,
          showProgressBar: true,
          collectEmails: true,
          thankYouMessage: 'Vielen Dank für Ihre Teilnahme!'
        },
        createdAt: '2024-08-31T10:00:00Z',
        updatedAt: '2024-08-31T10:00:00Z'
      },
      {
        id: 'mock-2',
        title: 'Team-Bewertung Digital Transformation',
        description: 'Bewertung der digitalen Reife durch multiple Teammitglieder',
        status: 'draft',
        questions: [
          {
            id: 'q1',
            type: 'rating',
            title: 'Bewerten Sie die aktuelle digitale Reife',
            description: 'Wie würden Sie den aktuellen Stand der Digitalisierung bewerten?',
            required: true,
            ratingScale: { min: 1, max: 5, step: 1 },
            order: 1
          }
        ],
        settings: {
          allowMultipleSubmissions: true,
          showProgressBar: true,
          collectEmails: false,
          thankYouMessage: 'Vielen Dank für Ihr Feedback!'
        },
        createdAt: '2024-08-30T15:00:00Z',
        updatedAt: '2024-08-31T09:00:00Z'
      }
    ];

    mockForms.forEach(form => {
      formsStorage.set(form.id, form);
    });
  }
};

export const mockStorage = {
  // Initialize mock data
  init: () => {
    initializeMockData();
  },

  // Get all forms
  getAllForms: (): StoredForm[] => {
    initializeMockData();
    return Array.from(formsStorage.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  // Get form by ID
  getForm: (id: string): StoredForm | undefined => {
    initializeMockData();
    return formsStorage.get(id);
  },

  // Save/Update form
  saveForm: (form: Omit<StoredForm, 'updatedAt'>): StoredForm => {
    initializeMockData();
    const savedForm = {
      ...form,
      updatedAt: new Date().toISOString()
    };
    formsStorage.set(form.id, savedForm);
    return savedForm;
  },

  // Delete form
  deleteForm: (id: string): boolean => {
    initializeMockData();
    return formsStorage.delete(id);
  },

  // Get forms count
  getCount: (): number => {
    initializeMockData();
    return formsStorage.size;
  }
};