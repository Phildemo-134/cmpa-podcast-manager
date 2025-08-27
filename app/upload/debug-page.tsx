'use client'

import { useState } from 'react'
import { Button } from '../../components/ui/button'

export default function UploadDebugPage() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🐛 Page de Débogage Upload
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Test de Rendu Simple
          </h2>
          
          <p className="text-gray-600 mb-4">
            Cette page teste uniquement le rendu de base sans hooks complexes.
          </p>
          
          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-700">Compteur de clics:</span>
            <span className="text-2xl font-bold text-blue-600">{count}</span>
          </div>
          
          <Button 
            onClick={() => setCount(prev => prev + 1)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Incrémenter
          </Button>
        </div>
        
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            ✅ Test Réussi
          </h3>
          <p className="text-green-800">
            Si vous voyez cette page et que le compteur fonctionne, 
            la structure de base est correcte. Le problème était dans les hooks d'authentification.
          </p>
        </div>
        
        <div className="mt-6 text-center">
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/upload'}
            className="mr-4"
          >
            Tester la Page Upload Réelle
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
          >
            Aller au Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
