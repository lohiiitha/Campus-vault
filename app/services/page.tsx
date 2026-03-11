'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { GuidelinesModal } from '@/components/GuidelinesModal'

const serviceCategories = ['All', 'Tutoring', 'Tech Repair', 'Notes Sharing', 'Design', 'Writing', 'Other']

export default function ServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showGuidelines, setShowGuidelines] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', hourlyPrice: '', category: 'Tutoring' })

  const openForm = () => {
    if (typeof window !== 'undefined' && !localStorage.getItem('cv_guidelines_accepted')) {
      setShowGuidelines(true)
    } else {
      setShowForm(true)
    }
  }

  const handleGuidelinesAccept = () => {
    localStorage.setItem('cv_guidelines_accepted', '1')
    setShowGuidelines(false)
    setShowForm(true)
  }

  const fetchServices = async () => {
    const params = category && category !== 'All' ? `?category=${category}` : ''
    const res = await fetch(`/api/services${params}`)
    const data = await res.json()
    setServices(data.services || [])
    setLoading(false)
  }

  useEffect(() => { fetchServices() }, [category])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, hourlyPrice: parseFloat(form.hourlyPrice) }),
    })
    if (res.ok) { toast.success('Service listed!'); setShowForm(false); fetchServices() }
    else { const d = await res.json(); toast.error(d.error) }
  }

  return (
    <div className="min-h-screen">
      {showGuidelines && <GuidelinesModal onAccept={handleGuidelinesAccept} />}
      <div className="pb-16">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="font-display text-4xl font-bold">Campus Services</h1>
              <p className="text-vault-muted mt-1">Tutoring, tech repair, notes & more</p>
            </div>
            {session && (
              <button onClick={() => showForm ? setShowForm(false) : openForm()} className="btn-primary">
                + Offer Service
              </button>
            )}
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-6">
            {serviceCategories.map(cat => (
              <button key={cat}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  (cat === 'All' && !category) || category === cat
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                    : 'border-vault-border text-vault-muted hover:border-stone-400'
                }`}>
                {cat}
              </button>
            ))}
          </div>

          {/* New service form */}
          {showForm && (
            <div className="card p-5 rounded-xl mb-6 animate-slide-up">
              <h2 className="font-semibold mb-4">Offer a Service</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input className="input" placeholder="Service title" required
                  value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                <textarea className="input" rows={2} placeholder="Describe your service" required
                  value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                    {serviceCategories.slice(1).map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input className="input" type="number" placeholder="Price per hour (₹)" required
                    value={form.hourlyPrice} onChange={e => setForm({...form, hourlyPrice: e.target.value})} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary">Submit</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {/* Services grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="card h-36 rounded-xl animate-pulse" />)}
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-vault-muted">
              <div className="text-5xl mb-4">🔧</div>
              <p>No services listed yet. Be the first!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((s: any) => {
                const avgRating = s.provider?.ratingsReceived?.length
                  ? (s.provider.ratingsReceived.reduce((a: number, b: any) => a + b.score, 0) / s.provider.ratingsReceived.length).toFixed(1)
                  : null
                return (
                  <div key={s.id} className="card card-hover p-5 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="badge badge-blue mb-2">{s.category}</span>
                        <h3 className="font-semibold">{s.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gradient">₹{s.hourlyPrice}</div>
                        <div className="text-xs text-vault-muted">/hour</div>
                      </div>
                    </div>
                    <p className="text-vault-muted text-sm mb-3 line-clamp-2">{s.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-vault-border">
                      <div className="text-sm">
                        <span className="font-medium">{s.provider?.name}</span>
                        <span className="text-vault-muted ml-2 text-xs">{s.provider?.department}</span>
                      </div>
                      {avgRating && <span className="text-xs text-yellow-400">★ {avgRating}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
