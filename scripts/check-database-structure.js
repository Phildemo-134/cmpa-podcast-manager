const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDatabaseStructure() {
  try {
    console.log('🔍 Vérification de la structure de la base de données...\n')
    
    // 1. Vérifier la table scheduled_tweets
    console.log('📋 Vérification de la table scheduled_tweets...')
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'scheduled_tweets')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (tableError) {
      console.error('❌ Erreur lors de la récupération des informations de la table:', tableError)
      return
    }
    
    if (!tableInfo || tableInfo.length === 0) {
      console.log('❌ Table scheduled_tweets non trouvée')
      return
    }
    
    console.log('✅ Structure de la table scheduled_tweets:')
    tableInfo.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'} ${col.column_default ? `DEFAULT: ${col.column_default}` : ''}`)
    })
    
    // 2. Vérifier les contraintes
    console.log('\n🔒 Vérification des contraintes...')
    
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'scheduled_tweets')
      .eq('table_schema', 'public')
    
    if (constraintsError) {
      console.error('❌ Erreur lors de la récupération des contraintes:', constraintsError)
    } else {
      console.log('✅ Contraintes trouvées:')
      constraints.forEach(constraint => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_type}`)
      })
    }
    
    // 3. Vérifier les politiques RLS
    console.log('\n🛡️ Vérification des politiques RLS...')
    
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'scheduled_tweets')
      .eq('schemaname', 'public')
    
    if (policiesError) {
      console.error('❌ Erreur lors de la récupération des politiques:', policiesError)
    } else {
      console.log('✅ Politiques RLS trouvées:')
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname}: ${policy.cmd}`)
      })
    }
    
    // 4. Vérifier les types d'énumération
    console.log('\n📝 Vérification des types d\'énumération...')
    
    const { data: enums, error: enumsError } = await supabase
      .from('pg_enum')
      .select('enumlabel')
      .eq('enumtypid', 
        supabase
          .from('pg_type')
          .select('oid')
          .eq('typname', 'scheduled_tweet_status')
          .single()
      )
    
    if (enumsError) {
      console.log('ℹ️ Type d\'énumération scheduled_tweet_status non trouvé ou erreur de récupération')
    } else {
      console.log('✅ Valeurs de l\'énumération scheduled_tweet_status:')
      enums.forEach(enumVal => {
        console.log(`   - ${enumVal.enumlabel}`)
      })
    }
    
    // 5. Tester l'insertion d'un tweet de test
    console.log('\n🧪 Test d\'insertion d\'un tweet...')
    
    // Récupérer un utilisateur et un épisode de test
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé pour le test')
      return
    }
    
    const { data: episodes, error: episodesError } = await supabase
      .from('episodes')
      .select('id')
      .limit(1)
    
    if (episodesError || !episodes || episodes.length === 0) {
      console.log('❌ Aucun épisode trouvé pour le test')
      return
    }
    
    const testData = {
      user_id: users[0].id,
      content: 'Test de tweet',
      scheduled_date: '2024-12-31',
      scheduled_time: '12:00:00',
      status: 'pending',
      episode_id: episodes[0].id,
      metadata: { test: true }
    }
    
    console.log('📝 Données de test:', testData)
    
    const { data: insertResult, error: insertError } = await supabase
      .from('scheduled_tweets')
      .insert(testData)
      .select()
      .single()
    
    if (insertError) {
      console.error('❌ Erreur lors de l\'insertion de test:', insertError)
      console.log('   Code d\'erreur:', insertError.code)
      console.log('   Message:', insertError.message)
      console.log('   Détails:', insertError.details)
    } else {
      console.log('✅ Insertion de test réussie!')
      console.log('   ID généré:', insertResult.id)
      
      // Nettoyer le tweet de test
      const { error: deleteError } = await supabase
        .from('scheduled_tweets')
        .delete()
        .eq('id', insertResult.id)
      
      if (deleteError) {
        console.log('⚠️ Impossible de supprimer le tweet de test:', deleteError.message)
      } else {
        console.log('🧹 Tweet de test supprimé')
      }
    }
    
    // 6. Vérifier les index
    console.log('\n📊 Vérification des index...')
    
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'scheduled_tweets')
      .eq('schemaname', 'public')
    
    if (indexesError) {
      console.error('❌ Erreur lors de la récupération des index:', indexesError)
    } else {
      console.log('✅ Index trouvés:')
      indexes.forEach(index => {
        console.log(`   - ${index.indexname}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

// Exécuter la vérification
checkDatabaseStructure()
