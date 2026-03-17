import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rental = await prisma.rental.findUnique({ where: { id: params.id }, include: { listing: true } })
  if (!rental) return NextResponse.json({ error: 'Rental not found' }, { status: 404 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (rental.ownerId !== user?.id && rental.renterId !== user?.id)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.rental.update({ where: { id: params.id }, data: { status: 'RETURNED', returnedAt: new Date() } })
  await prisma.listing.update({ where: { id: rental.listingId }, data: { status: 'ACTIVE' } })

  return NextResponse.json({ success: true })
}
