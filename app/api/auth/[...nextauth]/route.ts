import NextAuth, { AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null
        if (user.isBanned) throw new Error('Your account has been suspended due to guideline violations. Please contact support.')

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          image: user.profilePhoto,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = (user as any).role
        token.isVerified = (user as any).isVerified
      }
      return token
    },
    // Always re-fetch from DB so role switches reflect immediately without re-login
    async session({ session, token }) {
      if (token.email) {
        try {
          const freshUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: {
              id: true, name: true, role: true, isVerified: true,
              isBanned: true, profilePhoto: true, department: true, year: true, phone: true,
            },
          })
          if (freshUser) {
            session.user = {
              email: token.email as string,
              name: freshUser.name,
              image: freshUser.profilePhoto ?? undefined,
              ...(freshUser as any),
            }
          }
        } catch {}
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
