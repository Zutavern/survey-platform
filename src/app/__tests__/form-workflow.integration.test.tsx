import { render, screen, waitFor } from '@/test/utils'
import { setupUserEvent } from '@/test/utils'

// Import all the components we'll be testing
import HomePage from '@/app/page'
import TallyDashboard from '@/app/tally/page'
import CreateTallyForm from '@/app/tally/create/page'
import EditTallyForm from '@/app/tally/[id]/edit/page'
import TallyFormAnalytics from '@/app/tally/[id]/analytics/page'

// Mock navigation
const mockPush = jest.fn()
const mockParams = { id: 'test-form-id' }

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => mockParams,
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock fetch for dashboard data
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve([
      {
        id: '1',
        title: 'Kunden-Assessment - Ersteinschätzung',
        responses: 23,
        views: 142,
        status: 'published',
        url: 'https://tally.so/r/test-123',
        createdAt: '2024-08-31T10:00:00Z',
      },
      {
        id: '2', 
        title: 'Team-Bewertung Digital Transformation',
        responses: 0,
        views: 8,
        status: 'draft',
        url: 'https://tally.so/r/test-456',
        createdAt: '2024-08-30T15:00:00Z',
      },
    ]),
  })
) as jest.Mock

describe('Form Management Workflow Integration Tests', () => {
  beforeEach(() => {
    mockPush.mockClear()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Complete Form Creation Flow', () => {
    it('allows user to navigate from homepage to form creation', async () => {
      const user = setupUserEvent()
      
      // Start at homepage
      render(<HomePage />)
      
      // Find and click Tally Dashboard link
      const dashboardLink = screen.getByRole('link', { name: /tally dashboard/i })
      expect(dashboardLink).toHaveAttribute('href', '/tally')
      
      // Simulate navigation to dashboard
      render(<TallyDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Tally Dashboard')).toBeInTheDocument()
      })
      
      // Find create form button
      const createButton = screen.getByRole('link', { name: /neues formular/i })
      expect(createButton).toHaveAttribute('href', '/tally/create')
    })

    it('handles template-based form creation workflow', async () => {
      const user = setupUserEvent()
      
      // Start at create form page
      render(<CreateTallyForm />)
      
      // Verify page loads correctly
      expect(screen.getByText('Professionelles Assessment erstellen')).toBeInTheDocument()
      
      // Select template tab (should be default)
      expect(screen.getByText('Kunden-Assessment')).toBeInTheDocument()
      expect(screen.getByText('Team-Assessment')).toBeInTheDocument()
      expect(screen.getByText('Feedback-Formular')).toBeInTheDocument()
      
      // Click on customer assessment template
      const customerTemplate = screen.getByText('Kunden-Assessment').closest('div')!
      await user.click(customerTemplate)
      
      // Click use template button
      const useTemplateButton = screen.getByRole('button', { name: /vorlage verwenden/i })
      await user.click(useTemplateButton)
      
      // Verify loading state
      expect(screen.getByText(/erstelle formular/i)).toBeInTheDocument()
      
      // Wait for navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/tally/new-form-id/edit')
      })
    })

    it('handles custom form creation workflow', async () => {
      const user = setupUserEvent()
      
      render(<CreateTallyForm />)
      
      // Switch to custom form tab
      const customTab = screen.getByRole('button', { name: /leeres formular/i })
      await user.click(customTab)
      
      // Verify custom form interface
      expect(screen.getByText('Individuelles Formular erstellen')).toBeInTheDocument()
      expect(screen.getByLabelText(/titel des formulars/i)).toBeInTheDocument()
      
      // Fill out custom form
      const titleInput = screen.getByLabelText(/titel des formulars/i)
      const descriptionInput = screen.getByLabelText(/beschreibung/i)
      
      await user.type(titleInput, 'Integration Test Form')
      await user.type(descriptionInput, 'A form created during integration testing')
      
      // Submit custom form
      const createButton = screen.getByRole('button', { name: /individuelles formular erstellen/i })
      await user.click(createButton)
      
      // Verify loading and navigation
      expect(screen.getByText(/erstelle individuelles formular/i)).toBeInTheDocument()
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/tally/new-custom-form-id/edit')
      })
    })
  })

  describe('Form Editing Workflow', () => {
    it('loads and edits form correctly', async () => {
      const user = setupUserEvent()
      
      render(<EditTallyForm />)
      
      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      })
      
      // Verify form sections are present
      expect(screen.getByText('Grundeinstellungen')).toBeInTheDocument()
      expect(screen.getByText('Fragen')).toBeInTheDocument()
      expect(screen.getByText('Formular-Einstellungen')).toBeInTheDocument()
      
      // Edit form title
      const titleInput = screen.getByLabelText('Titel des Formulars')
      await user.clear(titleInput)
      await user.type(titleInput, 'Updated Integration Test Form')
      
      expect(titleInput).toHaveValue('Updated Integration Test Form')
      
      // Add a new question
      const addQuestionButton = screen.getByRole('button', { name: /frage hinzufügen/i })
      await user.click(addQuestionButton)
      
      // Verify new question was added
      await waitFor(() => {
        expect(screen.getByText('Frage 6')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Neue Frage')).toBeInTheDocument()
      })
      
      // Save form
      const saveButton = screen.getAllByRole('button', { name: /speichern/i })[0]
      await user.click(saveButton)
      
      // Verify save navigation
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/tally')
      }, { timeout: 3000 })
    })

    it('handles question management correctly', async () => {
      const user = setupUserEvent()
      
      render(<EditTallyForm />)
      
      await waitFor(() => {
        expect(screen.getByText('Unternehmensname')).toBeInTheDocument()
      })
      
      // Test editing a question
      const questionTitleInputs = screen.getAllByDisplayValue('Unternehmensname')
      const firstQuestionInput = questionTitleInputs[0]
      
      await user.clear(firstQuestionInput)
      await user.type(firstQuestionInput, 'Company Name (Updated)')
      
      expect(firstQuestionInput).toHaveValue('Company Name (Updated)')
      
      // Test changing question type
      const typeSelects = screen.getAllByDisplayValue('Text (kurz)')
      if (typeSelects.length > 0) {
        await user.selectOptions(typeSelects[0], 'email')
        expect(typeSelects[0]).toHaveValue('email')
      }
      
      // Test adding options for multiple choice question
      const addOptionButtons = screen.getAllByRole('button', { name: /option/i })
      if (addOptionButtons.length > 0) {
        await user.click(addOptionButtons[0])
        
        await waitFor(() => {
          expect(screen.getByDisplayValue('Neue Option')).toBeInTheDocument()
        })
      }
      
      // Test form settings
      const multipleSubmissionsCheckbox = screen.getByLabelText('Mehrfache Einreichungen erlauben')
      await user.click(multipleSubmissionsCheckbox)
      expect(multipleSubmissionsCheckbox).toBeChecked()
    })
  })

  describe('Analytics Workflow', () => {
    it('displays comprehensive analytics data', async () => {
      render(<TallyFormAnalytics />)
      
      // Wait for analytics to load
      await waitFor(() => {
        expect(screen.getByText('Analytics und Auswertungen')).toBeInTheDocument()
      })
      
      // Verify key metrics are displayed
      expect(screen.getByText('Aufrufe gesamt')).toBeInTheDocument()
      expect(screen.getByText('147')).toBeInTheDocument()
      
      expect(screen.getByText('Einreichungen')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument()
      
      expect(screen.getByText('Konversionsrate')).toBeInTheDocument()
      expect(screen.getByText('15.6%')).toBeInTheDocument()
      
      // Verify question statistics
      expect(screen.getByText('Fragen-Statistiken')).toBeInTheDocument()
      expect(screen.getByText('Unternehmensname')).toBeInTheDocument()
      expect(screen.getByText('Unternehmensgröße')).toBeInTheDocument()
      
      // Verify recent submissions
      expect(screen.getByText('Letzte Einreichungen')).toBeInTheDocument()
      expect(screen.getByText('Mustermann GmbH')).toBeInTheDocument()
    })

    it('handles data export functionality', async () => {
      const user = setupUserEvent()
      const mockAlert = jest.fn()
      global.alert = mockAlert
      
      render(<TallyFormAnalytics />)
      
      await waitFor(() => {
        expect(screen.getByText('Daten exportieren')).toBeInTheDocument()
      })
      
      // Test CSV export
      const csvButton = screen.getByRole('button', { name: /csv export/i })
      await user.click(csvButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Export als CSV würde hier starten')
      })
      
      // Test PDF export
      const pdfButton = screen.getByRole('button', { name: /pdf report/i })
      await user.click(pdfButton)
      
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Export als PDF würde hier starten')
      })
    })
  })

  describe('Dashboard Integration', () => {
    it('displays forms with correct data and actions', async () => {
      const user = setupUserEvent()
      
      render(<TallyDashboard />)
      
      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Tally Dashboard')).toBeInTheDocument()
      })
      
      // Verify forms are displayed
      expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      expect(screen.getByText('Team-Bewertung Digital Transformation')).toBeInTheDocument()
      
      // Verify statistics
      expect(screen.getByText('Formulare gesamt')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      
      // Test search functionality
      const searchInput = screen.getByPlaceholderText(/formulare durchsuchen/i)
      await user.type(searchInput, 'Team-Bewertung')
      
      await waitFor(() => {
        expect(screen.queryByText('Kunden-Assessment - Ersteinschätzung')).not.toBeInTheDocument()
        expect(screen.getByText('Team-Bewertung Digital Transformation')).toBeInTheDocument()
      })
      
      // Clear search
      await user.clear(searchInput)
      
      await waitFor(() => {
        expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      })
      
      // Test status filter
      const statusFilter = screen.getByDisplayValue(/alle status/i)
      await user.selectOptions(statusFilter, 'published')
      
      await waitFor(() => {
        expect(screen.queryByText('Team-Bewertung Digital Transformation')).not.toBeInTheDocument()
        expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      })
    })

    it('handles form actions correctly', async () => {
      const user = setupUserEvent()
      
      render(<TallyDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      })
      
      // Test action buttons are present
      expect(screen.getAllByText(/öffnen/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/analytics/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/bearbeiten/i).length).toBeGreaterThan(0)
      
      // Test refresh functionality
      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i })
      await user.click(refreshButton)
      
      // Should trigger another fetch call
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      // Mock API failure
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'))
      
      render(<TallyDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText(/fehler beim laden/i)).toBeInTheDocument()
      })
    })

    it('handles empty states correctly', async () => {
      // Mock empty API response
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      
      render(<TallyDashboard />)
      
      await waitFor(() => {
        expect(screen.getByText(/keine formulare gefunden/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Integration', () => {
    it('maintains keyboard navigation throughout workflow', async () => {
      const user = setupUserEvent()
      
      // Test homepage accessibility
      render(<HomePage />)
      
      const dashboardLink = screen.getByRole('link', { name: /tally dashboard/i })
      expect(dashboardLink).toBeInTheDocument()
      
      // Test dashboard accessibility
      render(<TallyDashboard />)
      
      await waitFor(() => {
        const searchInput = screen.getByRole('textbox', { name: /formulare durchsuchen/i })
        expect(searchInput).toBeInTheDocument()
        
        // Test keyboard focus
        searchInput.focus()
        expect(searchInput).toHaveFocus()
      })
      
      // Test create form accessibility
      render(<CreateTallyForm />)
      
      const templateTab = screen.getByRole('button', { name: /aus vorlage erstellen/i })
      const customTab = screen.getByRole('button', { name: /leeres formular/i })
      
      expect(templateTab).toBeInTheDocument()
      expect(customTab).toBeInTheDocument()
      
      // Test keyboard navigation
      templateTab.focus()
      expect(templateTab).toHaveFocus()
    })

    it('provides proper ARIA labels and roles', async () => {
      render(<EditTallyForm />)
      
      await waitFor(() => {
        // Verify form inputs have proper labels
        expect(screen.getByLabelText('Titel des Formulars')).toBeInTheDocument()
        expect(screen.getByLabelText('Beschreibung')).toBeInTheDocument()
        expect(screen.getByLabelText('Status')).toBeInTheDocument()
        
        // Verify buttons have proper roles
        const buttons = screen.getAllByRole('button')
        expect(buttons.length).toBeGreaterThan(0)
        
        // Verify navigation has proper role
        expect(screen.getByRole('link', { name: /zurück zum dashboard/i })).toBeInTheDocument()
      })
    })
  })
})