import { AuthForm } from '../../components/auth/auth-form'
import { AuthGuard } from '../../components/auth/auth-guard'

export default function AuthPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">CMPA Podcast Manager</h1>
            <p className="mt-2 text-sm text-gray-600">
              Gérez et traitez vos podcasts avec l'intelligence artificielle
            </p>
          </div>
          
          <AuthForm />
        </div>
      </div>
    </AuthGuard>
  )
}
