'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Key, Save, X, Eye, EyeOff, AlertCircle, CheckCircle2, Info } from 'lucide-react'

type ApiKeyStatus = {
  present: boolean
  last4?: string
}

type ApiKeysData = {
  tally: ApiKeyStatus
  openai: ApiKeyStatus
}

export default function ApiKeysPage() {
  // API key states
  const [apiKeys, setApiKeys] = useState<ApiKeysData>({
    tally: { present: false },
    openai: { present: false }
  })
  
  // New key input states
  const [newTallyKey, setNewTallyKey] = useState('')
  const [newOpenAIKey, setNewOpenAIKey] = useState('')
  
  // UI control states
  const [isEditingTally, setIsEditingTally] = useState(false)
  const [isEditingOpenAI, setIsEditingOpenAI] = useState(false)
  const [showTallyKey, setShowTallyKey] = useState(false)
  const [showOpenAIKey, setShowOpenAIKey] = useState(false)
  
  // Loading and status states
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info' | 'none', message: string }>({
    type: 'none',
    message: ''
  })

  // Fetch API keys on mount
  useEffect(() => {
    fetchApiKeys()
  }, [])

  const fetchApiKeys = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/settings/api-keys')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch API keys: ${response.status}`)
      }
      
      const data = await response.json()
      setApiKeys(data)
      
      // Show toast notification if no API keys are configured
      if (!data.tally.present && !data.openai.present) {
        setStatus({
          type: 'info',
          message: 'Keine API-Schlüssel konfiguriert. Bitte fügen Sie Ihre Tally und OpenAI API-Schlüssel hinzu, um alle Funktionen zu nutzen.'
        })
        
        // Auto-dismiss after 8 seconds for info messages
        setTimeout(() => {
          setStatus({ type: 'none', message: '' })
        }, 8000)
      }
    } catch (error) {
      console.error('Error fetching API keys:', error)
      setStatus({
        type: 'error',
        message: 'Failed to load API keys. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveKeys = async () => {
    try {
      setSaving(true)
      setStatus({ type: 'none', message: '' })
      
      // Prepare payload - only include keys that are being updated
      const payload: { tallyApiKey?: string | null, openaiApiKey?: string | null } = {}
      
      if (isEditingTally) {
        payload.tallyApiKey = newTallyKey || null
      }
      
      if (isEditingOpenAI) {
        payload.openaiApiKey = newOpenAIKey || null
      }
      
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update API keys')
      }
      
      // Update local state with response
      const updatedData = await response.json()
      setApiKeys(updatedData)
      
      // Reset editing states and inputs
      setIsEditingTally(false)
      setIsEditingOpenAI(false)
      setNewTallyKey('')
      setNewOpenAIKey('')
      
      // Show success message
      setStatus({
        type: 'success',
        message: 'API keys updated successfully'
      })
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus({ type: 'none', message: '' })
      }, 3000)
      
    } catch (error) {
      console.error('Error saving API keys:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update API keys'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClearTallyKey = async () => {
    try {
      setSaving(true)
      setStatus({ type: 'none', message: '' })
      
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tallyApiKey: null })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear Tally API key')
      }
      
      // Update local state with response
      const updatedData = await response.json()
      setApiKeys(updatedData)
      
      setStatus({
        type: 'success',
        message: 'Tally API key removed successfully'
      })
      
      setTimeout(() => {
        setStatus({ type: 'none', message: '' })
      }, 3000)
      
    } catch (error) {
      console.error('Error clearing Tally API key:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to clear Tally API key'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleClearOpenAIKey = async () => {
    try {
      setSaving(true)
      setStatus({ type: 'none', message: '' })
      
      const response = await fetch('/api/settings/api-keys', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ openaiApiKey: null })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to clear OpenAI API key')
      }
      
      // Update local state with response
      const updatedData = await response.json()
      setApiKeys(updatedData)
      
      setStatus({
        type: 'success',
        message: 'OpenAI API key removed successfully'
      })
      
      setTimeout(() => {
        setStatus({ type: 'none', message: '' })
      }, 3000)
      
    } catch (error) {
      console.error('Error clearing OpenAI API key:', error)
      setStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to clear OpenAI API key'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">
                  API-Schlüssel Einstellungen
                </h1>
                <p className="text-slate-600">
                  Verwalten Sie Ihre API-Schlüssel für externe Dienste
                </p>
              </div>
              {(isEditingTally || isEditingOpenAI) && (
                <Button 
                  onClick={handleSaveKeys}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Speichern...' : 'Speichern'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Status Message */}
          {status.type !== 'none' && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              status.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 
              status.type === 'info' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {status.type === 'success' ? 
                <CheckCircle2 className="w-5 h-5 text-green-600" /> : 
                status.type === 'info' ?
                <Info className="w-5 h-5 text-blue-600" /> :
                <AlertCircle className="w-5 h-5 text-red-600" />
              }
              <p>{status.message}</p>
            </div>
          )}

          {/* Tally API Key Card */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Tally API-Schlüssel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Der Tally API-Schlüssel wird benötigt, um auf Ihre Tally.so Formulare zuzugreifen und Daten abzurufen.
                </p>

                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-slate-600">Lade...</span>
                  </div>
                ) : apiKeys.tally.present && !isEditingTally ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded text-slate-700 font-mono">
                        •••• •••• •••• {apiKeys.tally.last4}
                      </div>
                      <div className="text-xs text-slate-500">
                        Gespeicherter Schlüssel (maskiert)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditingTally(true)}
                      >
                        Ersetzen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearTallyKey}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="tally-api-key">API-Schlüssel</Label>
                      <div className="relative mt-1">
                        <Input
                          id="tally-api-key"
                          type={showTallyKey ? "text" : "password"}
                          value={newTallyKey}
                          onChange={(e) => setNewTallyKey(e.target.value)}
                          placeholder="sk_xxxxxxxxxxxxxxxxxxxxxxxx"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTallyKey(!showTallyKey)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showTallyKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Sie finden Ihren API-Schlüssel in Ihren Tally.so Konto-Einstellungen.
                      </p>
                    </div>
                    
                    {apiKeys.tally.present && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsEditingTally(false)
                          setNewTallyKey('')
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Abbrechen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* OpenAI API Key Card */}
          <Card className="bg-white/60 backdrop-blur-sm border-slate-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5 text-green-600" />
                OpenAI API-Schlüssel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Der OpenAI API-Schlüssel wird für KI-gestützte Funktionen wie die Erstellung von Umfragen und die Analyse von Antworten verwendet.
                </p>

                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                    <span className="text-slate-600">Lade...</span>
                  </div>
                ) : apiKeys.openai.present && !isEditingOpenAI ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-100 rounded text-slate-700 font-mono">
                        •••• •••• •••• {apiKeys.openai.last4}
                      </div>
                      <div className="text-xs text-slate-500">
                        Gespeicherter Schlüssel (maskiert)
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditingOpenAI(true)}
                      >
                        Ersetzen
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearOpenAIKey}
                        disabled={saving}
                        className="text-red-600 hover:text-red-700"
                      >
                        Löschen
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="openai-api-key">API-Schlüssel</Label>
                      <div className="relative mt-1">
                        <Input
                          id="openai-api-key"
                          type={showOpenAIKey ? "text" : "password"}
                          value={newOpenAIKey}
                          onChange={(e) => setNewOpenAIKey(e.target.value)}
                          placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Sie finden Ihren API-Schlüssel in Ihrem OpenAI Dashboard unter "API Keys".
                      </p>
                    </div>
                    
                    {apiKeys.openai.present && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setIsEditingOpenAI(false)
                          setNewOpenAIKey('')
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Abbrechen
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
