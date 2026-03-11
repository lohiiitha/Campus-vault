'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { usePreloadListingImages } from '@/components/ui/ListingImage'

const categories = ['All', 'Textbooks', 'Electronics', 'Hostel Essentials', 'Clothing', 'Sports', 'Stationery', 'Vehicles', 'Services']

export default function MarketplacePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [sort, setSort] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [rentable, setRentable] = useState(searchParams.get('rentable') === 'true')

  usePreloadListingImages(listings)

  const fetchListings = async () => {
    setLoading(true)
    const params = new URLSearchParams({
      ...(search && { search }),
      ...(category && category !== 'All' && { category }),
      sort,
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(rentable && { rentable: 'true' }),
      page: String(page),
    })
    const res = await fetch(`/api/listings?${params}`)
    const data = await res.json()
    setListings(data.listings || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }

  useEffect(() => { fetchListings() }, [search, category, sort, minPrice, maxPrice, rentable, page])

  return (
    <div className="min-h-screen">
      <div className="pb-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl font-bold">Marketplace</h1>
              <p className="text-vault-muted mt-1">{total} items available</p>
            </div>
            <a href="/dashboard/listings/new" className="btn-primary">+ List Item</a>
          </div>

          {/* Search bar */}
          <div className="flex gap-3 mb-6">
            <input
              placeholder="🔍  Search listings by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ flex: 1, fontSize: '0.95rem', padding: '10px 16px', borderRadius: 10, border: '1.5px solid #ede8e2', background: '#fff', outline: 'none', color: '#1a1a2e' }}
            />
            <select className="input w-40" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="price_asc">Lowest Price</option>
              <option value="price_desc">Highest Price</option>
            </select>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 flex-wrap mb-6">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setCategory(cat === 'All' ? '' : cat); setPage(1) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  (cat === 'All' && !category) || category === cat
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600'
                    : 'border-vault-border text-vault-muted hover:border-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price range & rental toggle */}
          <div className="flex flex-wrap gap-3 mb-8 items-center">
            <input className="input w-32" type="number" placeholder="Min ₹" value={minPrice}
              onChange={e => { setMinPrice(e.target.value); setPage(1) }} />
            <input className="input w-32" type="number" placeholder="Max ₹" value={maxPrice}
              onChange={e => { setMaxPrice(e.target.value); setPage(1) }} />
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={rentable} onChange={e => { setRentable(e.target.checked); setPage(1) }}
                className="w-4 h-4 accent-orange-500" />
              <span className="text-sm font-medium">Rentable Only</span>
            </label>
          </div>

          {/* Listings grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="card rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-20 text-vault-muted">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg">No items found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} priority={i < 8} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                    p === page ? 'bg-orange-500 text-stone-800' : 'card text-vault-muted hover:text-stone-800'
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
