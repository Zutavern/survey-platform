'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft,
  Save,
  Wand2,
  FileText,
  Users,
  BarChart3,
  MessageSquare,
  Plus,
  Sparkles,
  Target,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface FormTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  questions: {
    type: string;
    title: string;
    description?: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
  }[];
}

const formTemplates: FormTemplate[] = [
  {
    id: 'customer-assessment',
    name: 'Kunden-Assessment',
    description: 'Erfassung grundlegender Kundeninformationen für Beratungsprojekte',
    icon: <Target className="h-6 w-6" />,
    questions: [
      {
        type: 'text',
        title: 'Unternehmensname',
        description: 'Bitte geben Sie den vollständigen Namen Ihres Unternehmens an',
        required: true,
        placeholder: 'z.B. Mustermann GmbH'
      },
      {
        type: 'radio',
        title: 'Unternehmensgröße',
        description: 'Wie viele Mitarbeiter hat Ihr Unternehmen?',
        required: true,
        options: ['1-10 Mitarbeiter', '11-50 Mitarbeiter', '51-250 Mitarbeiter', '251-1000 Mitarbeiter', '1000+ Mitarbeiter']
      },
      {
        type: 'select',
        title: 'Branche',
        description: 'In welcher Branche ist Ihr Unternehmen tätig?',
        required: true,
        options: ['IT/Software', 'Beratung', 'Produktion', 'Handel', 'Dienstleistung', 'Gesundheitswesen', 'Bildung', 'Finanzwesen', 'Sonstiges']
      },
      {
        type: 'email',
        title: 'Kontakt E-Mail',
        description: 'Ihre primäre Kontakt-E-Mail-Adresse',
        required: true,
        placeholder: 'max.mustermann@example.com'
      },
      {
        type: 'checkbox',
        title: 'Aktueller Hauptbedarf',
        description: 'In welchen Bereichen sehen Sie aktuell den größten Handlungsbedarf?',
        required: false,
        options: ['Strategieentwicklung', 'Prozessoptimierung', 'Technologie & Digitalisierung', 'Personal & Organisation', 'Finanzen & Controlling']
      }
    ]
  },
  {
    id: 'team-assessment',
    name: 'Team-Assessment',
    description: 'Bewertung durch mehrere Teammitglieder für kollaborative Einschätzungen',
    icon: <BarChart3 className="h-6 w-6" />,
    questions: [
      {
        type: 'text',
        title: 'Name und Position',
        description: 'Ihr Name und Ihre Position im Unternehmen',
        required: true,
        placeholder: 'Max Mustermann, Geschäftsführer'
      },
      {
        type: 'rating',
        title: 'Digitaler Reifegrad',
        description: 'Wie bewerten Sie den aktuellen digitalen Reifegrad Ihres Unternehmens?',
        required: true
      },
      {
        type: 'rating',
        title: 'Prozesseffizienz',
        description: 'Wie effizient schätzen Sie die aktuellen Geschäftsprozesse ein?',
        required: true
      },
      {
        type: 'textarea',
        title: 'Größte Herausforderungen',
        description: 'Was sind aus Ihrer Sicht die drei größten Herausforderungen?',
        required: false,
        placeholder: 'Beschreiben Sie die wichtigsten Herausforderungen...'
      }
    ]
  },
  {
    id: 'feedback-form',
    name: 'Feedback-Formular',
    description: 'Allgemeines Feedback-Formular für verschiedene Anwendungsfälle',
    icon: <MessageSquare className="h-6 w-6" />,
    questions: [
      {
        type: 'text',
        title: 'Name (optional)',
        description: 'Ihr Name für die Kontaktaufnahme',
        required: false,
        placeholder: 'Max Mustermann'
      },
      {
        type: 'email',
        title: 'E-Mail-Adresse',
        description: 'Für Rückfragen und weitere Kommunikation',
        required: true,
        placeholder: 'max@example.com'
      },
      {
        type: 'rating',
        title: 'Gesamtbewertung',
        description: 'Wie zufrieden sind Sie insgesamt?',
        required: true
      },
      {
        type: 'textarea',
        title: 'Kommentare und Vorschläge',
        description: 'Was können wir verbessern? Was hat Ihnen gefallen?',
        required: false,
        placeholder: 'Teilen Sie Ihr Feedback mit uns...'
      }
    ]
  }
];

export default function CreateTallyForm() {
  const router = useRouter();
  const [step, setStep] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customForm, setCustomForm] = useState({
    title: '',
    description: ''
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFromTemplate = async (templateId: string) => {
    const template = formTemplates.find(t => t.id === templateId);
    if (!template) return;

    try {
      setCreating(true);
      
      // This will be replaced with actual Tally MCP API call
      console.log('Creating form from template:', template);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to edit page for the new form
      router.push('/tally/new-form-id/edit');
    } catch (err) {
      setError('Fehler beim Erstellen des Formulars');
      console.error('Error creating form:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateCustomForm = async () => {
    if (!customForm.title.trim()) {
      setError('Bitte geben Sie einen Titel ein');
      return;
    }

    try {
      setCreating(true);
      
      // This will be replaced with actual Tally MCP API call
      console.log('Creating custom form:', customForm);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to edit page for the new form
      router.push('/tally/new-custom-form-id/edit');
    } catch (err) {
      setError('Fehler beim Erstellen des Formulars');
      console.error('Error creating custom form:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/tally" 
                className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              
              <div className="w-px h-6 bg-slate-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Formular erstellen</h1>
                  <p className="text-sm text-slate-600">Assessment-Formular konfigurieren</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="mr-2 h-4 w-4" />
            Powered by Tally Forms
          </div>
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Professionelles Assessment erstellen
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Wählen Sie eine bewährte Vorlage oder beginnen Sie mit einem individuellen Formular
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50 max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Navigation Tabs */}
        <div className="flex justify-center mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg border border-slate-200">
            <button
              onClick={() => setStep('template')}
              className={`px-8 py-4 rounded-xl transition-all duration-300 font-medium ${
                step === 'template' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Wand2 className="h-5 w-5 inline mr-3" />
              Aus Vorlage erstellen
              {step === 'template' && <CheckCircle className="h-4 w-4 inline ml-2" />}
            </button>
            <button
              onClick={() => setStep('custom')}
              className={`px-8 py-4 rounded-xl transition-all duration-300 font-medium ${
                step === 'custom' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <FileText className="h-5 w-5 inline mr-3" />
              Leeres Formular
              {step === 'custom' && <CheckCircle className="h-4 w-4 inline ml-2" />}
            </button>
          </div>
        </div>

        {step === 'template' ? (
          <div>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Bewährte Vorlagen auswählen
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Starten Sie mit einer professionellen Vorlage und passen Sie diese an Ihre Bedürfnisse an
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {formTemplates.map((template, index) => (
                <Card 
                  key={template.id} 
                  className="group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-[1.02]"
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="relative mb-6">
                      <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                        index === 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-500' :
                        index === 1 ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                        'bg-gradient-to-br from-purple-500 to-indigo-500'
                      }`}>
                        <div className="text-white">{template.icon}</div>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <CardTitle className="text-xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600 leading-relaxed">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-slate-50/70 rounded-xl p-4 group-hover:bg-blue-50/70 transition-colors">
                      <p className="text-sm font-medium text-slate-700 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Enthaltene Fragen ({template.questions.length})
                      </p>
                      <ul className="space-y-2">
                        {template.questions.slice(0, 3).map((question, qIndex) => (
                          <li key={qIndex} className="flex items-start text-sm text-slate-600">
                            <div className={`w-2 h-2 rounded-full mr-3 mt-1.5 flex-shrink-0 ${
                              index === 0 ? 'bg-blue-400' :
                              index === 1 ? 'bg-green-400' :
                              'bg-purple-400'
                            }`}></div>
                            <span className="line-clamp-1">{question.title}</span>
                          </li>
                        ))}
                        {template.questions.length > 3 && (
                          <li className="flex items-center text-xs text-slate-500 pl-5">
                            <Plus className="h-3 w-3 mr-1" />
                            {template.questions.length - 3} weitere Fragen
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <div className="pt-2">
                      <Button
                        className={`w-full transition-all duration-300 ${
                          index === 0 ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' :
                          index === 1 ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' :
                          'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                        } group-hover:shadow-lg`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateFromTemplate(template.id);
                        }}
                        disabled={creating}
                      >
                        {creating && selectedTemplate === template.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Erstelle Formular...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Vorlage verwenden
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4 pt-2 text-xs text-slate-500">
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        ~3 min Setup
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Sofort nutzbar
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900 mb-3">
                Individuelles Formular erstellen
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Beginnen Sie mit einem leeren Formular und gestalten Sie es nach Ihren spezifischen Anforderungen
              </p>
            </div>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-slate-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-2xl text-slate-900 mb-3">
                  Individuelles Assessment
                </CardTitle>
                <CardDescription className="text-slate-600 text-lg">
                  Vollständige Kontrolle über Fragen, Design und Funktionalität
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Form Configuration */}
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="custom-title" className="text-base font-medium text-slate-700 flex items-center mb-2">
                      Titel des Formulars *
                      <span className="ml-2 text-xs text-slate-500">(öffentlich sichtbar)</span>
                    </Label>
                    <Input
                      id="custom-title"
                      value={customForm.title}
                      onChange={(e) => setCustomForm({ ...customForm, title: e.target.value })}
                      placeholder="z.B. Strategieberatung - Unternehmensbewertung 2024"
                      className="text-lg py-3"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="custom-description" className="text-base font-medium text-slate-700 flex items-center mb-2">
                      Beschreibung
                      <span className="ml-2 text-xs text-slate-500">(optional)</span>
                    </Label>
                    <Textarea
                      id="custom-description"
                      value={customForm.description}
                      onChange={(e) => setCustomForm({ ...customForm, description: e.target.value })}
                      placeholder="Beschreiben Sie den Zweck und die Ziele Ihres Assessments. Diese Beschreibung hilft Teilnehmern zu verstehen, was sie erwartet..."
                      className="min-h-[100px] resize-none"
                      rows={4}
                    />
                  </div>
                </div>

                {/* Features Preview */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Was Sie erwarten können
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Drag & Drop Editor</p>
                        <p className="text-sm text-slate-600">Intuitive Fragenbearbeitung</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">15+ Fragetypen</p>
                        <p className="text-sm text-slate-600">Von Text bis Bewertungsskalen</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Logik & Bedingungen</p>
                        <p className="text-sm text-slate-600">Intelligente Fragenführung</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                      <div>
                        <p className="font-medium text-slate-800">Real-time Analytics</p>
                        <p className="text-sm text-slate-600">Sofortige Auswertungen</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleCreateCustomForm}
                    disabled={creating || !customForm.title.trim()}
                    className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 py-4 text-lg font-medium"
                    size="lg"
                  >
                    {creating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Erstelle individuelles Formular...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-3 h-5 w-5" />
                        Individuelles Formular erstellen
                      </>
                    )}
                  </Button>
                  
                  <p className="text-sm text-slate-500 text-center mt-4 flex items-center justify-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Geschätzte Einrichtungszeit: 5-15 Minuten
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}