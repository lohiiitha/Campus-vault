'use client'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function RentalsPage() {
  const [rentals, setRentals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRentals = async () => {
    const res = await fetch('/api/rentals')
    const data = await res.json()
    setRentals(data.rentals || [])
    setLoading(false)
  }

  useEffect(() => { fetchRentals() }, [])

  const handleReturn = async (id: string) => {
    const res = await fetch(`/api/rentals/${id}/return`, { method: 'POST' })
    if (res.ok) { toast.success('Item returned!'); fetchRentals() }
    else toast.error('Failed')
  }

  const statusColor: Record<string, string> = {
    ACTIVE: 'badge-green', RETURNED: 'badge-blue', OVERDUE: 'badge-red'
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Rentals</h1>
        <p className="text-vault-muted text-sm mt-1">Items you're renting and renting out</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="card h-24 rounded-xl animate-pulse" />)}
        </div>
      ) : rentals.length === 0 ? (
        <div className="card p-12 rounded-xl text-center">
          <div className="text-5xl mb-4">🔄</div>
          <p className="text-vault-muted mb-4">No rentals yet.</p>
          <a href="/marketplace?rentable=true" className="btn-primary">Browse Rentable Items</a>
        </div>
      ) : (
        <div className="space-y-3">
          {rentals.map((r: any) => (
            <div key={r.id} className="card p-4 rounded-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-stone-50 flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{r.listing?.title}</div>
                    <div className="text-xs text-vault-muted mt-0.5">
                      {new Date(r.startDate).toLocaleDateString()} → {new Date(r.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-vault-muted mt-0.5">
                      Renter: {r.renter?.name} • Owner: {r.owner?.name}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-gradient">₹{r.totalPrice}</div>
                  {r.deposit && <div className="text-xs text-vault-muted">Deposit: ₹{r.deposit}</div>}
                  <span className={`badge text-xs mt-1 ${statusColor[r.status]}`}>{r.status}</span>
                  {r.status === 'ACTIVE' && (
                    <button onClick={() => handleReturn(r.id)}
                      className="block mt-2 text-xs text-green-400 hover:text-green-300 transition-colors">
                      ✓ Mark Returned
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
