import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, BarChart3, Calendar, Users, FileText } from "lucide-react"
import Link from "next/link"

export default function SurveysPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Zurück zur Übersicht
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-blue-900">Meine Umfragen</h1>
            <Link href="/surveys/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Neue Umfrage
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-blue-900 mb-2">{survey.title}</CardTitle>
                    <CardDescription className="mb-3">{survey.description}</CardDescription>
                  </div>
                  <Badge 
                    variant={survey.status === 'active' ? 'default' : 'secondary'}
                    className={survey.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}
                  >
                    {survey.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-blue-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{survey.responses} Antworten</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{survey.createdAt}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link href={`/surveys/${survey.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Eye className="mr-1 h-3 w-3" />
                        Anzeigen
                      </Button>
                    </Link>
                    <Link href={`/surveys/${survey.id}/edit`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="mr-1 h-3 w-3" />
                        Bearbeiten
                      </Button>
                    </Link>
                    <Link href={`/surveys/${survey.id}/results`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="mr-1 h-3 w-3" />
                        Ergebnisse
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {surveys.length === 0 && (
          <Card className="bg-white/90 backdrop-blur-sm text-center py-12">
            <CardContent>
              <div className="text-blue-600 mb-4">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Noch keine Umfragen</h3>
                <p className="text-blue-500">Erstelle deine erste Umfrage, um loszulegen</p>
              </div>
              <Link href="/surveys/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Erste Umfrage erstellen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

const surveys = [
  {
    id: 1,
    title: "Kundenzufriedenheit 2024",
    description: "Umfrage zur Bewertung unserer Dienstleistungen und Produkte",
    status: "active" as const,
    responses: 234,
    createdAt: "15. März 2024"
  },
  {
    id: 2,
    title: "Produktfeedback",
    description: "Feedback zu unseren neuen Produktfeatures und Verbesserungsvorschläge",
    status: "active" as const,
    responses: 156,
    createdAt: "10. März 2024"
  },
  {
    id: 3,
    title: "Team-Morale",
    description: "Interne Umfrage zur Arbeitszufriedenheit und Arbeitsumgebung",
    status: "inactive" as const,
    responses: 89,
    createdAt: "1. März 2024"
  },
  {
    id: 4,
    title: "Website-Usability",
    description: "Bewertung der Benutzerfreundlichkeit unserer Website",
    status: "active" as const,
    responses: 67,
    createdAt: "25. Februar 2024"
  },
  {
    id: 5,
    title: "Preisgestaltung",
    description: "Umfrage zur Akzeptanz unserer Preismodelle",
    status: "inactive" as const,
    responses: 123,
    createdAt: "20. Februar 2024"
  },
  {
    id: 6,
    title: "Support-Qualität",
    description: "Bewertung unseres Kundensupports und Servicequalität",
    status: "active" as const,
    responses: 45,
    createdAt: "15. Februar 2024"
  }
]
