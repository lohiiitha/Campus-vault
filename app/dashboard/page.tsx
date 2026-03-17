'use client'
import React from "react"
import { useSession } from 'next-auth/react'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { ListingImage } from '@/components/ui/ListingImage'

const ROLE_THEME = {
  BUYER:            { color: '#3b82f6', muted: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)'  },
  SELLER:           { color: '#f97316', muted: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.2)'  },
  SERVICE_PROVIDER: { color: '#a855f7', muted: 'rgba(168,85,247,0.1)',  border: 'rgba(168,85,247,0.2)'  },
  ADMIN:            { color: '#ef4444', muted: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)'   },
}

// ✅ FIXED TYPES
type StatCardProps = {
  icon: React.ReactNode
  label: string
  value: string | number
  sub?: string
  color?: string
}

function StatCard({ icon, label, value, sub, color }: StatCardProps) {
  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #ede8e2', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: color || '#f97316' }}>{value ?? '—'}</div>
      <div style={{ color: '#a89d93', fontSize: '0.8rem', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color: '#92817a', fontSize: '0.72rem' }}>{sub}</div>}
    </div>
  )
}

type QuickActionProps = {
  href: string
  icon: React.ReactNode
  label: string
  desc: string
  color: string
  colorMuted: string
}

function QuickAction({ href, icon, label, desc, color, colorMuted }: QuickActionProps) {
  return (
    <Link href={href} style={{ display: 'block', textDecoration: 'none', background: colorMuted, border: `1px solid ${color}33`, borderRadius: 14, padding: '18px 20px', transition: 'all 0.2s ease' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${color}22` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#78716c', fontSize: '0.78rem', lineHeight: 1.5 }}>{desc}</div>
      <div style={{ color: color, fontSize: '0.8rem', fontWeight: 600, marginTop: 12 }}>Go →</div>
    </Link>
  )
}

export default function DashboardPage() {
  const { data: session } = useSession()

  const [stats, setStats] = useState({
    listings: 0,
    rentals: 0,
    activeRentals: 0,
    messages: 0,
    purchases: 0,
    wishlist: 0
  })

  const [recentListings, setRecentListings] = useState<any[]>([])
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([])
  const [confirmedPurchases, setConfirmedPurchases] = useState<any[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const user = session?.user
  const role = (user as any)?.role || 'BUYER'
  const theme = ROLE_THEME[role as keyof typeof ROLE_THEME] || ROLE_THEME.BUYER
  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  const fetchData = useCallback(async () => {
    try {
      const [listRes, rentalRes] = await Promise.all([
        fetch('/api/listings?limit=50'),
        fetch('/api/rentals'),
      ])

      const listData = await listRes.json()
      const rentalData = await rentalRes.json()

      const myListings = listData.listings?.filter((l: any) => l.seller?.name === user?.name) || []
      const rentals = rentalData.rentals || []

      setStats({
        listings: myListings.length,
        rentals: rentals.length,
        activeRentals: rentals.filter((r: any) => r.status === 'ACTIVE').length,
        messages: 0,
        purchases: 0,
        wishlist: 0,
      })

      setRecentListings(myListings.slice(0, 3))
      setLastUpdated(new Date())
    } catch {}
  }, [user?.name])

  useEffect(() => {
    if (user?.name) {
      fetchData()
      const id = setInterval(fetchData, 10000)
      return () => clearInterval(id)
    }
  }, [fetchData])

  const content = {
    greeting: `Welcome back, ${firstName}`,
    sub: "Your dashboard overview",
    stats: [
      { icon: '📋', label: 'Listings', value: stats.listings, color: theme.color },
      { icon: '🔄', label: 'Rentals', value: stats.activeRentals, color: theme.color },
      { icon: '📦', label: 'Total Rentals', value: stats.rentals, color: theme.color },
    ],
    actions: [
      { href: '/marketplace', icon: '🛍️', label: 'Browse', desc: 'Explore listings' },
      { href: '/dashboard/listings', icon: '📋', label: 'My Listings', desc: 'Manage your items' },
      { href: '/dashboard/chat', icon: '💬', label: 'Messages', desc: 'Check chats' },
    ],
  }

  return (
    <div style={{ padding: 28, maxWidth: 860 }}>
      <h1>{content.greeting}</h1>
      <p>{content.sub}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
        {content.stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      <div style={{ marginTop: 24 }}>
        {content.actions.map(a => (
          <QuickAction key={a.href} {...a} color={theme.color} colorMuted={theme.muted} />
        ))}
      </div>
    </div>
  )
}