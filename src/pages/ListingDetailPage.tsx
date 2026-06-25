import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import { getListing } from '../services/listings';
import { getUserProfile } from '../services/users';
import { getOrCreateConversation } from '../services/conversations';
import { useAuth } from '../contexts/AuthContext';
import { Listing, CATEGORY_LABELS, UserProfile } from '../types';

export function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [poster, setPoster] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contacting, setContacting] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getListing(id)
      .then((l) => {
        setListing(l);
        if (l) return getUserProfile(l.userId);
        return null;
      })
      .then((p) => setPoster(p))
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
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-5 w-28 bg-[var(--color-border)] rounded-full animate-pulse mb-6" />
          <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">
            <div className="bg-[var(--color-border)] animate-pulse h-16" />
            <div className="px-6 py-6 space-y-3">
              <div className="h-6 w-3/4 bg-[var(--color-border)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--color-border)] rounded animate-pulse" />
              <div className="h-4 w-full bg-[var(--color-border)] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[var(--color-border)] rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing && !error) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="py-20 flex flex-col items-center text-center">
            <span className="text-5xl">🔍</span>
            <h2 className="mt-4 text-xl font-semibold text-[var(--color-text)]">Listing not found</h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">This skill may have been removed or is no longer available.</p>
            <Link
              to="/browse"
              className="mt-6 text-sm font-medium text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              ← Browse other skills
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl">
            {error ?? 'Something went wrong.'}
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.userId;
  const posterName = poster?.name ?? 'Neighbour';
  const posterInitial = posterName[0]?.toUpperCase() ?? '?';
  const posterFirstName = posterName.split(' ')[0];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Back nav */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-muted)] hover:text-[var(--color-primary)] transition-colors mb-6"
        >
          ← Back to Browse
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden">

          {/* Header band */}
          <div className={`px-6 py-4 ${listing.type === 'offer' ? 'bg-[var(--color-accent-light)]' : 'bg-amber-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.type === 'offer' ? (
                  <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] border border-[#7CB97E]/30 font-semibold text-xs px-3 py-1 rounded-full">
                    Offering
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs px-3 py-1 rounded-full">
                    Requesting
                  </span>
                )}
                <span className="text-sm text-[var(--color-muted)] font-medium">
                  {CATEGORY_LABELS[listing.category]}
                </span>
              </div>
            </div>
          </div>

          {/* Card body */}
          <div className="px-6 py-6 space-y-6">
            {/* Title + description */}
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-text)] leading-tight">{listing.title}</h1>
              <p className="text-sm text-[var(--color-text-sub)] leading-relaxed mt-2">{listing.description}</p>
            </div>

            <div className="border-t border-[var(--color-border)]" />

            {/* Meta row */}
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                <Clock size={14} />
                {listing.creditsPerHour} credit{listing.creditsPerHour !== 1 ? 's' : ''} / hr
              </span>
              <span className="flex items-center gap-1.5 text-sm text-[var(--color-muted)]">
                <MapPin size={14} />
                Within {listing.radiusKm} km
              </span>
              {listing.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs px-2.5 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="border-t border-[var(--color-border)]" />

            {/* Poster info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {posterInitial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text)]">{posterName}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {listing.type === 'offer' ? 'Skill provider' : 'Looking to learn'}
                  </p>
                </div>
              </div>
              {isOwner && (
                <span className="bg-[var(--color-bg)] text-[var(--color-muted)] text-xs px-3 py-1 rounded-full border border-[var(--color-border)]">
                  Your listing
                </span>
              )}
            </div>
          </div>

          {/* Card footer */}
          <div className="px-6 py-5 bg-[var(--color-bg)] border-t border-[var(--color-border)]">
            {isOwner ? (
              <div className="flex items-center gap-3">
                <button className="border border-[var(--color-border)] text-[var(--color-text-sub)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] rounded-full px-5 py-2.5 text-sm font-medium transition-colors">
                  Edit listing
                </button>
                <button className="border border-red-200 text-red-400 hover:border-red-400 hover:text-red-600 rounded-full px-5 py-2.5 text-sm font-medium transition-colors">
                  Deactivate
                </button>
              </div>
            ) : (
              <button
                onClick={handleContact}
                disabled={contacting}
                className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-semibold px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {contacting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Connecting…
                  </>
                ) : (
                  <>
                    💬 Contact {posterFirstName}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
