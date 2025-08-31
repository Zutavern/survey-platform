import { render, screen } from '@/test/utils'
import HomePage from './page'

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('HomePage', () => {
  it('renders the main heading', () => {
    render(<HomePage />)
    
    const heading = screen.getByRole('heading', { 
      name: /professional assessment/i 
    })
    expect(heading).toBeInTheDocument()
  })

  it('displays the hero section with correct content', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/powered by tally & next.js 15/i)).toBeInTheDocument()
    expect(screen.getByText(/& survey platform/i)).toBeInTheDocument()
    expect(
      screen.getByText(/erstellen sie professionelle assessments für beratungsprojekte/i)
    ).toBeInTheDocument()
  })

  it('shows navigation links in header', () => {
    render(<HomePage />)
    
    expect(screen.getByRole('link', { name: /tally dashboard/i })).toBeInTheDocument()
    const surveyLinks = screen.getAllByRole('link', { name: /surveys/i })
    expect(surveyLinks.length).toBeGreaterThan(0)
  })

  it('displays feature cards with correct information', () => {
    render(<HomePage />)
    
    // Check for Individual Assessment card
    expect(screen.getByText('Individual Assessment')).toBeInTheDocument()
    expect(screen.getByText(/kundenspezifische fragenkataloge/i)).toBeInTheDocument()
    
    // Check for Team Assessment card
    expect(screen.getByText('Team Assessment')).toBeInTheDocument()
    expect(screen.getByText(/multi-user einladungen/i)).toBeInTheDocument()
    
    // Check for Analytics & Insights card
    expect(screen.getByText('Analytics & Insights')).toBeInTheDocument()
    expect(screen.getByText(/interactive dashboards/i)).toBeInTheDocument()
  })

  it('shows statistics cards with numbers', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Aktive Assessments')).toBeInTheDocument()
    expect(screen.getByText('23')).toBeInTheDocument()
    
    expect(screen.getByText('Gesamtantworten')).toBeInTheDocument()
    expect(screen.getByText('1,847')).toBeInTheDocument()
    
    expect(screen.getByText('Aktive Teilnehmer')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
    
    expect(screen.getByText('Ø Bearbeitungszeit')).toBeInTheDocument()
    expect(screen.getByText('4.2m')).toBeInTheDocument()
  })

  it('displays quick action buttons', () => {
    render(<HomePage />)
    
    const createAssessmentButton = screen.getByRole('button', { 
      name: /jetzt starten/i 
    })
    expect(createAssessmentButton).toBeInTheDocument()
    
    const dashboardButtons = screen.getAllByRole('button', { 
      name: /dashboard öffnen/i 
    })
    expect(dashboardButtons.length).toBeGreaterThan(0)
  })

  it('shows recent assessments section', () => {
    render(<HomePage />)
    
    expect(screen.getByText('Aktuelle Assessments')).toBeInTheDocument()
    expect(screen.getByText(/ihre zuletzt erstellten und bearbeiteten formulare/i)).toBeInTheDocument()
    
    // Check for sample assessment cards
    expect(screen.getByText('Kundenzufriedenheit 2024')).toBeInTheDocument()
    expect(screen.getByText('Produktfeedback')).toBeInTheDocument()
    expect(screen.getByText('Team-Morale')).toBeInTheDocument()
  })

  it('displays call-to-action section', () => {
    render(<HomePage />)
    
    expect(screen.getByText(/bereit für ihr erstes assessment/i)).toBeInTheDocument()
    expect(
      screen.getByText(/erstellen sie professionelle bewertungen in wenigen minuten/i)
    ).toBeInTheDocument()
    
    const ctaCreateButton = screen.getByRole('button', { 
      name: /jetzt assessment erstellen/i 
    })
    expect(ctaCreateButton).toBeInTheDocument()
    
    const ctaExploreButtons = screen.getAllByRole('button', { 
      name: /dashboard erkunden/i 
    })
    expect(ctaExploreButtons.length).toBeGreaterThan(0)
  })

  it('has proper accessibility structure', () => {
    render(<HomePage />)
    
    // Check for proper heading hierarchy
    const h1 = screen.getByRole('heading', { level: 1 })
    expect(h1).toBeInTheDocument()
    
    const h2Elements = screen.getAllByRole('heading', { level: 2 })
    expect(h2Elements.length).toBeGreaterThan(0)
    
    // Check for navigation landmark
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
  })

  it('links point to correct routes', () => {
    render(<HomePage />)
    
    const tallyDashboardLink = screen.getByRole('link', { name: /tally dashboard/i })
    expect(tallyDashboardLink).toHaveAttribute('href', '/tally')
    
    const surveysLinks = screen.getAllByRole('link', { name: /surveys/i })
    expect(surveysLinks[0]).toHaveAttribute('href', '/surveys')
    
    const createAssessmentLinks = screen.getAllByRole('link')
    const createLink = createAssessmentLinks.find(link => 
      link.getAttribute('href') === '/tally/create'
    )
    expect(createLink).toBeInTheDocument()
  })
})