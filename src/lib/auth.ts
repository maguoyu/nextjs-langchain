import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from './prisma'
import { setSession, delSession } from './redis'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: '用户名', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
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

        if (!user || user.status !== 1) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          return null
        }

        // 收集用户权限码
        const permissions = user.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.code)
        )

        // 收集用户角色码
        const roles = user.roles.map((ur) => ur.role.code)

        // 存储 session 到 Redis
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
      if (user) {
        token.id = user.id
        token.username = user.username
        token.roles = (user as { roles?: string[] }).roles || []
        token.permissions = (user as { permissions?: string[] }).permissions || []
      }
      return token
    },
    async session({ session, token }) {
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
