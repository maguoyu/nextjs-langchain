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

// Session 缓存 key
export const SESSION_PREFIX = 'session:'
export const TOKEN_PREFIX = 'token:'

// 设置 session
export async function setSession(userId: string, session: Record<string, unknown>, ttl = 60 * 60 * 24) {
  const key = `${SESSION_PREFIX}${userId}`
  await redis.set(key, JSON.stringify(session), 'EX', ttl)
}

// 获取 session
export async function getSession(userId: string): Promise<Record<string, unknown> | null> {
  const key = `${SESSION_PREFIX}${userId}`
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

// 删除 session
export async function delSession(userId: string) {
  const key = `${SESSION_PREFIX}${userId}`
  await redis.del(key)
}

// 设置 token
export async function setToken(token: string, userId: string, ttl = 60 * 60 * 24) {
  const key = `${TOKEN_PREFIX}${token}`
  await redis.set(key, userId, 'EX', ttl)
}

// 获取 token 对应的用户
export async function getToken(token: string): Promise<string | null> {
  const key = `${TOKEN_PREFIX}${token}`
  return await redis.get(key)
}

// 删除 token
export async function delToken(token: string) {
  const key = `${TOKEN_PREFIX}${token}`
  await redis.del(key)
}

export default redis
