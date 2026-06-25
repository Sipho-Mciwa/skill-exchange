import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserConversations } from '../services/conversations';
import { useAuth } from '../contexts/AuthContext';
import { Conversation } from '../types';

function formatConversationTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  if (date >= startOfToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }
  if (date >= startOfWeek) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

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

  const totalUnread = user
    ? conversations.reduce((sum, c) => sum + (c.unreadCounts[user.id] ?? 0), 0)
    : 0;

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">Inbox</h1>
          {totalUnread > 0 && (
            <span className="bg-[var(--color-primary)] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--color-muted)] mt-1">Your skill exchange conversations</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[var(--color-border)] px-5 py-4 flex items-center gap-4 animate-pulse">
              <div className="w-11 h-11 rounded-full bg-[var(--color-border)] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-[var(--color-border)] rounded" />
                <div className="h-3 w-3/4 bg-[var(--color-border)] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="py-20 flex flex-col items-center text-center">
          <span className="text-5xl">💬</span>
          <h3 className="mt-4 text-lg font-semibold text-[var(--color-text)]">No conversations yet</h3>
          <p className="mt-2 text-sm text-[var(--color-muted)] max-w-xs">
            When you contact someone about a skill, it'll appear here.
          </p>
          <Link
            to="/browse"
            className="mt-6 text-sm font-medium text-[var(--color-primary)] hover:underline"
          >
            Browse skills →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => {
            const unread = user ? (conv.unreadCounts[user.id] ?? 0) : 0;
            const hasUnread = unread > 0;
            const timeStr = conv.lastMessageAt ? formatConversationTime(conv.lastMessageAt) : '';

            return (
              <Link
                key={conv.id}
                to={`/conversations/${conv.id}`}
                className="bg-white rounded-2xl border border-[var(--color-border)] px-5 py-4 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer block"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  💬
                </div>

                {/* Content */}
                <div className={`flex-1 min-w-0 ${hasUnread ? 'border-l-2 border-[var(--color-primary)] pl-3 -ml-1' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate text-[var(--color-text)] ${hasUnread ? 'font-bold' : 'font-semibold'}`}>
                      {conv.listingTitle}
                    </p>
                    {timeStr && (
                      <span className="text-xs text-[var(--color-muted)] flex-shrink-0">{timeStr}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={`text-sm truncate ${conv.lastMessage ? 'text-[var(--color-muted)]' : 'text-[var(--color-border)] italic'}`}>
                      {conv.lastMessage || 'No messages yet'}
                    </p>
                    {hasUnread && (
                      <span className="bg-[var(--color-primary)] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
