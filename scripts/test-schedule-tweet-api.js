const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testScheduleTweetAPI() {
  console.log('🧪 Test de l\'API schedule-tweet...')

  try {
    // 1. Créer un utilisateur de test
    console.log('📝 Création d\'un utilisateur de test...')
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: 'test-user-' + Date.now(),
        email: 'test@example.com',
        name: 'Test User',
        subscription_tier: 'free',
        subscription_status: 'active'
      })
      .select()
      .single()

    if (userError) {
      console.error('❌ Erreur création utilisateur:', userError)
      return
    }

    console.log('✅ Utilisateur créé:', user.id)

    // 2. Créer un épisode de test
    console.log('📝 Création d\'un épisode de test...')
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .insert({
        user_id: user.id,
        title: 'Test Episode',
        description: 'Episode de test pour l\'API',
        audio_file_url: 'https://example.com/test.mp3',
        status: 'published'
      })
      .select()
      .single()

    if (episodeError) {
      console.error('❌ Erreur création épisode:', episodeError)
      return
    }

    console.log('✅ Épisode créé:', episode.id)

    // 3. Tester l'API avec episodeId
    console.log('📝 Test de l\'API avec episodeId...')
    const testData = {
      content: 'Test tweet avec episodeId #test #podcast',
      scheduledDate: '2024-12-31',
      scheduledTime: '12:00',
      episodeId: episode.id,
      hashtags: ['test', 'podcast', 'api']
    }

    const response1 = await fetch('http://localhost:3000/api/schedule-tweet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    })

    if (response1.ok) {
      const result1 = await response1.json()
      console.log('✅ API avec episodeId fonctionne:', result1)
    } else {
      const error1 = await response1.json()
      console.error('❌ API avec episodeId échoue:', error1)
    }

    // 4. Tester l'API avec userId seulement
    console.log('📝 Test de l\'API avec userId seulement...')
    const testData2 = {
      content: 'Test tweet sans episodeId #test #general',
      scheduledDate: '2024-12-31',
      scheduledTime: '13:00',
      userId: user.id,
      hashtags: ['test', 'general']
    }

    const response2 = await fetch('http://localhost:3000/api/schedule-tweet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData2)
    })

    if (response2.ok) {
      const result2 = await response2.json()
      console.log('✅ API avec userId seulement fonctionne:', result2)
    } else {
      const error2 = await response2.json()
      console.error('❌ API avec userId seulement échoue:', error2)
    }

    // 5. Vérifier les tweets créés
    console.log('📝 Vérification des tweets créés...')
    const { data: tweets, error: tweetsError } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('user_id', user.id)

    if (tweetsError) {
      console.error('❌ Erreur récupération tweets:', tweetsError)
    } else {
      console.log('✅ Tweets trouvés:', tweets.length)
      tweets.forEach(tweet => {
        console.log(`  - ${tweet.content} (${tweet.scheduled_date} ${tweet.scheduled_time})`)
      })
    }

    // 6. Nettoyage
    console.log('🧹 Nettoyage des données de test...')
    await supabase.from('scheduled_tweets').delete().eq('user_id', user.id)
    await supabase.from('episodes').delete().eq('id', episode.id)
    await supabase.from('users').delete().eq('id', user.id)
    console.log('✅ Nettoyage terminé')

  } catch (error) {
    console.error('❌ Erreur générale:', error)
  }
}

// Lancer le test
testScheduleTweetAPI()
