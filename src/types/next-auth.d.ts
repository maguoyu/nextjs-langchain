import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    name: string
    email?: string | null
    avatar?: string | null
    roles: string[]
    permissions: string[]
  }

  interface Session {
    user: {
      id: string
      username: string
      name: string
      email?: string | null
      avatar?: string | null
      roles: string[]
      permissions: string[]
    }
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
