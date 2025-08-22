#!/usr/bin/env node

console.log('🔍 Debug des fuseaux horaires JavaScript');
console.log('=======================================\n');

const testDate = '2024-12-31';
const testTime = '19:09';

console.log('📅 Test avec différentes approches:');
console.log(`   Date de test: ${testDate} ${testTime}`);
console.log('');

// Test 1: Sans fuseau horaire
const date1 = new Date(`${testDate}T${testTime}:00`);
console.log('1. Sans fuseau horaire:');
console.log(`   new Date("${testDate}T${testTime}:00")`);
console.log(`   Résultat: ${date1.toISOString()}`);
console.log(`   Heure locale: ${date1.toLocaleTimeString('fr-FR')}`);
console.log(`   Heure UTC: ${date1.getUTCHours().toString().padStart(2, '0')}:${date1.getUTCMinutes().toString().padStart(2, '0')}`);
console.log('');

// Test 2: Avec fuseau +02:00
const date2 = new Date(`${testDate}T${testTime}:00+02:00`);
console.log('2. Avec fuseau +02:00:');
console.log(`   new Date("${testDate}T${testTime}:00+02:00")`);
console.log(`   Résultat: ${date2.toISOString()}`);
console.log(`   Heure locale: ${date2.toLocaleTimeString('fr-FR')}`);
console.log(`   Heure UTC: ${date2.getUTCHours().toString().padStart(2, '0')}:${date2.getUTCMinutes().toString().padStart(2, '0')}`);
console.log('');

// Test 3: Avec fuseau -02:00
const date3 = new Date(`${testDate}T${testTime}:00-02:00`);
console.log('3. Avec fuseau -02:00:');
console.log(`   new Date("${testDate}T${testTime}:00-02:00")`);
console.log(`   Résultat: ${date3.toISOString()}`);
console.log(`   Heure locale: ${date3.toLocaleTimeString('fr-FR')}`);
console.log(`   Heure UTC: ${date3.getUTCHours().toString().padStart(2, '0')}:${date3.getUTCMinutes().toString().padStart(2, '0')}`);
console.log('');

// Test 4: Création manuelle avec getTime()
const date4 = new Date();
date4.setFullYear(2024, 11, 31); // Décembre = 11 (0-indexed)
date4.setHours(19, 9, 0, 0);
console.log('4. Création manuelle:');
console.log(`   setFullYear(2024, 11, 31), setHours(19, 9, 0, 0)`);
console.log(`   Résultat: ${date4.toISOString()}`);
console.log(`   Heure locale: ${date4.toLocaleTimeString('fr-FR')}`);
console.log(`   Heure UTC: ${date4.getUTCHours().toString().padStart(2, '0')}:${date4.getUTCMinutes().toString().padStart(2, '0')}`);
console.log('');

// Test 5: Conversion manuelle
const localHours = 19;
const localMinutes = 9;
const utcHours = localHours - 2; // UTC+2
const utcDate = new Date();
utcDate.setUTCFullYear(2024, 11, 31);
utcDate.setUTCHours(utcHours, localMinutes, 0, 0);
console.log('5. Conversion manuelle:');
console.log(`   Heure locale: ${localHours}:${localMinutes.toString().padStart(2, '0')} (UTC+2)`);
console.log(`   Heure UTC calculée: ${utcHours}:${localMinutes.toString().padStart(2, '0')}`);
console.log(`   Résultat: ${utcDate.toISOString()}`);
console.log(`   Heure UTC vérifiée: ${utcDate.getUTCHours().toString().padStart(2, '0')}:${utcDate.getUTCMinutes().toString().padStart(2, '0')}`);
console.log('');

console.log('💡 Analyse:');
console.log('   - Test 1: JavaScript traite la date comme locale');
console.log('   - Test 2: JavaScript traite +02:00 comme "cette date est en UTC+2"');
console.log('   - Test 3: JavaScript traite -02:00 comme "cette date est en UTC-2"');
console.log('   - Test 4: Création manuelle avec les méthodes set*');
console.log('   - Test 5: Conversion manuelle en UTC');
console.log('');
console.log('🎯 Pour notre cas:');
console.log('   Nous voulons que 19:09 heure française (UTC+2) soit stocké comme 17:09 UTC');
console.log('   Donc nous devons utiliser la logique du test 5 (conversion manuelle)');
