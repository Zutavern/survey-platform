'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Sparkles, 
  ArrowLeft, 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Eye,
  Edit,
  Save,
  Settings,
  FileText,
  Clock,
  Users,
  Star,
  Lightbulb
} from "lucide-react";
import Link from "next/link";

interface GeneratedForm {
  id: string;
  title: string;
  description: string;
  questions: Array<{
    id: string;
    type: string;
    title: string;
    description?: string;
    required: boolean;
    options?: string[];
    validation?: any;
    ratingScale?: any;
    fileUpload?: any;
    dateTime?: any;
    matrix?: any;
    conditionalLogic?: any;
    payment?: any;
  }>;
  settings: {
    allowMultipleSubmissions: boolean;
    showProgressBar: boolean;
    collectEmails: boolean;
    confirmBeforeSubmit: boolean;
    submitButtonText: string;
    thankYouMessage: string;
    theme: {
      primaryColor: string;
      backgroundColor: string;
      textColor: string;
      fontFamily: string;
    };
  };
  aiGenerated: boolean;
  originalPrompt: string;
}

interface GenerationMetadata {
  promptLength: number;
  questionCount: number;
  estimatedCompletionTime: number;
  generatedAt: string;
  model: string;
}

const EXAMPLE_PROMPTS = [
  {
    category: "Business",
    icon: "💼",
    examples: [
      "Kundenzufriedenheits-Umfrage für ein Software-Unternehmen",
      "Mitarbeiter-Feedback zum Homeoffice mit Bewertungsskalen",
      "Lead-Qualifizierung für Beratungsdienstleistungen mit Kontaktdaten"
    ]
  },
  {
    category: "Education",
    icon: "🎓", 
    examples: [
      "Kurs-Evaluation mit Matrix-Fragen und Freitext-Feedback",
      "Studenten-Anmeldung mit Datei-Upload für Dokumente",
      "Lernstil-Assessment mit bedingter Logik"
    ]
  },
  {
    category: "Healthcare",
    icon: "🏥",
    examples: [
      "Patienten-Intake-Formular mit medizinischer Historie",
      "Symptom-Tracker mit Datum/Zeit-Feldern",
      "Therapie-Feedback mit Bewertungsskalen"
    ]
  },
  {
    category: "Events",
    icon: "🎉",
    examples: [
      "Event-Anmeldung mit Zahlungsintegration",
      "Workshop-Feedback mit verschiedenen Fragetypen",
      "Catering-Bestellung mit Mehrfachauswahl"
    ]
  }
];

export default function AIFormCreator() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedForm, setGeneratedForm] = useState<GeneratedForm | null>(null);
  const [metadata, setMetadata] = useState<GenerationMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Bitte geben Sie einen Prompt ein');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          apiKey: apiKey.trim() || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fehler beim Generieren des Formulars');
      }

      setGeneratedForm(data.form);
      setMetadata(data.metadata);
      
    } catch (err: any) {
      setError(err.message);
      console.error('Form generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveForm = async () => {
    if (!generatedForm) return;

    try {
      const response = await fetch('/api/tally/forms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(generatedForm),
      });

      if (response.ok) {
        router.push('/tally');
      } else {
        throw new Error('Fehler beim Speichern des Formulars');
      }
    } catch (err) {
      setError('Fehler beim Speichern des Formulars');
      console.error('Save error:', err);
    }
  };

  const getFieldTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'text': '📝', 'textarea': '📄', 'email': '📧', 'phone': '📞',
      'radio': '◉', 'checkbox': '☑️', 'select': '📋', 'multiselect': '📝',
      'rating': '⭐', 'scale': '📊', 'date': '📅', 'time': '⏰',
      'file_upload': '📎', 'signature': '✍️', 'address': '🏠',
      'payment': '💳', 'section_break': '➖', 'matrix_radio': '🔲'
    };
    return icons[type] || '❓';
  };

  const getFieldTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'text': 'Text', 'textarea': 'Textbereich', 'email': 'E-Mail', 'phone': 'Telefon',
      'radio': 'Einzelauswahl', 'checkbox': 'Mehrfachauswahl', 'select': 'Dropdown',
      'rating': 'Bewertung', 'scale': 'Skala', 'date': 'Datum', 'time': 'Zeit',
      'file_upload': 'Datei-Upload', 'signature': 'Unterschrift', 'address': 'Adresse',
      'payment': 'Zahlung', 'section_break': 'Abschnitt', 'matrix_radio': 'Matrix'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/tally" 
                className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zum Dashboard
              </Link>
              
              <div className="w-px h-6 bg-slate-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">KI-Formular Generator</h1>
                  <p className="text-sm text-slate-600">Powered by OpenAI GPT-4</p>
                </div>
              </div>
            </div>
            
            <Badge className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
              <Sparkles className="mr-1 h-3 w-3" />
              KI-Powered
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!generatedForm ? (
            <div className="space-y-8">
              {/* Prompt Input Section */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Wand2 className="h-6 w-6 text-purple-600" />
                    Formular-Prompt eingeben
                  </CardTitle>
                  <CardDescription>
                    Beschreiben Sie das gewünschte Formular. Die KI erstellt automatisch alle Felder, 
                    Validierungen und erweiterten Konfigurationen.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Formular-Beschreibung</Label>
                    <textarea
                      id="prompt"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="z.B. 'Erstelle eine Kundenzufriedenheits-Umfrage für ein Restaurant mit Bewertungsskalen für Service, Essen und Atmosphäre, plus Freitext-Feedback und Kontaktdaten für Follow-up'"
                      className="w-full h-32 px-3 py-2 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={loading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                      className="text-sm"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {showApiKeyInput ? 'API Key verbergen' : 'Eigenen API Key verwenden'}
                    </Button>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        {prompt.length}/1000 Zeichen
                      </span>
                    </div>
                  </div>

                  {showApiKeyInput && (
                    <div className="space-y-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Label htmlFor="apiKey">OpenAI API Key (optional)</Label>
                      <Input
                        id="apiKey"
                        type="password"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="font-mono"
                      />
                      <p className="text-xs text-blue-600">
                        Wenn kein eigener API Key eingegeben wird, verwenden wir den Server-Key.
                      </p>
                    </div>
                  )}

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-600">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    onClick={handleGenerate}
                    disabled={loading || !prompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generiere Formular...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Formular generieren
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Example Prompts */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Beispiel-Prompts
                  </CardTitle>
                  <CardDescription>
                    Klicken Sie auf ein Beispiel, um es zu verwenden
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {EXAMPLE_PROMPTS.map((category, index) => (
                      <div key={index} className="space-y-3">
                        <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                          <span className="text-lg">{category.icon}</span>
                          {category.category}
                        </h4>
                        <div className="space-y-2">
                          {category.examples.map((example, exampleIndex) => (
                            <button
                              key={exampleIndex}
                              onClick={() => setPrompt(example)}
                              className="w-full text-left p-3 text-sm bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 hover:border-slate-300"
                              disabled={loading}
                            >
                              {example}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Generated Form Preview */
            <div className="space-y-8">
              {/* Form Overview */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <div>
                        <CardTitle>Formular erfolgreich generiert!</CardTitle>
                        <CardDescription>
                          Überprüfen Sie die generierten Felder und speichern Sie das Formular
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setGeneratedForm(null)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Neu generieren
                      </Button>
                      <Button onClick={handleSaveForm} className="bg-green-600 hover:bg-green-700">
                        <Save className="mr-2 h-4 w-4" />
                        Formular speichern
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {metadata && (
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-blue-900">{metadata.questionCount}</p>
                        <p className="text-xs text-blue-600">Fragen</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <Clock className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="text-2xl font-bold text-green-900">{metadata.estimatedCompletionTime}min</p>
                        <p className="text-xs text-green-600">Bearbeitungszeit</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Bot className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-purple-900">GPT-4</p>
                        <p className="text-xs text-purple-600">KI-Modell</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <p className="text-lg font-bold text-yellow-900">Pro</p>
                        <p className="text-xs text-yellow-600">Qualität</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Form Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {/* Form Header */}
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>{generatedForm.title}</CardTitle>
                      <CardDescription>{generatedForm.description}</CardDescription>
                      
                      <div className="flex flex-wrap gap-2 mt-4">
                        <Badge variant="outline">
                          KI-generiert
                        </Badge>
                        <Badge variant="outline">
                          {generatedForm.questions.length} Fragen
                        </Badge>
                        <Badge variant="outline">
                          {generatedForm.settings.theme.fontFamily}
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Questions Preview */}
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle>Fragen-Übersicht</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {generatedForm.questions.map((question, index) => (
                          <div key={question.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-lg">{getFieldTypeIcon(question.type)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {getFieldTypeLabel(question.type)}
                                  </Badge>
                                  {question.required && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">
                                      Pflichtfeld
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="font-medium text-slate-900">{question.title}</h4>
                                {question.description && (
                                  <p className="text-sm text-slate-600 mt-1">{question.description}</p>
                                )}
                                
                                {question.options && question.options.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-slate-500 mb-1">Optionen:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {question.options.map((option, optIndex) => (
                                        <Badge key={optIndex} variant="outline" className="text-xs">
                                          {option}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="text-right">
                                <span className="text-xs text-slate-400">#{index + 1}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Settings Sidebar */}
                <div className="space-y-6">
                  <Card className="bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Formular-Einstellungen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Mehrere Einreichungen</span>
                          <Badge variant={generatedForm.settings.allowMultipleSubmissions ? "default" : "secondary"}>
                            {generatedForm.settings.allowMultipleSubmissions ? "Ja" : "Nein"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Fortschrittsbalken</span>
                          <Badge variant={generatedForm.settings.showProgressBar ? "default" : "secondary"}>
                            {generatedForm.settings.showProgressBar ? "Ja" : "Nein"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">E-Mail sammeln</span>
                          <Badge variant={generatedForm.settings.collectEmails ? "default" : "secondary"}>
                            {generatedForm.settings.collectEmails ? "Ja" : "Nein"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Bestätigung vor Absendung</span>
                          <Badge variant={generatedForm.settings.confirmBeforeSubmit ? "default" : "secondary"}>
                            {generatedForm.settings.confirmBeforeSubmit ? "Ja" : "Nein"}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Design-Theme</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border"
                              style={{ backgroundColor: generatedForm.settings.theme.primaryColor }}
                            ></div>
                            <span className="text-sm">Primärfarbe</span>
                          </div>
                          <div className="text-sm text-slate-600">
                            Schriftart: {generatedForm.settings.theme.fontFamily}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Nachrichten</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-slate-500">Button-Text:</span>
                            <p className="text-sm">{generatedForm.settings.submitButtonText}</p>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500">Danke-Nachricht:</span>
                            <p className="text-sm">{generatedForm.settings.thankYouMessage}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Bot className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                        <h4 className="font-medium text-purple-900 mb-2">KI-Generiert</h4>
                        <p className="text-sm text-purple-700 mb-4">
                          Dieses Formular wurde automatisch basierend auf Ihrem Prompt erstellt.
                        </p>
                        <div className="text-xs text-purple-600 bg-white/50 rounded-lg p-2">
                          <strong>Original-Prompt:</strong>
                          <br />
                          "{generatedForm.originalPrompt}"
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}