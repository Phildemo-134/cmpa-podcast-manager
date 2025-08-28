import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcriptionId, speakerMappings } = body

    if (process.env.NODE_ENV === 'development') {
    if (process.env.NODE_ENV === 'development') {
        console.log('🔍 API update-speakers appelée avec:', { transcriptionId, speakerMappings });
      }
  }

    if (!transcriptionId || !speakerMappings) {
      return NextResponse.json(
        { error: 'ID de transcription et mappings des speakers requis' },
        { status: 400 }
      )
    }

    // Vérifier que la transcription existe
    const { data: transcription, error: fetchError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single()

    if (fetchError || !transcription) {
      console.log('❌ Transcription non trouvée:', fetchError)
      return NextResponse.json(
        { error: 'Transcription non trouvée' },
        { status: 404 }
      )
    }

    console.log('🔍 Transcription trouvée:', transcription.id)
    console.log('🔍 Timestamps avant mise à jour:', transcription.timestamps)

    // Mettre à jour les timestamps avec les nouveaux noms des speakers
    const updatedTimestamps = transcription.timestamps?.map((timestamp: any) => {
      console.log('🔍 Traitement du timestamp:', timestamp)
      if (timestamp.speaker && speakerMappings[timestamp.speaker]) {
        const newSpeaker = speakerMappings[timestamp.speaker]
        console.log(`🔍 Mise à jour: ${timestamp.speaker} → ${newSpeaker}`)
        return {
          ...timestamp,
          speaker: newSpeaker
        }
      }
      console.log('🔍 Timestamp non modifié:', timestamp.speaker)
      return timestamp
    })

    console.log('🔍 Timestamps après mise à jour:', updatedTimestamps)

    // Vérifier que les timestamps ont bien été mis à jour
    const hasChanges = updatedTimestamps?.some((timestamp: any, index: number) => {
      const original = transcription.timestamps?.[index]
      return original && original.speaker !== timestamp.speaker
    })

    if (!hasChanges) {
      console.log('⚠️ Aucun changement détecté dans les timestamps')
    } else {
      console.log('✅ Changements détectés dans les timestamps')
    }

    // Mettre à jour la transcription - laisser le trigger gérer updated_at
    const { data: updatedTranscriptionData, error: updateError } = await supabase
      .from('transcriptions')
      .update({
        timestamps: updatedTimestamps
      })
      .eq('id', transcriptionId)
      .select('*')
      .single()

    if (updateError) {
      console.log('❌ Erreur lors de la mise à jour:', updateError)
      throw updateError
    }

    if (!updatedTranscriptionData) {
      throw new Error('Aucune donnée retournée après la mise à jour')
    }

    console.log('✅ Transcription mise à jour avec succès en base de données')
    console.log('🔍 Transcription mise à jour:', updatedTranscriptionData)

    const result = {
      success: true,
      message: 'Noms des speakers mis à jour',
      transcription: updatedTranscriptionData
    }

    console.log('🔍 Résultat retourné:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour des speakers:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour des speakers',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
