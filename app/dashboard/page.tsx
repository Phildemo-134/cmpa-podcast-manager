import { EpisodeList } from '../../components/episodes/episode-list'
import { Header } from '../../components/ui/header'
import { ProtectedRoute } from '../../components/auth/protected-route'

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="dashboard" />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <EpisodeList />
        </main>
      </div>
    </ProtectedRoute>
  )
}
