import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '../../../types/database'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { content, scheduledDate, scheduledTime, userId } = await request.json()

    if (!content || !scheduledDate || !scheduledTime || !userId) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // Vérifier que la date et l'heure sont dans le futur
    const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`)
    const now = new Date()
    
    if (scheduledDateTime <= now) {
      return NextResponse.json(
        { error: 'La date et l\'heure doivent être dans le futur' },
        { status: 400 }
      )
    }

    // Insérer le tweet planifié dans la base de données
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .insert({
        content,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        user_id: userId,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde du tweet' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      tweet: data 
    })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'ID utilisateur requis' },
        { status: 400 }
      )
    }

    // Récupérer tous les tweets planifiés de l'utilisateur
    const { data, error } = await supabase
      .from('scheduled_tweets')
      .select('*')
      .eq('user_id', userId)
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('Erreur Supabase:', error)
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des tweets' },
        { status: 500 }
      )
    }

    return NextResponse.json({ tweets: data })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
