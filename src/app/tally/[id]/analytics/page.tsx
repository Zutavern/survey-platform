'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft,
  Download,
  Eye,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  Mail
} from "lucide-react";
import Link from "next/link";

interface FormAnalytics {
  id: string;
  title: string;
  status: 'published' | 'draft' | 'closed';
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  avgCompletionTime: number;
  createdAt: string;
  lastSubmission: string;
  submissions: FormSubmission[];
  questionStats: QuestionStats[];
}

interface FormSubmission {
  id: string;
  submittedAt: string;
  answers: { [questionId: string]: string | string[] };
  completionTime: number;
  source: string;
}

interface QuestionStats {
  id: string;
  title: string;
  type: string;
  responseCount: number;
  responseRate: number;
  answers: { [key: string]: number };
  avgRating?: number;
}

export default function TallyFormAnalytics() {
  const params = useParams();
  const formId = params.id as string;
  
  const [analytics, setAnalytics] = useState<FormAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [formId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Use our Next.js API route which handles Tally API calls
      const response = await fetch(`/api/tally/forms/${formId}/analytics`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const analyticsData = await response.json();
      setAnalytics(analyticsData);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'pdf' | 'json') => {
    try {
      setExportLoading(true);
      
      // This will be replaced with actual Tally MCP API call
      console.log('Exporting data in format:', format);
      
      // Mock export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, this would trigger a download
      alert(`Export als ${format.toUpperCase()} würde hier starten`);
    } catch (err) {
      console.error('Error exporting data:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-blue-600">Lade Analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <p className="text-red-600 text-center">Analytics nicht verfügbar</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/tally" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zum Dashboard
          </Link>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-blue-900">{analytics.title}</h1>
              <p className="text-blue-600 mt-2">Analytics und Auswertungen</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge 
                  className={analytics.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                >
                  {analytics.status === 'published' ? 'Veröffentlicht' : 'Entwurf'}
                </Badge>
                <span className="text-sm text-blue-600">
                  Erstellt: {formatDate(analytics.createdAt)}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleExportData('csv')} disabled={exportLoading}>
                <Download className="mr-2 h-4 w-4" />
                CSV Export
              </Button>
              <Button variant="outline" onClick={() => handleExportData('pdf')} disabled={exportLoading}>
                <Download className="mr-2 h-4 w-4" />
                PDF Report
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-2">Aufrufe gesamt</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalViews}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-2">Einreichungen</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.totalSubmissions}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-2">Konversionsrate</p>
                  <p className="text-2xl font-bold text-blue-900">{formatPercentage(analytics.conversionRate)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 mb-2">Ø Bearbeitungszeit</p>
                  <p className="text-2xl font-bold text-blue-900">{analytics.avgCompletionTime}min</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-full">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Question Statistics */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900">Fragen-Statistiken</h2>
            
            {analytics.questionStats.map((question) => (
              <Card key={question.id} className="bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-blue-900 text-base">{question.title}</CardTitle>
                      <CardDescription>
                        {question.responseCount} Antworten ({formatPercentage(question.responseRate)} Antwortrate)
                      </CardDescription>
                    </div>
                    <Badge variant="outline">
                      {question.type === 'text' && 'Text'}
                      {question.type === 'email' && 'E-Mail'}
                      {question.type === 'radio' && 'Single Choice'}
                      {question.type === 'select' && 'Dropdown'}
                      {question.type === 'checkbox' && 'Multiple Choice'}
                      {question.type === 'rating' && 'Bewertung'}
                    </Badge>
                  </div>
                </CardHeader>
                
                {(question.type === 'radio' || question.type === 'select' || question.type === 'checkbox') && (
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(question.answers).map(([answer, count]) => {
                        const percentage = (count / question.responseCount) * 100;
                        return (
                          <div key={answer}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm text-blue-900">{answer}</span>
                              <span className="text-sm text-blue-600">{count} ({formatPercentage(percentage)})</span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
                
                {question.avgRating && (
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-900 mb-2">{question.avgRating}/5</div>
                      <div className="text-sm text-blue-600">Durchschnittliche Bewertung</div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {/* Recent Submissions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-blue-900">Letzte Einreichungen</h2>
            
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Aktuelle Antworten
                </CardTitle>
                <CardDescription>
                  Letzte Aktualisierung: {formatDate(analytics.lastSubmission)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.submissions.slice(0, 5).map((submission, index) => (
                    <div key={submission.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline">Einreichung #{analytics.submissions.length - index}</Badge>
                        <span className="text-xs text-blue-600">
                          {formatDate(submission.submittedAt)}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-blue-600">Unternehmen:</span>
                          <span className="text-blue-900">{submission.answers['1'] as string}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-blue-600">Größe:</span>
                          <span className="text-blue-900">{submission.answers['2'] as string}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-blue-600">Branche:</span>
                          <span className="text-blue-900">{submission.answers['3'] as string}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <span className="text-blue-600">Bearbeitungszeit:</span>
                          <span className="text-blue-900">{submission.completionTime} Minuten</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {analytics.submissions.length === 0 && (
                    <div className="text-center py-8 text-blue-600">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Noch keine Einreichungen vorhanden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Daten exportieren
                </CardTitle>
                <CardDescription>
                  Laden Sie Ihre Formulardaten in verschiedenen Formaten herunter
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportData('csv')}
                  disabled={exportLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  CSV-Datei (für Excel)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportData('pdf')}
                  disabled={exportLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  PDF-Report
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportData('json')}
                  disabled={exportLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  JSON-Daten
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}