import { Suspense } from 'react'
import { SocialConnections } from '../../components/settings/social-connections'
import { Header } from '../../components/ui/header'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage="settings" />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Réglages
          </h2>
          <p className="text-gray-600">
            Gérez vos connexions aux réseaux sociaux et vos préférences
          </p>
        </div>

        <Suspense fallback={<div>Chargement...</div>}>
          <SocialConnections />
        </Suspense>
      </main>
    </div>
  )
}
