'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ListingImage } from '@/components/ui/ListingImage'
import { generateReceipt } from '@/lib/generateReceipt'

export default function SalesHistoryPage() {
  const { data: session } = useSession()
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!session) return
    fetch('/api/purchases?type=seller')
      .then(r => r.json())
      .then(data => {
        const confirmed = (data.purchases || []).filter((p: any) => p.status === 'CONFIRMED' || p.status === 'OFFLINE')
        setSales(confirmed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  const filtered = sales.filter(s =>
    s.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
    s.buyer?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalEarnings = sales.reduce((sum: number, s: any) => sum + (s.price || 0), 0)

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display text-3xl font-bold">Sales History</h1>
        <p className="text-vault-muted text-sm mt-1">{sales.length} total sales</p>
      </div>

      {/* Total earnings card */}
      {sales.length > 0 && (
        <div style={{ background: '#ffffff', border: '1.5px solid #ede8e2', borderRadius: 14, padding: '18px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total Earnings</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #f97316, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ₹{totalEarnings.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>💰</div>
        </div>
      )}

      {/* Search */}
      <input
        className="input"
        placeholder="Search by item or buyer name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 20 }}
      />

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card h-16 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#a89d93' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <p style={{ fontSize: '0.95rem' }}>
            {search ? 'No sales match your search.' : 'No confirmed sales yet.'}
          </p>
          {!search && (
            <Link href="/dashboard/listings" style={{ color: '#f97316', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
              Go to My Listings →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((s: any) => (
            <div key={s.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(234,88,12,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
            >
              {/* Image */}
              <Link href={`/marketplace/${s.listing?.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={s.listing?.images?.[0]} alt="" title={s.listing?.title} category={s.listing?.category} size="sm" />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.listing?.title}
                  </div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem', marginTop: 2 }}>
                    Sold to <span style={{ fontWeight: 600, color: '#574f4a' }}>
                      {s.status === 'OFFLINE' ? (s.offlineBuyerName || 'Unknown') : s.buyer?.name}
                    </span>
                    {s.status === 'OFFLINE' && s.offlineBuyerPhone && (
                      <span style={{ color: '#b8a99a' }}> · {s.offlineBuyerPhone}</span>
                    )}
                  </div>
                  {s.status === 'OFFLINE' && s.notes && (
                    <div style={{ color: '#b8a99a', fontSize: '0.7rem', marginTop: 1, fontStyle: 'italic' }}>"{s.notes}"</div>
                  )}
                  <div style={{ color: '#b8a99a', fontSize: '0.7rem', marginTop: 1 }}>
                    {new Date(s.status === 'OFFLINE' && s.soldDate ? s.soldDate : s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Link>
              {/* Price + Receipt */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#f97316', fontWeight: 700, fontSize: '0.95rem' }}>₹{s.price?.toLocaleString()}</div>
                <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: s.status === 'OFFLINE' ? 'rgba(139,92,246,0.1)' : 'rgba(34,197,94,0.1)', color: s.status === 'OFFLINE' ? '#7c3aed' : '#22c55e', marginTop: 4, display: 'inline-block' }}>
                  {s.status === 'OFFLINE' ? 'Offline' : 'Sold'}
                </div>
                <div>
                  <button
                    onClick={() => generateReceipt({
                      transactionId: s.id,
                      type: s.status === 'OFFLINE' ? 'OFFLINE' : 'SALE',
                      itemTitle: s.listing?.title || 'Item',
                      itemCategory: s.listing?.category || 'Other',
                      price: s.price || 0,
                      sellerName: (session?.user as any)?.name || 'Seller',
                      buyerName: s.status === 'OFFLINE' ? (s.offlineBuyerName || 'Unknown') : (s.buyer?.name || 'Buyer'),
                      date: new Date(s.status === 'OFFLINE' && s.soldDate ? s.soldDate : s.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                      notes: s.notes,
                      phone: s.offlineBuyerPhone,
                    })}
                    style={{ marginTop: 6, fontSize: '0.68rem', padding: '3px 8px', borderRadius: 6, border: '1px solid #ede8e2', background: '#fff', color: '#f97316', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}
                  >
                    🧾 Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
