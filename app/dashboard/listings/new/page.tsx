'use client'
import { ListingImage } from '@/components/ui/ListingImage'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { GuidelinesModal } from '@/components/GuidelinesModal'

const categories = ['Textbooks', 'Electronics', 'Hostel Essentials', 'Clothing', 'Sports', 'Stationery', 'Vehicles', 'Other']

export default function NewListingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cv_guidelines_accepted')) {
      setShowGuidelines(true)
    }
  }, [])

  const handleGuidelinesAccept = () => {
    localStorage.setItem('cv_guidelines_accepted', '1')
    setShowGuidelines(false)
  }
  const [form, setForm] = useState({
    title: '', description: '', price: '', condition: 'USED',
    category: 'Textbooks', images: [''], isRentable: false,
    rentalPrice: '', deposit: '', isUrgent: false, isNegotiable: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const validImages = form.images.filter(img => img.trim())
    // Images are optional — auto-generated from title if none provided
    // (no return/error needed)

    const res = await fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
        images: validImages,
        rentalPrice: form.rentalPrice ? parseFloat(form.rentalPrice) : undefined,
        deposit: form.deposit ? parseFloat(form.deposit) : undefined,
      }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return toast.error(data.error)
    toast.success('Listing submitted! Awaiting admin approval.')
    router.push('/dashboard/listings')
  }

  const addImageField = () => setForm({ ...form, images: [...form.images, ''] })
  const updateImage = (i: number, val: string) => {
    const imgs = [...form.images]; imgs[i] = val
    setForm({ ...form, images: imgs })
  }

  return (
    <div className="p-6 max-w-2xl">
      {showGuidelines && <GuidelinesModal onAccept={handleGuidelinesAccept} />}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">List an Item</h1>
        <p className="text-vault-muted mt-1 text-sm">Your listing will be reviewed before going live.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 rounded-xl space-y-4">
          <h2 className="font-semibold">Basic Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-600">Title *</label>
            <input className="input" placeholder="e.g. VLSI Design Textbook" required
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-600">Description</label>
            <textarea className="input" rows={3} placeholder="Describe the item, any defects, etc."
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Category *</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Condition *</label>
              <select className="input" value={form.condition} onChange={e => setForm({...form, condition: e.target.value})}>
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="USED">Used</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-5 rounded-xl space-y-4">
          <h2 className="font-semibold">Pricing</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-stone-600">Selling Price (₹) *</label>
            <input className="input" type="number" min="0" required placeholder="0"
              value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isRentable} onChange={e => setForm({...form, isRentable: e.target.checked})}
              className="w-4 h-4 accent-orange-500" />
            <span className="text-sm font-medium">Available for rent</span>
          </label>

          {form.isRentable && (
            <div className="grid grid-cols-2 gap-3 animate-slide-up">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Rental Price/day (₹)</label>
                <input className="input" type="number" min="0" placeholder="0"
                  value={form.rentalPrice} onChange={e => setForm({...form, rentalPrice: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Deposit (₹)</label>
                <input className="input" type="number" min="0" placeholder="Optional"
                  value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} />
              </div>
            </div>
          )}
        </div>

        <div className="card p-5 rounded-xl space-y-4">
          <div>
            <h2 className="font-semibold mb-1">Images <span style={{ color: '#b8a99a', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></h2>
            <p className="text-vault-muted text-xs">
              Paste a direct image URL, or leave blank — a relevant image will be shown automatically based on your title.
              Free hosting: <a href="https://imgur.com/upload" target="_blank" rel="noreferrer" style={{ color: '#ea580c' }}>Imgur</a> or{' '}
              <a href="https://imgbb.com" target="_blank" rel="noreferrer" style={{ color: '#ea580c' }}>ImgBB</a>
            </p>
          </div>
          <div className="space-y-3">
            {form.images.map((img, i) => (
              <div key={i} className="flex gap-3 items-start">
                {/* Preview thumbnail */}
                <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, border: '1.5px solid #ede8e2', background: '#f5f0eb' }}>
                  <ListingImage src={img || null} alt="" title={form.title} category={form.category} size="sm" />
                </div>
                <div className="flex-1">
                  <input
                    className="input"
                    placeholder={`Image URL ${i + 1} — paste a direct image link`}
                    value={img}
                    onChange={e => updateImage(i, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addImageField}
            style={{ color: '#ea580c', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
            + Add another image URL
          </button>
        </div>

        <div className="card p-5 rounded-xl space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isUrgent} onChange={e => setForm({...form, isUrgent: e.target.checked})}
              className="w-4 h-4 accent-red-500" />
            <div>
              <span className="font-medium text-sm">⚡ Mark as Urgent</span>
              <p className="text-vault-muted text-xs">Get notified users to respond faster (visible 24 hrs)</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isNegotiable} onChange={e => setForm({...form, isNegotiable: e.target.checked})}
              className="w-4 h-4 accent-orange-500" />
            <div>
              <span className="font-medium text-sm">💬 Open to Negotiation</span>
              <p className="text-vault-muted text-xs">Let buyers know they can make an offer on the price</p>
            </div>
          </label>
        </div>

        <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
          {loading ? 'Submitting...' : '📤 Submit Listing'}
        </button>
      </form>
    </div>
  )
}
