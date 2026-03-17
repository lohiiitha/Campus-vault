import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { action: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (admin?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { listingId, userId, reportId, reason } = await req.json()

  switch (params.action) {
    case 'approve-listing':
      await prisma.listing.update({ where: { id: listingId }, data: { status: 'ACTIVE' } })
      return NextResponse.json({ success: true, message: 'Listing approved' })

    case 'reject-listing':
      await prisma.listing.update({ where: { id: listingId }, data: { status: 'REMOVED' } })
      return NextResponse.json({ success: true, message: 'Listing rejected' })

    case 'remove-listing': {
      const listing = await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'REMOVED', removalReason: reason || 'Violated platform guidelines' },
        include: { seller: { select: { id: true, name: true } } },
      })
      await prisma.notification.create({
        data: {
          userId: listing.seller.id,
          title: '🚫 Listing Removed',
          body: `Your listing "${listing.title}" was removed by admin. Reason: ${reason || 'Violated platform guidelines'}`,
          link: '/dashboard/listings',
        },
      })
      return NextResponse.json({ success: true, message: 'Listing removed and seller notified' })
    }

    case 'ban-user':
      await prisma.user.update({ where: { id: userId }, data: { isBanned: true } })
      await prisma.listing.updateMany({ where: { sellerId: userId }, data: { status: 'REMOVED' } })
      return NextResponse.json({ success: true, message: 'User banned' })

    case 'unban-user':
      await prisma.user.update({ where: { id: userId }, data: { isBanned: false } })
      return NextResponse.json({ success: true, message: 'User unbanned' })

    case 'resolve-report':
      await prisma.report.update({ where: { id: reportId }, data: { resolved: true } })
      return NextResponse.json({ success: true, message: 'Report resolved' })

    default:
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  }
}
