import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { containsBannedWord } from '@/lib/bannedWords'

const serviceSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  hourlyPrice: z.number().positive(),
  category: z.string(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')

  const services = await prisma.service.findMany({
    where: { isAvailable: true, ...(category && { category }) },
    include: {
      provider: {
        select: { id: true, name: true, profilePhoto: true, department: true, ratingsReceived: { select: { score: true } } }
      }
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ services })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = serviceSchema.parse(body)
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Banned words check
    const flagged = containsBannedWord(data.title + ' ' + (data.description || ''))
    if (flagged) {
      const newCount = user.warningCount + 1
      if (newCount >= 2) {
        await prisma.user.update({ where: { id: user.id }, data: { warningCount: newCount, isBanned: true } })
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) await prisma.notification.create({
          data: { userId: admin.id, title: '🚨 User Auto-Banned', body: `${user.name} was banned after service flagged for: "${flagged}"` }
        })
        return NextResponse.json({ error: 'Your account has been disabled due to repeated guideline violations. Please contact support.' }, { status: 403 })
      } else {
        await prisma.user.update({ where: { id: user.id }, data: { warningCount: newCount } })
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) await prisma.notification.create({
          data: { userId: admin.id, title: '⚠️ Flagged Service', body: `${user.name} tried to post a service flagged for: "${flagged}". Warning ${newCount}/2.` }
        })
        return NextResponse.json({ error: `Your service was flagged for violating community guidelines (word: "${flagged}"). This is warning ${newCount} of 2. A second violation will disable your account.` }, { status: 400 })
      }
    }

    const service = await prisma.service.create({ data: { ...data, providerId: user.id } })
    return NextResponse.json({ success: true, service })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
