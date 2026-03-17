import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const reportSchema = z.object({
  reportedId: z.string(),
  reason: z.enum(['SCAM', 'FAKE_ITEM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'OTHER']),
  description: z.string().optional(),
  listingId: z.string().optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = reportSchema.parse(body)
    const reporter = await prisma.user.findUnique({ where: { email: session.user.email! } })
    if (!reporter) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const report = await prisma.report.create({ data: { ...data, reporterId: reporter.id } })

    // Auto-delete rule: 3+ total reports → delete account
    const reportCount = await prisma.report.count({ where: { reportedId: data.reportedId } })
    if (reportCount >= 3) {
      await prisma.user.delete({ where: { id: data.reportedId } })
    }

    return NextResponse.json({ success: true, report })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
