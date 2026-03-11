'use client'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const ROLES = [
  { value: 'BUYER',            emoji: '🛍️', label: 'Buyer',           desc: 'Browse and buy items from campus sellers' },
  { value: 'SELLER',           emoji: '💰', label: 'Seller',          desc: 'List items for sale or rent to other students' },
  { value: 'SERVICE_PROVIDER', emoji: '🎓', label: 'Service Provider', desc: 'Offer tutoring, tech repair, notes and more' },
]

const ROLE_COLOR = { BUYER: '#3b82f6', SELLER: '#f97316', SERVICE_PROVIDER: '#a855f7', ADMIN: '#ef4444' }

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ name: '', phone: '', department: '', year: 1, role: 'BUYER' })

  // Load fresh data from DB
  useEffect(() => {
    fetch('/api/user/profile')
      .then(r => r.json())
      .then(d => {
        if (d.user) {
          setProfile(d.user)
          setForm({ name: d.user.name || '', phone: d.user.phone || '', department: d.user.department || '', year: d.user.year || 1, role: d.user.role || 'BUYER' })
        }
      })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      // Refresh NextAuth session so sidebar/header update immediately
      await update()
      router.refresh()
      toast.success('Profile saved!')
    } catch {
      toast.error('Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  const user = session?.user
  const currentRole = form.role
  const accentColor = ROLE_COLOR[currentRole] || '#f97316'

  return (
    <div style={{ padding: '28px', maxWidth: 600 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.7rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 5 }}>Profile Settings</h1>
        <p style={{ color: '#78716c', fontSize: '0.88rem' }}>Changes save to the database and update your interface immediately.</p>
      </div>

      {/* Avatar card */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', borderRadius: 14, background: '#ffffff', border: `1px solid ${accentColor}33`, marginBottom: 24 }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: accentColor, color: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', fontWeight: 700, flexShrink: 0 }}>
          {form.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ color: '#1a1a2e', fontWeight: 700, fontSize: '1rem' }}>{form.name || user?.name}</div>
          <div style={{ color: '#78716c', fontSize: '0.8rem' }}>{user?.email}</div>
          <div style={{ marginTop: 5, display: 'flex', gap: 6 }}>
            {user?.isVerified
              ? <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '2px 9px', borderRadius: 99, border: '1px solid rgba(34,197,94,0.2)' }}>✓ Verified Student</span>
              : <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'rgba(234,179,8,0.1)', color: '#eab308', padding: '2px 9px', borderRadius: 99 }}>⚠ Not Verified</span>}
            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: `${accentColor}18`, color: accentColor, padding: '2px 9px', borderRadius: 99, border: `1px solid ${accentColor}33` }}>
              {ROLES.find(r => r.value === currentRole)?.emoji} {ROLES.find(r => r.value === currentRole)?.label || currentRole}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Personal info */}
        <section style={{ background: '#ffffff', border: '1px solid #ede8e2', borderRadius: 14, padding: '20px' }}>
          <h2 style={{ color: '#78716c', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Personal Info</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', color: '#a8998f', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <label style={{ display: 'block', color: '#a8998f', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>Phone Number</label>
              <input className="input" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
              <p style={{ color: '#a8998f', fontSize: '0.72rem', marginTop: 4 }}>Only visible to verified students</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', color: '#a8998f', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>Department</label>
                <input className="input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. CSE, ECE" />
              </div>
              <div>
                <label style={{ display: 'block', color: '#a8998f', fontSize: '0.82rem', fontWeight: 500, marginBottom: 6 }}>Year</label>
                <select className="input" value={form.year} onChange={e => setForm({ ...form, year: parseInt(e.target.value) })}>
                  {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Role switcher */}
        <section style={{ background: '#ffffff', border: '1px solid #ede8e2', borderRadius: 14, padding: '20px' }}>
          <h2 style={{ color: '#78716c', fontSize: '0.73rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Your Role</h2>
          <p style={{ color: '#92817a', fontSize: '0.78rem', marginBottom: 14 }}>
            Changing your role updates the entire sidebar, dashboard, and available actions.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ROLES.map(r => {
              const isActive = form.role === r.value
              const rc = ROLE_COLOR[r.value]
              return (
                <label key={r.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', borderRadius: 11, cursor: 'pointer', background: isActive ? `${rc}12` : 'transparent', border: `1px solid ${isActive ? rc + '44' : '#ede8e2'}`, transition: 'all 0.15s ease' }}>
                  <input type="radio" name="role" value={r.value} checked={isActive} onChange={() => setForm({ ...form, role: r.value })} style={{ accentColor: rc, marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ color: isActive ? 'white' : '#9ca3af', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {r.emoji} {r.label}
                      {isActive && <span style={{ fontSize: '0.68rem', background: `${rc}22`, color: rc, padding: '1px 7px', borderRadius: 99 }}>Active</span>}
                    </div>
                    <div style={{ color: '#92817a', fontSize: '0.78rem', marginTop: 2 }}>{r.desc}</div>
                  </div>
                </label>
              )
            })}
          </div>
        </section>

        <button type="submit" disabled={saving}
          style={{ background: saving ? '#e5dfd8' : 'linear-gradient(135deg,#f97316,#ea580c)', color: saving ? '#78716c' : '#ffffff', border: 'none', borderRadius: 11, padding: '13px 24px', fontWeight: 700, fontSize: '0.9rem', cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onMouseEnter={e => { if (!saving) e.currentTarget.style.boxShadow = '0 4px 20px rgba(249,115,22,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          {saving ? (
            <><span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#1a1a2e', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Saving…</>
          ) : '💾 Save Changes'}
        </button>
      </form>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
