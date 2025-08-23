#!/usr/bin/env node

/**
 * Script pour générer une clé secrète sécurisée pour les cron jobs
 * Usage: node scripts/generate-cron-key.js
 */

const crypto = require('crypto');

function generateSecureKey(length = 64) {
  // Générer une clé aléatoire
  const randomBytes = crypto.randomBytes(length);
  
  // Convertir en base64 pour une meilleure lisibilité
  const base64Key = randomBytes.toString('base64');
  
  // Alternative en hex (plus long mais très sécurisé)
  const hexKey = randomBytes.toString('hex');
  
  return {
    base64: base64Key,
    hex: hexKey,
    length: base64Key.length,
    hexLength: hexKey.length
  };
}

function generateMultipleKeys(count = 3) {
  console.log('🔐 Génération de clés secrètes sécurisées pour les cron jobs\n');
  
  for (let i = 1; i <= count; i++) {
    const key = generateSecureKey(64);
    
    console.log(`--- Clé ${i} ---`);
    console.log(`Base64 (${key.length} caractères):`);
    console.log(`${key.base64}\n`);
    
    console.log(`Hex (${key.hexLength} caractères):`);
    console.log(`${key.hex}\n`);
    
    // Vérifier la complexité
    const hasUppercase = /[A-Z]/.test(key.base64);
    const hasLowercase = /[a-z]/.test(key.base64);
    const hasNumbers = /[0-9]/.test(key.base64);
    const hasSpecial = /[+/=]/.test(key.base64);
    
    console.log('✅ Complexité:');
    console.log(`  - Majuscules: ${hasUppercase ? '✅' : '❌'}`);
    console.log(`  - Minuscules: ${hasLowercase ? '✅' : '❌'}`);
    console.log(`  - Chiffres: ${hasNumbers ? '✅' : '❌'}`);
    console.log(`  - Caractères spéciaux: ${hasSpecial ? '✅' : '❌'}`);
    console.log('---\n');
  }
  
  console.log('💡 Recommandations:');
  console.log('  - Utilise la clé Base64 (plus courte et lisible)');
  console.log('  - Stocke-la dans les variables d\'environnement Vercel');
  console.log('  - Ne la partage JAMAIS dans le code source');
  console.log('  - Change-la régulièrement pour la sécurité');
}

// Exécution du script
if (require.main === module) {
  generateMultipleKeys();
}

module.exports = { generateSecureKey };
