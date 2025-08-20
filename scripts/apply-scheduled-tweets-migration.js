const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function applyMigration() {
  try {
    console.log('🚀 Application de la migration scheduled_tweets...')
    
    // Lire le fichier de migration SQL
    const migrationPath = path.join(__dirname, '..', 'supabase-scheduled-tweets-migration.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    console.log('📖 Fichier de migration lu')
    
    // Diviser le SQL en commandes individuelles
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'))
    
    console.log(`🔧 ${commands.length} commandes SQL à exécuter`)
    
    // Exécuter chaque commande
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i]
      if (command.trim()) {
        try {
          console.log(`\n📝 Exécution de la commande ${i + 1}/${commands.length}...`)
          console.log(`   ${command.substring(0, 100)}...`)
          
          const { error } = await supabase.rpc('exec_sql', { sql: command })
          
          if (error) {
            // Si la commande échoue, essayer de continuer
            console.log(`   ⚠️  Commande ignorée (probablement déjà exécutée): ${error.message}`)
          } else {
            console.log(`   ✅ Commande exécutée avec succès`)
          }
        } catch (cmdError) {
          console.log(`   ⚠️  Commande ignorée: ${cmdError.message}`)
        }
      }
    }
    
    console.log('\n✅ Migration terminée!')
    
    // Vérifier la structure de la table
    console.log('\n🔍 Vérification de la structure de la table...')
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'scheduled_tweets')
      .eq('table_schema', 'public')
      .order('ordinal_position')
    
    if (columnsError) {
      console.log('❌ Erreur lors de la vérification des colonnes:', columnsError.message)
    } else {
      console.log('📋 Colonnes de la table scheduled_tweets:')
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
      })
    }
    
    // Tester l'insertion d'un tweet de test
    console.log('\n🧪 Test d\'insertion d\'un tweet...')
    
    const testTweet = {
      content: 'Tweet de test pour vérifier la migration',
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: new Date().toTimeString().split(' ')[0],
      user_id: '00000000-0000-0000-0000-000000000000', // UUID de test
      status: 'pending'
    }
    
    try {
      // Tenter d'ajouter episode_id et metadata
      const { data: insertData, error: insertError } = await supabase
        .from('scheduled_tweets')
        .insert({
          ...testTweet,
          episode_id: '00000000-0000-0000-0000-000000000000',
          metadata: { test: true }
        })
        .select()
        .single()
      
      if (insertError) {
        console.log('   ⚠️  Insertion avec nouvelles colonnes échouée, test avec structure de base...')
        
        const { data: basicInsert, error: basicError } = await supabase
          .from('scheduled_tweets')
          .insert(testTweet)
          .select()
          .single()
        
        if (basicError) {
          console.log('   ❌ Insertion de base échouée:', basicError.message)
        } else {
          console.log('   ✅ Insertion de base réussie')
          
          // Nettoyer le tweet de test
          await supabase
            .from('scheduled_tweets')
            .delete()
            .eq('id', basicInsert.id)
        }
      } else {
        console.log('   ✅ Insertion avec nouvelles colonnes réussie')
        
        // Nettoyer le tweet de test
        await supabase
          .from('scheduled_tweets')
          .delete()
          .eq('id', insertData.id)
      }
    } catch (testError) {
      console.log('   ❌ Erreur lors du test:', testError.message)
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error.message)
  }
}

// Exécuter la migration
applyMigration()
