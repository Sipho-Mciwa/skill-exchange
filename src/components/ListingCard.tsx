import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import { Listing, CATEGORY_LABELS } from '../types';

interface ListingCardProps {
  listing: Listing;
  distanceKm?: number;
}

export function ListingCard({ listing, distanceKm }: ListingCardProps) {
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            listing.type === 'offer'
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {listing.type === 'offer' ? 'Offering' : 'Requesting'}
        </span>
        <span className="text-xs text-gray-500">{CATEGORY_LABELS[listing.category]}</span>
      </div>

      <h3 className="mt-1 font-semibold text-gray-900 line-clamp-1">{listing.title}</h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{listing.description}</p>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Clock size={12} />
          {listing.creditsPerHour} credit{listing.creditsPerHour !== 1 ? 's' : ''}/hr
        </span>
        {distanceKm !== undefined && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {distanceKm.toFixed(1)} km away
          </span>
        )}
      </div>
    </Link>
  );
}
