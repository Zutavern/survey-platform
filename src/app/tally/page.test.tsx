import { render, screen, waitFor, fireEvent } from '@/test/utils'
import { setupUserEvent, createMockForm, mockClipboard } from '@/test/utils'
import TallyDashboard from './page'

// Mock next/link and navigation
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock the fetch function for API calls
const mockFetchTallyForms = () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        createMockForm({
          id: '1',
          title: 'Kunden-Assessment - Ersteinschätzung',
          responses: 23,
          views: 142,
        }),
        createMockForm({
          id: '2',
          title: 'Team-Bewertung Digital Transformation',
          status: 'draft',
          responses: 0,
          views: 8,
        }),
      ]),
    })
  ) as jest.Mock
}

describe('TallyDashboard', () => {
  beforeEach(() => {
    mockFetchTallyForms()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('displays loading state initially', () => {
    render(<TallyDashboard />)
    
    expect(screen.getByText(/lade dashboard/i)).toBeInTheDocument()
    expect(screen.getByText(/ihre tally-formulare werden geladen/i)).toBeInTheDocument()
  })

  it('renders dashboard header with correct title', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Tally Dashboard')).toBeInTheDocument()
      expect(screen.getByText(/assessment-formulare verwalten/i)).toBeInTheDocument()
    })
  })

  it('displays statistics cards with calculated values', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      // Forms total
      expect(screen.getByText('Formulare gesamt')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument() // Mock data has 4 forms
      
      // Total responses
      expect(screen.getByText('Gesamtantworten')).toBeInTheDocument()
      expect(screen.getByText('45')).toBeInTheDocument() // 23 + 0 + 15 + 7
      
      // Total views
      expect(screen.getByText('Aufrufe gesamt')).toBeInTheDocument()
      expect(screen.getByText('273')).toBeInTheDocument() // 142 + 8 + 89 + 34
    })
  })

  it('renders search and filter functionality', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/formulare durchsuchen/i)
      expect(searchInput).toBeInTheDocument()
      
      const statusFilter = screen.getByDisplayValue(/alle status/i)
      expect(statusFilter).toBeInTheDocument()
    })
  })

  it('filters forms by search query', async () => {
    const user = setupUserEvent()
    render(<TallyDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText(/formulare durchsuchen/i)
    await user.type(searchInput, 'Team-Bewertung')
    
    await waitFor(() => {
      expect(screen.queryByText('Kunden-Assessment - Ersteinschätzung')).not.toBeInTheDocument()
      expect(screen.getByText('Team-Bewertung Digital Transformation')).toBeInTheDocument()
    })
  })

  it('filters forms by status', async () => {
    const user = setupUserEvent()
    render(<TallyDashboard />)
    
    await waitFor(() => {
      expect(screen.getByText('Team-Bewertung Digital Transformation')).toBeInTheDocument()
    })
    
    const statusFilter = screen.getByDisplayValue(/alle status/i)
    await user.selectOptions(statusFilter, 'published')
    
    await waitFor(() => {
      expect(screen.queryByText('Team-Bewertung Digital Transformation')).not.toBeInTheDocument()
      expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
    })
  })

  it('displays form cards with correct information', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      // Check first form
      expect(screen.getByText('Kunden-Assessment - Ersteinschätzung')).toBeInTheDocument()
      expect(screen.getByText('23')).toBeInTheDocument()
      expect(screen.getByText('142')).toBeInTheDocument()
      
      // Check status badges
      const publishedBadge = screen.getByText('Veröffentlicht')
      expect(publishedBadge).toBeInTheDocument()
      
      const draftBadge = screen.getByText('Entwurf')
      expect(draftBadge).toBeInTheDocument()
    })
  })

  it('handles copy URL functionality', async () => {
    const { writeTextMock } = mockClipboard()
    const user = setupUserEvent()
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const copyButtons = screen.getAllByRole('button', { name: /copy/i })
      expect(copyButtons.length).toBeGreaterThan(0)
    })
    
    const copyButton = screen.getAllByRole('button')[0] // First copy button
    await user.click(copyButton)
    
    expect(writeTextMock).toHaveBeenCalledWith('https://tally.so/r/test-123')
  })

  it('shows form action buttons', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      expect(screen.getAllByText(/öffnen/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/analytics/i).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/bearbeiten/i).length).toBeGreaterThan(0)
    })
  })

  it('displays empty state when no forms match search', async () => {
    const user = setupUserEvent()
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/formulare durchsuchen/i)
      expect(searchInput).toBeInTheDocument()
    })
    
    const searchInput = screen.getByPlaceholderText(/formulare durchsuchen/i)
    await user.type(searchInput, 'nonexistent form')
    
    await waitFor(() => {
      expect(screen.getByText(/keine ergebnisse gefunden/i)).toBeInTheDocument()
      expect(screen.getByText(/keine formulare entsprechen ihren suchkriterien/i)).toBeInTheDocument()
    })
  })

  it('has refresh functionality', async () => {
    const user = setupUserEvent()
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const refreshButton = screen.getByRole('button', { name: /aktualisieren/i })
      expect(refreshButton).toBeInTheDocument()
    })
    
    const refreshButton = screen.getByRole('button', { name: /aktualisieren/i })
    await user.click(refreshButton)
    
    // Should trigger another fetch call
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('handles delete form functionality', async () => {
    const user = setupUserEvent()
    // Mock window.confirm
    window.confirm = jest.fn(() => true)
    
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByRole('button')
      const deleteButton = deleteButtons.find(btn => 
        btn.textContent?.toLowerCase().includes('löschen')
      )
      expect(deleteButton).toBeInTheDocument()
    })
    
    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => 
      btn.textContent?.toLowerCase().includes('löschen')
    )
    
    if (deleteButton) {
      await user.click(deleteButton)
      expect(window.confirm).toHaveBeenCalled()
    }
  })

  it('navigates to create form page', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      const createButton = screen.getByRole('link', { name: /neues formular/i })
      expect(createButton).toBeInTheDocument()
      expect(createButton).toHaveAttribute('href', '/tally/create')
    })
  })

  it('has proper accessibility attributes', async () => {
    render(<TallyDashboard />)
    
    await waitFor(() => {
      // Check for navigation
      const backButton = screen.getByRole('link', { name: /zurück/i })
      expect(backButton).toBeInTheDocument()
      
      // Check for main content
      const searchInput = screen.getByRole('textbox', { name: /formulare durchsuchen/i })
      expect(searchInput).toBeInTheDocument()
      
      // Check for proper button roles
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})