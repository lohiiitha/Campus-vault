import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

// Get or create a chat room between two users
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { otherUserId } = await req.json()
  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  // Look for existing room between these two users
  const participants = [user.id, otherUserId].sort()
  let room = await prisma.chatRoom.findFirst({
    where: { participants: { hasEvery: participants } },
    include: { messages: { include: { sender: { select: { name: true, profilePhoto: true } } }, orderBy: { createdAt: 'asc' } } }
  })

  if (!room) {
    room = await prisma.chatRoom.create({
      data: { participants },
      include: { messages: { include: { sender: { select: { name: true, profilePhoto: true } } }, orderBy: { createdAt: 'asc' } } }
    })
  }

  return NextResponse.json({ room })
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  const rooms = await prisma.chatRoom.findMany({
    where: { participants: { has: user.id } },
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { name: true } } } }
    },
    orderBy: { createdAt: 'desc' },
  })

  // For each room, fetch the other participant's name + unread count
  const enrichedRooms = await Promise.all(rooms.map(async (room) => {
    const otherId = room.participants.find((p: string) => p !== user.id)
    const otherUser = otherId ? await prisma.user.findUnique({ where: { id: otherId }, select: { name: true } }) : null
    const unreadCount = await prisma.message.count({
      where: { roomId: room.id, senderId: { not: user.id }, read: false }
    })
    return { ...room, otherUserName: otherUser?.name || 'Unknown', unreadCount }
  }))

  return NextResponse.json({ rooms: enrichedRooms })
}
