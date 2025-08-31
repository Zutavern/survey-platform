"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Trash2, GripVertical } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  text: string
  type: "TEXT" | "MULTIPLE_CHOICE" | "CHECKBOX" | "RATING"
  required: boolean
  options: string[]
}

export default function CreateSurveyPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([])

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "TEXT",
      required: false,
      options: []
    }
    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: [...q.options, ""] }
        : q
    ))
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { 
            ...q, 
            options: q.options.map((opt, idx) => 
              idx === optionIndex ? value : opt
            )
          }
        : q
    ))
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => 
      q.id === questionId 
        ? { ...q, options: q.options.filter((_, idx) => idx !== optionIndex) }
        : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Hier würde die API-Integration erfolgen
    console.log({ title, description, questions })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-3xl font-bold text-blue-900">Neue Umfrage erstellen</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Survey Details */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Umfrage-Details</CardTitle>
              <CardDescription>
                Gib deiner Umfrage einen Titel und eine Beschreibung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-blue-700">Titel *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="z.B. Kundenzufriedenheit 2024"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-blue-700">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Beschreibe den Zweck deiner Umfrage..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-900">Fragen</CardTitle>
              <CardDescription>
                Füge Fragen zu deiner Umfrage hinzu
              </CardDescription>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-8 text-blue-600">
                  <p>Noch keine Fragen hinzugefügt</p>
                  <Button 
                    type="button" 
                    onClick={addQuestion}
                    variant="outline" 
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Erste Frage hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                      <div className="flex items-start gap-3 mb-4">
                        <GripVertical className="h-5 w-5 text-blue-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <Label className="text-blue-700 font-medium">
                              Frage {index + 1}
                            </Label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(question.id, 'type', e.target.value)}
                              className="border border-blue-200 rounded px-2 py-1 text-sm"
                            >
                              <option value="TEXT">Text</option>
                              <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                              <option value="CHECKBOX">Checkbox</option>
                              <option value="RATING">Bewertung</option>
                            </select>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id={`required-${question.id}`}
                                checked={question.required}
                                onCheckedChange={(checked) => 
                                  updateQuestion(question.id, 'required', checked)
                                }
                              />
                              <Label htmlFor={`required-${question.id}`} className="text-sm">
                                Pflichtfrage
                              </Label>
                            </div>
                          </div>
                          
                          <Input
                            value={question.text}
                            onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                            placeholder="Frage eingeben..."
                            className="mb-3"
                          />

                          {/* Options for multiple choice and checkbox */}
                          {(question.type === "MULTIPLE_CHOICE" || question.type === "CHECKBOX") && (
                            <div className="space-y-2">
                              <Label className="text-sm text-blue-600">Optionen:</Label>
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2">
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                    placeholder={`Option ${optionIndex + 1}`}
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeOption(question.id, optionIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(question.id)}
                                className="text-blue-600"
                              >
                                <Plus className="mr-1 h-3 w-3" />
                                Option hinzufügen
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button 
                    type="button" 
                    onClick={addQuestion}
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Weitere Frage hinzufügen
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button type="button" variant="outline">
                Abbrechen
              </Button>
            </Link>
            <Button type="submit" disabled={!title || questions.length === 0}>
              Umfrage erstellen
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
