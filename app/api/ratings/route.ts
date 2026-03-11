import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ratingSchema = z.object({
  rateeId: z.string(),
  score: z.number().min(1).max(5),
  review: z.string().optional(),
  listingId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = ratingSchema.parse(body)
    const rater = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!rater) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (rater.id === data.rateeId) return NextResponse.json({ error: 'Cannot rate yourself' }, { status: 400 })

    const rating = await prisma.rating.create({ data: { ...data, raterId: rater.id } })

    // Flag to admin if score is 1 or 2
    const avgRating = await prisma.rating.aggregate({ where: { rateeId: data.rateeId }, _avg: { score: true } })
    if ((avgRating._avg.score || 5) < 2.5) {
      console.log(`[ALERT] User ${data.rateeId} has low avg rating: ${avgRating._avg.score}`)
    }

    return NextResponse.json({ success: true, rating })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
