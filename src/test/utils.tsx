import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything from testing library
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Setup user event
export const setupUserEvent = () => userEvent.setup()

// Common test utilities
export const createMockForm = (overrides = {}) => ({
  id: '1',
  title: 'Test Assessment Form',
  description: 'A test form for unit testing',
  status: 'published' as const,
  url: 'https://tally.so/r/test-123',
  createdAt: '2024-08-31T10:00:00Z',
  updatedAt: '2024-08-31T10:00:00Z',
  responses: 5,
  views: 23,
  ...overrides,
})

export const createMockFormTemplate = (overrides = {}) => ({
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template for unit testing',
  icon: <div data-testid="mock-icon">📋</div>,
  questions: [
    {
      type: 'text',
      title: 'Test Question 1',
      required: true,
      placeholder: 'Enter your answer',
    },
    {
      type: 'email',
      title: 'Email Address',
      required: true,
      placeholder: 'your@email.com',
    },
  ],
  ...overrides,
})

export const createMockAnalytics = (overrides = {}) => ({
  id: '1',
  title: 'Test Assessment Form',
  status: 'published' as const,
  totalViews: 147,
  totalSubmissions: 23,
  conversionRate: 15.6,
  avgCompletionTime: 4.2,
  createdAt: '2024-08-25T10:00:00Z',
  lastSubmission: '2024-08-31T09:30:00Z',
  submissions: [],
  questionStats: [
    {
      id: '1',
      title: 'Test Question',
      type: 'text',
      responseCount: 23,
      responseRate: 100,
      answers: {},
    },
  ],
  ...overrides,
})

// Mock handlers for common scenarios
export const mockFetch = (response: any, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  ) as jest.Mock
}

export const mockClipboard = () => {
  const writeTextMock = jest.fn().mockResolvedValue(undefined)
  
  Object.assign(navigator, {
    clipboard: {
      writeText: writeTextMock,
    },
  })
  
  return { writeTextMock }
}

// Async test helpers
export const waitForLoadingToFinish = async () => {
  const { findByTestId } = customRender(<div data-testid="loading-finished" />)
  await findByTestId('loading-finished')
}

// Form testing utilities
export const fillFormField = async (user: ReturnType<typeof userEvent.setup>, fieldLabel: string, value: string) => {
  const field = document.querySelector(`[aria-label="${fieldLabel}"], [placeholder*="${fieldLabel}"], label:has-text("${fieldLabel}") + input, label:has-text("${fieldLabel}") + textarea`)
  if (field) {
    await user.clear(field as HTMLElement)
    await user.type(field as HTMLElement, value)
  }
}

// Component testing helpers
export const getButtonByText = (text: string) => {
  return document.querySelector(`button:has-text("${text}"), [role="button"]:has-text("${text}")`)
}

// Assertion helpers
export const expectElementToHaveAttribute = (element: HTMLElement | null, attribute: string, value?: string) => {
  expect(element).toBeInTheDocument()
  if (value !== undefined) {
    expect(element).toHaveAttribute(attribute, value)
  } else {
    expect(element).toHaveAttribute(attribute)
  }
}

export const expectElementToBeVisible = (element: HTMLElement | null) => {
  expect(element).toBeInTheDocument()
  expect(element).toBeVisible()
}

// Test data factories
export const createMockQuestion = (overrides = {}) => ({
  id: 'q1',
  type: 'text' as const,
  title: 'Test Question',
  description: 'Test question description',
  required: false,
  order: 1,
  ...overrides,
})

export const createMockAnswer = (overrides = {}) => ({
  id: 'a1',
  textAnswer: 'Test answer',
  responseId: 'r1',
  questionId: 'q1',
  ...overrides,
})