import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

async function requireAdmin(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (user?.role !== 'ADMIN') return null
  return user
}

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [totalUsers, totalListings, activeListings, pendingListings, totalRentals, openReports, bannedUsers] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.rental.count(),
      prisma.report.count({ where: { resolved: false } }),
      prisma.user.count({ where: { isBanned: true } }),
    ])

  const recentReports = await prisma.report.findMany({
    where: { resolved: false },
    include: {
      reporter: { select: { name: true, email: true } },
      reported: { select: { name: true, email: true, isBanned: true } },
      listing: { select: { title: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const activeListingsData = await prisma.listing.findMany({
    where: { status: 'ACTIVE' },
    include: { seller: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const allUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isBanned: true, warningCount: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })

  const pendingListingsData = await prisma.listing.findMany({
    where: { status: 'PENDING' },
    include: { seller: { select: { name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const topCategories = await prisma.listing.groupBy({
    by: ['category'],
    _count: { category: true },
    orderBy: { _count: { category: 'desc' } },
    take: 5,
  })

  return NextResponse.json({
    stats: { totalUsers, totalListings, activeListings, pendingListings, totalRentals, openReports, bannedUsers },
    recentReports, pendingListingsData, activeListingsData, allUsers, topCategories,
  })
}
