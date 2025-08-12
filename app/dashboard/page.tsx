import { EpisodeList } from '../../components/episodes/episode-list'
import { SignOutButton } from '../../components/auth/sign-out-button'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                CMPA Podcast Manager
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EpisodeList />
      </main>
    </div>
  )
}
