'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  BarChart3, 
  Calendar, 
  Users, 
  FileText,
  ExternalLink,
  Copy,
  Settings,
  Target,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Clock,
  Globe,
  Filter,
  Search,
  MoreHorizontal,
  LogOut
} from "lucide-react";
import Link from "next/link";

interface TallyForm {
  id: string;
  title: string;
  description?: string;
  status: 'published' | 'draft' | 'closed';
  url: string;
  createdAt: string;
  updatedAt: string;
  responses: number;
  views: number;
}

export default function TallyDashboard() {
  const [forms, setForms] = useState<TallyForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'closed'>('all');

  useEffect(() => {
    fetchTallyForms();
  }, []);

  const fetchTallyForms = async () => {
    try {
      setLoading(true);
      
      // Use our Next.js API route which handles Tally API calls
      const response = await fetch('/api/tally/forms');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const formsData = await response.json();
      setForms(formsData);
      setError(null);
    } catch (err) {
      setError('Fehler beim Laden der Tally-Formulare');
      console.error('Error fetching Tally forms:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         form.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: TallyForm['status']) => {
    const statusConfig = {
      published: { label: 'Veröffentlicht', className: 'bg-green-100 text-green-800' },
      draft: { label: 'Entwurf', className: 'bg-yellow-100 text-yellow-800' },
      closed: { label: 'Geschlossen', className: 'bg-slate-100 text-slate-800' }
    };

    const config = statusConfig[status];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Möchten Sie dieses Formular wirklich löschen?')) {
      try {
        const response = await fetch(`/api/tally/forms/${formId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Remove from local state
        setForms(forms.filter(form => form.id !== formId));
      } catch (err) {
        console.error('Error deleting form:', err);
        alert('Fehler beim Löschen des Formulars');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/login';
      } else {
        alert('Fehler beim Abmelden');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Fehler beim Abmelden');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Lade Dashboard</h2>
            <p className="text-slate-600">Ihre Tally-Formulare werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="text-slate-600 hover:text-slate-900 transition-colors inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück
              </Link>
              
              <div className="w-px h-6 bg-slate-300"></div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Tally Dashboard</h1>
                  <p className="text-sm text-slate-600">Assessment-Formulare verwalten</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchTallyForms}
                className="hidden sm:flex"
              >
                <Settings className="mr-2 h-4 w-4" />
                Aktualisieren
              </Button>
              
              <Link href="/tally/create">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Neues </span>Formular
                </Button>
              </Link>

              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Abmelden</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Formulare gesamt</p>
                  <p className="text-2xl font-bold text-slate-900">{forms.length}</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Aktiv verwaltet
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Gesamtantworten</p>
                  <p className="text-2xl font-bold text-slate-900">{forms.reduce((sum, f) => sum + f.responses, 0)}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% diesen Monat
                  </p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Aufrufe gesamt</p>
                  <p className="text-2xl font-bold text-slate-900">{forms.reduce((sum, f) => sum + f.views, 0)}</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Globe className="h-3 w-3 mr-1" />
                    Online verfügbar
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Eye className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-1">Konversionsrate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {forms.length > 0 ? ((forms.reduce((sum, f) => sum + f.responses, 0) / forms.reduce((sum, f) => sum + f.views, 0)) * 100).toFixed(1) : '0.0'}%
                  </p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Optimiert
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Bar */}
        <Card className="mb-8 bg-white/90 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Formulare durchsuchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 rounded-lg border border-slate-200 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="published">Veröffentlicht</option>
                  <option value="draft">Entwurf</option>
                  <option value="closed">Geschlossen</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {filteredForms.length === 0 && !loading ? (
          searchQuery || statusFilter !== 'all' ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm text-center py-16">
              <CardContent>
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Keine Ergebnisse gefunden</h3>
                <p className="text-slate-600 mb-6">
                  Keine Formulare entsprechen Ihren Suchkriterien.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                >
                  Filter zurücksetzen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-sm text-center py-16">
              <CardContent>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Noch keine Formulare</h3>
                <p className="text-slate-600 mb-6">
                  Erstellen Sie Ihr erstes Assessment-Formular und sammeln Sie strukturierte Daten.
                </p>
                <Link href="/tally/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Erstes Formular erstellen
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredForms.map((form) => (
              <Card 
                key={form.id} 
                className="group bg-white/90 backdrop-blur-sm border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:scale-[1.01]"
              >
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 pr-4">
                      <CardTitle className="text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {form.title}
                      </CardTitle>
                      {form.description && (
                        <CardDescription className="text-slate-600 line-clamp-2 text-sm leading-relaxed">
                          {form.description}
                        </CardDescription>
                      )}
                    </div>
                    {getStatusBadge(form.status)}
                  </div>
                  
                  {/* Enhanced Stats Row */}
                  <div className="flex items-center justify-between py-3 px-3 bg-slate-50/50 rounded-lg">
                    <div className="flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-slate-700">{form.responses}</span>
                      <span className="text-slate-500">Antworten</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-slate-700">{form.views}</span>
                      <span className="text-slate-500">Aufrufe</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(form.createdAt)}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0 space-y-4">
                  {/* URL Preview */}
                  <div className="bg-slate-50/70 rounded-lg p-3 group-hover:bg-blue-50/70 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Globe className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <code className="text-xs text-slate-600 truncate">
                          {form.url.replace('https://tally.so/r/', '')}
                        </code>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleCopyUrl(form.url)}
                        className="h-7 w-7 p-0 hover:bg-white/80"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Primary Actions */}
                  <div className="flex gap-2">
                    <a 
                      href={form.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full group-hover:border-blue-200 group-hover:text-blue-600">
                        <ExternalLink className="mr-2 h-3 w-3" />
                        Öffnen
                      </Button>
                    </a>
                    
                    <Link 
                      href={`/tally/${form.id}/analytics`} 
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                        <BarChart3 className="mr-2 h-3 w-3" />
                        Analytics
                      </Button>
                    </Link>
                  </div>
                  
                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div className="flex gap-1">
                      <Link href={`/tally/${form.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                        onClick={() => handleCopyUrl(form.url)}
                      >
                        <Share2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-slate-500 hover:text-slate-700">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                        onClick={() => handleDeleteForm(form.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Stats Summary */}
        {forms.length > 0 && (
          <Card className="mt-8 bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Übersicht</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-900">
                    {forms.length}
                  </div>
                  <div className="text-sm text-blue-600">Formulare gesamt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {forms.filter(f => f.status === 'published').length}
                  </div>
                  <div className="text-sm text-blue-600">Veröffentlicht</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {forms.reduce((sum, f) => sum + f.responses, 0)}
                  </div>
                  <div className="text-sm text-blue-600">Antworten gesamt</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {forms.reduce((sum, f) => sum + f.views, 0)}
                  </div>
                  <div className="text-sm text-blue-600">Aufrufe gesamt</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}