import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const room = await prisma.chatRoom.findUnique({ where: { id: params.roomId } })
  if (!room?.participants.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const messages = await prisma.message.findMany({
    where: { roomId: params.roomId },
    include: { sender: { select: { id: true, name: true, profilePhoto: true } } },
    orderBy: { createdAt: 'asc' },
  })

  // Mark messages as read
  await prisma.message.updateMany({
    where: { roomId: params.roomId, senderId: { not: user.id }, read: false },
    data: { read: true },
  })

  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest, { params }: { params: { roomId: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: 'Empty message' }, { status: 400 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const room = await prisma.chatRoom.findUnique({ where: { id: params.roomId } })
  if (!room?.participants.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const message = await prisma.message.create({
    data: { content: content.trim(), roomId: params.roomId, senderId: user.id },
    include: { sender: { select: { id: true, name: true, profilePhoto: true } } },
  })

  // Notify the other participant
  const otherId = room.participants.find((p: string) => p !== user.id)
  if (otherId) {
    await prisma.notification.create({
      data: {
        userId: otherId,
        title: '💬 New Message',
        body: `${user.name}: ${content.trim().slice(0, 60)}${content.trim().length > 60 ? '...' : ''}`,
        link: `/dashboard/chat/${params.roomId}`,
      },
    })
  }

  return NextResponse.json({ message })
}
