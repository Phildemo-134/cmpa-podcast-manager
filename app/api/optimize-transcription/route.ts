import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { createClient } from '@supabase/supabase-js'

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { transcriptionText, transcriptionId } = await request.json()

    if (!transcriptionText) {
      return NextResponse.json(
        { error: 'Le texte de transcription est requis' },
        { status: 400 }
      )
    }

    if (!transcriptionId) {
      return NextResponse.json(
        { error: 'L\'ID de la transcription est requis' },
        { status: 400 }
      )
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Clé API Gemini non configurée' },
        { status: 500 }
      )
    }

    // Récupérer la transcription avec les timestamps pour avoir les noms des speakers
    const { data: transcription, error: fetchError } = await supabase
      .from('transcriptions')
      .select('*')
      .eq('id', transcriptionId)
      .single()

    if (fetchError || !transcription) {
      console.error('Erreur lors de la récupération de la transcription:', fetchError)
      return NextResponse.json(
        { error: 'Transcription non trouvée' },
        { status: 404 }
      )
    }

    // Extraire les noms des speakers depuis les timestamps
    const speakerNames = Array.from(
      new Set(
        (transcription.timestamps as any[])
          ?.filter((t: any) => t && typeof t === 'object' && t.speaker && typeof t.speaker === 'string')
          .map((t: any) => t.speaker as string)
          .filter(Boolean)
      )
    ).sort()

    console.log('🔍 Speakers détectés:', speakerNames)

    const tools = [
      {
        googleSearch: {}
      },
    ]

    const config = {
      thinkingConfig: {
        thinkingBudget: -1,
      },
      tools,
    }

    const model = 'gemini-2.5-flash'
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: `Tu es un expert en édition de transcription. Ton travail est d'optimiser la transcription pour assurer une lisibilité maximale
tout en gardant l'essentiel du message.

Chose importante: réponds UNIQUEMENT avec la transcription optimisée. N'inclus aucune explication, headers ou phrases du type:
"Ceci est la transcription".

RÈGLE ABSOLUE: Tu DOIS remplacer tous les labels génériques (Speaker 0, Speaker 1, etc.) par les vrais noms des speakers.

Assure-toi que ces points sont respectés:
1. Corrige les erreurs d'attribution de la personne qui parle, en particulier aux zones de changement de locuteur. Fais attention aux phrases incomplètes
qui sont sûrement du locuteur précédent.

2. Combine les paragraphes d'un même locuteur en un unique paragraphe. Utilise le temps de debut de prise de parole comme
temps de début du paragraphe combiné.

3. Optimise la lisibilité tout en gardant le plus possible la transcription originale:
- Enlève les mots de remplissage: "hum", "euh", "en fait", "tu vois"
- Retire les faux départs et les répétitions
- Scinde les phrases trop longues en phrases plus courtes
- Conserve un flux de conversation naturel tout en améliorant la clarté 
- N'utilise pas trop de points d'exclamation ou d'interrogation

4. Maintient une consistance dans le format
- REMPLACE OBLIGATOIREMENT le format "[00:00:00] Speaker X" par "[00:00:00] Nom_du_speaker"
- Utilise UNIQUEMENT les noms des speakers suivants:
${speakerNames.map(name => `- ${name}`).join('\n')}
- Ajoute UN SEUL saut de ligne après le nom du speaker/timestamp et avant le texte 
- Ajoute deux saut de ligne après le texte et avant le prochain nom du speaker/timestamp
- Utilise une ponctuation appropriée et des majuscules quand c'est nécessaire
- Ajoute un saut de paragraphe lors de changements de sujets
- Quand tu ajoute un saut de paragraphe entre deux remarques d'un même locuteur, pas besoin
de respecifier le nom du speaker
- Préserve les tours de parole distincts 

EXEMPLE DE REMPLACEMENT OBLIGATOIRE:
- "Speaker 0" → "${speakerNames[0] || 'Speaker 0'}"
- "Speaker 1" → "${speakerNames[1] || 'Speaker 1'}"
- "Speaker 2" → "${speakerNames[2] || 'Speaker 2'}"

Exemple d'input:
[00:01:08] Speaker 0 : Uhm, euh, ok, je pensais que, tu vois
[00:01:18] Speaker 0 : les températures ont diminuées, hum, par rapport aux, aux derniers jours
[00:01:26] Speaker 1 : on peut tout de même pas dire qu'on en a fini avec cet épisode de canicule

Exemple d'output:
[00:01:08] ${speakerNames[0] || 'Speaker 0'}
les températures ont diminuées par rapport aux derniers jours

[00:01:26] ${speakerNames[1] || 'Speaker 1'}
on peut tout de même pas dire qu'on en a fini avec cet épisode de canicule

Optimise la transcription suivante en remplaçant TOUS les "Speaker X" par les vrais noms:

${transcriptionText}`,
          },
        ],
      },
    ]

    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    })

    let optimizedText = ''
    for await (const chunk of response) {
      if (chunk.text) {
        optimizedText += chunk.text
      }
    }

    // Sauvegarder la transcription optimisée en base de données
    const { error: updateError } = await supabase
      .from('transcriptions')
      .update({ 
        cleaned_text: optimizedText,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptionId)

    if (updateError) {
      console.error('Erreur lors de la sauvegarde en base:', updateError)
      return NextResponse.json(
        { error: 'Erreur lors de la sauvegarde de la transcription optimisée' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      optimizedText,
      transcriptionId 
    })
  } catch (error) {
    console.error('Erreur lors de l\'optimisation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'optimisation de la transcription' },
      { status: 500 }
    )
  }
}
