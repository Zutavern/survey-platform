'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  GripVertical,
  Eye,
  Settings
} from "lucide-react";
import Link from "next/link";

interface FormQuestion {
  id: string;
  type: 'text' | 'email' | 'select' | 'radio' | 'checkbox' | 'textarea' | 'rating';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  order: number;
}

interface TallyFormData {
  id: string;
  title: string;
  description?: string;
  status: 'published' | 'draft' | 'closed';
  questions: FormQuestion[];
  settings: {
    allowMultipleSubmissions: boolean;
    showProgressBar: boolean;
    collectEmails: boolean;
    thankYouMessage: string;
  };
}

const questionTypes = [
  { value: 'text', label: 'Text (kurz)' },
  { value: 'textarea', label: 'Text (lang)' },
  { value: 'email', label: 'E-Mail' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Multiple Choice (einfach)' },
  { value: 'checkbox', label: 'Multiple Choice (mehrfach)' },
  { value: 'rating', label: 'Bewertung (1-5)' }
];

export default function EditTallyForm() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const [formData, setFormData] = useState<TallyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFormData();
  }, [formId]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      
      // Use our Next.js API route which handles Tally API calls
      const response = await fetch(`/api/tally/forms/${formId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const formData = await response.json();
      setFormData(formData);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden des Formulars');
      console.error('Error fetching form data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    if (!formData) return;
    
    try {
      setSaving(true);
      
      // Use our Next.js API route to save the form
      const response = await fetch(`/api/tally/forms/${formId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Redirect back to dashboard
      router.push('/tally');
    } catch (err) {
      setError('Fehler beim Speichern des Formulars');
      console.error('Error saving form:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateBasicInfo = (field: keyof Pick<TallyFormData, 'title' | 'description' | 'status'>, value: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleUpdateQuestion = (questionId: string, field: keyof FormQuestion, value: any) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      questions: formData.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    });
  };

  const handleAddQuestion = () => {
    if (!formData) return;
    
    const newQuestion: FormQuestion = {
      id: Date.now().toString(),
      type: 'text',
      title: 'Neue Frage',
      description: '',
      required: false,
      order: formData.questions.length + 1
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      questions: formData.questions.filter(q => q.id !== questionId)
    });
  };

  const handleUpdateQuestionOptions = (questionId: string, options: string[]) => {
    handleUpdateQuestion(questionId, 'options', options);
  };

  const addOption = (questionId: string) => {
    const question = formData?.questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newOptions = [...(question.options || []), 'Neue Option'];
    handleUpdateQuestionOptions(questionId, newOptions);
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = formData?.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    handleUpdateQuestionOptions(questionId, newOptions);
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = formData?.questions.find(q => q.id === questionId);
    if (!question || !question.options) return;
    
    const newOptions = question.options.filter((_, index) => index !== optionIndex);
    handleUpdateQuestionOptions(questionId, newOptions);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600">Lade Formular...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">Formular nicht gefunden</p>
              <div className="mt-4 text-center">
                <Link href="/tally">
                  <Button variant="outline">Zurück zum Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tally" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Link>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Formular bearbeiten</h1>
              <p className="text-blue-600 mt-2">
                Passen Sie Ihr Assessment-Formular an
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Vorschau
              </Button>
              
              <Button 
                onClick={handleSaveForm}
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Speichern...' : 'Speichern'}
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Grundeinstellungen</CardTitle>
              <CardDescription>
                Titel, Beschreibung und Status des Formulars
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel des Formulars</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleUpdateBasicInfo('title', e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleUpdateBasicInfo('description', e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleUpdateBasicInfo('status', e.target.value as any)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                >
                  <option value="draft">Entwurf</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="closed">Geschlossen</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Fragen</CardTitle>
                  <CardDescription>
                    Bearbeiten Sie die Fragen Ihres Formulars
                  </CardDescription>
                </div>
                <Button onClick={handleAddQuestion} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Frage hinzufügen
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {formData.questions.map((question, index) => (
                  <Card key={question.id} className="border border-slate-200">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-slate-400" />
                          <Badge variant="outline">Frage {index + 1}</Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Fragentyp</Label>
                          <select
                            value={question.type}
                            onChange={(e) => handleUpdateQuestion(question.id, 'type', e.target.value)}
                            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                          >
                            {questionTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <Label>
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => handleUpdateQuestion(question.id, 'required', e.target.checked)}
                              className="mr-2"
                            />
                            Pflichtfeld
                          </Label>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Fragentext</Label>
                        <Input
                          value={question.title}
                          onChange={(e) => handleUpdateQuestion(question.id, 'title', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label>Beschreibung (optional)</Label>
                        <Textarea
                          value={question.description || ''}
                          onChange={(e) => handleUpdateQuestion(question.id, 'description', e.target.value)}
                          className="mt-1"
                          rows={2}
                        />
                      </div>
                      
                      {question.type === 'text' || question.type === 'email' || question.type === 'textarea' ? (
                        <div>
                          <Label>Platzhaltertext</Label>
                          <Input
                            value={question.placeholder || ''}
                            onChange={(e) => handleUpdateQuestion(question.id, 'placeholder', e.target.value)}
                            className="mt-1"
                          />
                        </div>
                      ) : null}
                      
                      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label>Antwortoptionen</Label>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addOption(question.id)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Option
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {(question.options || []).map((option, optionIndex) => (
                              <div key={optionIndex} className="flex gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(question.id, optionIndex)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Form Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Formular-Einstellungen
              </CardTitle>
              <CardDescription>
                Erweiterte Einstellungen für Ihr Formular
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.settings.allowMultipleSubmissions}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, allowMultipleSubmissions: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  Mehrfache Einreichungen erlauben
                </Label>
              </div>
              
              <div>
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.settings.showProgressBar}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, showProgressBar: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  Fortschrittsbalken anzeigen
                </Label>
              </div>
              
              <div>
                <Label>
                  <input
                    type="checkbox"
                    checked={formData.settings.collectEmails}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, collectEmails: e.target.checked }
                    })}
                    className="mr-2"
                  />
                  E-Mail-Adressen sammeln
                </Label>
              </div>
              
              <div>
                <Label>Danke-Nachricht</Label>
                <Textarea
                  value={formData.settings.thankYouMessage}
                  onChange={(e) => setFormData({
                    ...formData,
                    settings: { ...formData.settings, thankYouMessage: e.target.value }
                  })}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 text-center">
          <Button 
            onClick={handleSaveForm}
            disabled={saving}
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Speichern...' : 'Änderungen speichern'}
          </Button>
        </div>
      </div>
    </div>
  );
}