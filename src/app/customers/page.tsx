'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  Search, 
  Building2, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { Customer } from '@/lib/types/customer'

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.primaryContact?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.primaryContact?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Kunden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                Kunden-Management
              </h1>
              <p className="text-slate-600">
                Verwalten Sie Ihre Kunden und deren individuelle Umfragen
              </p>
            </div>
            <Link href="/customers/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Neuer Kunde
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Suche nach Firma, Stadt oder Ansprechpartner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Gesamt Kunden</p>
                    <p className="text-2xl font-bold text-slate-900">{customers.length}</p>
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
                    <p className="text-sm text-slate-600">Aktive Kunden</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {customers.filter(c => c.status === 'active').length}
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
                    <p className="text-sm text-slate-600">Zugewiesene Umfragen</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {customers.reduce((sum, c) => sum + c.assignedSurveys.length, 0)}
                    </p>
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
                      {customers.reduce((sum, c) => sum + c.additionalContacts.length + 1, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Customer List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-white/60 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-900 mb-1">
                      {customer.companyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                      <MapPin className="w-3 h-3" />
                      {customer.postalCode} {customer.city}
                    </div>
                  </div>
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                    {customer.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Primary Contact */}
                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Hauptansprechpartner</h4>
                  <p className="text-sm text-slate-800 font-medium mb-1">
                    {customer.primaryContact.firstName} {customer.primaryContact.lastName}
                  </p>
                  <p className="text-xs text-slate-600 mb-2">{customer.primaryContact.role}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {customer.primaryContact.email}
                    </div>
                    {customer.primaryContact.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {customer.primaryContact.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-medium text-blue-900">{customer.additionalContacts.length}</p>
                    <p className="text-blue-600 text-xs">Weitere Kontakte</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-medium text-green-900">{customer.assignedSurveys.length}</p>
                    <p className="text-green-600 text-xs">Umfragen</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link href={`/customers/${customer.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-3 h-3 mr-1" />
                      Details
                    </Button>
                  </Link>
                  <Link href={`/customers/${customer.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-3 h-3" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCustomers.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              {searchQuery ? 'Keine Kunden gefunden' : 'Noch keine Kunden'}
            </h3>
            <p className="text-slate-600 mb-4">
              {searchQuery 
                ? 'Versuchen Sie eine andere Suche oder erstellen Sie einen neuen Kunden.'
                : 'Erstellen Sie Ihren ersten Kunden, um zu beginnen.'
              }
            </p>
            {!searchQuery && (
              <Link href="/customers/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Ersten Kunden erstellen
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}