import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      name?: string | null
      email?: string | null
      image?: string | null
      roles: string[]
      permissions: string[]
    } & DefaultSession['user']
  }

  interface User {
    roles: string[]
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    roles: string[]
    permissions: string[]
  }
}
