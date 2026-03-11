'use client'
import { useSession, signOut } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ─── Constants ───────────────────────────────────────────────────────────────
const SIDEBAR_W = 224
const MOBILE_H  = 56

// ─── Role config ─────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, {
  label: string; emoji: string; color: string
  colorMuted: string; colorBorder: string
  nav: { href: string; label: string; icon: string }[]
}> = {
  BUYER: {
    label: 'Buyer', emoji: '🛍️', color: '#2563eb',
    colorMuted: 'rgba(37,99,235,0.08)', colorBorder: 'rgba(37,99,235,0.2)',
    nav: [
      { href: '/dashboard',                  label: 'Home',           icon: '🏠' },
      { href: '/marketplace',                label: 'Marketplace',    icon: '🛍️' },
      { href: '/dashboard/purchases',        label: 'My Purchases',   icon: '🧾' },
      { href: '/marketplace?rentable=true',  label: 'Rentals',        icon: '🔄' },
      { href: '/services',                   label: 'Services',       icon: '🎓' },
      { href: '/dashboard/rentals',          label: 'My Rentals',     icon: '📦' },
      { href: '/dashboard/chat',             label: 'Messages',       icon: '💬' },
      { href: '/dashboard/profile',          label: 'Profile',        icon: '👤' },
    ],
  },
  SELLER: {
    label: 'Seller', emoji: '💰', color: '#ea580c',
    colorMuted: 'rgba(234,88,12,0.08)', colorBorder: 'rgba(234,88,12,0.2)',
    nav: [
      { href: '/dashboard',                  label: 'Home',           icon: '🏠' },
      { href: '/marketplace',                label: 'Marketplace',    icon: '🛍️' },
      { href: '/dashboard/listings',         label: 'My Listings',    icon: '📋' },
      { href: '/dashboard/listings/new',     label: 'Post Item',      icon: '➕' },
      { href: '/dashboard/sales',            label: 'Sales History',  icon: '✅' },
      { href: '/dashboard/rentals',          label: 'Rentals',        icon: '🔄' },
      { href: '/services',                   label: 'Services',       icon: '🎓' },
      { href: '/dashboard/chat',             label: 'Messages',       icon: '💬' },
      { href: '/dashboard/profile',          label: 'Profile',        icon: '👤' },
    ],
  },
  SERVICE_PROVIDER: {
    label: 'Provider', emoji: '🎓', color: '#7c3aed',
    colorMuted: 'rgba(124,58,237,0.08)', colorBorder: 'rgba(124,58,237,0.2)',
    nav: [
      { href: '/dashboard',                  label: 'Home',           icon: '🏠' },
      { href: '/marketplace',                label: 'Marketplace',    icon: '🛍️' },
      { href: '/services',                   label: 'Browse Services',icon: '🔍' },
      { href: '/dashboard/services',         label: 'My Services',    icon: '🔧' },
      { href: '/dashboard/chat',             label: 'Messages',       icon: '💬' },
      { href: '/dashboard/profile',          label: 'Profile',        icon: '👤' },
    ],
  },
  ADMIN: {
    label: 'Admin', emoji: '⚙️', color: '#dc2626',
    colorMuted: 'rgba(220,38,38,0.08)', colorBorder: 'rgba(220,38,38,0.2)',
    nav: [
      { href: '/dashboard',                  label: 'Home',           icon: '🏠' },
      { href: '/admin',                      label: 'Admin Panel',    icon: '⚙️' },
      { href: '/marketplace',                label: 'Marketplace',    icon: '🛍️' },
      { href: '/dashboard/listings',         label: 'All Listings',   icon: '📋' },
      { href: '/services',                   label: 'Services',       icon: '🎓' },
      { href: '/dashboard/chat',             label: 'Messages',       icon: '💬' },
      { href: '/dashboard/profile',          label: 'Profile',        icon: '👤' },
    ],
  },
}

const SWITCHABLE_ROLES = ['BUYER', 'SELLER', 'SERVICE_PROVIDER']

// ─── Notification Bell ───────────────────────────────────────────────────────
function NotificationBell({ color }: { color: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const prevUnreadRef = useRef(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (!res.ok) return
      const data = await res.json()
      const incoming = data.unreadCount ?? 0

      // Show toast for each new notification
      if (incoming > prevUnreadRef.current && prevUnreadRef.current !== -1) {
        const newOnes = (data.notifications ?? []).slice(0, incoming - prevUnreadRef.current)
        newOnes.forEach((n: any) => toast(n.title + '\n' + n.body, { icon: '🔔', duration: 4000 }))
      }
      prevUnreadRef.current = incoming
      setUnreadCount(incoming)
      setNotifications(data.notifications ?? [])
    } catch {}
  }, [])

  useEffect(() => {
    // Set to -1 initially so first fetch doesn't trigger toasts for existing notifications
    prevUnreadRef.current = -1
    fetchNotifications().then(() => {
      // After first fetch set the real baseline so future ones trigger toasts
      prevUnreadRef.current = unreadCount
    })
    const id = setInterval(fetchNotifications, 5000)
    return () => clearInterval(id)
  }, [fetchNotifications])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await fetch('/api/notifications', { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    prevUnreadRef.current = 0
  }

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <div ref={dropdownRef} style={{ position: 'relative', padding: '0 0 6px' }}>
      <button onClick={handleOpen}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, fontSize: '0.83rem', fontWeight: 500, background: open ? 'rgba(0,0,0,0.04)' : 'transparent', border: '1.5px solid transparent', color: '#574f4a', cursor: 'pointer', transition: 'all 0.14s ease', position: 'relative' }}
        onMouseEnter={e => { e.currentTarget.style.background = '#f5f1ed'; e.currentTarget.style.color = '#1a1a2e' }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? 'rgba(0,0,0,0.04)' : 'transparent'; e.currentTarget.style.color = '#574f4a' }}
      >
        <span style={{ position: 'relative', fontSize: '1rem' }}>
          🔔
          {unreadCount > 0 && (
            <span style={{ position: 'absolute', top: -4, right: -6, background: '#ef4444', color: '#fff', fontSize: '0.55rem', fontWeight: 700, borderRadius: 99, minWidth: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        <span style={{ flex: 1 }}>Notifications</span>
      </button>

      {open && (
        <div style={{ position: 'absolute', bottom: '100%', left: 8, right: 8, background: '#fff', border: '1.5px solid #ede8e2', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 200, maxHeight: 320, overflowY: 'auto' }}>
          <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid #ede8e2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1a1a2e' }}>Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} style={{ fontSize: '0.7rem', color: color, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                Mark all read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '20px 14px', textAlign: 'center', color: '#a89d93', fontSize: '0.8rem' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(n => (
              <Link key={n.id} href={n.link || '/dashboard'} onClick={() => setOpen(false)}
                style={{ display: 'block', padding: '10px 14px', borderBottom: '1px solid #f5f1ed', textDecoration: 'none', background: n.read ? 'transparent' : 'rgba(249,115,22,0.04)', transition: 'background 0.12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#faf9f7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? 'transparent' : 'rgba(249,115,22,0.04)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {!n.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1a1a2e', marginBottom: 2 }}>{n.title}</div>
                    <div style={{ fontSize: '0.73rem', color: '#78716c', lineHeight: 1.4, wordBreak: 'break-word' }}>{n.body}</div>
                    <div style={{ fontSize: '0.67rem', color: '#b8a99a', marginTop: 3 }}>
                      {new Date(n.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ─── Sidebar content (shared between desktop panel and mobile drawer) ─────────
function SidebarContent({
  cfg, user, userRole, pathname, switching, onSwitch, onNav,
}: {
  cfg: typeof ROLE_CONFIG[string]
  user: any
  userRole: string
  pathname: string
  switching: string | null
  onSwitch: (role: string) => void
  onNav: () => void
}) {
  const visibleRoles = userRole === 'ADMIN'
    ? ['BUYER', 'SELLER', 'SERVICE_PROVIDER', 'ADMIN']
    : SWITCHABLE_ROLES

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>

      {/* ── Logo ── */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #ede8e2', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1, flexShrink: 0 }}>🏛️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: '#ea580c', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Campus Vault
          </span>
        </Link>
      </div>

      {/* ── User card ── */}
      <div style={{ margin: '10px 10px 6px', padding: '10px 11px', borderRadius: 11, background: cfg.colorMuted, border: `1.5px solid ${cfg.colorBorder}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: cfg.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: '#1a1a2e', fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name ?? 'Student'}
            </div>
            <div style={{ color: cfg.color, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
              <span>{cfg.emoji}</span>
              <span>{cfg.label}</span>
              {(user as any)?.isVerified && <span style={{ color: '#16a34a', marginLeft: 2 }}>✓</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Role switcher ── */}
      <div style={{ padding: '0 10px 6px', flexShrink: 0 }}>
        <p style={{ color: '#b8a99a', fontSize: '0.63rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 2px 5px' }}>
          Switch Role
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {visibleRoles.map(r => {
            const rc = ROLE_CONFIG[r]
            const isActive  = r === userRole
            const isLoading = switching === r
            return (
              <button key={r} onClick={() => onSwitch(r)} disabled={!!switching}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 8px', borderRadius: 8,
                  fontSize: '0.72rem', fontWeight: 600,
                  cursor: isActive ? 'default' : 'pointer',
                  background: isActive ? rc.colorMuted : '#faf9f7',
                  border: `1.5px solid ${isActive ? rc.colorBorder : '#e8e2db'}`,
                  color: isActive ? rc.color : '#6b6560',
                  opacity: switching && !isLoading ? 0.45 : 1,
                  transition: 'all 0.16s ease', overflow: 'hidden',
                }}>
                {isLoading
                  ? <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px solid currentColor', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
                  : <span style={{ flexShrink: 0 }}>{rc.emoji}</span>}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rc.label}</span>
                {isActive && <span style={{ marginLeft: 'auto', width: 5, height: 5, borderRadius: '50%', background: rc.color, flexShrink: 0 }} />}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ height: 1, background: '#ede8e2', margin: '0 10px 6px', flexShrink: 0 }} />

      {/* ── Nav links ── */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {cfg.nav.map(item => {
          // Active detection: exact for dashboard root, prefix for everything else
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/')
              || pathname === item.href.split('?')[0]

          return (
            <Link key={item.href + item.label} href={item.href} onClick={onNav}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9,
                fontSize: '0.83rem', fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                background: isActive ? cfg.colorMuted : 'transparent',
                border: `1.5px solid ${isActive ? cfg.colorBorder : 'transparent'}`,
                color: isActive ? cfg.color : '#574f4a',
                transition: 'all 0.14s ease',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#1a1a2e'
                  e.currentTarget.style.background = '#f5f1ed'
                  e.currentTarget.style.borderColor = '#e8e2db'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.color = '#574f4a'
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }
              }}
            >
              <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />}
            </Link>
          )
        })}
      </nav>

      {/* ── Notifications ── */}
      <div style={{ padding: '0 8px' }}>
        <NotificationBell color={cfg.color} />
      </div>

      {/* ── Sign out ── */}
      <div style={{ padding: '8px', borderTop: '1px solid #ede8e2', flexShrink: 0 }}>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 9, fontSize: '0.83rem', fontWeight: 500, background: 'transparent', border: '1.5px solid transparent', color: '#8a807a', cursor: 'pointer', transition: 'all 0.14s ease' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#dc2626'; e.currentTarget.style.background = 'rgba(220,38,38,0.06)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#8a807a'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
        >
          <span>🚪</span><span>Sign Out</span>
        </button>
      </div>
    </div>
  )
}

// ─── Public sidebar (unauthenticated visitors) ────────────────────────────────
function PublicSidebar({ pathname, onNav }: { pathname: string; onNav: () => void }) {
  const publicNav = [
    { href: '/',                          label: 'Home',        icon: '🏠' },
    { href: '/marketplace',               label: 'Marketplace', icon: '🛍️' },
    { href: '/marketplace?rentable=true', label: 'Rentals',     icon: '🔄' },
    { href: '/services',                  label: 'Services',    icon: '🎓' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #ede8e2', flexShrink: 0 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏛️</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: '#ea580c', letterSpacing: '-0.01em' }}>
            Campus Vault
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {publicNav.map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname === item.href.split('?')[0] || pathname.startsWith(item.href.split('?')[0] + '/')
          return (
            <Link key={item.href} href={item.href} onClick={onNav}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 9,
                fontSize: '0.83rem', fontWeight: isActive ? 600 : 500,
                textDecoration: 'none',
                background: isActive ? 'rgba(234,88,12,0.08)' : 'transparent',
                border: `1.5px solid ${isActive ? 'rgba(234,88,12,0.2)' : 'transparent'}`,
                color: isActive ? '#ea580c' : '#574f4a',
                transition: 'all 0.14s ease',
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#1a1a2e'; e.currentTarget.style.background = '#f5f1ed'; e.currentTarget.style.borderColor = '#e8e2db' } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#574f4a'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' } }}
            >
              <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{item.icon}</span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              {isActive && <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#ea580c', flexShrink: 0 }} />}
            </Link>
          )
        })}
      </nav>

      {/* Auth CTAs */}
      <div style={{ padding: '10px 10px 14px', borderTop: '1px solid #ede8e2', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Link href="/login" onClick={onNav}
          style={{ display: 'block', textAlign: 'center', padding: '9px 12px', borderRadius: 9, fontSize: '0.83rem', fontWeight: 600, border: '1.5px solid #e2dbd4', color: '#574f4a', textDecoration: 'none', transition: 'all 0.14s ease', background: '#faf9f7' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#ea580c'; e.currentTarget.style.color = '#ea580c' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2dbd4'; e.currentTarget.style.color = '#574f4a' }}
        >
          Log in
        </Link>
        <Link href="/register" onClick={onNav}
          style={{ display: 'block', textAlign: 'center', padding: '9px 12px', borderRadius: 9, fontSize: '0.83rem', fontWeight: 600, background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', textDecoration: 'none', transition: 'all 0.14s ease' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(249,115,22,0.35)' }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none' }}
        >
          Sign up free
        </Link>
      </div>
    </div>
  )
}

// ─── Main AppShell ────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session, status, update } = useSession()
  const pathname  = usePathname()
  const router    = useRouter()
  const [switching, setSwitching] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false) }, [pathname])

  // Pages that should render fullscreen without the sidebar
  const NO_SHELL_ROUTES = ['/login', '/register']
  if (NO_SHELL_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return <>{children}</>
  }

  const isAuth   = status === 'authenticated'
  const userRole = ((session?.user as any)?.role ?? 'BUYER') as string
  const cfg      = ROLE_CONFIG[userRole] ?? ROLE_CONFIG.BUYER
  const user     = session?.user

  const switchRole = async (newRole: string) => {
    if (newRole === userRole || switching) return
    setSwitching(newRole)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      await update()
      router.refresh()
      toast.success(`Switched to ${ROLE_CONFIG[newRole].label}`)
      router.push('/dashboard')
    } catch {
      toast.error('Role switch failed')
    } finally {
      setSwitching(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f5f3f0' }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }

        /* ── Desktop sidebar ── */
        .cv-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: ${SIDEBAR_W}px; z-index: 40;
          background: #ffffff; border-right: 1.5px solid #ede8e2;
          box-shadow: 2px 0 12px rgba(0,0,0,0.04);
        }
        .cv-main {
          margin-left: ${SIDEBAR_W}px;
          min-height: 100vh; flex: 1; overflow-x: hidden;
        }

        /* ── Mobile topbar + drawer ── */
        .cv-topbar  { display: none; }
        .cv-overlay {
          display: none; position: fixed; inset: 0; z-index: 60;
          background: rgba(0,0,0,0.35); backdrop-filter: blur(2px);
        }
        .cv-overlay.open { display: block; }
        .cv-drawer {
          position: fixed; top: 0; left: 0; bottom: 0;
          width: 264px; z-index: 70;
          background: #ffffff; border-right: 1.5px solid #ede8e2;
          box-shadow: 4px 0 24px rgba(0,0,0,0.12);
          transform: translateX(-100%);
          transition: transform 0.26s cubic-bezier(.22,.68,0,1.2);
        }
        .cv-drawer.open { transform: translateX(0); }

        @media (max-width: 767px) {
          .cv-sidebar { display: none !important; }
          .cv-main    { margin-left: 0 !important; padding-top: ${MOBILE_H}px; }
          .cv-topbar  {
            display: flex; position: fixed; top: 0; left: 0; right: 0;
            height: ${MOBILE_H}px; z-index: 50;
            background: #ffffff; border-bottom: 1.5px solid #ede8e2;
            align-items: center; justify-content: space-between;
            padding: 0 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          }
        }
      `}</style>

      {/* ── Desktop sidebar ── */}
      <aside className="cv-sidebar">
        {isAuth
          ? <SidebarContent
              cfg={cfg} user={user} userRole={userRole}
              pathname={pathname} switching={switching}
              onSwitch={switchRole} onNav={() => {}}
            />
          : <PublicSidebar pathname={pathname} onNav={() => {}} />
        }
      </aside>

      {/* ── Mobile backdrop ── */}
      <div className={`cv-overlay${mobileOpen ? ' open' : ''}`} onClick={() => setMobileOpen(false)} />

      {/* ── Mobile drawer ── */}
      <div className={`cv-drawer${mobileOpen ? ' open' : ''}`}>
        {isAuth
          ? <SidebarContent
              cfg={cfg} user={user} userRole={userRole}
              pathname={pathname} switching={switching}
              onSwitch={switchRole} onNav={() => setMobileOpen(false)}
            />
          : <PublicSidebar pathname={pathname} onNav={() => setMobileOpen(false)} />
        }
      </div>

      {/* ── Mobile topbar ── */}
      <div className="cv-topbar">
        <button
          onClick={() => setMobileOpen(true)}
          style={{ color: '#78716c', background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' }}
          aria-label="Open menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <span style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: '#ea580c',
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          🏛️ Campus Vault
        </span>

        {isAuth ? (
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: cfg.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
            {user?.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        ) : (
          <Link href="/login" style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ea580c', textDecoration: 'none' }}>
            Log in
          </Link>
        )}
      </div>

      {/* ── Page content ── */}
      <main className="cv-main">
        {children}
      </main>
    </div>
  )
}
