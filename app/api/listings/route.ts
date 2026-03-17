import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { containsBannedWord } from '@/lib/bannedWords'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const sort = searchParams.get('sort') || 'newest'
  const search = searchParams.get('search') || ''
  const rentable = searchParams.get('rentable')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 12

  const where: any = {
    status: 'ACTIVE',
    ...(category && { category }),
    ...(search && { title: { contains: search, mode: 'insensitive' } }),
    ...(rentable === 'true' && { isRentable: true }),
    price: {
      ...(minPrice && { gte: parseFloat(minPrice) }),
      ...(maxPrice && { lte: parseFloat(maxPrice) }),
    },
  }

  const orderBy: any =
    sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
    : sort === 'rating' ? { seller: { ratingsReceived: { _count: 'desc' } } }
    : { createdAt: 'desc' }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        seller: { select: { id: true, name: true, profilePhoto: true, ratingsReceived: { select: { score: true } } } },
        _count: { select: { rentals: true } },
      },
    }),
    prisma.listing.count({ where }),
  ])

  // Price insight: avg price for same category
  const priceInsight = category
    ? await prisma.listing.aggregate({ where: { category, status: 'ACTIVE' }, _avg: { price: true } })
    : null

  return NextResponse.json({ listings, total, pages: Math.ceil(total / limit), priceInsight })
}

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  price: z.number().positive(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'USED']),
  category: z.string(),
  images: z.array(z.string()).min(1),
  isRentable: z.boolean().default(false),
  rentalPrice: z.number().optional(),
  deposit: z.number().optional(),
  isUrgent: z.boolean().default(false),
  isNegotiable: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = createSchema.parse(body)
    const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Banned words check
    const flagged = containsBannedWord(data.title + ' ' + (data.description || ''))
    if (flagged) {
      const newCount = user.warningCount + 1
      if (newCount >= 2) {
        // Second offence — ban the account
        await prisma.user.update({ where: { id: user.id }, data: { warningCount: newCount, isBanned: true } })
        await prisma.notification.create({
          data: { userId: user.id, title: '🚫 Account Disabled', body: 'Your account has been disabled due to repeated guideline violations.' }
        })
        // Notify admin
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) await prisma.notification.create({
          data: { userId: admin.id, title: '🚨 User Auto-Banned', body: `${user.name} was banned after listing flagged for: "${flagged}"` }
        })
        return NextResponse.json({ error: 'Your account has been disabled due to repeated guideline violations. Please contact support.' }, { status: 403 })
      } else {
        // First offence — warn
        await prisma.user.update({ where: { id: user.id }, data: { warningCount: newCount } })
        // Notify admin
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (admin) await prisma.notification.create({
          data: { userId: admin.id, title: '⚠️ Flagged Listing', body: `${user.name} tried to list an item flagged for: "${flagged}". Warning ${newCount}/2.` }
        })
        return NextResponse.json({ error: `Your listing was flagged for violating community guidelines (word: "${flagged}"). This is warning ${newCount} of 2. A second violation will disable your account.` }, { status: 400 })
      }
    }

    const listing = await prisma.listing.create({
      data: { ...data, sellerId: user.id, status: 'ACTIVE' },
    })

    return NextResponse.json({ success: true, listing })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
