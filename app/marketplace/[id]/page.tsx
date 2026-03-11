'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ListingImage } from '@/components/ui/ListingImage'
import toast from 'react-hot-toast'

export default function ListingDetailPage() {
  const { id } = useParams()
  const { data: session } = useSession()
  const router = useRouter()
  const [listing, setListing] = useState<any>(null)
  const [priceInsight, setPriceInsight] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImg, setActiveImg] = useState(0)
  const [rental, setRental] = useState({ startDate: '', endDate: '' })
  const [rating, setRating] = useState({ score: 5, review: '' })
  const [showRentForm, setShowRentForm] = useState(false)
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState('SCAM')
  const [showSoldModal, setShowSoldModal] = useState(false)
  const [soldMode, setSoldMode] = useState<'choose' | 'online' | 'offline'>('choose')
  const [chatBuyers, setChatBuyers] = useState<any[]>([])
  const [selectedBuyer, setSelectedBuyer] = useState('')
  const [markingLoading, setMarkingLoading] = useState(false)
  const [offlineForm, setOfflineForm] = useState({ offlineBuyerName: '', offlineBuyerPhone: '', soldDate: new Date().toISOString().split('T')[0], notes: '' })
  const [wishlisted, setWishlisted] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(r => r.json())
      .then(d => {
        setListing(d.listing)
        setPriceInsight(d.priceInsight)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!session || !id) return
    fetch('/api/wishlist')
      .then(r => r.json())
      .then(d => {
        const saved = d.wishlist?.some((w: any) => w.listingId === id)
        setWishlisted(!!saved)
      })
      .catch(() => {})
  }, [session, id])

  const startChat = async () => {
    if (!session) return router.push('/login')
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otherUserId: listing.seller.id }),
    })
    const data = await res.json()
    if (data.room) router.push(`/dashboard/chat/${data.room.id}`)
  }

  const handleRent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) return router.push('/login')
    const res = await fetch('/api/rentals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listingId: id, ...rental }),
    })
    const data = await res.json()
    if (!res.ok) return toast.error(data.error)
    toast.success('Rental confirmed!')
    router.push('/dashboard/rentals')
  }

  const handleReport = async () => {
    if (!session) return router.push('/login')
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportedId: listing.seller.id, reason: reportReason, listingId: id }),
    })
    if (res.ok) { toast.success('Report submitted.'); setShowReport(false) }
    else toast.error('Failed to submit report')
  }

  const toggleWishlist = async () => {
    if (!session) return router.push('/login')
    setWishlistLoading(true)
    try {
      if (wishlisted) {
        await fetch('/api/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: id }),
        })
        setWishlisted(false)
        toast.success('Removed from wishlist')
      } else {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ listingId: id }),
        })
        setWishlisted(true)
        toast.success('Saved to wishlist!')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setWishlistLoading(false)
    }
  }

  const openSoldModal = async () => {
    setShowSoldModal(true)
    setSoldMode('choose')
    setSelectedBuyer('')
    setOfflineForm({ offlineBuyerName: '', offlineBuyerPhone: '', soldDate: new Date().toISOString().split('T')[0], notes: '' })
    try {
      const res = await fetch('/api/chat')
      const data = await res.json()
      const userId = (session?.user as any)?.id
      const buyers: any[] = []
      for (const room of data.rooms || []) {
        const otherId = room.participants?.find((p: string) => p !== userId)
        const lastMsg = room.messages?.[0]
        const otherName = lastMsg?.sender?.name && lastMsg.sender.id !== userId ? lastMsg.sender.name : null
        if (otherId && !buyers.find(b => b.id === otherId)) {
          buyers.push({ id: otherId, name: otherName || `User (${otherId.slice(0, 6)})` })
        }
      }
      setChatBuyers(buyers)
    } catch {
      setChatBuyers([])
    }
  }

  const submitMarkAsSold = async () => {
    if (!selectedBuyer) return
    setMarkingLoading(true)
    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, buyerId: selectedBuyer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Purchase request sent to buyer!')
      setShowSoldModal(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to send request')
    } finally {
      setMarkingLoading(false)
    }
  }

  const submitOfflineSale = async () => {
    setMarkingLoading(true)
    try {
      const res = await fetch('/api/purchases/offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: id, ...offlineForm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Item marked as sold!')
      setShowSoldModal(false)
      // Refresh listing status
      fetch(`/api/listings/${id}`).then(r => r.json()).then(d => setListing(d.listing))
    } catch (err: any) {
      toast.error(err.message || 'Failed')
    } finally {
      setMarkingLoading(false)
    }
  }

  const submitRating = async () => {
    if (!session) return router.push('/login')
    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rateeId: listing.seller.id, ...rating, listingId: id }),
    })
    if (res.ok) toast.success('Rating submitted!')
    else toast.error('Failed')
  }

  if (loading) return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="card h-96 rounded-2xl animate-pulse" />
      </div>
    </div>
  )

  if (!listing) return (
    <div className="min-h-screen">
      <div className="pt-8 text-center text-vault-muted">Listing not found.</div>
    </div>
  )

  const avgRating = listing.seller?.ratingsReceived?.length
    ? (listing.seller.ratingsReceived.reduce((a: number, b: any) => a + b.score, 0) / listing.seller.ratingsReceived.length).toFixed(1)
    : null

  return (
    <div className="min-h-screen">
      <div className="pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="rounded-xl overflow-hidden bg-stone-50 aspect-square">
                <ListingImage
                  src={listing.images?.[activeImg]}
                  alt={listing.title}
                  title={listing.title}
                  category={listing.category}
                  size="lg"
                  priority={true}
                  style={{ borderRadius: 12, aspectRatio: '1/1', height: '100%' }}
                />
              </div>
              {listing.images?.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {listing.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      style={{
                        flexShrink: 0, width: 64, height: 64, borderRadius: 8,
                        overflow: 'hidden', padding: 0, cursor: 'pointer',
                        border: activeImg === i ? '2.5px solid #ea580c' : '2px solid #ede8e2',
                        transition: 'border-color 0.15s',
                      }}>
                      <ListingImage src={img} alt="" title={listing.title} category={listing.category} size="sm" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-5">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {listing.isUrgent && <span className="badge badge-red">⚡ Urgent</span>}
                  {listing.isRentable && <span className="badge badge-purple">🔄 Rentable</span>}
                  {listing.isNegotiable && <span className="badge badge-green">💬 Negotiable</span>}
                  <span className="badge badge-blue">{listing.category}</span>
                  <span className="badge badge-green">{listing.condition.replace('_', ' ')}</span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">{listing.title}</h1>
                {listing.description && <p className="text-vault-muted text-sm leading-relaxed">{listing.description}</p>}
              </div>

              {/* Price */}
              <div className="glass-orange p-4 rounded-xl">
                <div className="text-4xl font-display font-bold text-gradient">₹{listing.price.toLocaleString()}</div>
                {listing.isRentable && listing.rentalPrice && (
                  <div className="text-purple-400 text-sm mt-1">Available to rent at ₹{listing.rentalPrice}/day</div>
                )}
                {priceInsight?.avgPrice && (
                  <div className="text-sm mt-2">
                    <span className="text-vault-muted">Market avg for {listing.category}: </span>
                    <span className={listing.price <= priceInsight.avgPrice ? 'text-green-400' : 'text-red-400'}>
                      ₹{Math.round(priceInsight.avgPrice).toLocaleString()}
                      {listing.price <= priceInsight.avgPrice ? ' ✅ Good deal' : ' ⚠️ Above avg'}
                    </span>
                  </div>
                )}
              </div>

              {/* Seller */}
              <div className="card p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fde8da", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#ea580c", fontSize: "1rem", flexShrink: 0 }}>
                    {listing.seller?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{listing.seller?.name}</div>
                    <div className="text-xs text-vault-muted">
                      {listing.seller?.department} • Year {listing.seller?.year}
                      {avgRating && <span className="ml-2 text-yellow-400">★ {avgRating}</span>}
                    </div>
                  </div>
                  {listing.seller?.isVerified && <span className="badge badge-green ml-auto">✓ Verified</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {/* Seller view — show Mark as Sold */}
                {(session?.user as any)?.id === listing.seller?.id ? (
                  <>
                    {listing.status === 'ACTIVE' && (
                      <button onClick={openSoldModal} className="btn-primary justify-center py-3">
                        ✅ Mark as Sold
                      </button>
                    )}
                    {listing.status === 'SOLD' && (
                      <div style={{ textAlign: 'center', padding: '12px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1.5px solid rgba(34,197,94,0.25)', color: '#22c55e', fontWeight: 600, fontSize: '0.9rem' }}>
                        ✅ This item has been sold
                      </div>
                    )}
                  </>
                ) : (
                  /* Buyer/visitor view */
                  <>
                    <button onClick={startChat} className="btn-primary justify-center py-3">
                      💬 Chat with Seller
                    </button>
                    <button onClick={toggleWishlist} disabled={wishlistLoading}
                      className="btn-secondary justify-center py-3"
                      style={{ borderColor: wishlisted ? '#f97316' : undefined, color: wishlisted ? '#f97316' : undefined }}
                    >
                      {wishlisted ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}
                    </button>
                    {listing.isRentable && (
                      <button onClick={() => setShowRentForm(!showRentForm)} className="btn-secondary justify-center py-3">
                        🔄 Rent This Item
                      </button>
                    )}
                    <button onClick={() => setShowReport(!showReport)} className="text-red-400 text-sm hover:text-red-300 transition-colors">
                      ⚑ Report Listing
                    </button>
                  </>
                )}
              </div>

              {/* Rent form */}
              {showRentForm && (
                <form onSubmit={handleRent} className="card p-4 rounded-xl space-y-3">
                  <h3 className="font-semibold">Select Rental Period</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-vault-muted block mb-1">Start Date</label>
                      <input type="date" className="input" required
                        value={rental.startDate} onChange={e => setRental({...rental, startDate: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs text-vault-muted block mb-1">End Date</label>
                      <input type="date" className="input" required
                        value={rental.endDate} onChange={e => setRental({...rental, endDate: e.target.value})} />
                    </div>
                  </div>
                  {rental.startDate && rental.endDate && listing.rentalPrice && (
                    <div className="text-sm text-orange-400">
                      Estimated: ₹{(listing.rentalPrice * (Math.max(1, Math.ceil((new Date(rental.endDate).getTime() - new Date(rental.startDate).getTime()) / 86400000) + 1))).toLocaleString()}
                    </div>
                  )}
                  <button type="submit" className="btn-primary w-full justify-center">Confirm Rental</button>
                </form>
              )}

              {/* Report form */}
              {showReport && (
                <div className="card p-4 rounded-xl space-y-3">
                  <h3 className="font-semibold text-red-400">Report this listing</h3>
                  <select className="input" value={reportReason} onChange={e => setReportReason(e.target.value)}>
                    <option value="SCAM">Scam</option>
                    <option value="FAKE_ITEM">Fake Item</option>
                    <option value="HARASSMENT">Harassment</option>
                    <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <button onClick={handleReport} className="btn-primary bg-red-600 hover:bg-red-700 w-full justify-center">
                    Submit Report
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Reviews */}
          {listing.ratings?.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-2xl font-bold mb-4">Reviews</h2>
              <div className="space-y-3">
                {listing.ratings.map((r: any) => (
                  <div key={r.id} className="card p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-sm">{r.rater?.name}</span>
                      <span className="text-yellow-400">{'★'.repeat(r.score)}{'☆'.repeat(5-r.score)}</span>
                    </div>
                    {r.review && <p className="text-vault-muted text-sm">{r.review}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leave a rating */}
          {session && (
            <div className="mt-8 card p-6 rounded-xl">
              <h3 className="font-semibold mb-4">Rate this seller</h3>
              <div className="flex gap-2 mb-3">
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating({...rating, score: s})}
                    className={`text-2xl transition-all ${s <= rating.score ? 'text-yellow-400' : 'text-stone-500'}`}>★</button>
                ))}
              </div>
              <textarea className="input mb-3" rows={2} placeholder="Write a review (optional)"
                value={rating.review} onChange={e => setRating({...rating, review: e.target.value})} />
              <button onClick={submitRating} className="btn-primary">Submit Rating</button>
            </div>
          )}
        </div>
      </div>

      {/* Mark as Sold Modal */}
      {showSoldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}>

            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>Mark as Sold</h2>
            <p style={{ color: '#78716c', fontSize: '0.82rem', marginBottom: 20 }}>
              <strong>{listing.title}</strong> — how was it sold?
            </p>

            {/* Step 1 — Choose mode */}
            {soldMode === 'choose' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={() => setSoldMode('online')}
                  style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e2dbd4', background: '#faf9f7', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: 3 }}>📱 Sold on Platform</div>
                  <div style={{ fontSize: '0.78rem', color: '#92817a' }}>Buyer is on Campus Vault — send them a confirmation request</div>
                </button>
                <button onClick={() => setSoldMode('offline')}
                  style={{ padding: '14px 16px', borderRadius: 12, border: '1.5px solid #e2dbd4', background: '#faf9f7', cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1a2e', marginBottom: 3 }}>🤝 Sold Offline / Face-to-Face</div>
                  <div style={{ fontSize: '0.78rem', color: '#92817a' }}>Exchange happened in person — record the details and mark as sold instantly</div>
                </button>
                <button onClick={() => setShowSoldModal(false)}
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
                  <p style={{ color: '#a89d93', fontSize: '0.85rem', marginBottom: 20, padding: '12px', background: '#faf9f7', borderRadius: 10, border: '1.5px solid #e2dbd4' }}>
                    No chat participants found. The buyer must have messaged you first.
                  </p>
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
                  <button onClick={() => setShowSoldModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2dbd4', background: '#faf9f7', color: '#574f4a', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>Cancel</button>
                  <button onClick={submitMarkAsSold} disabled={!selectedBuyer || markingLoading}
                    style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: selectedBuyer ? 'linear-gradient(135deg,#f97316,#ea580c)' : '#e2dbd4', color: selectedBuyer ? '#fff' : '#a89d93', cursor: selectedBuyer ? 'pointer' : 'not-allowed', fontSize: '0.88rem', fontWeight: 600 }}>
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
                  <button onClick={() => setShowSoldModal(false)} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid #e2dbd4', background: '#faf9f7', color: '#574f4a', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500 }}>Cancel</button>
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
