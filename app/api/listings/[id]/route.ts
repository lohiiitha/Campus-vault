import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      seller: {
        select: {
          id: true, name: true, profilePhoto: true, department: true, year: true,
          ratingsReceived: { select: { score: true, review: true, rater: { select: { name: true } } } },
        },
      },
      ratings: { include: { rater: { select: { name: true, profilePhoto: true } } } },
    },
  })

  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  // Increment views
  await prisma.listing.update({ where: { id: params.id }, data: { views: { increment: 1 } } })

  // Price comparison
  const avgPrice = await prisma.listing.aggregate({
    where: { category: listing.category, status: 'ACTIVE', id: { not: params.id } },
    _avg: { price: true },
    _count: true,
  })

  return NextResponse.json({ listing, priceInsight: { avgPrice: avgPrice._avg.price, count: avgPrice._count } })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (listing.sellerId !== user?.id && user?.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const updated = await prisma.listing.update({ where: { id: params.id }, data: body })
  return NextResponse.json({ listing: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const listing = await prisma.listing.findUnique({ where: { id: params.id } })
  if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (listing.sellerId !== user?.id && user?.role !== 'ADMIN')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.listing.update({ where: { id: params.id }, data: { status: 'REMOVED' } })
  return NextResponse.json({ success: true })
}
