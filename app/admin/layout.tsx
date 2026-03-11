import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f7f4' }}>
      {/* Admin mode banner */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #ede8e2',
        boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
        padding: '0 20px',
      }}>
        <div style={{
          maxWidth: 1024, margin: '0 auto',
          height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span className="badge badge-red" style={{ fontSize: '0.75rem' }}>⚙️ Admin Mode</span>
          <Link href="/dashboard" style={{
            fontSize: '0.82rem', color: '#574f4a', textDecoration: 'none',
            padding: '5px 12px', borderRadius: 7, border: '1.5px solid #e5dfd8',
            transition: 'all 0.14s ease',
          }}>
            ← Dashboard
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '0 20px' }}>
        {children}
      </div>
    </div>
  )
}
