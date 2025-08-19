import { Suspense } from 'react'
import { SocialConnections } from '../../components/settings/social-connections'
import { SignOutButton } from '../../components/auth/sign-out-button'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-semibold text-gray-900">
                CMPA Podcast Manager
              </h1>
              <nav className="flex space-x-4">
                <a
                  href="/dashboard"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/settings"
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Réglages
                </a>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

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
