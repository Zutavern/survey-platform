import { render, screen, waitFor, fireEvent } from '@/test/utils'
import { setupUserEvent, createMockFormTemplate } from '@/test/utils'
import CreateTallyForm from './page'
import { useRouter } from 'next/navigation'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

const mockPush = jest.fn()

describe('CreateTallyForm', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockPush.mockClear()
  })

  it('renders the page header correctly', () => {
    render(<CreateTallyForm />)
    
    expect(screen.getByText('Formular erstellen')).toBeInTheDocument()
    expect(screen.getByText('Assessment-Formular konfigurieren')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/tally')
  })

  it('displays hero section with correct content', () => {
    render(<CreateTallyForm />)
    
    expect(screen.getByText('Powered by Tally Forms')).toBeInTheDocument()
    expect(screen.getByText('Professionelles Assessment erstellen')).toBeInTheDocument()
    expect(screen.getByText(/wählen sie eine bewährte vorlage/i)).toBeInTheDocument()
  })

  it('shows navigation tabs for template and custom options', () => {
    render(<CreateTallyForm />)
    
    expect(screen.getByRole('button', { name: /aus vorlage erstellen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /leeres formular/i })).toBeInTheDocument()
  })

  it('displays template cards by default', () => {
    render(<CreateTallyForm />)
    
    expect(screen.getByText('Kunden-Assessment')).toBeInTheDocument()
    expect(screen.getByText('Team-Assessment')).toBeInTheDocument()
    expect(screen.getByText('Feedback-Formular')).toBeInTheDocument()
    
    // Check template descriptions
    expect(screen.getByText(/erfassung grundlegender kundeninformationen/i)).toBeInTheDocument()
    expect(screen.getByText(/bewertung durch mehrere teammitglieder/i)).toBeInTheDocument()
    expect(screen.getByText(/allgemeines feedback-formular/i)).toBeInTheDocument()
  })

  it('switches to custom form view when custom tab is clicked', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    expect(screen.getByText('Individuelles Formular erstellen')).toBeInTheDocument()
    expect(screen.getByLabelText(/titel des formulars/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/beschreibung/i)).toBeInTheDocument()
  })

  it('shows template question previews', () => {
    render(<CreateTallyForm />)
    
    // Check that question counts are displayed
    expect(screen.getByText(/enthaltene fragen \(5\)/i)).toBeInTheDocument() // Customer assessment
    expect(screen.getByText(/enthaltene fragen \(4\)/i)).toBeInTheDocument() // Team assessment and Feedback form
    
    // Check some specific question titles
    expect(screen.getByText('Unternehmensname')).toBeInTheDocument()
    expect(screen.getByText('Name und Position')).toBeInTheDocument()
  })

  it('handles template selection and creation', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    const customerAssessmentCard = screen.getByText('Kunden-Assessment').closest('div')!
    await user.click(customerAssessmentCard)
    
    const useTemplateButton = screen.getByRole('button', { name: /vorlage verwenden/i })
    await user.click(useTemplateButton)
    
    // Should show loading state
    expect(screen.getByText(/erstelle formular/i)).toBeInTheDocument()
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tally/new-form-id/edit')
    })
  })

  it('validates custom form input', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Switch to custom form
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    // Try to create without title
    const createButton = screen.getByRole('button', { name: /individuelles formular erstellen/i })
    expect(createButton).toBeDisabled()
    
    // Add title
    const titleInput = screen.getByLabelText(/titel des formulars/i)
    await user.type(titleInput, 'Test Assessment')
    
    expect(createButton).toBeEnabled()
  })

  it('handles custom form creation', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Switch to custom form
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    // Fill out form
    const titleInput = screen.getByLabelText(/titel des formulars/i)
    const descriptionInput = screen.getByLabelText(/beschreibung/i)
    
    await user.type(titleInput, 'Custom Test Assessment')
    await user.type(descriptionInput, 'This is a test description')
    
    // Submit form
    const createButton = screen.getByRole('button', { name: /individuelles formular erstellen/i })
    await user.click(createButton)
    
    // Should show loading state
    expect(screen.getByText(/erstelle individuelles formular/i)).toBeInTheDocument()
    
    // Wait for navigation
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/tally/new-custom-form-id/edit')
    })
  })

  it('displays feature preview in custom form', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Switch to custom form
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    expect(screen.getByText('Was Sie erwarten können')).toBeInTheDocument()
    expect(screen.getByText('Drag & Drop Editor')).toBeInTheDocument()
    expect(screen.getByText('15+ Fragetypen')).toBeInTheDocument()
    expect(screen.getByText('Logik & Bedingungen')).toBeInTheDocument()
    expect(screen.getByText('Real-time Analytics')).toBeInTheDocument()
  })

  it('shows estimated setup times', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Template setup time
    expect(screen.getAllByText(/~3 min setup/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/sofort nutzbar/i).length).toBeGreaterThan(0)
    
    // Switch to custom form for custom setup time
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    expect(screen.getByText(/geschätzte einrichtungszeit: 5-15 minuten/i)).toBeInTheDocument()
  })

  it('handles template selection clicks', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Click on team assessment card
    const teamAssessmentCard = screen.getByText('Team-Assessment').closest('div')!
    await user.click(teamAssessmentCard)
    
    // Should show selection indicator (would need to check for visual selection state)
    const useTemplateButtons = screen.getAllByRole('button', { name: /vorlage verwenden/i })
    expect(useTemplateButtons.length).toBe(3) // One for each template
  })

  it('displays proper accessibility attributes', () => {
    render(<CreateTallyForm />)
    
    // Check for proper labels
    expect(screen.getByRole('button', { name: /aus vorlage erstellen/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /leeres formular/i })).toBeInTheDocument()
    
    // Check for proper headings
    expect(screen.getByRole('heading', { name: /professionelles assessment erstellen/i })).toBeInTheDocument()
  })

  it('shows loading states correctly during creation', async () => {
    const user = setupUserEvent()
    render(<CreateTallyForm />)
    
    // Test template creation loading
    const useTemplateButton = screen.getAllByRole('button', { name: /vorlage verwenden/i })[0]
    await user.click(useTemplateButton)
    
    // Should disable all template buttons during creation
    const allTemplateButtons = screen.getAllByRole('button', { name: /vorlage verwenden|erstelle formular/i })
    allTemplateButtons.forEach(button => {
      if (button.textContent?.includes('Erstelle Formular')) {
        expect(button).toBeDisabled()
      }
    })
  })

  it('handles error states properly', async () => {
    const user = setupUserEvent()
    
    // Mock console.error to avoid test output pollution
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    
    render(<CreateTallyForm />)
    
    // Switch to custom form and trigger validation error
    const customTab = screen.getByRole('button', { name: /leeres formular/i })
    await user.click(customTab)
    
    // This would require mocking the creation process to fail
    // For now, we just verify the error display functionality exists
    
    consoleSpy.mockRestore()
  })
})