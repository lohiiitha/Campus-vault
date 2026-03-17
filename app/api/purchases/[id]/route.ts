import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// PATCH — buyer confirms or declines a purchase request
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const buyer = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!buyer) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { action } = await req.json() // 'confirm' | 'decline'
  if (!['confirm', 'decline'].includes(action)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const purchase = await prisma.purchase.findUnique({ where: { id: params.id } })
  if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
  if (purchase.buyerId !== buyer.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  if (purchase.status !== 'PENDING') return NextResponse.json({ error: 'Already responded' }, { status: 400 })

  if (action === 'confirm') {
    const [updatedPurchase] = await prisma.$transaction([
      prisma.purchase.update({
        where: { id: params.id },
        data: { status: 'CONFIRMED' },
      }),
      prisma.listing.update({
        where: { id: purchase.listingId },
        data: { status: 'SOLD' },
      }),
    ])

    // Notify the seller
    await prisma.notification.create({
      data: {
        userId: purchase.sellerId,
        title: '✅ Purchase Confirmed',
        body: `${buyer.name} confirmed the purchase of your listing.`,
        link: '/dashboard/listings',
      },
    })

    return NextResponse.json({ success: true, purchase: updatedPurchase })
  } else {
    const updatedPurchase = await prisma.purchase.update({
      where: { id: params.id },
      data: { status: 'DECLINED' },
    })

    // Notify the seller
    await prisma.notification.create({
      data: {
        userId: purchase.sellerId,
        title: '❌ Purchase Declined',
        body: `${buyer.name} declined the purchase request.`,
        link: '/dashboard/listings',
      },
    })

    return NextResponse.json({ success: true, purchase: updatedPurchase })
  }
}
