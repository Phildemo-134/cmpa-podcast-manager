import { cache, transcriptionCache, contentCache } from './redis';

/**
 * Script de test pour vérifier la connexion Redis avec Upstash
 */
export async function testRedisConnection(): Promise<void> {
  console.log('🧪 Testing Redis connection...');

  try {
    // Test 1: Opérations de base
    console.log('📝 Testing basic operations...');
    
    const testKey = 'test:connection';
    const testValue = 'Hello Upstash!';
    
    // SET
    await cache.set(testKey, testValue, 60); // TTL: 1 minute
    console.log('✅ SET operation successful');
    
    // GET
    const retrievedValue = await cache.get(testKey);
    if (retrievedValue === testValue) {
      console.log('✅ GET operation successful');
    } else {
      throw new Error(`GET failed: expected "${testValue}", got "${retrievedValue}"`);
    }
    
    // EXISTS
    const exists = await cache.exists(testKey);
    if (exists) {
      console.log('✅ EXISTS operation successful');
    } else {
      throw new Error('EXISTS failed: key should exist');
    }
    
    // DELETE
    await cache.del(testKey);
    const deletedExists = await cache.exists(testKey);
    if (!deletedExists) {
      console.log('✅ DELETE operation successful');
    } else {
      throw new Error('DELETE failed: key should not exist');
    }

    // Test 2: Cache des transcriptions
    console.log('📝 Testing transcription cache...');
    
    const testEpisodeId = 'test-episode-123';
    const testTranscription = {
      raw_text: 'This is a test transcription',
      cleaned_text: 'This is a test transcription.',
      timestamps: [{ start: 0, end: 5, text: 'This is a test transcription.' }],
      created_at: new Date().toISOString(),
    };
    
    await transcriptionCache.save(testEpisodeId, testTranscription);
    console.log('✅ Transcription cache save successful');
    
    const retrievedTranscription = await transcriptionCache.get(testEpisodeId);
    if (retrievedTranscription && retrievedTranscription.raw_text === testTranscription.raw_text) {
      console.log('✅ Transcription cache get successful');
    } else {
      throw new Error('Transcription cache get failed');
    }
    
    await transcriptionCache.delete(testEpisodeId);
    console.log('✅ Transcription cache delete successful');

    // Test 3: Cache du contenu
    console.log('📝 Testing content cache...');
    
    const testContent = {
      blog_description: 'This is a test blog description',
      youtube_description: 'This is a test YouTube description',
      social_posts: ['Test social post 1', 'Test social post 2'],
    };
    
    await contentCache.save(testEpisodeId, 'descriptions', testContent);
    console.log('✅ Content cache save successful');
    
    const retrievedContent = await contentCache.get(testEpisodeId, 'descriptions');
    if (retrievedContent && retrievedContent.blog_description === testContent.blog_description) {
      console.log('✅ Content cache get successful');
    } else {
      throw new Error('Content cache get failed');
    }
    
    await contentCache.delete(testEpisodeId, 'descriptions');
    console.log('✅ Content cache delete successful');

    console.log('🎉 All Redis tests passed! Upstash connection is working correctly.');
    
  } catch (error) {
    console.error('❌ Redis test failed:', error);
    throw error;
  }
}

/**
 * Fonction pour tester la performance du cache
 */
export async function testRedisPerformance(): Promise<void> {
  console.log('⚡ Testing Redis performance...');
  
  const iterations = 100;
  const testData = JSON.stringify({
    large_text: 'Lorem ipsum '.repeat(1000), // ~11KB de données
    timestamp: Date.now(),
  });
  
  // Test d'écriture
  const writeStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    await cache.set(`perf:test:${i}`, testData, 300); // 5 minutes TTL
  }
  const writeTime = Date.now() - writeStart;
  
  // Test de lecture
  const readStart = Date.now();
  for (let i = 0; i < iterations; i++) {
    await cache.get(`perf:test:${i}`);
  }
  const readTime = Date.now() - readStart;
  
  // Nettoyage
  for (let i = 0; i < iterations; i++) {
    await cache.del(`perf:test:${i}`);
  }
  
  console.log(`📊 Performance results for ${iterations} operations:`);
  console.log(`   Write: ${writeTime}ms (${(writeTime/iterations).toFixed(2)}ms/op)`);
  console.log(`   Read:  ${readTime}ms (${(readTime/iterations).toFixed(2)}ms/op)`);
}

// Fonction utilitaire pour exécuter les tests depuis la ligne de commande
if (require.main === module) {
  testRedisConnection()
    .then(() => testRedisPerformance())
    .then(() => {
      console.log('✨ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}
