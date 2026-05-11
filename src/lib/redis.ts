import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

function createRedisClient() {
  const host = process.env.REDIS_HOST || 'localhost'
  const port = parseInt(process.env.REDIS_PORT || '6379', 10)
  const password = process.env.REDIS_PASSWORD
  const db = parseInt(process.env.REDIS_DATABASE || '0', 10)

  return new Redis({
    host,
    port,
    password: password || undefined,
    db,
    retryStrategy(times) {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    maxRetriesPerRequest: 3,
  })
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Key prefixes
export const SESSION_PREFIX = 'auth:session:'

export interface RedisSessionData {
  userId: string
  username: string
  name: string
  email: string
  roles: string[]
  permissions: string[]
  expires: string
}

function getSessionKey(userId: string) {
  return `${SESSION_PREFIX}${userId}`
}

export async function setSession(
  userId: string,
  data: RedisSessionData,
  ttl = 60 * 60 * 24
) {
  const key = getSessionKey(userId)
  await redis.set(key, JSON.stringify(data), 'EX', ttl)
}

export async function getSession(userId: string): Promise<RedisSessionData | null> {
  const key = getSessionKey(userId)
  const raw = await redis.get(key)
  return raw ? (JSON.parse(raw) as RedisSessionData) : null
}

export async function delSession(userId: string) {
  const key = getSessionKey(userId)
  await redis.del(key)
}
