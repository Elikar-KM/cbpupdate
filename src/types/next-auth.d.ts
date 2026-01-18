import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    accessToken?: string
    role?: string
  }

  interface Session {
    user: User
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string
    id?: string
    role?: string
  }
}
