import { useEffect, useState, useMemo } from 'react';
import { getActiveListings } from '../services/listings';
import { useLocation } from '../hooks/useLocation';
import { haversineKm } from '../utils/distance';
import { ListingCard } from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import { Listing, ListingCategory, LISTING_CATEGORIES, CATEGORY_LABELS } from '../types';

type TypeFilter = 'all' | 'offer' | 'request';

export function BrowsePage() {
  const { location, error: locationError } = useLocation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ListingCategory[]>([]);
  const [radiusKm, setRadiusKm] = useState(20);

  useEffect(() => {
    setLoading(true);
    getActiveListings()
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return listings
      .map((l) => ({
        listing: l,
        distanceKm: location ? haversineKm(location, l.location) : undefined,
      }))
      .filter(({ listing, distanceKm }) => {
        if (typeFilter !== 'all' && listing.type !== typeFilter) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(listing.category)) return false;
        if (distanceKm !== undefined && distanceKm > radiusKm) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm === undefined || b.distanceKm === undefined) return 0;
        return a.distanceKm - b.distanceKm;
      });
  }, [listings, location, typeFilter, categoryFilter, radiusKm]);

  const toggleCategory = (cat: ListingCategory) => {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Browse Skills</h1>

      {locationError && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{locationError}</p>
      )}

      {/* Filter bar */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-4">
        {/* Type toggle */}
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</span>
          <div className="mt-2 flex gap-2">
            {(['all', 'offer', 'request'] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`rounded-full px-3 py-1 text-sm capitalize transition-colors ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Category
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {LISTING_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  categoryFilter.includes(cat)
                    ? 'bg-indigo-100 text-indigo-700 font-semibold'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Radius slider */}
        <div>
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Radius: {radiusKm} km
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="mt-2 w-full"
          />
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-500">
          No listings match your filters. Try expanding the radius or clearing categories.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ listing, distanceKm }) => (
            <ListingCard key={listing.id} listing={listing} distanceKm={distanceKm} />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-gray-400">
        ℹ️ Distance filtering is client-side for MVP. Will be replaced with GeoHash indexing at scale.
      </p>
    </main>
  );
}
