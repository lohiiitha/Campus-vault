import { AuthOptions, getServerSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

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

        if (user.isBanned) {
          throw new Error(
            'Your account has been suspended due to guideline violations.'
          )
        }

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

    async session({ session, token }) {
      if (token.email) {
        const freshUser = await prisma.user.findUnique({
          where: { email: token.email as string },
          select: {
            id: true,
            name: true,
            role: true,
            isVerified: true,
            isBanned: true,
            profilePhoto: true,
            department: true,
            year: true,
            phone: true,
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

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) return null

  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      isBanned: true,
      profilePhoto: true,
      department: true,
      year: true,
      phone: true,
      ratingsReceived: { select: { score: true } },
    },
  })
}

export function getAverageRating(ratings: { score: number }[]) {
  if (!ratings.length) return 0
  return (
    ratings.reduce((a, b) => a + b.score, 0) / ratings.length
  ).toFixed(1)
}

export function isCollegeEmail(email: string) {
  return (
    email.includes('.edu') ||
    email.includes('ac.in') ||
    email.includes('edu.in')
  )
}