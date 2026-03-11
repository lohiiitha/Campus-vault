import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

// Server-Sent Events endpoint — clients poll this for live counts
// Supports 50+ concurrent users because each response is lightweight
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const [activeListings, activeRentals, recentCount] = await Promise.all([
          prisma.listing.count({ where: { status: 'ACTIVE' } }),
          prisma.rental.count({ where: { status: 'ACTIVE' } }),
          prisma.listing.count({ where: { createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) } } }),
        ])

        send({ activeListings, activeRentals, recentCount, ts: Date.now() })
      } catch {
        send({ error: true, ts: Date.now() })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
