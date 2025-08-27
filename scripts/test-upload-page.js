#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration de la page upload
 * Vérifie que tous les composants et dépendances sont en place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la page upload...\n');

// Vérifier que la page upload existe
const uploadPagePath = path.join(__dirname, '../app/upload/page.tsx');
if (fs.existsSync(uploadPagePath)) {
  console.log('✅ Page upload trouvée');
} else {
  console.log('❌ Page upload manquante');
  process.exit(1);
}

// Vérifier que le composant AudioUpload existe
const audioUploadPath = path.join(__dirname, '../components/upload/audio-upload.tsx');
if (fs.existsSync(audioUploadPath)) {
  console.log('✅ Composant AudioUpload trouvé');
} else {
  console.log('❌ Composant AudioUpload manquant');
  process.exit(1);
}

// Vérifier que l'API upload-audio existe
const uploadApiPath = path.join(__dirname, '../app/api/upload-audio/route.ts');
if (fs.existsSync(uploadApiPath)) {
  console.log('✅ API upload-audio trouvée');
} else {
  console.log('❌ API upload-audio manquante');
  process.exit(1);
}

// Vérifier que la lib S3 existe
const s3LibPath = path.join(__dirname, '../lib/s3.ts');
if (fs.existsSync(s3LibPath)) {
  console.log('✅ Lib S3 trouvée');
} else {
  console.log('❌ Lib S3 manquante');
  process.exit(1);
}

// Vérifier que le hook useSubscription existe
const subscriptionHookPath = path.join(__dirname, '../hooks/use-subscription.ts');
if (fs.existsSync(subscriptionHookPath)) {
  console.log('✅ Hook useSubscription trouvé');
} else {
  console.log('❌ Hook useSubscription manquant');
  process.exit(1);
}

// Vérifier que le composant PremiumGuard existe
const premiumGuardPath = path.join(__dirname, '../components/subscription/premium-guard.tsx');
if (fs.existsSync(premiumGuardPath)) {
  console.log('✅ Composant PremiumGuard trouvé');
} else {
  console.log('❌ Composant PremiumGuard manquant');
  process.exit(1);
}

// Vérifier les dépendances dans package.json
const packageJsonPath = path.join(__dirname, '../package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const requiredDeps = ['aws-sdk', '@supabase/supabase-js', 'next', 'react'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
  
  if (missingDeps.length === 0) {
    console.log('✅ Toutes les dépendances requises sont installées');
  } else {
    console.log(`❌ Dépendances manquantes: ${missingDeps.join(', ')}`);
    process.exit(1);
  }
} else {
  console.log('❌ package.json non trouvé');
  process.exit(1);
}

// Vérifier les variables d'environnement
const envExamplePath = path.join(__dirname, '../env.example');
if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredEnvVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_S3_BUCKET',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !envContent.includes(envVar));
  
  if (missingEnvVars.length === 0) {
    console.log('✅ Toutes les variables d\'environnement requises sont documentées');
  } else {
    console.log(`❌ Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
  }
} else {
  console.log('❌ env.example non trouvé');
}

console.log('\n🎉 Vérification terminée !');
console.log('\n📝 Prochaines étapes :');
console.log('1. Configurer les variables d\'environnement AWS S3');
console.log('2. Créer un bucket S3 et configurer les permissions');
console.log('3. Tester l\'upload avec un fichier audio');
console.log('4. Vérifier que seuls les utilisateurs avec un abonnement actif peuvent uploader');
