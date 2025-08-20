const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTweetGeneration() {
  try {
    console.log('🧪 Test de génération de tweets...')
    
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
    console.log(`📝 Longueur du transcript: ${transcription.transcript?.length || 0} caractères`)
    
    // Tester l'API de génération de tweets
    console.log('\n🚀 Test de l\'API de génération de tweets...')
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ episodeId: episode.id }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erreur API: ${response.status} - ${errorData.error || 'Erreur inconnue'}`)
    }
    
    const { tweets } = await response.json()
    
    console.log(`✅ ${tweets.length} tweets générés avec succès!`)
    
    // Afficher les premiers tweets
    tweets.slice(0, 3).forEach((tweet, index) => {
      console.log(`\n📱 Tweet ${index + 1}:`)
      console.log(`   Contenu: ${tweet.content}`)
      console.log(`   Hashtags: ${tweet.hashtags.join(', ')}`)
      console.log(`   Caractères: ${tweet.content.length}/200`)
    })
    
    if (tweets.length > 3) {
      console.log(`\n... et ${tweets.length - 3} autres tweets`)
    }
    
    // Vérifier la limite de caractères
    const invalidTweets = tweets.filter(tweet => tweet.content.length > 200)
    if (invalidTweets.length > 0) {
      console.log(`\n⚠️  ${invalidTweets.length} tweet(s) dépassent la limite de 200 caractères`)
    } else {
      console.log('\n✅ Tous les tweets respectent la limite de 200 caractères')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Exécuter le test
testTweetGeneration()
