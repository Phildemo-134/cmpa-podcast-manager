import { SignOutButton } from '../auth/sign-out-button'

interface HeaderProps {
  currentPage: 'dashboard' | 'upload' | 'settings' | 'episode' | 'schedule-tweet'
}

export function Header({ currentPage }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-gray-900">
              Podcast Manager
            </h1>
            <nav className="flex space-x-4">
              <a
                href="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Dashboard
              </a>
              <a
                href="/schedule-tweet"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'schedule-tweet'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Publications
              </a>
              <a
                href="/settings"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentPage === 'settings'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
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
  )
}
