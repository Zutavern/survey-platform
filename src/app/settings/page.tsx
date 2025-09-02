import { redirect } from 'next/navigation'
import Link from 'next/link'

export default function SettingsPage() {
  // Redirect to API keys settings page
  redirect('/settings/api-keys')
  
  // This will only render if redirect fails
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Einstellungen</h1>
      <p className="mb-4">Weiterleitung fehlgeschlagen.</p>
      <Link 
        href="/settings/api-keys"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Zu API-Schlüssel
      </Link>
    </div>
  )
}
