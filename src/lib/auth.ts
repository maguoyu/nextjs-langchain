import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { setSession, delSession } from './redis'

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
          console.error('[Auth] 缺少用户名或密码')
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
          console.error('[Auth] 用户不存在:', credentials.username)
          return null
        }

        if (user.status !== 1) {
          console.error('[Auth] 用户状态异常:', user.username, user.status)
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          console.error('[Auth] 密码错误:', credentials.username)
          return null
        }

        const permissions = user.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.code)
        )

        const roles = user.roles.map((ur) => ur.role.code)

        console.log('[Auth] 登录成功:', user.username, 'roles:', roles, 'permissions:', permissions.length)

        await setSession(user.id, {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          roles,
          permissions,
        })

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
      console.log('[Auth jwt] called', { hasUser: !!user, tokenId: token.id, tokenRoles: token.roles })
      if (user) {
        token.id = user.id
        token.username = user.username
        token.roles = (user as { roles?: string[] }).roles || []
        token.permissions = (user as { permissions?: string[] }).permissions || []
      }
      return token
    },
    async session({ session, token }) {
      console.log('[Auth session] called', { hasToken: !!token, tokenId: token.id, tokenRoles: token.roles })
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
    maxAge: 60 * 60 * 24, // 24 hours
  },
  secret: process.env.AUTH_SECRET,
})

// 自定义 signOut 清理 Redis
export async function customSignOut() {
  const session = await auth()
  if (session?.user?.id) {
    await delSession(session.user.id)
  }
  await signOut()
}
