// Customer Management Storage System
import { Customer, ContactPerson, CustomerSurvey, SurveyTemplate } from './types/customer';

// In-memory storage (in production would be replaced with database)
const customersStorage: Map<string, Customer> = new Map();
const surveyTemplatesStorage: Map<string, SurveyTemplate> = new Map();
const customerSurveysStorage: Map<string, CustomerSurvey> = new Map();

// Initialize with some mock data
const initializeMockData = () => {
  if (customersStorage.size === 0) {
    const mockCustomers: Customer[] = [
      {
        id: 'customer-001',
        companyName: 'TechCorp Solutions GmbH',
        street: 'Musterstraße 123',
        postalCode: '10115',
        city: 'Berlin',
        primaryContact: {
          firstName: 'Max',
          lastName: 'Mustermann',
          role: 'Geschäftsführer',
          email: 'max.mustermann@techcorp.de',
          phone: '+49 30 12345678'
        },
        additionalContacts: [
          {
            id: 'contact-001',
            firstName: 'Anna',
            lastName: 'Schmidt',
            role: 'IT-Leiterin',
            department: 'IT',
            email: 'anna.schmidt@techcorp.de',
            phone: '+49 30 12345679',
            isActive: true
          },
          {
            id: 'contact-002',
            firstName: 'Tom',
            lastName: 'Weber',
            role: 'Projektmanager',
            department: 'Entwicklung',
            email: 'tom.weber@techcorp.de',
            isActive: true
          }
        ],
        assignedSurveys: [],
        createdAt: '2024-08-30T10:00:00Z',
        updatedAt: '2024-08-30T10:00:00Z',
        status: 'active'
      },
      {
        id: 'customer-002',
        companyName: 'Innovation AG',
        street: 'Innovationsplatz 1',
        postalCode: '80331',
        city: 'München',
        primaryContact: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          role: 'Head of Operations',
          email: 'sarah.johnson@innovation.de',
          phone: '+49 89 98765432'
        },
        additionalContacts: [],
        assignedSurveys: [],
        createdAt: '2024-08-29T14:30:00Z',
        updatedAt: '2024-08-29T14:30:00Z',
        status: 'active'
      }
    ];

    mockCustomers.forEach(customer => {
      customersStorage.set(customer.id, customer);
    });
  }
};

export const customerStorage = {
  // Initialize mock data
  init: () => {
    initializeMockData();
  },

  // Customer CRUD operations
  getAllCustomers: (): Customer[] => {
    initializeMockData();
    return Array.from(customersStorage.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  getCustomer: (id: string): Customer | undefined => {
    initializeMockData();
    return customersStorage.get(id);
  },

  saveCustomer: (customer: Omit<Customer, 'updatedAt'>): Customer => {
    initializeMockData();
    const savedCustomer = {
      ...customer,
      updatedAt: new Date().toISOString()
    };
    customersStorage.set(customer.id, savedCustomer);
    return savedCustomer;
  },

  deleteCustomer: (id: string): boolean => {
    initializeMockData();
    return customersStorage.delete(id);
  },

  // Contact Person operations
  addContactPerson: (customerId: string, contact: Omit<ContactPerson, 'id'>): ContactPerson | null => {
    const customer = customersStorage.get(customerId);
    if (!customer) return null;

    const newContact: ContactPerson = {
      ...contact,
      id: `contact-${Date.now()}`
    };

    customer.additionalContacts.push(newContact);
    customer.updatedAt = new Date().toISOString();
    customersStorage.set(customerId, customer);

    return newContact;
  },

  updateContactPerson: (customerId: string, contactId: string, updates: Partial<ContactPerson>): boolean => {
    const customer = customersStorage.get(customerId);
    if (!customer) return false;

    const contactIndex = customer.additionalContacts.findIndex(c => c.id === contactId);
    if (contactIndex === -1) return false;

    customer.additionalContacts[contactIndex] = {
      ...customer.additionalContacts[contactIndex],
      ...updates
    };
    customer.updatedAt = new Date().toISOString();
    customersStorage.set(customerId, customer);

    return true;
  },

  removeContactPerson: (customerId: string, contactId: string): boolean => {
    const customer = customersStorage.get(customerId);
    if (!customer) return false;

    customer.additionalContacts = customer.additionalContacts.filter(c => c.id !== contactId);
    customer.updatedAt = new Date().toISOString();
    customersStorage.set(customerId, customer);

    return true;
  },

  // Survey Assignment operations
  assignSurveyToCustomer: (customerId: string, templateId: string, assignedTo: string[]): CustomerSurvey | null => {
    const customer = customersStorage.get(customerId);
    if (!customer) return null;

    const template = surveyTemplatesStorage.get(templateId);
    if (!template) return null;

    const customerSurvey: CustomerSurvey = {
      id: `customer-survey-${Date.now()}`,
      customerId,
      originalSurveyId: templateId,
      title: `${template.title} - ${customer.companyName}`,
      description: template.description,
      status: 'draft',
      assignedTo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: 0
    };

    customer.assignedSurveys.push(customerSurvey);
    customer.updatedAt = new Date().toISOString();
    customersStorage.set(customerId, customer);
    customerSurveysStorage.set(customerSurvey.id, customerSurvey);

    return customerSurvey;
  },

  getCustomerSurveys: (customerId: string): CustomerSurvey[] => {
    const customer = customersStorage.get(customerId);
    return customer?.assignedSurveys || [];
  },

  // Survey Templates operations
  getSurveyTemplates: (): SurveyTemplate[] => {
    return Array.from(surveyTemplatesStorage.values());
  },

  addSurveyTemplate: (template: SurveyTemplate): void => {
    surveyTemplatesStorage.set(template.id, template);
  },

  // Statistics
  getCustomerStats: () => ({
    totalCustomers: customersStorage.size,
    activeCustomers: Array.from(customersStorage.values()).filter(c => c.status === 'active').length,
    totalSurveys: customerSurveysStorage.size,
    activeSurveys: Array.from(customerSurveysStorage.values()).filter(s => s.status === 'active').length
  })
};