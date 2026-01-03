// lib/redis/upstash-redis.ts
// Upstash Redis REAL - com fallback para desenvolvimento
import { Redis } from '@upstash/redis';

// Configuração Upstash Redis
const UPSTASH_REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// Cliente Redis REAL
let upstashClient: Redis | null = null;

// Fallback em memória para desenvolvimento
const memoryCache = new Map<string, { value: any; expiry?: number }>();

export const getRedisClient = (): Redis | null => {
  if (!upstashClient && UPSTASH_REDIS_URL && UPSTASH_REDIS_TOKEN) {
    upstashClient = new Redis({
      url: UPSTASH_REDIS_URL,
      token: UPSTASH_REDIS_TOKEN,
    });
  }
  return upstashClient;
};

// Interface unificada Redis REAL
export const redisService = {
  async get<T = any>(key: string): Promise<T | null> {
    const client = getRedisClient();
    
    if (client) {
      try {
        const value = await client.get<T>(key);
        return value;
      } catch (error) {
        console.error('Upstash Redis GET error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    if (cached) {
      if (cached.expiry && Date.now() > cached.expiry) {
        memoryCache.delete(key);
        return null;
      }
      return cached.value as T;
    }
    
    return null;
  },

  async set(key: string, value: any, options?: { ex?: number; px?: number }): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      try {
        if (options?.ex) {
          await client.setex(key, options.ex, value);
        } else if (options?.px) {
          await client.psetex(key, options.px, value);
        } else {
          await client.set(key, value);
        }
        return;
      } catch (error) {
        console.error('Upstash Redis SET error:', error);
      }
    }
    
    // Fallback em memória
    const expiry = options?.ex 
      ? Date.now() + options.ex * 1000 
      : options?.px 
      ? Date.now() + options.px 
      : undefined;
    
    memoryCache.set(key, { value, expiry });
  },

  async del(key: string): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      try {
        await client.del(key);
        return;
      } catch (error) {
        console.error('Upstash Redis DEL error:', error);
      }
    }
    
    memoryCache.delete(key);
  },

  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    
    if (client) {
      try {
        const result = await client.exists(key);
        return result === 1;
      } catch (error) {
        console.error('Upstash Redis EXISTS error:', error);
      }
    }
    
    return memoryCache.has(key);
  },

  async incr(key: string): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.incr(key);
      } catch (error) {
        console.error('Upstash Redis INCR error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    const current = cached?.value || 0;
    const newValue = current + 1;
    memoryCache.set(key, { value: newValue });
    return newValue;
  },

  async expire(key: string, seconds: number): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      try {
        await client.expire(key, seconds);
        return;
      } catch (error) {
        console.error('Upstash Redis EXPIRE error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    if (cached) {
      cached.expiry = Date.now() + seconds * 1000;
      memoryCache.set(key, cached);
    }
  },

  async ttl(key: string): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.ttl(key);
      } catch (error) {
        console.error('Upstash Redis TTL error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    if (cached?.expiry) {
      const remaining = Math.floor((cached.expiry - Date.now()) / 1000);
      return remaining > 0 ? remaining : -2;
    }
    return -1;
  },

  async keys(pattern: string): Promise<string[]> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.keys(pattern);
      } catch (error) {
        console.error('Upstash Redis KEYS error:', error);
      }
    }
    
    // Fallback em memória
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return Array.from(memoryCache.keys()).filter(key => regex.test(key));
  },

  // Pub/Sub (apenas com Upstash)
  async publish(channel: string, message: string): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      try {
        await client.publish(channel, message);
      } catch (error) {
        console.error('Upstash Redis PUBLISH error:', error);
      }
    }
  },

  // Lista operações
  async lpush(key: string, ...values: any[]): Promise<number> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.lpush(key, ...values);
      } catch (error) {
        console.error('Upstash Redis LPUSH error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    const list = (cached?.value as any[]) || [];
    list.unshift(...values);
    memoryCache.set(key, { value: list });
    return list.length;
  },

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.lrange(key, start, stop);
      } catch (error) {
        console.error('Upstash Redis LRANGE error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    const list = (cached?.value as any[]) || [];
    return list.slice(start, stop === -1 ? undefined : stop + 1);
  },

  // Hash operações
  async hset(key: string, field: string, value: any): Promise<void> {
    const client = getRedisClient();
    
    if (client) {
      try {
        await client.hset(key, { [field]: value });
        return;
      } catch (error) {
        console.error('Upstash Redis HSET error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    const hash = (cached?.value as Record<string, any>) || {};
    hash[field] = value;
    memoryCache.set(key, { value: hash });
  },

  async hget(key: string, field: string): Promise<any | null> {
    const client = getRedisClient();
    
    if (client) {
      try {
        return await client.hget(key, field);
      } catch (error) {
        console.error('Upstash Redis HGET error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    const hash = (cached?.value as Record<string, any>) || {};
    return hash[field] || null;
  },

  async hgetall(key: string): Promise<Record<string, any>> {
    const client = getRedisClient();
    
    if (client) {
      try {
        const result = await client.hgetall(key);
        return result || {};
      } catch (error) {
        console.error('Upstash Redis HGETALL error:', error);
      }
    }
    
    // Fallback em memória
    const cached = memoryCache.get(key);
    return (cached?.value as Record<string, any>) || {};
  },

  // Cleanup (apenas para memoryCache)
  clearMemoryCache(): void {
    memoryCache.clear();
  },

  // Status
  isConnected(): boolean {
    return upstashClient !== null;
  },

  getMode(): 'upstash' | 'memory' {
    return upstashClient ? 'upstash' : 'memory';
  }
};
