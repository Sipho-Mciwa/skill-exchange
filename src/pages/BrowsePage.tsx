import React, { useEffect, useState, useMemo } from 'react';
import { getActiveListings, getListingsByLocation } from '../services/listings';
import { useLocation } from '../hooks/useLocation';
import { ListingCard } from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import { Listing, ListingCategory, LISTING_CATEGORIES, CATEGORY_LABELS } from '../types';

type TypeFilter = 'all' | 'offer' | 'request';

interface ListingWithDistance {
  listing: Listing;
  distanceKm: number | undefined;
}

export function BrowsePage() {
  const { location, error: locationError } = useLocation();
  const [listings, setListings] = useState<ListingWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<ListingCategory[]>([]);
  const [radiusKm, setRadiusKm] = useState(20);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const load = async () => {
      if (location && (location.lat !== 0 || location.lng !== 0)) {
        // Geo query — server-side distance filtering via GeoHash
        try {
          const results = await getListingsByLocation(location.lat, location.lng, radiusKm);
          if (results.length === 0) {
            console.warn('GeoHash query returned 0 results — index may still be building, falling back to full fetch');
            throw new Error('fallback');
          }
          setListings(results.map((r) => ({ listing: r, distanceKm: r.distanceKm })));
          return;
        } catch (err) {
          // Fall through to the full fetch fallback if geo query fails or returns nothing
          if (err instanceof Error && err.message !== 'fallback') {
            console.warn('GeoHash query error, falling back:', err.message);
          }
        }
      }

      // Fallback: fetch all active listings and attach distance if location is known
      const all = await getActiveListings();
      setListings(
        all.map((l) => {
          const hasLocation = l.location.lat !== 0 || l.location.lng !== 0;
          let distanceKm: number | undefined;
          if (location && hasLocation) {
            const dLat = (l.location.lat - location.lat) * (Math.PI / 180);
            const dLng = (l.location.lng - location.lng) * (Math.PI / 180);
            const a =
              Math.sin(dLat / 2) ** 2 +
              Math.cos(location.lat * (Math.PI / 180)) *
                Math.cos(l.location.lat * (Math.PI / 180)) *
                Math.sin(dLng / 2) ** 2;
            distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          }
          return { listing: l, distanceKm };
        })
      );
    };

    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, [location, radiusKm]);

  const filtered = useMemo(() => {
    return listings
      .filter(({ listing, distanceKm }) => {
        if (typeFilter !== 'all' && listing.type !== typeFilter) return false;
        if (categoryFilter.length > 0 && !categoryFilter.includes(listing.category)) return false;
        // When using the geo query the radius is already applied server-side,
        // but the fallback path still needs client-side filtering.
        if (distanceKm !== undefined && distanceKm > radiusKm) return false;
        return true;
      })
      .sort((a, b) => {
        if (a.distanceKm === undefined || b.distanceKm === undefined) return 0;
        return a.distanceKm - b.distanceKm;
      });
  }, [listings, typeFilter, categoryFilter, radiusKm]);

  const toggleCategory = (cat: ListingCategory) => {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">Browse Skills</h1>
        <p className="text-sm text-[var(--color-muted)] mt-1">
          Showing {filtered.length} skill{filtered.length !== 1 ? 's' : ''} within {radiusKm} km
        </p>
      </div>

      {/* Location warning */}
      {locationError && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm px-4 py-3 rounded-2xl">
          ⚠️ {locationError}
        </div>
      )}

      {/* Filter card */}
      <div className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm space-y-5">
        {/* TYPE */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">Type</p>
          <div className="inline-flex bg-[var(--color-bg)] rounded-full p-1 gap-1">
            {(['all', 'offer', 'request'] as TypeFilter[]).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 capitalize ${
                  typeFilter === t
                    ? 'bg-[var(--color-primary)] text-white shadow-sm'
                    : 'text-[var(--color-text-sub)] hover:bg-[var(--color-accent-light)]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)] mb-2">Category</p>
          <div className="flex flex-wrap gap-2">
            {LISTING_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`rounded-full border text-sm px-3 py-1 transition-all duration-150 ${
                  categoryFilter.includes(cat)
                    ? 'bg-[var(--color-primary)] text-white border-transparent'
                    : 'border-[var(--color-border)] text-[var(--color-text-sub)] hover:bg-[var(--color-accent-light)]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* RADIUS */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted)]">Radius</p>
            <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full"
            style={{ '--range-progress': `${((radiusKm - 1) / 19) * 100}%` } as React.CSSProperties}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">{error}</div>
      )}

      {/* Results */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <ListingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center text-center">
            <span className="text-5xl">🔍</span>
            <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">No skills found nearby</h3>
            <p className="mt-1 text-sm text-[var(--color-muted)]">Try adjusting your filters or expanding your radius.</p>
            {categoryFilter.length > 0 && (
              <button
                onClick={() => setCategoryFilter([])}
                className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Clear category filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map(({ listing, distanceKm }) => (
              <ListingCard key={listing.id} listing={listing} distanceKm={distanceKm} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
