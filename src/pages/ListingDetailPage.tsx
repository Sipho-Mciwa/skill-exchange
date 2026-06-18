import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, MapPin, Tag } from 'lucide-react';
import { getListing } from '../services/listings';
import { getOrCreateConversation } from '../services/conversations';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/Skeleton';
import { Listing, CATEGORY_LABELS } from '../types';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListing(id)
      .then(setListing)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load listing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleContact = async () => {
    if (!user || !listing) return;
    setContacting(true);
    try {
      const conversationId = await getOrCreateConversation(
        user.id,
        listing.userId,
        listing.id,
        listing.title
      );
      navigate(`/conversations/${conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start conversation');
      setContacting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-32 w-full" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
      </main>
    );
  }

  if (!listing) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-gray-500">Listing not found.</p>
      </main>
    );
  }

  const isOwner = user?.id === listing.userId;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2">
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

        <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
        <p className="mt-4 text-gray-700 leading-relaxed">{listing.description}</p>

        <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {listing.creditsPerHour} credit{listing.creditsPerHour !== 1 ? 's' : ''}/hr
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            Within {listing.radiusKm} km
          </span>
        </div>

        {listing.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {listing.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                <Tag size={10} /> {tag}
              </span>
            ))}
          </div>
        )}

        {!isOwner && (
          <button
            onClick={handleContact}
            disabled={contacting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 sm:w-auto sm:px-6"
          >
            <MessageSquare size={16} />
            {contacting ? 'Opening chat…' : 'Contact'}
          </button>
        )}

        {isOwner && (
          <p className="mt-6 text-sm text-gray-400 italic">This is your listing.</p>
        )}
      </div>
    </main>
  );
}
