#!/usr/bin/env node

/**
 * Script de test pour vérifier la configuration Stripe en production
 * Usage: node scripts/test-stripe-production.js
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://your-app.vercel.app';
const STRIPE_WEBHOOK_URL = `${PRODUCTION_URL}/api/stripe/webhook`;

console.log('🧪 Test de la configuration Stripe en production\n');

// Test 1: Vérifier que l'endpoint webhook est accessible
console.log('1️⃣ Test de l\'endpoint webhook Stripe...');
testWebhookEndpoint();

// Test 2: Vérifier les variables d'environnement
console.log('\n2️⃣ Vérification des variables d\'environnement...');
checkEnvironmentVariables();

// Test 3: Test de l'API de création de session
console.log('\n3️⃣ Test de l\'API de création de session...');
testCheckoutSessionAPI();

function testWebhookEndpoint() {
  const options = {
    hostname: new URL(PRODUCTION_URL).hostname,
    port: 443,
    path: '/api/stripe/webhook',
    method: 'GET',
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    console.log(`   ✅ Endpoint accessible (Status: ${res.statusCode})`);
    if (res.statusCode === 405) {
      console.log('   ℹ️  Status 405 attendu (méthode GET non autorisée)');
    }
  });

  req.on('error', (error) => {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  });

  req.on('timeout', () => {
    console.log('   ⏰ Timeout - endpoint non accessible');
    req.destroy();
  });

  req.end();
}

function checkEnvironmentVariables() {
  const requiredVars = [
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_PRICE_ID',
    'NEXT_PUBLIC_APP_URL'
  ];

  console.log('   Variables d\'environnement requises:');
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      const value = process.env[varName];
      const maskedValue = varName.includes('SECRET') || varName.includes('KEY') 
        ? `${value.substring(0, 8)}...${value.substring(value.length - 4)}`
        : value;
      console.log(`   ✅ ${varName}: ${maskedValue}`);
    } else {
      console.log(`   ❌ ${varName}: Non définie`);
    }
  });
}

function testCheckoutSessionAPI() {
  const testData = {
    userId: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  };

  const postData = JSON.stringify(testData);
  const options = {
    hostname: new URL(PRODUCTION_URL).hostname,
    port: 443,
    path: '/api/stripe/create-checkout-session',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 10000
  };

  const req = https.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      if (res.statusCode === 200) {
        console.log('   ✅ API de création de session accessible');
        try {
          const response = JSON.parse(data);
          if (response.sessionId) {
            console.log('   ✅ Session Stripe créée avec succès');
          } else {
            console.log('   ⚠️  Réponse inattendue:', response);
          }
        } catch (e) {
          console.log('   ⚠️  Réponse non-JSON:', data);
        }
      } else if (res.statusCode === 401) {
        console.log('   ❌ Erreur d\'authentification (vérifiez vos clés Stripe)');
      } else if (res.statusCode === 500) {
        console.log('   ❌ Erreur serveur interne');
      } else {
        console.log(`   ⚠️  Status inattendu: ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.log(`   ❌ Erreur de connexion: ${error.message}`);
  });

  req.on('timeout', () => {
    console.log('   ⏰ Timeout - API non accessible');
    req.destroy();
  });

  req.write(postData);
  req.end();
}

// Instructions finales
console.log('\n📋 Instructions pour finaliser la configuration:');
console.log('1. Configurez vos variables d\'environnement sur Vercel');
console.log('2. Créez le webhook Stripe avec l\'URL:', STRIPE_WEBHOOK_URL);
console.log('3. Ajoutez le secret du webhook à vos variables Vercel');
console.log('4. Redéployez votre application');
console.log('5. Testez avec une vraie carte de test Stripe');

console.log('\n🔗 Liens utiles:');
console.log('- Dashboard Vercel:', 'https://vercel.com/dashboard');
console.log('- Dashboard Stripe:', 'https://dashboard.stripe.com/webhooks');
console.log('- Guide complet:', './STRIPE_PRODUCTION_DEPLOYMENT.md');
