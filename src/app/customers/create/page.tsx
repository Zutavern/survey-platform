'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Building2, User, Mail, Phone, MapPin } from 'lucide-react'
import Link from 'next/link'

export default function CreateCustomerPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    street: '',
    postalCode: '',
    city: '',
    primaryContact: {
      firstName: '',
      lastName: '',
      role: '',
      email: '',
      phone: ''
    }
  })

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('primaryContact.')) {
      const contactField = field.replace('primaryContact.', '')
      setFormData(prev => ({
        ...prev,
        primaryContact: {
          ...prev.primaryContact,
          [contactField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/customers/${data.customer.id}`)
      } else {
        console.error('Failed to create customer')
      }
    } catch (error) {
      console.error('Error creating customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const isValid = formData.companyName && 
                  formData.street && 
                  formData.postalCode && 
                  formData.city &&
                  formData.primaryContact.firstName &&
                  formData.primaryContact.lastName &&
                  formData.primaryContact.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Neuen Kunden erstellen
              </h1>
              <p className="text-slate-600">
                Erfassen Sie die Firmendaten und den Hauptansprechpartner
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Information */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Firmendaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Firmenname *</Label>
                <Input
                  id="companyName"
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="z.B. Mustermann GmbH"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="street">Straße & Hausnummer *</Label>
                  <Input
                    id="street"
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    placeholder="z.B. Musterstraße 123"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postleitzahl *</Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="z.B. 12345"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="z.B. Berlin"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Primary Contact */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Hauptansprechpartner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={formData.primaryContact.firstName}
                    onChange={(e) => handleInputChange('primaryContact.firstName', e.target.value)}
                    placeholder="z.B. Max"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={formData.primaryContact.lastName}
                    onChange={(e) => handleInputChange('primaryContact.lastName', e.target.value)}
                    placeholder="z.B. Mustermann"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Rolle / Position</Label>
                <Input
                  id="role"
                  type="text"
                  value={formData.primaryContact.role}
                  onChange={(e) => handleInputChange('primaryContact.role', e.target.value)}
                  placeholder="z.B. Geschäftsführer, Projektleiter"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-Mail-Adresse *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.primaryContact.email}
                      onChange={(e) => handleInputChange('primaryContact.email', e.target.value)}
                      placeholder="z.B. max.mustermann@firma.de"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefonnummer</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.primaryContact.phone}
                      onChange={(e) => handleInputChange('primaryContact.phone', e.target.value)}
                      placeholder="z.B. +49 123 456789"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href="/customers">
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={!isValid || loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Wird erstellt...' : 'Kunde erstellen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}