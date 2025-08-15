import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function testSpeakerEditing() {
  try {
    console.log('🧪 Test de l\'édition des speakers...')
    
    // Récupérer une transcription existante pour le test
    const { data: transcriptions, error: fetchError } = await supabase
      .from('transcriptions')
      .select('*')
      .limit(1)
    
    if (fetchError || !transcriptions || transcriptions.length === 0) {
      console.log('⚠️  Aucune transcription trouvée pour le test')
      console.log('   Créez d\'abord une transcription avec des speakers')
      return
    }
    
    const transcription = transcriptions[0]
    console.log('📝 Transcription trouvée:', transcription.id)
    
    // Vérifier si la transcription a des speakers
    if (!transcription.timestamps || !Array.isArray(transcription.timestamps)) {
      console.log('⚠️  Cette transcription n\'a pas de timestamps avec speakers')
      return
    }
    
    const speakers: string[] = Array.from(
      new Set(
        transcription.timestamps
          .filter((t: any) => t.speaker)
          .map((t: any) => t.speaker as string)
      )
    )
    
    if (speakers.length === 0) {
      console.log('⚠️  Aucun speaker détecté dans cette transcription')
      return
    }
    
    console.log('🔊 Speakers détectés:', speakers)
    
    // Créer des mappings de test
    const speakerMappings: Record<string, string> = {}
    speakers.forEach((speaker: string, index) => {
      speakerMappings[speaker] = `Test Speaker ${index + 1}`
    })
    
    console.log('📝 Mappings de test:', speakerMappings)
    
    // Tester l'API de mise à jour
    const response = await fetch('/api/transcribe/update-speakers', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcriptionId: transcription.id,
        speakerMappings
      }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Erreur lors de la mise à jour')
    }
    
    const result = await response.json()
    console.log('✅ Mise à jour réussie !')
    console.log('📊 Résultat:', result.message)
    
    // Vérifier que les timestamps ont été mis à jour
    const updatedTranscription = result.transcription
    const updatedSpeakers = Array.from(
      new Set(
        updatedTranscription.timestamps
          .filter((t: any) => t.speaker)
          .map((t: any) => t.speaker)
      )
    )
    
    console.log('🔄 Speakers après mise à jour:', updatedSpeakers)
    
    // Restaurer les noms originaux
    const restoreMappings: Record<string, string> = {}
    speakers.forEach(speaker => {
      restoreMappings[speaker] = speaker
    })
    
    console.log('🔄 Restauration des noms originaux...')
    
    const restoreResponse = await fetch('/api/transcribe/update-speakers', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcriptionId: transcription.id,
        speakerMappings: restoreMappings
      }),
    })
    
    if (restoreResponse.ok) {
      console.log('✅ Noms originaux restaurés')
    } else {
      console.log('⚠️  Impossible de restaurer les noms originaux')
    }
    
    console.log('🎉 Test terminé avec succès !')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  }
}

// Exécuter le test si le fichier est appelé directement
if (require.main === module) {
  testSpeakerEditing()
}

export { testSpeakerEditing }
