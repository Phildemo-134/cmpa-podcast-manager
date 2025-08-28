'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '../../hooks/use-supabase-auth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useSupabaseAuth()

  // ✅ Rediriger si l'utilisateur est déjà connecté (dans useEffect)
  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  // ✅ Ne pas faire de redirection dans le rendu
  if (user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Redirection...</span>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        })

        if (error) throw error

        if (data.user) {
          // Create user profile in users table
          const { error: profileError } = await supabase
            .from('users')
            .insert([
              {
                id: data.user.id,
                email: data.user.email!,
                name,
                subscription_tier: 'free',
                subscription_status: 'active',
              },
            ])

          if (profileError) {
            console.error('Profile creation error:', profileError)
          }

          // Send confirmation email
          await supabase.auth.resend({
            type: 'signup',
            email,
          })

          alert('Vérifiez votre email pour confirmer votre compte!')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        // ✅ La redirection sera gérée automatiquement par le hook useSupabaseAuth
        // Pas besoin de router.push ici
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isSignUp ? 'Créer un compte' : 'Se connecter'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Créez votre compte pour commencer à gérer vos podcasts'
            : 'Connectez-vous à votre compte existant'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Votre nom"
                required={isSignUp}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : isSignUp ? 'Créer un compte' : 'Se connecter'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {isSignUp
              ? 'Déjà un compte ? Se connecter'
              : 'Pas de compte ? Créer un compte'}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
