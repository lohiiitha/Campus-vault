'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ListingImage } from '@/components/ui/ListingImage'
import { generateReceipt } from '@/lib/generateReceipt'

export default function MyPurchasesPage() {
  const { data: session } = useSession()
  const [purchases, setPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!session) return
    fetch('/api/purchases?type=buyer')
      .then(r => r.json())
      .then(data => {
        const confirmed = (data.purchases || []).filter((p: any) => p.status === 'CONFIRMED')
        setPurchases(confirmed)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [session])

  const filtered = purchases.filter(p =>
    p.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.seller?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const totalSpent = purchases.reduce((sum: number, p: any) => sum + (p.price || 0), 0)

  return (
    <div className="p-6 max-w-3xl">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display text-3xl font-bold">My Purchases</h1>
        <p className="text-vault-muted text-sm mt-1">{purchases.length} total purchases</p>
      </div>

      {/* Total spent card */}
      {purchases.length > 0 && (
        <div style={{ background: '#ffffff', border: '1.5px solid #ede8e2', borderRadius: 14, padding: '18px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#a89d93', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Total Spent</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              ₹{totalSpent.toLocaleString()}
            </div>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🛍️</div>
        </div>
      )}

      {/* Search */}
      <input
        className="input"
        placeholder="Search by item or seller name..."
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
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>🛍️</div>
          <p style={{ fontSize: '0.95rem' }}>
            {search ? 'No purchases match your search.' : 'No confirmed purchases yet.'}
          </p>
          {!search && (
            <Link href="/marketplace" style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none', marginTop: 8, display: 'inline-block' }}>
              Browse Marketplace →
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((p: any) => (
            <div key={p.id}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#ffffff', border: '1.5px solid #ede8e2', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#ede8e2'}
            >
              <Link href={`/marketplace/${p.listing?.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
                {/* Image */}
                <div style={{ width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                  <ListingImage src={p.listing?.images?.[0]} alt="" title={p.listing?.title} category={p.listing?.category} size="sm" />
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#1a1a2e', fontSize: '0.88rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.listing?.title}
                  </div>
                  <div style={{ color: '#92817a', fontSize: '0.75rem', marginTop: 2 }}>
                    Bought from <span style={{ fontWeight: 600, color: '#574f4a' }}>{p.seller?.name}</span>
                  </div>
                  <div style={{ color: '#b8a99a', fontSize: '0.7rem', marginTop: 1 }}>
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Link>
              {/* Price + Receipt */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ color: '#2563eb', fontWeight: 700, fontSize: '0.95rem' }}>₹{p.price?.toLocaleString()}</div>
                <div style={{ fontSize: '0.68rem', padding: '2px 8px', borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#22c55e', marginTop: 4, display: 'inline-block' }}>
                  Purchased
                </div>
                <div>
                  <button
                    onClick={() => generateReceipt({
                      transactionId: p.id,
                      type: 'PURCHASE',
                      itemTitle: p.listing?.title || 'Item',
                      itemCategory: p.listing?.category || 'Other',
                      price: p.price || 0,
                      sellerName: p.seller?.name || 'Seller',
                      buyerName: (session?.user as any)?.name || 'Buyer',
                      date: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
                    })}
                    style={{ marginTop: 6, fontSize: '0.68rem', padding: '3px 8px', borderRadius: 6, border: '1px solid #ede8e2', background: '#fff', color: '#2563eb', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}
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
