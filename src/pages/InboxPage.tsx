import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { getUserConversations } from '../services/conversations';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/Skeleton';
import { Conversation } from '../types';

export function InboxPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getUserConversations(user.id)
      .then(setConversations)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load inbox'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Inbox</h1>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-4">
              <Skeleton className="mb-2 h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-gray-400">
          <MessageSquare size={48} className="mb-4 opacity-40" />
          <p>No conversations yet.</p>
          <p className="text-sm">Contact someone from the Browse page to start chatting.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const unread = user ? (conv.unreadCounts[user.id] ?? 0) : 0;
            return (
              <Link
                key={conv.id}
                to={`/conversations/${conv.id}`}
                className="flex items-start justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">{conv.listingTitle}</p>
                  <p className="mt-1 truncate text-sm text-gray-500">
                    {conv.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="ml-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                    {unread}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
