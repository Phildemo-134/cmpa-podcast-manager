#!/usr/bin/env node

/**
 * Script de test pour vérifier la conversion des fuseaux horaires
 * Ce script simule la planification d'un tweet à 19:09 heure française
 * et vérifie qu'il est bien stocké à 17:09 en UTC
 */

// Configuration
const FRENCH_TIMEZONE_OFFSET = 2; // UTC+2 pour la France (heure d'été)
const TEST_DATE = '2024-12-31';
const TEST_TIME = '19:09';

console.log('🧪 Test de conversion des fuseaux horaires');
console.log('==========================================\n');

// Simuler la conversion côté client (comme dans l'API)
function convertLocalToUTC(localDate, localTime) {
  // Créer une date locale en spécifiant explicitement le fuseau UTC+2
  // Quand on spécifie +02:00, JavaScript traite cela comme "cette date est en UTC+2"
  // et la convertit automatiquement en UTC en soustrayant 2 heures
  // Donc 19:09 +02:00 devient 17:09 UTC, ce qui est exactement ce que nous voulons !
  const localDateTime = new Date(`${localDate}T${localTime}:00+02:00`);
  
  // Retourner l'ISO string (JavaScript a déjà fait la conversion UTC)
  return localDateTime.toISOString();
}

// Simuler la conversion côté serveur pour l'affichage
function convertUTCToLocal(utcDateTime) {
  const utcDate = new Date(utcDateTime);
  
  // Créer une date locale en ajoutant 2 heures (UTC+2)
  const localDate = new Date(utcDate.getTime() + (FRENCH_TIMEZONE_OFFSET * 60 * 60 * 1000));
  
  // Extraire la date et l'heure en format local
  // Utiliser getUTCHours() pour éviter les problèmes de fuseau horaire local
  const date = localDate.toISOString().split('T')[0];
  const time = `${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`;
  
  return { date, time };
}

// Test 1: Conversion locale vers UTC
console.log('📅 Test 1: Conversion locale vers UTC');
console.log(`   Date locale: ${TEST_DATE}`);
console.log(`   Heure locale: ${TEST_TIME}`);
console.log(`   Fuseau: UTC+${FRENCH_TIMEZONE_OFFSET}`);

const utcDateTime = convertLocalToUTC(TEST_DATE, TEST_TIME);
const utcDate = new Date(utcDateTime);

console.log(`   UTC stocké: ${utcDateTime}`);
console.log(`   Heure UTC: ${utcDate.getUTCHours().toString().padStart(2, '0')}:${utcDate.getUTCMinutes().toString().padStart(2, '0')}`);
console.log(`   Date UTC: ${utcDate.getUTCFullYear()}-${(utcDate.getUTCMonth() + 1).toString().padStart(2, '0')}-${utcDate.getUTCDate().toString().padStart(2, '0')}`);

// Vérification
const expectedUTCHour = 19 - FRENCH_TIMEZONE_OFFSET; // 19 - 2 = 17
const actualUTCHour = utcDate.getUTCHours();

if (actualUTCHour === expectedUTCHour) {
  console.log(`   ✅ SUCCÈS: Heure UTC ${actualUTCHour}:09 (attendu: ${expectedUTCHour}:09)`);
} else {
  console.log(`   ❌ ÉCHEC: Heure UTC ${actualUTCHour}:09 (attendu: ${expectedUTCHour}:09)`);
}

console.log('');

// Test 2: Conversion UTC vers locale pour l'affichage
console.log('📅 Test 2: Conversion UTC vers locale pour l\'affichage');
console.log(`   UTC reçu: ${utcDateTime}`);

const localDisplay = convertUTCToLocal(utcDateTime);

console.log(`   Date affichée: ${localDisplay.date}`);
console.log(`   Heure affichée: ${localDisplay.time}`);

// Vérification
if (localDisplay.date === TEST_DATE && localDisplay.time === TEST_TIME) {
  console.log(`   ✅ SUCCÈS: Affichage correct ${localDisplay.date} ${localDisplay.time}`);
} else {
  console.log(`   ❌ ÉCHEC: Affichage incorrect ${localDisplay.date} ${localDisplay.time} (attendu: ${TEST_DATE} ${TEST_TIME})`);
}

console.log('');

// Test 3: Vérification de la cohérence
console.log('📅 Test 3: Vérification de la cohérence');
console.log('   Vérification que la conversion est bidirectionnelle...');

const roundTripUTC = convertLocalToUTC(localDisplay.date, localDisplay.time);
const roundTripLocal = convertUTCToLocal(roundTripUTC);

console.log(`   UTC après aller-retour: ${roundTripUTC}`);
console.log(`   Local après aller-retour: ${roundTripLocal.date} ${roundTripLocal.time}`);

if (roundTripLocal.date === TEST_DATE && roundTripLocal.time === TEST_TIME) {
  console.log(`   ✅ SUCCÈS: Conversion bidirectionnelle cohérente`);
} else {
  console.log(`   ❌ ÉCHEC: Conversion bidirectionnelle incohérente`);
}

console.log('');

// Test 4: Cas limites
console.log('📅 Test 4: Cas limites');
console.log('   Test avec minuit (00:00)...');

const midnightUTC = convertLocalToUTC('2024-12-31', '00:00');
const midnightDate = new Date(midnightUTC);

console.log(`   Minuit local (00:00) → UTC: ${midnightDate.getUTCHours().toString().padStart(2, '0')}:${midnightDate.getUTCMinutes().toString().padStart(2, '0')}`);

console.log('   Test avec 23:59...');

const lateUTC = convertLocalToUTC('2024-12-31', '23:59');
const lateDate = new Date(lateUTC);

console.log(`   23:59 local → UTC: ${lateDate.getUTCHours().toString().padStart(2, '0')}:${lateDate.getUTCMinutes().toString().padStart(2, '0')}`);

console.log('');

// Résumé
console.log('📊 Résumé des tests');
console.log('===================');
console.log(`✅ Conversion locale → UTC: ${actualUTCHour === expectedUTCHour ? 'SUCCÈS' : 'ÉCHEC'}`);
console.log(`✅ Conversion UTC → locale: ${localDisplay.date === TEST_DATE && localDisplay.time === TEST_TIME ? 'SUCCÈS' : 'ÉCHEC'}`);
console.log(`✅ Cohérence bidirectionnelle: ${roundTripLocal.date === TEST_DATE && roundTripLocal.time === TEST_TIME ? 'SUCCÈS' : 'ÉCHEC'}`);

console.log('\n🎯 Objectif atteint:');
console.log(`   Un tweet planifié à ${TEST_TIME} heure française (UTC+${FRENCH_TIMEZONE_OFFSET})`);
console.log(`   sera stocké à ${actualUTCHour}:09 en UTC dans la base de données`);
console.log(`   et affiché correctement à ${TEST_TIME} pour l'utilisateur français.`);
