'use client'
import { ListingImage } from '@/components/ui/ListingImage'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const REMOVAL_REASONS = [
  'Inappropriate content',
  'Violates community guidelines',
  'Spam or duplicate listing',
  'Prohibited item',
  'Misleading information',
  'Other',
]

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'listings' | 'reports' | 'users'>('overview')

  // Remove modal state
  const [removeModal, setRemoveModal] = useState<{ open: boolean; listingId: string; title: string }>({ open: false, listingId: '', title: '' })
  const [removeReason, setRemoveReason] = useState(REMOVAL_REASONS[0])

  useEffect(() => {
    const role = (session?.user as any)?.role
    if (session && role !== 'ADMIN') router.push('/dashboard')
    if (role === 'ADMIN') fetch('/api/admin').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [session])

  const doAction = async (action: string, payload: any) => {
    const res = await fetch(`/api/admin/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const d = await res.json()
    if (res.ok) { toast.success(d.message); fetch('/api/admin').then(r => r.json()).then(setData) }
    else toast.error(d.error)
  }

  const handleRemoveConfirm = async () => {
    await doAction('remove-listing', { listingId: removeModal.listingId, reason: removeReason })
    setRemoveModal({ open: false, listingId: '', title: '' })
    setRemoveReason(REMOVAL_REASONS[0])
  }

  if (loading) return (
    <div className="p-6 text-vault-muted animate-pulse">Loading admin panel...</div>
  )

  const { stats, recentReports, activeListingsData, allUsers, topCategories } = data || {}

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: '👥', color: 'blue' },
    { label: 'Active Listings', value: stats?.activeListings, icon: '📋', color: 'green' },
    { label: 'Pending Approval', value: stats?.pendingListings, icon: '⏳', color: 'yellow' },
    { label: 'Open Reports', value: stats?.openReports, icon: '⚠️', color: 'red' },
    { label: 'Total Rentals', value: stats?.totalRentals, icon: '🔄', color: 'purple' },
    { label: 'Banned Users', value: stats?.bannedUsers, icon: '🚫', color: 'red' },
  ]

  const warnedUsers = (allUsers || []).filter((u: any) => u.warningCount > 0)

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">⚙️ Admin Panel</h1>
        <p className="text-vault-muted text-sm mt-1">Platform moderation & monitoring</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {statCards.map(card => (
          <div key={card.label} className="card p-4 rounded-xl">
            <div className="text-2xl mb-2">{card.icon}</div>
            <div className="text-2xl font-bold font-display text-gradient">{card.value ?? 0}</div>
            <div className="text-vault-muted text-xs mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Top categories */}
      {topCategories?.length > 0 && (
        <div className="card p-4 rounded-xl mb-6">
          <h2 className="font-semibold mb-3">Top Categories</h2>
          <div className="flex gap-2 flex-wrap">
            {topCategories.map((c: any) => (
              <span key={c.category} className="badge badge-orange">
                {c.category}: {c._count.category}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-3 mb-5 border-b border-vault-border pb-3">
        {(['overview', 'listings', 'reports', 'users'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`text-sm font-medium pb-2 border-b-2 transition-all capitalize ${
              tab === t ? 'border-orange-500 text-orange-400' : 'border-transparent text-vault-muted hover:text-stone-800'
            }`}>
            {t === 'listings' && `Listings (${activeListingsData?.length || 0})`}
            {t === 'reports' && `Reports (${recentReports?.length || 0})`}
            {t === 'users' && `Users (${allUsers?.length || 0})`}
            {t === 'overview' && 'Overview'}
          </button>
        ))}
      </div>

      {/* Overview tab — warned users */}
      {tab === 'overview' && (
        <div>
          {warnedUsers.length > 0 ? (
            <div className="card p-4 rounded-xl">
              <h2 style={{ fontWeight: 700, fontSize: '0.8rem', color: '#a89d93', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>⚠️ Warned Users</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {warnedUsers.map((u: any) => (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: 'rgba(234,179,8,0.06)', border: '1.5px solid rgba(234,179,8,0.2)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1a1a2e' }}>{u.name}</div>
                      <div style={{ fontSize: '0.72rem', color: '#92817a' }}>{u.email} • {u.role}</div>
                    </div>
                    <span style={{ background: 'rgba(234,179,8,0.12)', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>
                      ⚠️ {u.warningCount} warning{u.warningCount > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-vault-muted text-center py-8 text-sm">No warned users 🎉</div>
          )}
        </div>
      )}

      {/* Listings tab */}
      {tab === 'listings' && (
        <div className="space-y-3">
          {activeListingsData?.length === 0 && (
            <div className="text-vault-muted text-center py-8">No active listings</div>
          )}
          {activeListingsData?.map((listing: any) => (
            <div key={listing.id} className="card p-4 rounded-xl flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-stone-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <ListingImage src={listing.images?.[0]} alt="" title={listing.title} category={listing.category} size="sm" style={{ borderRadius: 8 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{listing.title}</div>
                <div className="text-xs text-vault-muted">{listing.category} • ₹{listing.price} • by {listing.seller?.name}</div>
                <div className="text-xs text-vault-muted">{listing.seller?.email}</div>
              </div>
              <button
                onClick={() => setRemoveModal({ open: true, listingId: listing.id, title: listing.title })}
                style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                🗑 Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="space-y-3">
          {recentReports?.length === 0 && (
            <div className="text-vault-muted text-center py-8">No open reports 🎉</div>
          )}
          {recentReports?.map((report: any) => (
            <div key={report.id} className="card p-4 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge badge-red">{report.reason}</span>
                    {report.reported?.isBanned && <span className="badge badge-red">BANNED</span>}
                  </div>
                  <div className="text-sm">
                    <span className="text-vault-muted">Reporter:</span> {report.reporter?.name} ({report.reporter?.email})
                  </div>
                  <div className="text-sm">
                    <span className="text-vault-muted">Reported:</span> {report.reported?.name} ({report.reported?.email})
                  </div>
                  {report.listing && <div className="text-xs text-vault-muted mt-1">Listing: {report.listing.title}</div>}
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button onClick={() => doAction('resolve-report', { reportId: report.id })}
                    className="btn-secondary py-1.5 px-3 text-xs">✓ Resolve</button>
                  {!report.reported?.isBanned && (
                    <button onClick={() => doAction('ban-user', { userId: report.reportedId })}
                      className="bg-red-500/10 text-red-400 border border-red-500/20 py-1.5 px-3 text-xs rounded-lg">
                      🚫 Ban User
                    </button>
                  )}
                  {report.reported?.isBanned && (
                    <button onClick={() => doAction('unban-user', { userId: report.reportedId })}
                      className="bg-green-500/10 text-green-400 border border-green-500/20 py-1.5 px-3 text-xs rounded-lg">
                      ✓ Unban
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <div className="space-y-3">
          {allUsers?.length === 0 && (
            <div className="text-vault-muted text-center py-8">No users found</div>
          )}
          {allUsers?.map((u: any) => (
            <div key={u.id} className="card p-4 rounded-xl flex items-center gap-4"
              style={{ borderColor: u.warningCount > 0 && !u.isBanned ? 'rgba(234,179,8,0.3)' : undefined }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: u.isBanned ? 'rgba(239,68,68,0.1)' : u.warningCount > 0 ? 'rgba(234,179,8,0.1)' : 'rgba(37,99,235,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: u.isBanned ? '#ef4444' : u.warningCount > 0 ? '#b45309' : '#2563eb', flexShrink: 0 }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  {u.name}
                  {u.isBanned && <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>BANNED</span>}
                  {u.warningCount > 0 && !u.isBanned && <span style={{ background: 'rgba(234,179,8,0.1)', color: '#b45309', fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: 99 }}>⚠️ {u.warningCount} warn</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#92817a' }}>{u.email} • {u.role}</div>
                <div style={{ fontSize: '0.68rem', color: '#b8a99a' }}>Joined {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!u.isBanned ? (
                  <button onClick={() => doAction('ban-user', { userId: u.id })}
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.2)', padding: '5px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    🚫 Ban
                  </button>
                ) : (
                  <button onClick={() => doAction('unban-user', { userId: u.id })}
                    style={{ background: 'rgba(34,197,94,0.08)', color: '#22c55e', border: '1.5px solid rgba(34,197,94,0.2)', padding: '5px 12px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                    ✓ Unban
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Remove Listing Modal */}
      {removeModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 420, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>Remove Listing</h2>
            <p style={{ fontSize: '0.82rem', color: '#92817a', marginBottom: 20 }}>
              Removing <strong>"{removeModal.title}"</strong>. The seller will be notified with the reason below.
            </p>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#574f4a', display: 'block', marginBottom: 8 }}>Reason for Removal</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {REMOVAL_REASONS.map(r => (
                <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${removeReason === r ? 'rgba(239,68,68,0.4)' : '#ede8e2'}`, background: removeReason === r ? 'rgba(239,68,68,0.04)' : '#fff', cursor: 'pointer', fontSize: '0.82rem', fontWeight: removeReason === r ? 600 : 400, color: removeReason === r ? '#ef4444' : '#574f4a' }}>
                  <input type="radio" name="reason" value={r} checked={removeReason === r} onChange={() => setRemoveReason(r)} style={{ accentColor: '#ef4444' }} />
                  {r}
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { setRemoveModal({ open: false, listingId: '', title: '' }); setRemoveReason(REMOVAL_REASONS[0]) }}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1.5px solid #ede8e2', background: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', color: '#574f4a' }}>
                Cancel
              </button>
              <button onClick={handleRemoveConfirm}
                style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: '#ef4444', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                🗑 Remove Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
