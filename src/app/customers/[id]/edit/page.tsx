'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Save,
  X
} from 'lucide-react'
import Link from 'next/link'
import { Customer } from '@/lib/types/customer'

export default function CustomerEditPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    if (customerId) {
      fetchCustomer()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        setError('Customer not found')
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
      setError('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    if (!customer) return
    
    if (field.startsWith('primaryContact.')) {
      const contactField = field.replace('primaryContact.', '')
      setCustomer({
        ...customer,
        primaryContact: {
          ...customer.primaryContact,
          [contactField]: value
        }
      })
    } else {
      setCustomer({
        ...customer,
        [field]: value
      })
    }
  }

  const handleSave = async () => {
    if (!customer) return
    
    try {
      setSaving(true)
      setError(null)
      
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: customer.companyName,
          street: customer.street,
          postalCode: customer.postalCode,
          city: customer.city,
          primaryContact: customer.primaryContact,
          status: customer.status
        }),
      })

      if (response.ok) {
        // Navigate back to customer details page
        router.push(`/customers/${customerId}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update customer')
      }
    } catch (error) {
      console.error('Error updating customer:', error)
      setError('An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Lade Kundendaten...</p>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Kunde nicht gefunden</h3>
          <Link href="/customers">
            <Button>Zurück zur Übersicht</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Link href={`/customers/${customerId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-slate-900">
                Kunde bearbeiten
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push(`/customers/${customerId}`)}
                disabled={saving}
              >
                <X className="w-4 h-4 mr-2" />
                Abbrechen
              </Button>
              <Button 
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        {/* Company Information */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Unternehmensdaten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="companyName">Firmenname</Label>
                <Input
                  id="companyName"
                  value={customer.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="street">Straße</Label>
                <Input
                  id="street"
                  value={customer.street}
                  onChange={(e) => handleInputChange('street', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="postalCode">PLZ</Label>
                <Input
                  id="postalCode"
                  value={customer.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Ort</Label>
                <Input
                  id="city"
                  value={customer.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Primary Contact */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Hauptansprechpartner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="firstName">Vorname</Label>
                <Input
                  id="firstName"
                  value={customer.primaryContact.firstName}
                  onChange={(e) => handleInputChange('primaryContact.firstName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={customer.primaryContact.lastName}
                  onChange={(e) => handleInputChange('primaryContact.lastName', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="role">Position/Rolle</Label>
                <Input
                  id="role"
                  value={customer.primaryContact.role}
                  onChange={(e) => handleInputChange('primaryContact.role', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={customer.primaryContact.email}
                  onChange={(e) => handleInputChange('primaryContact.email', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={customer.primaryContact.phone || ''}
                  onChange={(e) => handleInputChange('primaryContact.phone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push(`/customers/${customerId}`)}
            disabled={saving}
          >
            <X className="w-4 h-4 mr-2" />
            Abbrechen
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Speichern...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
