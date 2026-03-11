import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminPass = await bcrypt.hash('admin123456', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campusvault.edu' },
    update: {},
    create: {
      email: 'admin@campusvault.edu',
      name: 'Admin User',
      password: adminPass,
      role: 'ADMIN',
      isVerified: true,
      department: 'Administration',
      year: 1,
      phone: '+91-9999999999',
    },
  })

  // Demo seller
  const sellerPass = await bcrypt.hash('seller123456', 12)
  const seller = await prisma.user.upsert({
    where: { email: 'arjun@college.edu' },
    update: {},
    create: {
      email: 'arjun@college.edu',
      name: 'Arjun Sharma',
      password: sellerPass,
      role: 'SELLER',
      isVerified: true,
      department: 'Computer Science',
      year: 3,
      phone: '+91-9876543210',
    },
  })

  // Demo buyer
  const buyerPass = await bcrypt.hash('buyer123456', 12)
  await prisma.user.upsert({
    where: { email: 'priya@college.edu' },
    update: {},
    create: {
      email: 'priya@college.edu',
      name: 'Priya Patel',
      password: buyerPass,
      role: 'BUYER',
      isVerified: true,
      department: 'Electronics',
      year: 2,
      phone: '+91-9123456789',
    },
  })

  // Demo listings
  const listings = [
    {
      title: 'VLSI Design by Neil Weste - 4th Edition',
      description: 'Excellent condition, used for just one semester. No highlights.',
      price: 350, condition: 'LIKE_NEW' as const, category: 'Textbooks',
      images: ['https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&q=80&fit=crop&auto=format'],
      isRentable: true, rentalPrice: 30, deposit: 100, status: 'ACTIVE' as const,
    },
    {
      title: 'Casio FX-991EX Scientific Calculator',
      description: 'Works perfectly. Original box included.',
      price: 800, condition: 'USED' as const, category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1564473185935-58de66a5cf15?w=600&q=80&fit=crop&auto=format'],
      isRentable: true, rentalPrice: 50, deposit: 200, status: 'ACTIVE' as const,
    },
    {
      title: 'Single Room Study Desk with Chair',
      description: 'Solid wood desk, very sturdy. Chair has minor scratches.',
      price: 1200, condition: 'USED' as const, category: 'Hostel Essentials',
      images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80&fit=crop&auto=format'],
      isRentable: false, status: 'ACTIVE' as const,
    },
    {
      title: 'Data Structures & Algorithms - Multiple Books',
      description: 'Bundle: CLRS + Skiena + GeeksForGeeks notes. All in good condition.',
      price: 650, condition: 'USED' as const, category: 'Textbooks',
      images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80&fit=crop&auto=format'],
      isRentable: true, rentalPrice: 40, status: 'ACTIVE' as const, isUrgent: true,
    },
    {
      title: 'HP EliteBook Laptop Bag',
      description: 'Fits 15.6 inch laptops. Waterproof. Used for 6 months.',
      price: 400, condition: 'LIKE_NEW' as const, category: 'Electronics',
      images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80&fit=crop&auto=format'],
      isRentable: false, status: 'ACTIVE' as const,
    },
  ]

  for (const listing of listings) {
    await prisma.listing.create({ data: { ...listing, sellerId: seller.id } })
  }

  // Demo service
  await prisma.service.create({
    data: {
      title: 'Python & Data Science Tutoring',
      description: 'I can help with Python, NumPy, Pandas, ML basics. Available evenings and weekends.',
      hourlyPrice: 200,
      category: 'Tutoring',
      providerId: seller.id,
    }
  })

  console.log('✅ Seeding complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:  admin@campusvault.edu / admin123456')
  console.log('  Seller: arjun@college.edu / seller123456')
  console.log('  Buyer:  priya@college.edu / buyer123456')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
