'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { ListingImage } from '@/components/ui/ListingImage'
import toast from 'react-hot-toast'

export default function MyListingsPage() {
  const { data: session } = useSession()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Mark as Sold modal state
  const [soldModal, setSoldModal] = useState<{ listing: any } | null>(null)
  const [soldMode, setSoldMode] = useState<'choose' | 'online' | 'offline'>('choose')
  const [chatBuyers, setChatBuyers] = useState<any[]>([])
  const [selectedBuyer, setSelectedBuyer] = useState('')
  const [markingLoading, setMarkingLoading] = useState(false)
  const [offlineForm, setOfflineForm] = useState({ offlineBuyerName: '', offlineBuyerPhone: '', soldDate: new Date().toISOString().split('T')[0], notes: '' })

  const fetchListings = async () => {
    const res = await fetch('/api/listings?limit=100')
    const data = await res.json()
    const mine = data.listings?.filter((l: any) => l.seller?.name === session?.user?.name) || []
    setListings(mine)
    setLoading(false)
  }

  useEffect(() => { if (session) fetchListings() }, [session])

  const deleteListing = async (id: string) => {
    if (!confirm('Remove this listing?')) return
    const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Listing removed'); fetchListings() }
    else toast.error('Failed')
  }

  // Open Mark as Sold modal — load chat participants for this listing's seller
  const openSoldModal = async (listing: any) => {
    setSoldModal({ listing })
    setSoldMode('choose')
    setSelectedBuyer('')
    setOfflineForm({ offlineBuyerName: '', offlineBuyerPhone: '', soldDate: new Date().toISOString().split('T')[0], notes: '' })
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      // Extract the other participant from each room (not the current seller)
      const userId = (session?.user as any)?.id
      const buyers: any[] = []
      for (const room of data.rooms || []) {
        const otherId = room.participants?.find((p: string) => p !== userId)
        if (otherId) {
          // We only have the id here; fetch name from messages sender info
          const lastMsg = room.messages?.[0]
          const otherName = lastMsg?.sender?.name && lastMsg.sender.id !== userId
            ? lastMsg.sender.name
            : null
          if (otherId && !buyers.find(b => b.id === otherId)) {
            buyers.push({ id: otherId, name: otherName || `User (${otherId.slice(0, 6)})` })
          }
        }
      }
      setChatBuyers(buyers)
    } catch {
      setChatBuyers([])
    }
  }

  const submitMarkAsSold = async () => {
    if (!selectedBuyer || !soldModal) return
    setMarkingLoading(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: soldModal.listing.id, buyerId: selectedBuyer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Purchase request sent to buyer!')
      setSoldModal(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request')
    } finally {
      setMarkingLoading(false)
    }
  }

  const submitOfflineSale = async () => {
    if (!soldModal) return
    setMarkingLoading(true)
    try {
      const res = await fetch('/api/purchases/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: soldModal.listing.id, ...offlineForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Item marked as sold!')
      setSoldModal(null)
      fetchListings()
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setMarkingLoading(false)
    }
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'badge-green', PENDING: 'badge-yellow', SOLD: 'badge-blue',
    RENTED: 'badge-purple', REMOVED: 'badge-red',
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">My Listings</h1>
          <p className="text-vault-muted text-sm mt-1">{listings.length} total listings</p>
        </div>
        <Link href="/dashboard/listings/new" className="btn-primary">+ New Listing</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-20 rounded-xl animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-12 rounded-xl text-center">
          <div className="text-5xl mb-4">📦</div>
          <p className="text-vault-muted mb-4">You haven't listed anything yet.</p>
          <Link href="/dashboard/listings/new" className="btn-primary">Create your first listing</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing: any) => (
            <div key={listing.id} className="card p-4 rounded-xl flex items-center gap-4">
              <div style={{ width: 64, height: 64, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#f5f0eb' }}>
                <ListingImage src={listing.images?.[0]} alt="" title={listing.title} category={listing.category} size="sm" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{listing.title}</div>
                <div className="text-vault-muted text-xs mt-0.5">{listing.category} • {listing.condition}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge text-xs ${statusColor[listing.status]}`}>{listing.status}</span>
                  {listing.isUrgent && <span className="badge badge-red text-xs">⚡ Urgent</span>}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-gradient">₹{listing.price.toLocaleString()}</div>
                <div className="text-xs text-vault-muted mt-0.5">{listing.views} views</div>
                <div className="flex gap-2 mt-2 justify-end">
                  <Link href={`/marketplace/${listing.id}`} className="text-xs text-blue-600 hover:text-blue-700">View</Link>
                  {listing.status === 'ACTIVE' && (
                    <button onClick={() => openSoldModal(listing)} className="text-xs text-green-600 hover:text-green-700 font-medium">
                      Mark Sold
                    </button>
                  )}
                  <button onClick={() => deleteListing(listing.id)} className="text-xs text-red-600 hover:text-red-700">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mark as Sold Modal */}
      {soldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>Mark as Sold</h2>
            <p style={{ color: '#78716c', fontSize: '0.82rem', marginBottom: 20 }}>
              <strong>{soldModal.listing.title}</strong> — how was it sold?
            </p>

            {/* Step 1 — Choose mode */}
            {soldMode === 'choose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={async () => {
                  setSoldMode('online')
                  try {
                    const res = await fetch('/api/chat')
                    const data = await res.json()
                    const userId = (session?.user as any)?.id
                    const buyers: any[] = []
                    for (const room of data.rooms || []) {
                      const otherId = room.participants?.find((p: string) => p !== userId)
                      if (otherId) {
                        const lastMsg = room.messages?.[0]
                        const otherName = lastMsg?.sender?.name && lastMsg.sender.id !== userId ? lastMsg.sender.name : null
                        if (!buyers.find(b => b.id === otherId)) buyers.push({ id: otherId, name: otherName || `User (${otherId.slice(0, 6)})` })
                      }
                    }
                    setChatBuyers(buyers)
                  } catch { setChatBuyers([]) }
                }}
                  style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e2dbd4', background: '#faf9f7', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: 3 }}>📱 Sold on Platform</div>
                  <div style={{ fontSize: '0.78rem', color: '#92817a' }}>Buyer is on Campus Vault — send them a confirmation request</div>
                </button>
                <button onClick={() => setSoldMode('offline')}
                  style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e2dbd4', background: '#faf9f7', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: 3 }}>🤝 Sold Offline / Face-to-Face</div>
                  <div style={{ fontSize: '0.78rem', color: '#92817a' }}>Exchange happened in person — record the details and mark as sold instantly</div>
                </button>
                <button onClick={() => setSoldModal(null)}
                  style={{ padding: '10px', borderRadius: 10, border: '1.5px solid #e2dbd4', background: 'transparent', color: '#78716c', cursor: 'pointer', fontSize: '0.85rem', marginTop: 4 }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Step 2a — Online: pick buyer from chat */}
            {soldMode === 'online' && (
              <>
                <button onClick={() => setSoldMode('choose')} style={{ background: 'none', border: 'none', color: '#92817a', fontSize: '0.8rem', cursor: 'pointer', marginBottom: 14, padding: 0 }}>← Back</button>
                <p style={{ color: '#78716c', fontSize: '0.82rem', marginBottom: 12 }}>Select who you sold it to — a confirmation request will be sent to them.</p>
                {chatBuyers.length === 0 ? (
                  <p style={{ color: '#a89d93', fontSize: '0.85rem', marginBottom: 20 }}>No chat participants found. The buyer must have chatted with you first.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {chatBuyers.map(b => (
                      <button key={b.id} onClick={() => setSelectedBuyer(b.id)}
                        style={{ padding: '10px 14px', borderRadius: 10, textAlign: 'left', cursor: 'pointer', border: `1.5px solid ${selectedBuyer === b.id ? '#ea580c' : '#e2dbd4'}`, background: selectedBuyer === b.id ? 'rgba(234,88,12,0.06)' : '#faf9f7', color: selectedBuyer === b.id ? '#ea580c' : '#574f4a', fontWeight: selectedBuyer === b.id ? 600 : 400, fontSize: '0.88rem', transition: 'all 0.14s' }}>
                        👤 {b.name}
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setSoldModal(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2dbd4', background: '#faf9f7', color: '#574f4a', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>Cancel</button>
                  <button onClick={submitMarkAsSold} disabled={!selectedBuyer || markingLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: selectedBuyer ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#e2dbd4', color: selectedBuyer ? '#fff' : '#a89d93', cursor: selectedBuyer ? 'pointer' : 'not-allowed', fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.14s' }}>
                    {markingLoading ? 'Sending...' : 'Send Request'}
                  </button>
                </div>
              </>
            )}

            {/* Step 2b — Offline form */}
            {soldMode === 'offline' && (
              <>
                <button onClick={() => setSoldMode('choose')} style={{ background: 'none', border: 'none', color: '#92817a', fontSize: '0.8rem', cursor: 'pointer', marginBottom: 14, padding: 0 }}>← Back</button>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#574f4a', display: 'block', marginBottom: 5 }}>Buyer's Name</label>
                    <input className="input" placeholder="e.g. Rahul Sharma" value={offlineForm.offlineBuyerName}
                      onChange={e => setOfflineForm({ ...offlineForm, offlineBuyerName: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#574f4a', display: 'block', marginBottom: 5 }}>Phone Number <span style={{ fontWeight: 400, color: '#a89d93' }}>(optional)</span></label>
                    <input className="input" placeholder="e.g. 9876543210" value={offlineForm.offlineBuyerPhone}
                      onChange={e => setOfflineForm({ ...offlineForm, offlineBuyerPhone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#574f4a', display: 'block', marginBottom: 5 }}>Date of Sale</label>
                    <input className="input" type="date" value={offlineForm.soldDate}
                      onChange={e => setOfflineForm({ ...offlineForm, soldDate: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#574f4a', display: 'block', marginBottom: 5 }}>Notes <span style={{ fontWeight: 400, color: '#a89d93' }}>(optional)</span></label>
                    <input className="input" placeholder='e.g. "Paid cash", "Still owes ₹50"' value={offlineForm.notes}
                      onChange={e => setOfflineForm({ ...offlineForm, notes: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setSoldModal(null)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2dbd4', background: '#faf9f7', color: '#574f4a', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>Cancel</button>
                  <button onClick={submitOfflineSale} disabled={markingLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600 }}>
                    {markingLoading ? 'Saving...' : '✓ Mark as Sold'}
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
