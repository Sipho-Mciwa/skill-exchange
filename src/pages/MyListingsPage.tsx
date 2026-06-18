import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserListings, createListing, deactivateListing } from '../services/listings';
import { ListingForm } from '../components/ListingForm';
import { ListingCard } from '../components/ListingCard';
import { ListingCardSkeleton } from '../components/Skeleton';
import { Listing, ListingFormValues } from '../types';

export function MyListingsPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const id = await createListing(user.id, values, user.location);
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
        location: user.location,
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

  const active = listings.filter((l) => l.isActive);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> New listing
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {showForm && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Create listing</h2>
          <ListingForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </div>
      )}

      {loading ? (
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </div>
      ) : active.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          You have no active listings. Create one above!
        </p>
      ) : (
        <div className="grid gap-4">
          {active.map((listing) => (
            <div key={listing.id} className="relative">
              <ListingCard listing={listing} />
              <button
                onClick={() => handleDeactivate(listing.id)}
                title="Remove listing"
                className="absolute right-3 top-3 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
