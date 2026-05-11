import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { SESSION_MAX_AGE } from '@/types/constants'

const isDev = process.env.NODE_ENV !== 'production'

function debug(...args: unknown[]) {
  if (isDev) console.log('[Auth]', ...args)
}

function debugError(...args: unknown[]) {
  console.error('[Auth Error]', ...args)
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          debugError('缺少用户名或密码')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          debugError('用户不存在:', credentials.username)
          return null
        }

        if (user.status !== 1) {
          debugError('用户状态异常:', user.username, user.status)
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password)

        if (!isValid) {
          debugError('密码错误:', credentials.username)
          return null
        }

        const permissions = user.roles.flatMap((ur) => ur.role.permissions.map((rp) => rp.permission.code))
        const roles = user.roles.map((ur) => ur.role.code)

        debug('登录成功:', user.username, 'roles:', roles, 'permissions:', permissions.length)

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          roles,
          permissions,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      debug('jwt callback', { hasUser: !!user, tokenId: token.id })
      if (user) {
        token.id = user.id
        token.username = (user as unknown as { username?: string }).username ?? ''
        token.roles = (user as { roles?: string[] }).roles || []
        token.permissions = (user as { permissions?: string[] }).permissions || []
      }
      return token
    },
    async session({ session, token }) {
      debug('session callback', { hasToken: !!token, tokenId: token.id })
      if (session.user) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.roles = token.roles as string[]
        session.user.permissions = token.permissions as string[]
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: SESSION_MAX_AGE,
  },
  secret: process.env.AUTH_SECRET,
})
