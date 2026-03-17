import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// POST — seller marks item as sold offline (no buyer confirmation needed)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const seller = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!seller) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { listingId, offlineBuyerName, offlineBuyerPhone, soldDate, notes } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

  // Verify seller owns this listing
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
  if (listing.sellerId !== seller.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (listing.status !== 'ACTIVE') return NextResponse.json({ error: 'Listing is not active' }, { status: 400 })

  // Create offline purchase record + mark listing SOLD in a transaction
  const [purchase] = await prisma.$transaction([
    prisma.purchase.create({
      data: {
        listingId,
        sellerId: seller.id,
        buyerId: seller.id, // self-reference since buyer is not on platform
        price: listing.price,
        status: 'OFFLINE',
        offlineBuyerName: offlineBuyerName?.trim() || null,
        offlineBuyerPhone: offlineBuyerPhone?.trim() || null,
        soldDate: soldDate ? new Date(soldDate) : new Date(),
        notes: notes?.trim() || null,
      },
    }),
    prisma.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD' },
    }),
  ])

  return NextResponse.json({ success: true, purchase })
}
