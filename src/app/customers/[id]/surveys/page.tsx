'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  ExternalLink,
  TrendingUp,
  FileText,
  Activity,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Layout } from '@/components/layout/Layout'
import { Customer, CustomerSurvey } from '@/lib/types/customer'

export default function CustomerSurveysPage() {
  const params = useParams()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [surveys, setSurveys] = useState<CustomerSurvey[]>([])
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (customerId) {
      fetchCustomerData()
      fetchSurveyAnalytics()
    }
  }, [customerId])

  const fetchCustomerData = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
        setSurveys(data.assignedSurveys || [])
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  const fetchSurveyAnalytics = async () => {
    try {
      const surveyResponse = await fetch(`/api/customers/${customerId}/surveys`)
      if (surveyResponse.ok) {
        const surveys = await surveyResponse.json()
        
        // Fetch analytics for each survey with Tally form ID
        const analyticsPromises = surveys
          .filter((survey: CustomerSurvey) => survey.tallyFormId)
          .map(async (survey: CustomerSurvey) => {
            try {
              const analyticsResponse = await fetch(`/api/tally/forms/${survey.tallyFormId}/analytics`)
              const analyticsData = await analyticsResponse.json()
              return {
                ...survey,
                analytics: analyticsData
              }
            } catch (error) {
              console.error(`Error fetching analytics for survey ${survey.id}:`, error)
              return {
                ...survey,
                analytics: null
              }
            }
          })

        const analyticsResults = await Promise.all(analyticsPromises)
        setAnalytics(analyticsResults)
      }
    } catch (error) {
      console.error('Error fetching survey analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Lade Umfrage-Ergebnisse...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!customer) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Kunde nicht gefunden</h3>
            <Link href="/customers">
              <Button>Zurück zur Übersicht</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const totalResponses = analytics.reduce((sum, survey) => 
    sum + (survey.analytics?.submissions || 0), 0
  )
  
  const averageCompletionRate = analytics.length > 0 
    ? analytics.reduce((sum, survey) => sum + (survey.analytics?.completion_rate || 0), 0) / analytics.length
    : 0

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center gap-4 mb-4">
              <Link href={`/customers/${customerId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  Umfrage-Ergebnisse: {customer.companyName}
                </h1>
                <p className="text-slate-600">
                  Detaillierte Analysen aller zugewiesenen Umfragen
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Aktive Umfragen</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {surveys.filter(s => s.status === 'active').length}
                    </p>
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
                    <p className="text-sm text-slate-600">Antworten</p>
                    <p className="text-2xl font-bold text-slate-900">{totalResponses}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Completion Rate</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {Math.round(averageCompletionRate)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Letzte Aktivität</p>
                    <p className="text-sm font-medium text-slate-900">
                      {surveys.length > 0 
                        ? new Date(Math.max(...surveys.map(s => new Date(s.assignedAt).getTime()))).toLocaleDateString('de-DE')
                        : 'Keine Daten'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Survey Details */}
          {surveys.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-slate-900">Umfrage-Details</h2>
              
              {analytics.map((surveyData, index) => (
                <Card key={surveyData.id} className="bg-white/60 backdrop-blur-sm border-slate-200/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-blue-600" />
                          {surveyData.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Zugewiesen: {new Date(surveyData.assignedAt).toLocaleDateString('de-DE')}
                          </span>
                          <Badge variant={surveyData.status === 'active' ? 'default' : 'secondary'}>
                            {surveyData.status}
                          </Badge>
                        </div>
                      </div>
                      {surveyData.tallyFormId && (
                        <div className="flex gap-2">
                          <a 
                            href={`https://tally.so/r/${surveyData.tallyFormId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Umfrage öffnen
                            </Button>
                          </a>
                          <a 
                            href={`https://tally.so/forms/${surveyData.tallyFormId}/results`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              Ergebnisse
                            </Button>
                          </a>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    {surveyData.analytics ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-blue-900">
                            {surveyData.analytics.submissions || 0}
                          </p>
                          <p className="text-sm text-blue-600">Eingaben</p>
                        </div>
                        
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-green-900">
                            {Math.round(surveyData.analytics.completion_rate || 0)}%
                          </p>
                          <p className="text-sm text-green-600">Abschlussrate</p>
                        </div>
                        
                        <div className="p-4 bg-purple-50 rounded-lg text-center">
                          <p className="text-2xl font-bold text-purple-900">
                            {surveyData.analytics.views || 0}
                          </p>
                          <p className="text-sm text-purple-600">Aufrufe</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                        <p>Keine Analysedaten verfügbar</p>
                        <p className="text-sm">
                          {surveyData.tallyFormId 
                            ? 'Daten werden geladen...' 
                            : 'Kein Tally-Formular verknüpft'
                          }
                        </p>
                      </div>
                    )}

                    {surveyData.description && (
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                        <p className="text-sm text-slate-700">{surveyData.description}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Noch keine Umfragen zugewiesen
              </h3>
              <p className="text-slate-600 mb-4">
                Weisen Sie diesem Kunden Umfragen zu, um Analysen zu erhalten.
              </p>
              <Link href={`/customers/${customerId}`}>
                <Button>
                  Umfrage zuweisen
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}