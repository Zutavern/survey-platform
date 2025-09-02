'use client'

import { useEffect, useState } from 'react'
import { Navigation } from './Navigation'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const [stats, setStats] = useState({
    customerCount: 0,
    surveyCount: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [customersResponse, formsResponse] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/tally/forms')
      ])

      const [customers, forms] = await Promise.all([
        customersResponse.ok ? customersResponse.json() : [],
        formsResponse.ok ? formsResponse.json() : { forms: [] }
      ])

      // Normalize forms response to support both array and `{ forms: [...] }`
      const surveyCount = Array.isArray(forms)
        ? forms.length
        : (forms.forms?.length || 0)

      setStats({
        customerCount: Array.isArray(customers) ? customers.length : 0,
        surveyCount
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navigation customerCount={stats.customerCount} surveyCount={stats.surveyCount} />
      
      {/* Main Content */}
      <div className="lg:pl-72">
        {children}
      </div>
    </div>
  )
}