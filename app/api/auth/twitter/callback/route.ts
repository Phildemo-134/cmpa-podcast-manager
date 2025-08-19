import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuration Twitter OAuth2
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID
const TWITTER_CLIENT_SECRET = process.env.TWITTER_CLIENT_SECRET
const TWITTER_REDIRECT_URI = process.env.NEXT_PUBLIC_TWITTER_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/twitter/callback`

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Vérifier les paramètres de retour
    if (error) {
      console.error('Erreur Twitter OAuth2:', error)
      return NextResponse.redirect(new URL('/settings?error=twitter_auth_failed', request.url))
    }

    if (!code || !state) {
      console.error('Paramètres manquants dans le callback Twitter')
      return NextResponse.redirect(new URL('/settings?error=invalid_callback', request.url))
    }

    // Vérifier que les variables d'environnement sont configurées
    if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
      console.error('Configuration Twitter manquante')
      return NextResponse.redirect(new URL('/settings?error=config_missing', request.url))
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Valider le state et récupérer le code verifier
    const { data: stateData, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('platform', 'twitter')
      .single()

    if (stateError || !stateData) {
      console.error('State invalide ou expiré:', stateError)
      return NextResponse.redirect(new URL('/settings?error=invalid_state', request.url))
    }

    // Vérifier que le state n'a pas expiré
    if (new Date(stateData.expires_at) < new Date()) {
      console.error('State expiré')
      return NextResponse.redirect(new URL('/settings?error=expired_state', request.url))
    }

    // Échanger le code contre un token d'accès
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: TWITTER_REDIRECT_URI,
        code_verifier: stateData.code_verifier || ''
      })
    })
    console.log('tokenResponse', tokenResponse)
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Erreur lors de l\'échange du token:', errorText)
      return NextResponse.redirect(new URL('/settings?error=token_exchange_failed', request.url))
    }
  
    const tokenData = await tokenResponse.json()

    // Récupérer les informations de l'utilisateur Twitter
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    })

    if (!userResponse.ok) {
      console.error('Erreur lors de la récupération des infos utilisateur Twitter')
      return NextResponse.redirect(new URL('/settings?error=user_info_failed', request.url))
    }

    const userData = await userResponse.json()

    // Sauvegarder la connexion dans la base de données
    const { error: saveError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: stateData.user_id,
        platform: 'twitter',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        token_expires_at: tokenData.expires_in ? 
          new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        platform_user_id: userData.data.id,
        platform_username: userData.data.username,
        is_active: true,
        permissions: ['tweet.read', 'tweet.write', 'users.read'],
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,platform'
      })

    if (saveError) {
      console.error('Erreur lors de la sauvegarde de la connexion:', saveError)
      return NextResponse.redirect(new URL('/settings?error=save_failed', request.url))
    }

    // Nettoyer le state utilisé
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state)

    console.log('Connexion Twitter réussie pour l\'utilisateur:', stateData.user_id)

    // Rediriger vers la page de réglages avec un message de succès
    return NextResponse.redirect(new URL('/settings?success=twitter_connected', request.url))

  } catch (error) {
    console.error('Erreur lors du callback Twitter:', error)
    return NextResponse.redirect(new URL('/settings?error=callback_failed', request.url))
  }
}
