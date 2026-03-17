import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// GET — fetch purchases for current user (as buyer or seller)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') // 'buyer' | 'seller'

  const where = type === 'seller'
    ? { sellerId: user.id }
    : { buyerId: user.id }

  const purchases = await prisma.purchase.findMany({
    where,
    include: {
      listing: { select: { id: true, title: true, images: true, category: true } },
      buyer:   { select: { id: true, name: true, email: true } },
      seller:  { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ purchases })
}

// POST — seller initiates a purchase request for a buyer (from chat participants)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const seller = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!seller) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { listingId, buyerId } = await req.json()
  if (!listingId || !buyerId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  // Verify seller owns this listing
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.sellerId !== seller.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (listing.status !== 'ACTIVE') return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })

  // Verify buyer has chatted with seller (exists in a shared chat room)
  const sharedRoom = await prisma.chatRoom.findFirst({
    where: { participants: { hasEvery: [seller.id, buyerId] } },
  })
  if (!sharedRoom) return NextResponse.json({ error: 'Buyer has not chatted with you' }, { status: 400 })

  // Prevent duplicate pending request
  const existing = await prisma.purchase.findFirst({
    where: { listingId, buyerId, status: 'PENDING' },
  })
  if (existing) return NextResponse.json({ error: 'A pending request already exists for this buyer' }, { status: 400 })

  const purchase = await prisma.purchase.create({
    data: { listingId, buyerId, sellerId: seller.id, price: listing.price },
    include: {
      listing: { select: { id: true, title: true, images: true, category: true } },
      buyer:   { select: { id: true, name: true } },
    },
  })

  // Notify the buyer
  await prisma.notification.create({
    data: {
      userId: buyerId,
      title: '🛍️ Purchase Request',
      body: `${seller.name} wants to confirm you bought "${listing.title}" for ₹${listing.price.toLocaleString()}`,
      link: '/dashboard',
    },
  })

  return NextResponse.json({ success: true, purchase })
}
