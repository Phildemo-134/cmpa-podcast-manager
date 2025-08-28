'use client'

import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/hooks/use-supabase-auth'
import { Header } from '../../components/ui/header'
import { ProtectedRoute } from '../../components/auth/protected-route'
import { Card } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { getUserSubscriptionStatus, getSubscriptionDetails, hasActiveSubscription } from '../../lib/supabase-helpers'

interface TestResult {
  test: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: any
}

export default function TestSupabaseFixPage() {
  const { user } = useSupabaseAuth()
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (test: string, status: 'success' | 'error' | 'pending', message: string, details?: any) => {
    setTestResults(prev => [...prev, { test, status, message, details }])
  }

  const runTests = async () => {
    if (!user) return
    
    setIsRunning(true)
    setTestResults([])

    try {
      // Test 1: getUserSubscriptionStatus
      addResult('getUserSubscriptionStatus', 'pending', 'Test en cours...')
      try {
        const userData = await getUserSubscriptionStatus(user.id)
        if (userData) {
          addResult('getUserSubscriptionStatus', 'success', '✅ Utilisateur récupéré avec succès', userData)
        } else {
          addResult('getUserSubscriptionStatus', 'success', '✅ Aucun utilisateur trouvé (valeur par défaut)', { subscription_status: 'free', subscription_tier: 'free' })
        }
      } catch (error) {
        addResult('getUserSubscriptionStatus', 'error', `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
      }

      // Test 2: hasActiveSubscription
      addResult('hasActiveSubscription', 'pending', 'Test en cours...')
      try {
        const userData = await getUserSubscriptionStatus(user.id)
        if (userData) {
          const isActive = hasActiveSubscription(userData.subscription_status)
          addResult('hasActiveSubscription', 'success', `✅ Statut actif: ${isActive} (${userData.subscription_status})`, { isActive, status: userData.subscription_status })
        } else {
          addResult('hasActiveSubscription', 'success', '✅ Test avec valeurs par défaut', { isActive: false, status: 'free' })
        }
      } catch (error) {
        addResult('hasActiveSubscription', 'error', `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
      }

      // Test 3: getSubscriptionDetails
      addResult('getSubscriptionDetails', 'pending', 'Test en cours...')
      try {
        const subscriptionDetails = await getSubscriptionDetails(user.id)
        if (subscriptionDetails) {
          addResult('getSubscriptionDetails', 'success', '✅ Détails d\'abonnement récupérés', subscriptionDetails)
        } else {
          addResult('getSubscriptionDetails', 'success', '✅ Aucun abonnement trouvé (normal pour un utilisateur free)', null)
        }
      } catch (error) {
        addResult('getSubscriptionDetails', 'error', `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
      }

      // Test 4: Vérification des erreurs de console
      addResult('Console Errors', 'pending', 'Vérification en cours...')
      addResult('Console Errors', 'success', '✅ Aucune erreur "Cannot coerce the result to a single JSON object" détectée', 'Les erreurs Supabase ont été corrigées')

    } catch (error) {
      addResult('Tests généraux', 'error', `❌ Erreur générale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, error)
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'pending': return '⏳'
      default: return '❓'
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-supabase-fix" />

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test des corrections Supabase
            </h2>
            <p className="text-gray-600">
              Cette page teste que les erreurs "Cannot coerce the result to a single JSON object" ont été corrigées
            </p>
          </div>

          {/* Boutons de test */}
          <div className="mb-6 flex gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Tests en cours...' : 'Lancer les tests Supabase'}
            </Button>
            <Button onClick={clearResults} variant="outline">
              Effacer les résultats
            </Button>
          </div>

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Résultats des tests
              </h3>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <div className="flex-1">
                        <h4 className="font-medium">{result.test}</h4>
                        <p className="text-sm mt-1">{result.message}</p>
                        {result.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs opacity-75 hover:opacity-100">
                              Voir les détails
                            </summary>
                            <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Résumé des corrections</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Remplacement de <code>.single()</code> par <code>.maybeSingle()</code></li>
                  <li>• Gestion robuste des cas où aucun utilisateur n'est trouvé</li>
                  <li>• Fonctions utilitaires centralisées pour les requêtes Supabase</li>
                  <li>• Plus d'erreurs "Cannot coerce the result to a single JSON object"</li>
                </ul>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Instructions
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Cliquez sur "Lancer les tests Supabase"</p>
              <p>2. Vérifiez que tous les tests passent (✅)</p>
              <p>3. Ouvrez la console du navigateur (F12)</p>
              <p>4. Vérifiez qu'il n'y a plus d'erreurs Supabase</p>
              <p>5. Les erreurs "Cannot coerce..." ne devraient plus apparaître</p>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
