import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSignedAudioUrl } from '@/lib/s3'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token d\'authentification invalide' },
        { status: 401 }
      )
    }

    // Récupérer la clé S3 depuis les paramètres de requête
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (!key) {
      return NextResponse.json(
        { error: 'Clé S3 manquante' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur a accès à ce fichier
    const { data: episode, error: episodeError } = await supabase
      .from('episodes')
      .select('id, user_id, s3_key')
      .eq('s3_key', key)
      .single()

    if (episodeError || !episode) {
      return NextResponse.json(
        { error: 'Épisode non trouvé' },
        { status: 404 }
      )
    }

    if (episode.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce fichier' },
        { status: 403 }
      )
    }

    // Générer l'URL signée (valide 1 heure)
    const signedUrl = await getSignedAudioUrl(key, 3600)

    return NextResponse.json({
      url: signedUrl,
      expiresIn: 3600,
    })

  } catch (error) {
    console.error('Erreur génération URL signée:', error)
    return NextResponse.json(
      { 
        error: `Erreur serveur: ${error instanceof Error ? error.message : 'Erreur inconnue'}` 
      },
      { status: 500 }
    )
  }
}
