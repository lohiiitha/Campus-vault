'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    department: '', year: 1, role: 'BUYER'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, year: parseInt(String(form.year)) }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || 'Registration failed'
        setError(msg)
        toast.error(msg)
        return
      }
      toast.success('Account created! Please log in.')
      router.push('/login')
    } catch (err: any) {
      const msg = err.message || 'Something went wrong. Please try again.'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-300/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-gradient">🏛️ Campus Vault</Link>
          <h1 className="font-display text-3xl font-bold mt-4 mb-2">Create Account</h1>
          <p className="text-vault-muted text-sm">Join your campus marketplace</p>
        </div>

        <div className="card p-8 rounded-2xl">
          {/* Inline error banner */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Full Name</label>
              <input className="input" placeholder="Your name" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">College Email</label>
              <input className="input" type="email" placeholder="you@college.edu" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" required minLength={8}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Phone Number</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" required
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Department</label>
                <input className="input" placeholder="e.g. CS, ECE" required
                  value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Year</label>
                <select className="input" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-stone-600">I want to</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'BUYER', label: '🛍️ Buy', desc: 'Browse & buy' },
                  { value: 'SELLER', label: '💰 Sell', desc: 'List items' },
                  { value: 'SERVICE_PROVIDER', label: '🔧 Serve', desc: 'Offer services' },
                ].map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm({...form, role: r.value})}
                    className={`p-3 rounded-lg border text-center transition-all text-sm ${
                      form.role === r.value
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-vault-border text-vault-muted hover:border-gray-500'
                    }`}>
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-vault-muted mt-2">You can switch roles later from settings.</p>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-vault-muted text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" style={{ color: "#ea580c", fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-300/10 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-2xl font-bold text-gradient">🏛️ Campus Vault</Link>
          <h1 className="font-display text-3xl font-bold mt-4 mb-2">Create Account</h1>
          <p className="text-vault-muted text-sm">Join your campus marketplace</p>
        </div>

        <div className="card p-8 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Full Name</label>
              <input className="input" placeholder="Your name" required
                value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">College Email</label>
              <input className="input" type="email" placeholder="you@college.edu" required
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Password</label>
              <input className="input" type="password" placeholder="Min 8 characters" required minLength={8}
                value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-stone-600">Phone Number</label>
              <input className="input" placeholder="+91 XXXXX XXXXX" required
                value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Department</label>
                <input className="input" placeholder="e.g. CS, ECE" required
                  value={form.department} onChange={e => setForm({...form, department: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-stone-600">Year</label>
                <select className="input" value={form.year} onChange={e => setForm({...form, year: parseInt(e.target.value)})}>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-stone-600">I want to</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'BUYER', label: '🛍️ Buy', desc: 'Browse & buy' },
                  { value: 'SELLER', label: '💰 Sell', desc: 'List items' },
                  { value: 'SERVICE_PROVIDER', label: '🔧 Serve', desc: 'Offer services' },
                ].map(r => (
                  <button key={r.value} type="button"
                    onClick={() => setForm({...form, role: r.value})}
                    className={`p-3 rounded-lg border text-center transition-all text-sm ${
                      form.role === r.value
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-vault-border text-vault-muted hover:border-gray-500'
                    }`}>
                    <div className="font-semibold">{r.label}</div>
                    <div className="text-xs mt-0.5 opacity-70">{r.desc}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-vault-muted mt-2">You can switch roles later from settings.</p>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3 mt-2" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </button>
          </form>

          <p className="text-center text-vault-muted text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" style={{ color: "#ea580c", fontWeight: 600, textDecoration: "none" }}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
