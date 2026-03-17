'use client'
import React, { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ListingCard } from '@/components/marketplace/ListingCard'
import { usePreloadListingImages } from '@/components/ui/ListingImage'

const categories = ['All', 'Textbooks', 'Electronics', 'Hostel Essentials', 'Clothing', 'Sports', 'Stationery', 'Vehicles', 'Services']

// 🔹 INNER COMPONENT (uses searchParams)
function MarketplaceContent() {
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

  useEffect(() => {
    fetchListings()
  }, [search, category, sort, minPrice, maxPrice, rentable, page])

  return (
    <div className="min-h-screen">
      <div className="pb-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-4">Marketplace</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {listings.map((listing, i) => (
                <ListingCard key={listing.id} listing={listing} priority={i < 8} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 🔹 OUTER COMPONENT (wrap with Suspense)
export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Loading marketplace...</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}