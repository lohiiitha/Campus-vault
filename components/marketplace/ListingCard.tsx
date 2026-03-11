'use client'
import Link from 'next/link'
import { ListingImage } from '@/components/ui/ListingImage'

function StarRating({ ratings }: { ratings: { score: number }[] }) {
  if (!ratings?.length) return <span className="text-vault-muted text-xs">No ratings</span>
  const avg = ratings.reduce((a, b) => a + b.score, 0) / ratings.length
  return (
    <span className="flex items-center gap-1 text-xs">
      <span style={{ color: '#f59e0b' }}>★</span>
      <span className="font-medium">{avg.toFixed(1)}</span>
      <span className="text-vault-muted">({ratings.length})</span>
    </span>
  )
}

const conditionColors: Record<string, string> = {
  NEW:      'badge-green',
  LIKE_NEW: 'badge-blue',
  USED:     'badge-yellow',
}

export function ListingCard({ listing, priority = false }: { listing: any; priority?: boolean }) {
  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="card card-hover rounded-xl overflow-hidden flex flex-col"
      style={{ textDecoration: 'none' }}
    >
      {/* ── Image ── */}
      <div className="relative" style={{ height: 180, background: '#f5f0eb', flexShrink: 0, overflow: 'hidden' }}>
        <ListingImage
          src={listing.images?.[0]}
          alt={listing.title}
          title={listing.title}
          category={listing.category}
          size="md"
          priority={priority}
        />
        {listing.isUrgent && (
          <div className="badge badge-red absolute top-2 left-2" style={{ zIndex: 10 }}>⚡ Urgent</div>
        )}
        {listing.isRentable && (
          <div className="badge badge-purple absolute top-2 right-2" style={{ zIndex: 10 }}>🔄 Rentable</div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-3 flex-1 flex flex-col">
        <div className={`badge ${conditionColors[listing.condition] || 'badge-yellow'} mb-2 self-start`}>
          {listing.condition?.replace('_', ' ')}
        </div>
        <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2" style={{ color: '#1a1a2e' }}>
          {listing.title}
        </h3>
        <div className="text-xs text-vault-muted mb-2">{listing.category}</div>

        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gradient">₹{listing.price?.toLocaleString()}</span>
              {listing.isRentable && listing.rentalPrice && (
                <div style={{ fontSize: '0.72rem', color: '#7c3aed', marginTop: 1 }}>
                  ₹{listing.rentalPrice}/day rent
                </div>
              )}
            </div>
          </div>
          {listing.seller && (
            <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid #ede8e2' }}>
              <span className="text-xs text-vault-muted truncate" style={{ maxWidth: 100 }}>
                {listing.seller.name}
              </span>
              <StarRating ratings={listing.seller.ratingsReceived} />
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
