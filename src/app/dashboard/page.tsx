'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, FileText, Users, TrendingUp, Plus, Eye, Mail } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalForms: 0,
    assignedSurveys: 0,
    totalContacts: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const [customersResponse, formsResponse] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/tally/forms')
      ])

      const [customers, forms] = await Promise.all([
        customersResponse.ok ? customersResponse.json() : [],
        formsResponse.ok ? formsResponse.json() : { forms: [] }
      ])

      if (Array.isArray(customers)) {
        const assignedSurveysCount = customers.reduce((sum, customer) => 
          sum + (customer.assignedSurveys?.length || 0), 0
        )

        // Normalize forms response: supports array or `{ forms: [...] }`
        const formsCount = Array.isArray(forms)
          ? forms.length
          : (forms.forms?.length || 0)

        const totalContactsCount = customers.reduce((sum, customer) => 
          sum + (customer.additionalContacts?.length || 0) + 1, 0
        )

        setStats({
          totalCustomers: customers.length,
          activeCustomers: customers.filter(c => c.status === 'active').length,
          totalForms: formsCount,
          assignedSurveys: assignedSurveysCount,
          totalContacts: totalContactsCount,
          recentActivity: customers.slice(0, 3)
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Survey Management Dashboard
            </h1>
            <p className="text-slate-600">
              Verwalten Sie Ihre Kunden und Tally-Formulare zentral
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Customer Management */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Kunden-Management</CardTitle>
              <CardDescription className="text-slate-600">
                Verwalten Sie Ihre Kunden und weisen Sie individuelle Umfragen zu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p>• Firmendaten und Ansprechpartner verwalten</p>
                <p>• Zusätzliche Kontaktpersonen hinzufügen</p>
                <p>• Individuelle Umfragen zuweisen</p>
                <p>• Separate Auswertungen pro Kunde</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/customers" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Kunden verwalten
                  </Button>
                </Link>
                <Link href="/customers/create">
                  <Button variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tally Forms */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-slate-900">Tally Formulare</CardTitle>
              <CardDescription className="text-slate-600">
                Verwalten Sie Ihre Tally-Formulare und erstellen Sie neue mit AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-slate-600 space-y-2">
                <p>• Bestehende Tally-Formulare verwalten</p>
                <p>• Neue Formulare mit AI erstellen</p>
                <p>• Analysen und Statistiken einsehen</p>
                <p>• Vorlagen für Kunden-Zuweisungen</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Link href="/tally" className="flex-1">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Eye className="w-4 h-4 mr-2" />
                    Formulare verwalten
                  </Button>
                </Link>
                <Link href="/tally/ai-create">
                  <Button variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Übersicht</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Gesamt Kunden</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {loading ? '...' : stats.totalCustomers}
                    </p>
                    <p className="text-xs text-green-600">
                      {loading ? '...' : stats.activeCustomers} aktiv
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Formulare</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {loading ? '...' : stats.totalForms}
                    </p>
                    <p className="text-xs text-slate-500">Tally Vorlagen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Zugewiesene Umfragen</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {loading ? '...' : stats.assignedSurveys}
                    </p>
                    <p className="text-xs text-slate-500">Individuelle Kopien</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Mail className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Kontakte</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {loading ? '...' : stats.totalContacts}
                    </p>
                    <p className="text-xs text-slate-500">Ansprechpartner</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentActivity.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Letzte Aktivitäten</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentActivity.map((customer: any) => (
                <Card key={customer.id} className="bg-white/60 backdrop-blur-sm border-slate-200/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">{customer.companyName}</h3>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      {customer.primaryContact?.firstName} {customer.primaryContact?.lastName}
                    </p>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{customer.assignedSurveys?.length || 0} Umfragen</span>
                      <span>{new Date(customer.updatedAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Schnellaktionen</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/customers/create">
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 p-3 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Plus className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-slate-900">Neuen Kunden</p>
                  <p className="text-sm text-slate-600">erstellen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tally/ai-create">
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 p-3 bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="font-medium text-slate-900">AI Formular</p>
                  <p className="text-sm text-slate-600">erstellen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/customers">
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="font-medium text-slate-900">Umfrage</p>
                  <p className="text-sm text-slate-600">zuweisen</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/tally">
              <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200 cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="mx-auto mb-3 p-3 bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="font-medium text-slate-900">Analysen</p>
                  <p className="text-sm text-slate-600">einsehen</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      </div>
    </Layout>
  )
}