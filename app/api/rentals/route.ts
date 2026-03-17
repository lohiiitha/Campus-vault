import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { differenceInDays } from 'date-fns'

const rentalSchema = z.object({
  listingId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { listingId, startDate, endDate } = rentalSchema.parse(body)

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing || !listing.isRentable) return NextResponse.json({ error: 'Item not available for rent' }, { status: 400 })
    if (listing.status !== 'ACTIVE') return NextResponse.json({ error: 'Item not available' }, { status: 400 })

    const renter = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!renter) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (listing.sellerId === renter.id) return NextResponse.json({ error: 'Cannot rent your own item' }, { status: 400 })

    const days = differenceInDays(new Date(endDate), new Date(startDate)) + 1
    if (days < 1) return NextResponse.json({ error: 'Invalid dates' }, { status: 400 })

    const totalPrice = (listing.rentalPrice || listing.price * 0.1) * days

    const rental = await prisma.rental.create({
      data: {
        listingId, startDate: new Date(startDate), endDate: new Date(endDate),
        totalPrice, deposit: listing.deposit,
        renterId: renter.id, ownerId: listing.sellerId,
      },
    })

    await prisma.listing.update({ where: { id: listingId }, data: { status: 'RENTED' } })

    return NextResponse.json({ success: true, rental })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Rental failed' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const rentals = await prisma.rental.findMany({
    where: { OR: [{ renterId: user.id }, { ownerId: user.id }] },
    include: {
      listing: { select: { title: true, images: true, category: true } },
      renter: { select: { name: true, email: true } },
      owner: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ rentals })
}
