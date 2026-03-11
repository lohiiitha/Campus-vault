'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import Link from 'next/link'

export default function DashboardServicesPage() {
  const { data: session } = useSession()
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchServices = async () => {
    const res = await fetch('/api/services')
    const data = await res.json()
    const mine = data.services?.filter((s: any) => s.provider?.name === session?.user?.name) || []
    setServices(mine)
    setLoading(false)
  }

  useEffect(() => { if (session) fetchServices() }, [session])

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold">My Services</h1>
          <p className="text-vault-muted text-sm mt-1">Services you've offered to campus</p>
        </div>
        <Link href="/services" className="btn-primary">+ Add Service</Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="card h-24 rounded-xl animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="card p-12 rounded-xl text-center">
          <div className="text-5xl mb-4">🔧</div>
          <p className="text-vault-muted mb-4">You haven't listed any services yet.</p>
          <Link href="/services" className="btn-primary">Offer a Service</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s: any) => (
            <div key={s.id} className="card p-4 rounded-xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-vault-muted text-sm">{s.category} • ₹{s.hourlyPrice}/hr</div>
                <div className="text-vault-muted text-xs mt-1">{s.description.substring(0, 60)}...</div>
              </div>
              <span className={`badge ${s.isAvailable ? 'badge-green' : 'badge-red'}`}>
                {s.isAvailable ? 'Active' : 'Paused'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
