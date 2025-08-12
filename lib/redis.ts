import { Redis } from 'redis';

// Configuration Redis pour Upstash
let redis: Redis | null = null;

function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set');
    }

    redis = new Redis(redisUrl, {
      // Configuration optimisée pour Upstash
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      // Timeout pour les environnements serverless
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    // Gestion des erreurs
    redis.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redis.on('connect', () => {
      console.log('Connected to Redis (Upstash)');
    });
  }

  return redis;
}

// Interface pour les opérations de cache
export interface CacheOperations {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
  del: (key: string) => Promise<void>;
  exists: (key: string) => Promise<boolean>;
  clear: () => Promise<void>;
}

// Implémentation des opérations de cache
export const cache: CacheOperations = {
  async get(key: string): Promise<string | null> {
    try {
      const client = getRedisClient();
      return await client.get(key);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  },

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      const client = getRedisClient();
      if (ttlSeconds) {
        await client.setex(key, ttlSeconds, value);
      } else {
        await client.set(key, value);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  },

  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  },

  async clear(): Promise<void> {
    try {
      const client = getRedisClient();
      await client.flushall();
    } catch (error) {
      console.error('Redis CLEAR error:', error);
    }
  },
};

// Utilitaires pour le cache des transcriptions
export const transcriptionCache = {
  // Clé pour une transcription d'épisode
  getKey(episodeId: string): string {
    return `transcription:${episodeId}`;
  },

  // Sauvegarder une transcription (TTL: 7 jours)
  async save(episodeId: string, transcription: any): Promise<void> {
    const key = this.getKey(episodeId);
    const value = JSON.stringify(transcription);
    const ttl = 7 * 24 * 60 * 60; // 7 jours en secondes
    await cache.set(key, value, ttl);
  },

  // Récupérer une transcription
  async get(episodeId: string): Promise<any | null> {
    const key = this.getKey(episodeId);
    const value = await cache.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Supprimer une transcription du cache
  async delete(episodeId: string): Promise<void> {
    const key = this.getKey(episodeId);
    await cache.del(key);
  },
};

// Utilitaires pour le cache des contenus générés
export const contentCache = {
  // Clé pour du contenu généré
  getKey(episodeId: string, contentType: string): string {
    return `content:${episodeId}:${contentType}`;
  },

  // Sauvegarder du contenu généré (TTL: 30 jours)
  async save(episodeId: string, contentType: string, content: any): Promise<void> {
    const key = this.getKey(episodeId, contentType);
    const value = JSON.stringify(content);
    const ttl = 30 * 24 * 60 * 60; // 30 jours en secondes
    await cache.set(key, value, ttl);
  },

  // Récupérer du contenu généré
  async get(episodeId: string, contentType: string): Promise<any | null> {
    const key = this.getKey(episodeId, contentType);
    const value = await cache.get(key);
    return value ? JSON.parse(value) : null;
  },

  // Supprimer du contenu du cache
  async delete(episodeId: string, contentType: string): Promise<void> {
    const key = this.getKey(episodeId, contentType);
    await cache.del(key);
  },
};

export default getRedisClient;
