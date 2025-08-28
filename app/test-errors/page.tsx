'use client'

import { useState } from 'react'
import { Header } from '../../components/ui/header'
import { ProtectedRoute } from '../../components/auth/protected-route'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { logError, formatErrorMessage, handleSupabaseError } from '../../lib/error-handler'

export default function TestErrorsPage() {
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testErrorHandling = () => {
    setTestResults([])
    
    // Test 1: Error standard
    try {
      throw new Error('Ceci est une erreur de test standard')
    } catch (error) {
      const message = formatErrorMessage(error, 'Message par défaut')
      addResult(`✅ Error standard: ${message}`)
      logError('Test Error Standard', error)
    }

    // Test 2: Objet avec propriété message
    try {
      const customError = { message: 'Erreur personnalisée avec propriété message' }
      const message = formatErrorMessage(customError, 'Message par défaut')
      addResult(`✅ Objet avec message: ${message}`)
      logError('Test Objet avec message', customError)
    } catch (error) {
      addResult(`❌ Erreur lors du test objet avec message: ${error}`)
    }

    // Test 3: String
    try {
      const stringError = 'Erreur sous forme de string'
      const message = formatErrorMessage(stringError, 'Message par défaut')
      addResult(`✅ String: ${message}`)
      logError('Test String', stringError)
    } catch (error) {
      addResult(`❌ Erreur lors du test string: ${error}`)
    }

    // Test 4: Objet vide
    try {
      const emptyError = {}
      const message = formatErrorMessage(emptyError, 'Message par défaut')
      addResult(`✅ Objet vide: ${message}`)
      logError('Test Objet vide', emptyError)
    } catch (error) {
      addResult(`❌ Erreur lors du test objet vide: ${error}`)
    }

    // Test 5: Null
    try {
      const nullError = null
      const message = formatErrorMessage(nullError, 'Message par défaut')
      addResult(`✅ Null: ${message}`)
      logError('Test Null', nullError)
    } catch (error) {
      addResult(`❌ Erreur lors du test null: ${error}`)
    }

    // Test 6: Undefined
    try {
      const undefinedError = undefined
      const message = formatErrorMessage(undefinedError, 'Message par défaut')
      addResult(`✅ Undefined: ${message}`)
      logError('Test Undefined', undefinedError)
    } catch (error) {
      addResult(`❌ Erreur lors du test undefined: ${error}`)
    }

    // Test 7: Supabase error
    try {
      const supabaseError = { message: 'Erreur Supabase simulée', code: 'PGRST116' }
      const message = handleSupabaseError(supabaseError, 'la récupération des données')
      addResult(`✅ Supabase error: ${message}`)
    } catch (error) {
      addResult(`❌ Erreur lors du test Supabase: ${error}`)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header currentPage="test-errors" />

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Test de la gestion des erreurs
            </h2>
            <p className="text-gray-600">
              Cette page teste les utilitaires de gestion d'erreurs pour s'assurer qu'ils fonctionnent correctement
            </p>
          </div>

          {/* Boutons de test */}
          <div className="mb-6 flex gap-4">
            <Button onClick={testErrorHandling} className="bg-blue-600 hover:bg-blue-700">
              Lancer les tests d'erreurs
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
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div key={index} className="text-sm font-mono bg-gray-50 p-2 rounded">
                    {result}
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 Vérifiez la console du navigateur pour voir les logs d'erreurs formatés correctement.
                  Les objets vides {} ne devraient plus apparaître !
                </p>
              </div>
            </Card>
          )}

          {/* Instructions */}
          <Card className="p-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Instructions
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Cliquez sur "Lancer les tests d'erreurs"</p>
              <p>2. Vérifiez que tous les tests passent (✅)</p>
              <p>3. Ouvrez la console du navigateur (F12)</p>
              <p>4. Vérifiez que les erreurs sont bien formatées</p>
              <p>5. Les objets vides {} ne devraient plus apparaître</p>
            </div>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}
