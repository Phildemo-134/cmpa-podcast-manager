// Script de test simple pour l'API de planification de tweets
// Utilise fetch pour tester l'API Next.js directement

async function testScheduleTweet() {
  try {
    console.log('🧪 Test de l\'API de planification de tweets...\n')
    
    // Données de test
    const testData = {
      episodeId: 'test-episode-id',
      content: 'Test de tweet pour diagnostic',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Demain
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toTimeString().slice(0, 5) // Demain
    }
    
    console.log('📝 Données de test:', testData)
    
    // Tester l'API
    const response = await fetch('http://localhost:3000/api/schedule-tweet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })
    
    console.log('📡 Statut de la réponse:', response.status)
    console.log('📡 Headers de la réponse:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Erreur de réponse:')
      console.error('   Statut:', response.status)
      console.error('   Contenu:', errorText)
      
      // Essayer de parser le JSON d'erreur
      try {
        const errorData = JSON.parse(errorText)
        console.error('   Erreur parsée:', errorData)
      } catch (parseError) {
        console.error('   Impossible de parser l\'erreur comme JSON')
      }
      
      return
    }
    
    const result = await response.json()
    console.log('✅ Succès!')
    console.log('   Résultat:', result)
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Assurez-vous que le serveur Next.js est démarré (npm run dev)')
    }
  }
}

// Exécuter le test
console.log('🚀 Démarrage du test de planification de tweets...')
testScheduleTweet()
