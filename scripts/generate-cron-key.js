#!/usr/bin/env node

/**
 * Script pour générer une clé secrète pour le cron job
 * 
 * Usage: node scripts/generate-cron-key.js
 */

const crypto = require('crypto');

console.log('🔐 Génération d\'une clé secrète pour le cron job...');
console.log('');

// Générer une clé de 32 bytes (256 bits)
const secretKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Clé générée avec succès !');
console.log('');
console.log('📋 Ajoutez cette ligne dans votre fichier .env.local :');
console.log('');
console.log(`CRON_SECRET_KEY=${secretKey}`);
console.log('');
console.log('🔒 Cette clé est sécurisée et unique.');
console.log('💡 Gardez-la secrète et ne la partagez jamais !');
console.log('');
console.log('📝 Longueur de la clé:', secretKey.length, 'caractères');
console.log('🔑 Type: Hexadécimal (256 bits)');
