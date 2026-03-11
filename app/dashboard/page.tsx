'use client'
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

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #ede8e2', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: color || '#f97316' }}>{value ?? '—'}</div>
      <div style={{ color: '#a89d93', fontSize: '0.8rem', fontWeight: 500 }}>{label}</div>
      {sub && <div style={{ color: '#92817a', fontSize: '0.72rem' }}>{sub}</div>}
    </div>
  )
}

function QuickAction({ href, icon, label, desc, color, colorMuted }) {
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
  const [stats, setStats] = useState({ listings: 0, rentals: 0, activeRentals: 0, messages: 0, purchases: 0, wishlist: 0 })
  const [recentListings, setRecentListings] = useState([])
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([])
  const [confirmedPurchases, setConfirmedPurchases] = useState<any[]>([])
  const [wishlistItems, setWishlistItems] = useState<any[]>([])
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState(null)

  const user = session?.user
  const role = user?.role || 'BUYER'
  const theme = ROLE_THEME[role] || ROLE_THEME.BUYER
  const firstName = user?.name?.split(' ')[0] ?? 'Student'

  const fetchData = useCallback(async () => {
    try {
      const [listRes, rentalRes] = await Promise.all([
        fetch('/api/listings?limit=50'),
        fetch('/api/rentals'),
      ])
      const listData = await listRes.json()
      const rentalData = await rentalRes.json()

      const myListings = listData.listings?.filter(l => l.seller?.name === user?.name) || []
      const rentals = rentalData.rentals || []

      // Fetch purchases and wishlist for buyers
      let purchases: any[] = []
      let wishlist: any[] = []
      if (role === 'BUYER') {
        const [purchaseRes, wishlistRes] = await Promise.all([
          fetch('/api/purchases?type=buyer'),
          fetch('/api/wishlist'),
        ])
        const purchaseData = await purchaseRes.json()
        const wishlistData = await wishlistRes.json()
        purchases = purchaseData.purchases || []
        wishlist = wishlistData.wishlist || []
      }

      // Fetch sales history for sellers
      let sales: any[] = []
      if (role === 'SELLER') {
        const salesRes = await fetch('/api/purchases?type=seller')
        const salesData = await salesRes.json()
        sales = (salesData.purchases || []).filter((p: any) => p.status === 'CONFIRMED' || p.status === 'OFFLINE')
      }

      const pending = purchases.filter(p => p.status === 'PENDING')
      const confirmed = purchases.filter(p => p.status === 'CONFIRMED')

      setStats({
        listings: myListings.length,
        rentals: rentals.length,
        activeRentals: rentals.filter(r => r.status === 'ACTIVE').length,
        messages: 0,
        purchases: confirmed.length,
        wishlist: wishlist.length,
      })
      setPendingPurchases(pending)
      setConfirmedPurchases(confirmed)
      setWishlistItems(wishlist.slice(0, 4))
      setSalesHistory(sales.slice(0, 3))
      setRecentListings(myListings.slice(0, 3))
      setLastUpdated(new Date())
    } catch {}
  }, [user?.name, role])

  useEffect(() => {
    if (user?.name) {
      fetchData()
      const id = setInterval(fetchData, 10000)
      return () => clearInterval(id)
    }
  }, [fetchData])

  const handlePurchaseAction = async (purchaseId: string, action: 'confirm' | 'decline') => {
    try {
      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (!res.ok) throw new Error()
      fetchData()
    } catch {}
  }

  const ROLE_CONTENT = {
    BUYER: {
      greeting: `Ready to find a deal, ${firstName}?`,
      sub: "Browse verified listings from students on your campus.",
      stats: [
        { icon: '🛍️', label: 'Items Purchased', value: stats.purchases, color: theme.color },
        { icon: '♥', label: 'Saved Items', value: stats.wishlist, color: theme.color },
        { icon: '📦', label: 'Active Rentals', value: stats.activeRentals, color: theme.color },
      ],
      actions: [
        { href: '/marketplace', icon: '🛍️', label: 'Browse Marketplace', desc: 'Find textbooks, electronics and more at student prices.' },
        { href: '/marketplace?rentable=true', icon: '🔄', label: 'Rent an Item', desc: 'Short-term rentals for exam season and projects.' },
        { href: '/services', icon: '🎓', label: 'Campus Services', desc: 'Hire tutors, get tech help, find notes.' },
      ],
    },
    SELLER: {
      greeting: `Manage your shop, ${firstName}.`,
      sub: "Your listings, rentals, and earnings — all in one place.",
      stats: [
        { icon: '📋', label: 'My Listings', value: stats.listings, color: theme.color },
        { icon: '✅', label: 'Items Sold', value: salesHistory.length, color: theme.color },
        { icon: '🔄', label: 'Active Rentals', value: stats.activeRentals, color: theme.color },
      ],
      actions: [
        { href: '/dashboard/listings/new', icon: '➕', label: 'Post New Item', desc: 'List something to sell or rent to campus students.' },
        { href: '/dashboard/listings', icon: '📋', label: 'Manage Listings', desc: 'Edit, remove or mark items as sold.' },
        { href: '/dashboard/rentals', icon: '🔄', label: 'Track Rentals', desc: 'See who has your items and when they return.' },
      ],
    },
    SERVICE_PROVIDER: {
      greeting: `Your services, ${firstName}.`,
      sub: "Monetise your skills for fellow students.",
      stats: [
        { icon: '🔧', label: 'Active Services', value: stats.listings, color: theme.color },
        { icon: '💬', label: 'Conversations', value: stats.messages, color: theme.color },
        { icon: '⭐', label: 'Avg Rating', value: '—', color: theme.color },
      ],
      actions: [
        { href: '/dashboard/services', icon: '🎓', label: 'My Services', desc: 'View and manage the services you offer.' },
        { href: '/services', icon: '🔍', label: 'Browse Services', desc: 'See what other providers are offering on campus.' },
        { href: '/dashboard/chat', icon: '💬', label: 'Check Messages', desc: 'Respond to students requesting your services.' },
      ],
    },
    ADMIN: {
      greeting: `Platform overview, ${firstName}.`,
      sub: "Monitor activity, approve listings, and handle reports.",
      stats: [
        { icon: '📋', label: 'Total Listings', value: stats.listings, color: theme.color },
        { icon: '🔄', label: 'Total Rentals', value: stats.rentals, color: theme.color },
        { icon: '⚙️', label: 'Admin Mode', value: 'ON', color: theme.color },
      ],
      actions: [
        { href: '/admin', icon: '⚙️', label: 'Admin Panel', desc: 'Approve listings, resolve reports, ban users.' },
        { href: '/dashboard/listings', icon: '📋', label: 'All Listings', desc: 'See every listing across all sellers.' },
        { href: '/dashboard/chat', icon: '💬', label: 'Messages', desc: 'Check conversations and moderate if needed.' },
      ],
    },
  }

  const content = ROLE_CONTENT[role] || ROLE_CONTENT.BUYER

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 860 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 5 }}>
              {content.greeting}
            </h1>
            <p style={{ color: '#78716c', fontSize: '0.88rem' }}>{content.sub}</p>
          </div>
          {/* Role badge */}
          <div style={{ padding: '6px 14px', borderRadius: 99, background: theme.muted, border: `1px solid ${theme.border}`, color: theme.color, fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
            {session?.user?.role === 'SERVICE_PROVIDER' ? '🎓 Provider' : `${['🛍️','💰','⚙️'][['BUYER','SELLER','ADMIN'].indexOf(role)] ?? '👤'} ${role?.charAt(0) + role?.slice(1).toLowerCase()}`}
          </div>
        </div>
        {lastUpdated && (
          <p style={{ color: '#374151', fontSize: '0.72rem', marginTop: 8 }}>
            ● Live — last updated {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {content.stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick Actions */}
      <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
        Quick Actions
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 32 }}>
        {content.actions.map(a => (
          <QuickAction key={a.href} {...a} color={theme.color} colorMuted={theme.muted} />
        ))}
      </div>

      {/* Saved / Wishlist (buyer only) */}
      {role === 'BUYER' && wishlistItems.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ♥ Saved Items
            </h2>
            <Link href="/marketplace" style={{ color: theme.color, fontSize: '0.78rem', textDecoration: 'none' }}>Browse more →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wishlistItems.map((w: any) => (
              <Link key={w.id} href={`/marketplace/${w.listing?.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={w.listing?.images?.[0]} alt="" title={w.listing?.title} category={w.listing?.category} size="sm" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.listing?.title}</div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem' }}>{w.listing?.category} • {w.listing?.seller?.name}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: theme.color, fontWeight: 700, fontSize: '0.9rem' }}>₹{w.listing?.price?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: w.listing?.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: w.listing?.status === 'ACTIVE' ? '#22c55e' : '#eab308', marginTop: 3 }}>
                    {w.listing?.status === 'ACTIVE' ? 'Available' : w.listing?.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pending Purchase Requests (buyer only) */}
      {role === 'BUYER' && pendingPurchases.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>
            ⏳ Pending Purchase Requests
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingPurchases.map((p: any) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid rgba(234,88,12,0.25)' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={p.listing?.images?.[0]} alt="" title={p.listing?.title} category={p.listing?.category} size="sm" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.listing?.title}</div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem' }}>From {p.seller?.name} • ₹{p.price?.toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handlePurchaseAction(p.id, 'confirm')}
                    style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    Confirm
                  </button>
                  <button onClick={() => handlePurchaseAction(p.id, 'decline')}
                    style={{ padding: '6px 14px', borderRadius: 8, border: '1.5px solid #fca5a5', background: 'transparent', color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Purchases (buyer only) */}
      {role === 'BUYER' && confirmedPurchases.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              🛍️ My Purchases
            </h2>
            <Link href="/dashboard/purchases" style={{ color: theme.color, fontSize: '0.78rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {confirmedPurchases.slice(0, 3).map((p: any) => (
              <Link key={p.id} href={`/marketplace/${p.listing?.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={p.listing?.images?.[0]} alt="" title={p.listing?.title} category={p.listing?.category} size="sm" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.listing?.title}</div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem' }}>
                    {p.listing?.category} • {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: theme.color, fontWeight: 700, fontSize: '0.9rem' }}>₹{p.price?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginTop: 3 }}>Purchased</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sales History (seller only) */}
      {role === 'SELLER' && salesHistory.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              ✅ Sales History
            </h2>
            <Link href="/dashboard/sales" style={{ color: theme.color, fontSize: '0.78rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {salesHistory.map((s: any) => (
              <Link key={s.id} href={`/marketplace/${s.listing?.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={s.listing?.images?.[0]} alt="" title={s.listing?.title} category={s.listing?.category} size="sm" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.listing?.title}</div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem' }}>
                    Sold to {s.buyer?.name} • {new Date(s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: theme.color, fontWeight: 700, fontSize: '0.9rem' }}>₹{s.price?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginTop: 3 }}>Sold</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent listings (seller/admin only) */}
      {(role === 'SELLER' || role === 'ADMIN') && recentListings.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Recent Listings</h2>
            <Link href="/dashboard/listings" style={{ color: theme.color, fontSize: '0.78rem', textDecoration: 'none' }}>View all →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recentListings.map((l) => (
              <Link key={l.id} href={`/marketplace/${l.id}`} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = theme.border}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={l.images?.[0]} alt="" title={l.title} category={l.category} size="sm" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem' }}>{l.category}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ color: theme.color, fontWeight: 700, fontSize: '0.9rem' }}>₹{l.price?.toLocaleString()}</div>
                  <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: l.status === 'ACTIVE' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)', color: l.status === 'ACTIVE' ? '#22c55e' : '#eab308', marginTop: 3 }}>{l.status}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
