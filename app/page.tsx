'use client'
import Link from 'next/link'

const stats = [
  { label: 'Active Students', value: '10K+' },
  { label: 'Items Listed', value: '50K+' },
  { label: 'Colleges', value: '25+' },
  { label: 'Transactions', value: '₹2Cr+' },
]

const categories = [
  { name: 'Textbooks', icon: '📚', count: '2.4K' },
  { name: 'Electronics', icon: '💻', count: '1.8K' },
  { name: 'Hostel Essentials', icon: '🏠', count: '3.1K' },
  { name: 'Clothing', icon: '👕', count: '920' },
  { name: 'Sports', icon: '⚽', count: '540' },
  { name: 'Stationery', icon: '✏️', count: '670' },
  { name: 'Vehicles', icon: '🚲', count: '210' },
  { name: 'Services', icon: '🎓', count: '380' },
]

const trustBadges = [
  { icon: '🎓', label: 'College Email Verified' },
  { icon: '🛡️', label: 'Fraud Protection' },
  { icon: '⭐', label: 'Peer Ratings' },
  { icon: '⚡', label: 'Instant Chat' },
]

export default function Home() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative pt-10 pb-10 px-4 overflow-hidden">
        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-orange-300/10 blur-[130px] pointer-events-none" />
        <div className="absolute top-32 right-10 w-56 h-56 rounded-full bg-amber-300/10 blur-[90px] pointer-events-none" />
        <div className="absolute top-32 left-10 w-56 h-56 rounded-full bg-orange-300/10 blur-[90px] pointer-events-none" />

        {/* Subtle grid lines background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          {/* Pill badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-8 animate-fade-in"
            style={{
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.25)',
              color: '#fb923c',
              letterSpacing: '0.12em',
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-orange-400"
              style={{ animation: 'pulseSoft 2s ease-in-out infinite' }}
            />
            Student-Verified Marketplace
          </div>

          <h1
            className="font-display font-bold leading-[1.08] mb-5 animate-slide-up"
            style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)' }}
          >
            The marketplace
            <br />
            <span
              style={{
                background: 'linear-gradient(130deg, #f97316 0%, #fbbf24 55%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              built for campus.
            </span>
          </h1>

          <p
            className="animate-slide-up delay-100 mx-auto mb-10"
            style={{
              color: '#6b6a73',
              fontSize: '1.1rem',
              maxWidth: '34rem',
              lineHeight: 1.65,
            }}
          >
            Buy textbooks, sell gear, or offer your skills — all within your
            verified student community. No strangers, no scams.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12 animate-slide-up delay-200">
            <Link
              href="/register"
              className="btn-primary"
              style={{ fontSize: '0.95rem', padding: '12px 28px' }}
            >
              Join for Free →
            </Link>
            <Link
              href="/marketplace"
              className="btn-secondary"
              style={{ fontSize: '0.95rem', padding: '12px 28px' }}
            >
              Browse Listings
            </Link>
          </div>

          {/* Trust badges row */}
          <div className="flex flex-wrap justify-center gap-3 animate-slide-up delay-300">
            {trustBadges.map((b) => (
              <span
                key={b.label}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: '#78716c' }}
              >
                <span>{b.icon}</span>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── THREE CORE ACTION CARDS ──────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Section label */}
          <p
            className="text-center text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#f97316', letterSpacing: '0.15em' }}
          >
            What do you want to do?
          </p>
          <h2 className="font-display text-center font-bold mb-10" style={{ fontSize: '2rem' }}>
            Choose your role
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* ── BUY CARD ── */}
            <Link
              href="/marketplace"
              className="group relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e5dfd8',
                transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease, border-color 0.28s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(59,130,246,0.18)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.45)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#e5dfd8'
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)' }} />

              {/* Glow orb (visible on hover via group) */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle, rgba(59,130,246,0.18) 0%, transparent 70%)',
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div className="p-7 flex flex-col flex-1 relative">
                {/* Icon container */}
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.2)',
                  }}
                >
                  🛍️
                </div>

                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#3b82f6', letterSpacing: '0.12em' }}
                >
                  For Buyers
                </div>
                <h3 className="font-display font-bold text-stone-800 mb-2" style={{ fontSize: '1.5rem' }}>
                  Buy Items
                </h3>
                <p className="text-sm mb-6" style={{ color: '#78716c', lineHeight: 1.6 }}>
                  Browse thousands of student-listed textbooks, electronics, and hostel essentials at fair prices.
                </p>

                {/* Bottom stats row */}
                <div
                  className="flex gap-4 pt-4 mb-6"
                  style={{ borderTop: '1.5px solid #e5dfd8' }}
                >
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>50K+</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Listings</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>8 cats</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Categories</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>₹50+</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>From price</div>
                  </div>
                </div>

                <div
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 transition-all"
                  style={{
                    background: 'rgba(59,130,246,0.12)',
                    border: '1px solid rgba(59,130,246,0.25)',
                    color: '#60a5fa',
                  }}
                >
                  Browse Listings
                  <span style={{ transition: 'transform 0.2s ease' }} className="group-hover:translate-x-1 inline-block">→</span>
                </div>
              </div>
            </Link>

            {/* ── SELL CARD ── (featured / center) */}
            <Link
              href="/dashboard/listings/new"
              className="group relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(160deg, #1a1208 0%, #13111a 60%)',
                border: '1px solid rgba(249,115,22,0.3)',
                transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease, border-color 0.28s ease',
                boxShadow: '0 0 0 1px rgba(249,115,22,0.08), inset 0 1px 0 rgba(249,115,22,0.08)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px) scale(1.01)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 28px 70px rgba(249,115,22,0.22)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.6)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0) scale(1)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 1px rgba(249,115,22,0.08), inset 0 1px 0 rgba(249,115,22,0.08)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.3)'
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f97316, #fbbf24, #f97316)' }} />

              {/* "Most Popular" badge */}
              <div className="absolute top-5 right-5 z-10">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: 'rgba(249,115,22,0.15)',
                    border: '1px solid rgba(249,115,22,0.3)',
                    color: '#f97316',
                    letterSpacing: '0.04em',
                  }}
                >
                  Most Popular
                </span>
              </div>

              {/* Glow orb */}
              <div
                className="absolute -top-8 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)',
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div className="p-7 flex flex-col flex-1 relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{
                    background: 'rgba(249,115,22,0.12)',
                    border: '1px solid rgba(249,115,22,0.25)',
                  }}
                >
                  💰
                </div>

                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#f97316', letterSpacing: '0.12em' }}
                >
                  For Sellers
                </div>
                <h3 className="font-display font-bold text-stone-800 mb-2" style={{ fontSize: '1.5rem' }}>
                  Sell Items
                </h3>
                <p className="text-sm mb-6" style={{ color: '#78716c', lineHeight: 1.6 }}>
                  Turn unused gear into cash. List in 2 minutes — textbooks, gadgets, hostel stuff — and reach buyers on your campus.
                </p>

                <div
                  className="flex gap-4 pt-4 mb-6"
                  style={{ borderTop: '1px solid rgba(249,115,22,0.1)' }}
                >
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>2 min</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>To list</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>0%</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Platform fee</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>Fast</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Payouts</div>
                  </div>
                </div>

                <div
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 text-stone-800 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #f97316, #ea580c)',
                    boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
                  }}
                >
                  Post an Item
                  <span className="group-hover:translate-x-1 inline-block" style={{ transition: 'transform 0.2s ease' }}>→</span>
                </div>
              </div>
            </Link>

            {/* ── SERVICES CARD ── */}
            <Link
              href="/services"
              className="group relative flex flex-col rounded-2xl overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1.5px solid #e5dfd8',
                transition: 'transform 0.28s cubic-bezier(.22,.68,0,1.2), box-shadow 0.28s ease, border-color 0.28s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = '0 24px 60px rgba(168,85,247,0.18)'
                ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.45)'
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
                ;(e.currentTarget as HTMLElement).style.borderColor = '#e5dfd8'
              }}
            >
              {/* Top accent bar */}
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #a855f7, #c084fc)' }} />

              {/* Glow orb */}
              <div
                className="absolute -top-10 -left-10 w-40 h-40 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
                style={{
                  background: 'radial-gradient(circle, rgba(168,85,247,0.16) 0%, transparent 70%)',
                  transition: 'opacity 0.3s ease',
                }}
              />

              <div className="p-7 flex flex-col flex-1 relative">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-5"
                  style={{
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.2)',
                  }}
                >
                  🎓
                </div>

                <div
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#a855f7', letterSpacing: '0.12em' }}
                >
                  For Providers
                </div>
                <h3 className="font-display font-bold text-stone-800 mb-2" style={{ fontSize: '1.5rem' }}>
                  Offer Services
                </h3>
                <p className="text-sm mb-6" style={{ color: '#78716c', lineHeight: 1.6 }}>
                  Monetise your skills — tutoring, tech repair, notes, design. Set your hourly rate and start earning from campus.
                </p>

                <div
                  className="flex gap-4 pt-4 mb-6"
                  style={{ borderTop: '1.5px solid #e5dfd8' }}
                >
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>₹200+</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Per hour</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>380+</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Listed</div>
                  </div>
                  <div>
                    <div className="font-bold text-base" style={{ color: '#1a1a2e' }}>4 types</div>
                    <div className="text-xs" style={{ color: '#78716c' }}>Categories</div>
                  </div>
                </div>

                <div
                  className="mt-auto inline-flex items-center gap-2 font-semibold text-sm rounded-xl px-5 py-3 transition-all"
                  style={{
                    background: 'rgba(168,85,247,0.12)',
                    border: '1px solid rgba(168,85,247,0.25)',
                    color: '#c084fc',
                  }}
                >
                  Offer a Service
                  <span className="group-hover:translate-x-1 inline-block" style={{ transition: 'transform 0.2s ease' }}>→</span>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────────────────── */}
      <section className="py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden"
            style={{ background: '#e5dfd8' }}
          >
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center py-7 px-4"
                style={{ background: '#ffffff' }}
              >
                <div
                  className="font-display font-bold mb-1"
                  style={{
                    fontSize: '1.8rem',
                    background: 'linear-gradient(135deg, #f97316, #fbbf24)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {s.value}
                </div>
                <div className="text-xs font-medium" style={{ color: '#78716c' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATEGORIES ───────────────────────────────────────────────── */}
      <section className="py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <p
            className="text-center text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#f97316', letterSpacing: '0.15em' }}
          >
            Explore
          </p>
          <h2 className="font-display font-bold text-center mb-8" style={{ fontSize: '1.9rem' }}>
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${cat.name}`}
                className="group flex items-center gap-3 rounded-xl px-4 py-3.5 transition-all"
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #e5dfd8',
                  transition: 'border-color 0.2s, background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(249,115,22,0.35)'
                  ;(e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.04)'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#e5dfd8'
                  ;(e.currentTarget as HTMLElement).style.background = '#ffffff'
                  ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                }}
              >
                <span className="text-xl flex-shrink-0">{cat.icon}</span>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-stone-800 truncate">{cat.name}</div>
                  <div className="text-xs" style={{ color: '#78716c' }}>{cat.count} items</div>
                </div>
                <span
                  className="ml-auto text-xs opacity-0 group-hover:opacity-100"
                  style={{ color: '#f97316', transition: 'opacity 0.2s' }}
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="py-16 px-4 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(249,115,22,0.025) 50%, transparent 100%)' }}
        />
        <div className="max-w-4xl mx-auto relative">
          <p
            className="text-center text-xs font-semibold tracking-widest uppercase mb-3"
            style={{ color: '#f97316', letterSpacing: '0.15em' }}
          >
            Simple Process
          </p>
          <h2 className="font-display font-bold text-center mb-12" style={{ fontSize: '1.9rem' }}>
            Up and running in minutes
          </h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div
              className="hidden md:block absolute top-7 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), rgba(249,115,22,0.3), transparent)' }}
            />
            {[
              { step: '01', icon: '🎓', title: 'Verify Your Student Email', desc: 'Sign up with your college email. Your verified badge unlocks the full marketplace.' },
              { step: '02', icon: '🔍', title: 'Pick Your Role', desc: 'Choose to buy, sell, or offer services. You can switch anytime from your profile.' },
              { step: '03', icon: '🤝', title: 'Transact Safely', desc: 'Chat, negotiate, and complete deals — all with peer ratings protecting every side.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl mb-4 relative z-10"
                  style={{
                    background: 'rgba(249,115,22,0.1)',
                    border: '1px solid rgba(249,115,22,0.25)',
                  }}
                >
                  {item.icon}
                </div>
                <div
                  className="text-xs font-bold tracking-widest mb-2"
                  style={{ color: 'rgba(249,115,22,0.6)', letterSpacing: '0.15em' }}
                >
                  STEP {item.step}
                </div>
                <h3 className="font-display font-bold text-stone-800 mb-2" style={{ fontSize: '1.05rem' }}>
                  {item.title}
                </h3>
                <p className="text-sm" style={{ color: '#78716c', lineHeight: 1.65 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto">
          <div
            className="relative rounded-2xl overflow-hidden p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, #1a1208 0%, #130e1a 100%)',
              border: '1px solid rgba(249,115,22,0.2)',
              boxShadow: '0 2px 24px rgba(249,115,22,0.08)',
            }}
          >
            {/* Background glow */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at 50% 0%, rgba(249,115,22,0.12) 0%, transparent 65%)',
              }}
            />
            <div className="relative">
              <div className="text-3xl mb-4">🏛️</div>
              <h2 className="font-display font-bold text-stone-800 mb-3" style={{ fontSize: '2rem' }}>
                Ready to save money on campus?
              </h2>
              <p className="mb-8 text-sm" style={{ color: '#78716c', lineHeight: 1.65 }}>
                Thousands of students are already buying and selling smarter.
                Join your campus community today — it's completely free.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Link href="/register" className="btn-primary" style={{ justifyContent: 'center', padding: '12px 32px' }}>
                  Create Free Account →
                </Link>
                <Link href="/marketplace" className="btn-secondary" style={{ justifyContent: 'center', padding: '12px 32px' }}>
                  Explore Listings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-4 text-sm"
        style={{ borderTop: '1px solid #ede8e2' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-display font-bold text-stone-800 text-lg">
            🏛️ Campus Vault
          </div>
          <div className="flex gap-6">
            <Link href="/marketplace" className="hover:text-stone-800 transition-colors">Marketplace</Link>
            <Link href="/marketplace?rentable=true" className="hover:text-stone-800 transition-colors">Rentals</Link>
            <Link href="/services" className="hover:text-stone-800 transition-colors">Services</Link>
          </div>
          <div>© 2024 Campus Vault — for students, by students.</div>
        </div>
      </footer>
    </div>
  )
}
