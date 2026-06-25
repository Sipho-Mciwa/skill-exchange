import { useEffect, useState } from 'react';
import { Plus, Trash2, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserListings, createListing, deactivateListing, updateListing } from '../services/listings';
import { ListingForm } from '../components/ListingForm';
import { Listing, ListingFormValues, GeoPoint } from '../types';

function getCurrentPosition(): Promise<GeoPoint | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    );
  });
}

export function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingLocationId, setUpdatingLocationId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getUserListings(user.id)
      .then(setListings)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listings'))
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async (values: ListingFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const gps = await getCurrentPosition();
      const location = gps ?? user.location;
      const id = await createListing(user.id, values, location);
      const newListing: Listing = {
        id,
        userId: user.id,
        type: values.type,
        title: values.title,
        description: values.description,
        category: values.category,
        tags: values.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        location,
        radiusKm: values.radiusKm,
        creditsPerHour: values.creditsPerHour,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      setListings((prev) => [newListing, ...prev]);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivateListing(id);
      setListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove listing');
    }
  };

  const handleUpdateLocation = async (id: string) => {
    setUpdatingLocationId(id);
    setError(null);
    try {
      const gps = await getCurrentPosition();
      if (!gps) { setError('Could not get your location. Please allow location access and try again.'); return; }
      await updateListing(id, {}, gps);
      setListings((prev) => prev.map((l) => l.id === id ? { ...l, location: gps } : l));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update location');
    } finally {
      setUpdatingLocationId(null);
    }
  };

  const active = listings.filter((l) => l.isActive);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">My Listings</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Manage your skill offers and requests</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
        >
          <Plus size={16} /> New listing
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Form panel */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Create listing</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors text-lg leading-none"
              aria-label="Close form"
            >
              ✕
            </button>
          </div>
          <ListingForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </div>
      )}

      {/* Listings grid or empty state */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--color-border)] p-5 animate-pulse">
              <div className="h-5 w-20 bg-[var(--color-border)] rounded-full mb-3" />
              <div className="h-5 w-3/4 bg-[var(--color-border)] rounded mb-2" />
              <div className="h-4 w-full bg-[var(--color-border)] rounded" />
            </div>
          ))}
        </div>
      ) : active.length === 0 && !showForm ? (
        <div className="py-20 flex flex-col items-center text-center">
          <span className="text-6xl">🌱</span>
          <h3 className="mt-4 text-xl font-semibold text-[var(--color-text)]">You haven't listed any skills yet</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)] max-w-sm">Share what you know — someone nearby is waiting to learn it.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors"
          >
            <Plus size={16} /> Create your first listing
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((listing) => (
            <div key={listing.id} className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm hover:shadow-md transition-all duration-200">
              {/* Card header */}
              <div className="flex items-center justify-between">
                {listing.type === 'offer'
                  ? <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] font-semibold text-xs px-2.5 py-1 rounded-full">Offering</span>
                  : <span className="bg-amber-50 text-amber-700 font-semibold text-xs px-2.5 py-1 rounded-full">Requesting</span>
                }
                <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs font-medium px-2 py-0.5 rounded-full">Active</span>
              </div>
              {/* Title + description */}
              <h3 className="text-base font-semibold text-[var(--color-text)] mt-3">{listing.title}</h3>
              <p className="text-sm text-[var(--color-text-sub)] mt-1 line-clamp-2">{listing.description}</p>
              {/* Credits */}
              <p className="text-xs text-[var(--color-muted)] mt-2">⏱ {listing.creditsPerHour} credits/hr</p>
              {/* Location indicator */}
              {listing.location.lat === 0 && listing.location.lng === 0 && (
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <MapPin size={12} /> No location set — distance won't show on Browse
                </p>
              )}
              {/* Action row */}
              <div className="border-t border-[var(--color-border)] mt-4 pt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleUpdateLocation(listing.id)}
                  disabled={updatingLocationId === listing.id}
                  title="Update location to current GPS"
                  className="flex items-center gap-1.5 text-xs text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors px-2 py-1 rounded-lg disabled:opacity-50"
                >
                  {updatingLocationId === listing.id ? (
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <MapPin size={13} />
                  )}
                  Update location
                </button>
                <button
                  onClick={() => handleDeactivate(listing.id)}
                  title="Remove listing"
                  className="text-[var(--color-muted)] hover:text-red-500 transition-colors p-1.5 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
