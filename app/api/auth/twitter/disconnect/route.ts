import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  try {
    // Récupérer l'utilisateur connecté depuis Supabase
    const cookieStore = await cookies()
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Erreur d\'authentification:', authError)
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    // Supprimer la connexion Twitter de la base de données
    const { error: deleteError } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'twitter')

    if (deleteError) {
      console.error('Erreur lors de la suppression de la connexion Twitter:', deleteError)
      return NextResponse.json(
        { error: 'Erreur lors de la déconnexion' },
        { status: 500 }
      )
    }

    if (process.env.NODE_ENV === 'development') {
      if (process.env.NODE_ENV === 'development') {
        console.log('Déconnexion Twitter réussie pour l\'utilisateur:', user.id);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Compte Twitter déconnecté avec succès' 
    })

  } catch (error) {
    console.error('Erreur lors de la déconnexion Twitter:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
