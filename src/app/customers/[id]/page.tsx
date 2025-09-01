'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Plus,
  Edit,
  Trash2,
  FileText,
  Users,
  Eye,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import { Customer, ContactPerson } from '@/lib/types/customer'

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string
  
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [surveys, setSurveys] = useState([])
  const [isAddingContact, setIsAddingContact] = useState(false)
  const [isAssigningSurvey, setIsAssigningSurvey] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState([])
  
  const [newContact, setNewContact] = useState({
    firstName: '',
    lastName: '',
    role: '',
    department: '',
    email: '',
    phone: ''
  })

  const [surveyAssignment, setSurveyAssignment] = useState({
    templateId: '',
    assignedTo: [] as string[],
    customTitle: '',
    customDescription: ''
  })

  useEffect(() => {
    if (customerId) {
      fetchCustomer()
      fetchCustomerSurveys()
      fetchAvailableTemplates()
    }
  }, [customerId])

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`)
      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      }
    } catch (error) {
      console.error('Error fetching customer:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerSurveys = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/surveys`)
      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      }
    } catch (error) {
      console.error('Error fetching customer surveys:', error)
    }
  }

  const fetchAvailableTemplates = async () => {
    try {
      const response = await fetch('/api/tally/forms')
      if (response.ok) {
        const data = await response.json()
        setAvailableTemplates(data.forms || [])
      }
    } catch (error) {
      console.error('Error fetching templates:', error)
    }
  }

  const handleAddContact = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      })

      if (response.ok) {
        setIsAddingContact(false)
        setNewContact({
          firstName: '',
          lastName: '',
          role: '',
          department: '',
          email: '',
          phone: ''
        })
        fetchCustomer()
      }
    } catch (error) {
      console.error('Error adding contact:', error)
    }
  }

  const handleAssignSurvey = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(surveyAssignment),
      })

      if (response.ok) {
        setIsAssigningSurvey(false)
        setSurveyAssignment({
          templateId: '',
          assignedTo: [],
          customTitle: '',
          customDescription: ''
        })
        fetchCustomerSurveys()
        fetchCustomer()
      }
    } catch (error) {
      console.error('Error assigning survey:', error)
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (confirm('Kontakt wirklich löschen?')) {
      try {
        const response = await fetch(`/api/customers/${customerId}/contacts?contactId=${contactId}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchCustomer()
        }
      } catch (error) {
        console.error('Error deleting contact:', error)
      }
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
          <div className="flex items-center gap-4 mb-4">
            <Link href="/customers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900">
                {customer.companyName}
              </h1>
              <p className="text-slate-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {customer.street}, {customer.postalCode} {customer.city}
              </p>
            </div>
            <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
              {customer.status === 'active' ? 'Aktiv' : 'Inaktiv'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
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
                <p className="text-lg font-semibold text-slate-900">
                  {customer.primaryContact.firstName} {customer.primaryContact.lastName}
                </p>
                <p className="text-slate-600">{customer.primaryContact.role}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  {customer.primaryContact.email}
                </div>
                {customer.primaryContact.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    {customer.primaryContact.phone}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Contacts */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Weitere Ansprechpartner ({customer.additionalContacts.length})
              </CardTitle>
              <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Kontakt hinzufügen
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Kontakt hinzufügen</DialogTitle>
                    <DialogDescription>
                      Fügen Sie einen weiteren Ansprechpartner für diesen Kunden hinzu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-firstName">Vorname</Label>
                        <Input
                          id="contact-firstName"
                          value={newContact.firstName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, firstName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-lastName">Nachname</Label>
                        <Input
                          id="contact-lastName"
                          value={newContact.lastName}
                          onChange={(e) => setNewContact(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-role">Rolle</Label>
                        <Input
                          id="contact-role"
                          value={newContact.role}
                          onChange={(e) => setNewContact(prev => ({ ...prev, role: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-department">Abteilung</Label>
                        <Input
                          id="contact-department"
                          value={newContact.department}
                          onChange={(e) => setNewContact(prev => ({ ...prev, department: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact-email">E-Mail</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          value={newContact.email}
                          onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact-phone">Telefon</Label>
                        <Input
                          id="contact-phone"
                          value={newContact.phone}
                          onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingContact(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleAddContact}>
                        Kontakt hinzufügen
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {customer.additionalContacts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.additionalContacts.map((contact) => (
                  <Card key={contact.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900">
                            {contact.firstName} {contact.lastName}
                          </p>
                          <p className="text-sm text-slate-600">{contact.role}</p>
                          {contact.department && (
                            <p className="text-sm text-slate-500">{contact.department}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteContact(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {contact.email}
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Noch keine weiteren Kontakte hinzugefügt.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Assigned Surveys */}
        <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Zugewiesene Umfragen ({customer.assignedSurveys.length})
              </CardTitle>
              <Dialog open={isAssigningSurvey} onOpenChange={setIsAssigningSurvey}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Umfrage zuweisen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Umfrage zuweisen</DialogTitle>
                    <DialogDescription>
                      Wählen Sie eine Umfrage-Vorlage aus und weisen Sie sie diesem Kunden zu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template-select">Umfrage-Vorlage</Label>
                      <select
                        id="template-select"
                        className="w-full p-2 border border-slate-300 rounded-md"
                        value={surveyAssignment.templateId}
                        onChange={(e) => setSurveyAssignment(prev => ({ ...prev, templateId: e.target.value }))}
                      >
                        <option value="">Vorlage auswählen...</option>
                        {availableTemplates.map((template: any) => (
                          <option key={template.id} value={template.id}>
                            {template.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="custom-title">Individueller Titel (optional)</Label>
                      <Input
                        id="custom-title"
                        value={surveyAssignment.customTitle}
                        onChange={(e) => setSurveyAssignment(prev => ({ ...prev, customTitle: e.target.value }))}
                        placeholder="Leer lassen für automatischen Titel"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAssigningSurvey(false)}>
                        Abbrechen
                      </Button>
                      <Button 
                        onClick={handleAssignSurvey}
                        disabled={!surveyAssignment.templateId}
                      >
                        Umfrage zuweisen
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {customer.assignedSurveys.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customer.assignedSurveys.map((survey) => (
                  <Card key={survey.id} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-slate-900">{survey.title}</p>
                          <p className="text-sm text-slate-600">Template: {survey.templateId}</p>
                          <p className="text-sm text-slate-500">
                            Zugewiesen: {new Date(survey.assignedAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                          {survey.status}
                        </Badge>
                      </div>
                      {survey.tallyFormId && (
                        <div className="mt-3">
                          <a 
                            href={`https://tally.so/r/${survey.tallyFormId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Umfrage öffnen
                          </a>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                Noch keine Umfragen zugewiesen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}