'use client'

const DOS = [
  'Textbooks, notes, and stationery',
  'Electronics like laptops, calculators, headphones',
  'Hostel essentials — fans, kettles, bedding',
  'Clothing, shoes, and accessories',
  'Sports equipment and gear',
  'Bicycles and campus vehicles',
  'Tutoring, tech help, and academic services',
]

const DONTS = [
  'Weapons of any kind — guns, knives, blades',
  'Drugs, narcotics, or any controlled substances',
  'Alcohol, tobacco, cigars, or vaping products',
  'Adult or explicit content',
  'Stolen or counterfeit items',
  'Anything illegal under Indian law',
]

export function GuidelinesModal({ onAccept }: { onAccept: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 18, maxWidth: 480, width: '100%',
        padding: '28px 28px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: '2.2rem', marginBottom: 8 }}>📋</div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
            Community Guidelines
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#92817a', lineHeight: 1.5 }}>
            Campus Vault is a student marketplace. Please read what's allowed before posting.
          </p>
        </div>

        {/* Do's */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#22c55e', marginBottom: 10 }}>
            ✅ You can list
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {DOS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.83rem', color: '#374151' }}>
                <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#ede8e2', margin: '16px 0' }} />

        {/* Don'ts */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', marginBottom: 10 }}>
            🚫 Strictly not allowed
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {DONTS.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.83rem', color: '#374151' }}>
                <span style={{ color: '#ef4444', flexShrink: 0, marginTop: 1 }}>✗</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Warning note */}
        <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: '0.78rem', color: '#b91c1c', lineHeight: 1.5 }}>
          ⚠️ Listings that violate these guidelines will be flagged. A second violation will result in your account being <strong>permanently disabled</strong>.
        </div>

        {/* Accept button */}
        <button onClick={onAccept}
          style={{ width: '100%', padding: '12px', borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #fbbf24)', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>
          I Understand & Agree
        </button>
      </div>
    </div>
  )
}
