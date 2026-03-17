import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true, name: true, email: true, role: true, phone: true,
      department: true, year: true, profilePhoto: true, isVerified: true,
      createdAt: true,
      ratingsReceived: { select: { score: true } },
      _count: { select: { listings: true, rentalsAsRenter: true } }
    }
  })

  return NextResponse.json({ user })
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, phone, department, year, role, profilePhoto } = body

  const user = await prisma.user.update({
    where: { email: session.user.email! },
    data: {
      ...(name && { name }),
      ...(phone !== undefined && { phone }),
      ...(department && { department }),
      ...(year && { year: parseInt(year) }),
      ...(role && { role }),
      ...(profilePhoto !== undefined && { profilePhoto }),
    },
  })

  return NextResponse.json({ success: true, user: { id: user.id, name: user.name, role: user.role } })
}
