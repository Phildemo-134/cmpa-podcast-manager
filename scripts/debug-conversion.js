#!/usr/bin/env node

console.log('🔍 Debug de la conversion UTC vers locale');
console.log('=========================================\n');

// Simuler la conversion comme dans notre fonction
function debugConversion(utcDateTime) {
  console.log(`📅 UTC reçu: ${utcDateTime}`);
  
  const utcDate = new Date(utcDateTime);
  console.log(`   Date UTC créée: ${utcDate.toISOString()}`);
  console.log(`   Heure UTC: ${utcDate.getUTCHours().toString().padStart(2, '0')}:${utcDate.getUTCMinutes().toString().padStart(2, '0')}`);
  
  // Ajouter 2 heures pour passer en heure locale française
  const localDate = new Date(utcDate.getTime() + (2 * 60 * 60 * 1000));
  console.log(`   Après ajout de 2h: ${localDate.toISOString()}`);
  console.log(`   Heure locale calculée: ${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`);
  
  // Extraire date et heure
  const date = localDate.toISOString().split('T')[0];
  const time = `${localDate.getUTCHours().toString().padStart(2, '0')}:${localDate.getUTCMinutes().toString().padStart(2, '0')}`;
  
  console.log(`   Date extraite: ${date}`);
  console.log(`   Heure extraite: ${time}`);
  
  return { date, time };
}

// Test avec notre cas
console.log('🧪 Test avec 17:09 UTC (qui devrait donner 19:09 locale)');
console.log('');

const result = debugConversion('2024-12-31T17:09:00.000Z');

console.log('');
console.log('📊 Résultat final:');
console.log(`   Date: ${result.date}`);
console.log(`   Heure: ${result.time}`);
console.log(`   Attendu: 19:09`);
console.log(`   ✅ ${result.time === '19:09' ? 'SUCCÈS' : 'ÉCHEC'}`);
