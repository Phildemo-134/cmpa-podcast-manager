const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTweetScheduling() {
  try {
    console.log('🧪 Test de planification de tweets...')
    
    // Récupérer un épisode avec transcription
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id, title, status')
      .limit(1)
    
    if (episodesError) {
      throw episodesError
    }
    
    if (!episodes || episodes.length === 0) {
      console.log('❌ Aucun épisode trouvé')
      return
    }
    
    const episode = episodes[0]
    console.log(`📺 Épisode trouvé: ${episode.title} (ID: ${episode.id})`)
    
    // Vérifier s'il y a une transcription
    const { data: transcription, error: transcriptionError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('episode_id', episode.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (transcriptionError || !transcription) {
      console.log('❌ Aucune transcription trouvée pour cet épisode')
      return
    }
    
    if (transcription.processing_status !== 'completed') {
      console.log(`❌ Transcription non terminée (status: ${transcription.processing_status})`)
      return
    }
    
    console.log('✅ Transcription trouvée et terminée')
    
    // Tester l'API de planification
    console.log('\n🚀 Test de l\'API de planification...')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const scheduledDate = tomorrow.toISOString().split('T')[0]
    const scheduledTime = tomorrow.toTimeString().slice(0, 5)
    
    const testTweet = {
      episodeId: episode.id,
      content: "Test de planification de tweet pour l'épisode",
      scheduledDate: scheduledDate,
      scheduledTime: scheduledTime
    }
    
    console.log('📝 Tweet de test:', testTweet)
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schedule-tweet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testTweet),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API: ${response.status} - ${errorData.error || 'Erreur inconnue'}`)
    }
    
    const { success, tweet, scheduledFor } = await response.json()
    
    console.log('✅ Tweet planifié avec succès!')
    console.log(`   ID: ${tweet.id}`)
    console.log(`   Statut: ${tweet.status}`)
    console.log(`   Planifié pour: ${scheduledFor}`)
    
    // Tester la récupération des tweets planifiés
    console.log('\n📋 Test de récupération des tweets planifiés...')
    
    const getResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schedule-tweet?episodeId=${episode.id}`)
    
    if (!getResponse.ok) {
      const errorData = await getResponse.json()
      throw new Error(`Erreur API GET: ${getResponse.status} - ${errorData.error || 'Erreur inconnue'}`)
    }
    
    const { tweets } = await getResponse.json()
    
    console.log(`✅ ${tweets.length} tweet(s) planifié(s) récupéré(s)`)
    
    if (tweets.length > 0) {
      tweets.forEach((tweet, index) => {
        console.log(`\n📱 Tweet ${index + 1}:`)
        console.log(`   Contenu: ${tweet.content}`)
        console.log(`   Date: ${new Date(tweet.scheduled_at).toLocaleString('fr-FR')}`)
        console.log(`   Heure: ${new Date(tweet.scheduled_at).toLocaleTimeString('fr-FR')}`)
        console.log(`   Statut: ${tweet.status}`)
      })
    }
    
    // Tester l'annulation d'un tweet
    if (tweets.length > 0) {
      console.log('\n❌ Test d\'annulation d\'un tweet...')
      
      const cancelResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schedule-tweet/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tweetId: tweets[0].id }),
      })
      
      if (!cancelResponse.ok) {
        const errorData = await cancelResponse.json()
        throw new Error(`Erreur API d'annulation: ${cancelResponse.status} - ${errorData.error || 'Erreur inconnue'}`)
      }
      
      const { success: cancelSuccess } = await cancelResponse.json()
      
      if (cancelSuccess) {
        console.log('✅ Tweet annulé avec succès!')
      } else {
        console.log('❌ Échec de l\'annulation')
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le test
testTweetScheduling()
