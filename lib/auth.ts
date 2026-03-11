import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null
  return prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true, name: true, email: true, role: true,
      isVerified: true, isBanned: true, profilePhoto: true,
      department: true, year: true, phone: true,
      ratingsReceived: { select: { score: true } }
    }
  })
}

export function getAverageRating(ratings: { score: number }[]) {
  if (!ratings.length) return 0
  return (ratings.reduce((a, b) => a + b.score, 0) / ratings.length).toFixed(1)
}

export function isCollegeEmail(email: string) {
  // Allow .edu emails or configure your college domain
  return email.includes('.edu') || email.includes('ac.in') || email.includes('edu.in')
}
