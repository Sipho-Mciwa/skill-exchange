import { Link } from 'react-router-dom';
import { Listing, CATEGORY_LABELS } from '../types';

interface ListingCardProps {
  listing: Listing;
  distanceKm?: number;
}

export function ListingCard({ listing, distanceKm }: ListingCardProps) {
  const { title, description, type, category, creditsPerHour } = listing;

  return (
    <Link to={`/listings/${listing.id}`} className="block">
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
        {/* Header row */}
        <div className="flex items-center justify-between">
          {/* Type badge */}
          {type === 'offer'
            ? <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] font-semibold text-xs px-2.5 py-1 rounded-full">Offering</span>
            : <span className="bg-amber-50 text-amber-700 font-semibold text-xs px-2.5 py-1 rounded-full">Requesting</span>
          }
          {/* Category */}
          <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">{CATEGORY_LABELS[category]}</span>
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-[var(--color-text)] mt-3">{title}</h3>

        {/* Description */}
        <p className="text-sm text-[var(--color-text-sub)] mt-1 line-clamp-2">{description}</p>

        {/* Divider + footer */}
        <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--color-muted)] flex items-center gap-1">
            ⏱ {creditsPerHour} credits/hr
          </span>
          {distanceKm !== undefined && (
            <span className="bg-[var(--color-bg)] text-[var(--color-muted)] text-xs px-2 py-0.5 rounded-full">
              📍 {distanceKm < 0.5 ? 'Nearby' : `${distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
