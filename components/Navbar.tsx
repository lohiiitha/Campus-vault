'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export function Navbar() {
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1.5px solid #ede8e2',
        boxShadow: '0 1px 8px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>🏛️</span>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#ea580c', whiteSpace: 'nowrap' }}>
              Campus Vault
            </span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }} className="nav-links-desktop">
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/marketplace?rentable=true', label: 'Rentals' },
              { href: '/services', label: 'Services' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.88rem', fontWeight: 500,
                color: '#574f4a', textDecoration: 'none', transition: 'all 0.14s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#1a1a2e'; (e.currentTarget as HTMLAnchorElement).style.background = '#f5f1ed' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#574f4a'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop auth buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }} className="nav-auth-desktop">
            {session ? (
              <>
                <Link href="/dashboard" className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Dashboard</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem', color: '#78716c', padding: '7px 10px', borderRadius: 8, transition: 'color 0.14s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#1a1a2e')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#78716c')}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="btn-secondary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Log in</Link>
                <Link href="/register" className="btn-primary" style={{ padding: '7px 16px', fontSize: '0.85rem' }}>Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', padding: 6, borderRadius: 8, display: 'none', alignItems: 'center' }}
            aria-label="Toggle menu"
          >
            {menuOpen
              ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div style={{
            background: '#ffffff', borderTop: '1px solid #ede8e2',
            padding: '12px 16px 16px', display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {[
              { href: '/marketplace', label: 'Marketplace' },
              { href: '/marketplace?rentable=true', label: 'Rentals' },
              { href: '/services', label: 'Services' },
            ].map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                style={{ padding: '10px 12px', borderRadius: 8, fontSize: '0.9rem', color: '#574f4a', textDecoration: 'none', fontWeight: 500 }}>
                {l.label}
              </Link>
            ))}
            <div style={{ height: 1, background: '#ede8e2', margin: '6px 0' }} />
            {session ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>Dashboard</Link>
                <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: '/' }) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#78716c', fontSize: '0.88rem', padding: '10px 12px', textAlign: 'left', borderRadius: 8 }}>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-secondary" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>Log in</Link>
                <Link href="/register" onClick={() => setMenuOpen(false)} className="btn-primary" style={{ justifyContent: 'center', padding: '10px 16px', fontSize: '0.88rem' }}>Sign up</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 767px) {
          .nav-links-desktop { display: none !important; }
          .nav-auth-desktop  { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
      `}</style>
    </>
  )
}
