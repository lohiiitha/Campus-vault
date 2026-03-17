import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// GET — fetch current user's wishlist
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        select: {
          id: true, title: true, price: true, images: true,
          category: true, condition: true, status: true,
          seller: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ wishlist })
}

// POST — add a listing to wishlist
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

  try {
    const item = await prisma.wishlist.create({
      data: { userId: user.id, listingId },
    })
    return NextResponse.json({ success: true, item })
  } catch {
    // @@unique constraint violation — already saved
    return NextResponse.json({ error: 'Already in wishlist' }, { status: 409 })
  }
}

// DELETE — remove a listing from wishlist
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const { listingId } = await req.json()
  if (!listingId) return NextResponse.json({ error: 'Missing listingId' }, { status: 400 })

  await prisma.wishlist.deleteMany({
    where: { userId: user.id, listingId },
  })

  return NextResponse.json({ success: true })
}
