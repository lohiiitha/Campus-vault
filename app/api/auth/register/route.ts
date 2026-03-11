import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7),
  department: z.string().min(2),
  year: z.number().min(1).max(6),
  role: z.enum(['BUYER', 'SELLER', 'SERVICE_PROVIDER']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = registerSchema.parse(body)

    // Check college email
    const allowedDomains = ['.edu', 'ac.in', 'edu.in', 'college.edu']
    const isCollegeEmail = allowedDomains.some(d => data.email.includes(d))
    // For development, allow all emails — remove this in production:
    // if (!isCollegeEmail) return NextResponse.json({ error: 'Please use your college email address.' }, { status: 400 })

    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) return NextResponse.json({ error: 'Email already registered.' }, { status: 409 })

    const hashed = await bcrypt.hash(data.password, 12)
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashed,
        phone: data.phone,
        department: data.department,
        year: data.year,
        role: data.role,
        isVerified: true, // Auto-verify for now; add OTP email flow as needed
      },
    })

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (err: any) {
    if (err.name === 'ZodError') return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 })
  }
}
