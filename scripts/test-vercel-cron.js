#!/usr/bin/env node

/**
 * Script de test pour vérifier le fonctionnement de la route cron sur Vercel
 * Usage: node scripts/test-vercel-cron.js
 */

const https = require('https');

// Configuration
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
const CRON_SECRET = process.env.CRON_SECRET_KEY || 'test-key';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCronJob() {
  console.log('🧪 Test de la route cron Vercel');
  console.log(`📍 URL: ${APP_URL}/api/cron/publish-scheduled-tweets`);
  console.log('---');
  
  try {
    // Test 1: Appel GET (pour Vercel cron)
    console.log('1️⃣ Test de la route GET (cron Vercel)...');
    const getResponse = await makeRequest(`${APP_URL}/api/cron/publish-scheduled-tweets`, {
      method: 'GET'
    });
    
    console.log(`✅ Status: ${getResponse.status}`);
    console.log(`📊 Réponse:`, JSON.stringify(getResponse.data, null, 2));
    
    // Test 2: Appel POST avec authentification
    console.log('\n2️⃣ Test de la route POST avec authentification...');
    const postResponse = await makeRequest(`${APP_URL}/api/cron/publish-scheduled-tweets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${postResponse.status}`);
    console.log(`📊 Réponse:`, JSON.stringify(postResponse.data, null, 2));
    
    // Test 3: Appel POST sans authentification (doit échouer)
    console.log('\n3️⃣ Test de la route POST sans authentification (doit échouer)...');
    const postResponseUnauth = await makeRequest(`${APP_URL}/api/cron/publish-scheduled-tweets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`✅ Status: ${postResponseUnauth.status}`);
    console.log(`📊 Réponse:`, JSON.stringify(postResponseUnauth.data, null, 2));
    
    // Test 4: Health check
    console.log('\n4️⃣ Test de la route health check...');
    const healthResponse = await makeRequest(`${APP_URL}/api/health`, {
      method: 'GET'
    });
    
    console.log(`✅ Status: ${healthResponse.status}`);
    console.log(`📊 Réponse:`, JSON.stringify(healthResponse.data, null, 2));
    
    console.log('\n🎉 Tests terminés avec succès!');
    
  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
    process.exit(1);
  }
}

// Exécution du script
if (require.main === module) {
  testCronJob();
}

module.exports = { testCronJob };
