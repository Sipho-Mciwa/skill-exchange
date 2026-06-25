import { useEffect, useState } from 'react';
import { getUserTransactions } from '../services/transactions';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfToday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

  if (date >= startOfToday) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  }
  if (date >= startOfYesterday) return 'Yesterday';
  if (date >= startOfWeek) {
    return date.toLocaleDateString([], { weekday: 'short' });
  }
  return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
}

export function WalletPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setError(null);
    setLoading(true);
    getUserTransactions(user.id)
      .then(setTransactions)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load transactions'))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  // Derived stats — computed from already-fetched transaction data, no extra queries
  const totalEarned = transactions
    .filter((tx) => tx.toUserId === user.id)
    .reduce((sum, tx) => sum + tx.credits, 0);
  const totalSpent = transactions
    .filter((tx) => tx.fromUserId === user.id)
    .reduce((sum, tx) => sum + tx.credits, 0);
  const totalExchanges = transactions.length;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">Wallet</h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">Your time credits and transaction history</p>
        </div>

        {/* Balance card */}
        {loading ? (
          <div className="animate-pulse bg-[var(--color-border)] rounded-2xl h-36" />
        ) : (
          <div className="bg-[var(--color-primary-dark)] rounded-2xl p-6 shadow-md flex items-center justify-between">
            {/* Left: balance info */}
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)] mb-2">
                Current balance
              </p>
              <p className="text-6xl font-bold text-white leading-none">{user.creditBalance}</p>
              <p className="text-sm text-[var(--color-accent)] mt-1">credits available</p>
              <p className="text-xs text-white/60 mt-4">Each hour you teach earns 1 credit</p>
            </div>

            {/* Right: decorative circles (desktop only) */}
            <div className="hidden sm:flex items-center justify-center relative w-24 h-24" aria-hidden="true">
              <div className="absolute w-24 h-24 rounded-full bg-white/5" />
              <div className="absolute w-16 h-16 rounded-full bg-white/5" />
              <div className="absolute w-8 h-8 rounded-full bg-white/10" />
              <span className="text-6xl opacity-20 relative">🌿</span>
            </div>
          </div>
        )}

        {/* Quick stats row */}
        {loading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse bg-[var(--color-border)] rounded-xl h-16" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-[var(--color-border)] px-4 py-3 text-center shadow-sm">
              <p className="text-lg font-bold text-[var(--color-primary)]">
                {totalExchanges > 0 ? totalEarned : '—'}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Earned</p>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border)] px-4 py-3 text-center shadow-sm">
              <p className="text-lg font-bold text-[var(--color-text)]">
                {totalExchanges > 0 ? totalSpent : '—'}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Spent</p>
            </div>
            <div className="bg-white rounded-xl border border-[var(--color-border)] px-4 py-3 text-center shadow-sm">
              <p className="text-lg font-bold text-[var(--color-text)]">
                {totalExchanges > 0 ? totalExchanges : '—'}
              </p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5">Exchanges</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-2xl flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Transaction history */}
        <div>
          {/* Section heading */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Transaction history</h2>
            {!loading && totalExchanges > 0 && (
              <span className="bg-[var(--color-accent-light)] text-[var(--color-primary)] text-xs font-semibold px-2.5 py-1 rounded-full">
                {totalExchanges} transaction{totalExchanges !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* List */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden divide-y divide-[var(--color-border)]">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-border)] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 bg-[var(--color-border)] rounded" />
                    <div className="h-3 w-1/3 bg-[var(--color-border)] rounded" />
                  </div>
                  <div className="h-4 w-10 bg-[var(--color-border)] rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm py-16 text-center">
              <p className="text-4xl mb-3">🌱</p>
              <p className="text-sm font-medium text-[var(--color-text)]">No transactions yet</p>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Complete a skill exchange to earn or spend credits.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden divide-y divide-[var(--color-border)]">
              {transactions.map((tx) => {
                const isIncoming = tx.toUserId === user.id;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Direction icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isIncoming ? 'bg-[var(--color-accent-light)]' : 'bg-red-50'
                      }`}
                    >
                      {isIncoming ? (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-[var(--color-primary)]"
                        >
                          <line x1="12" y1="19" x2="12" y2="5" />
                          <polyline points="5 12 12 5 19 12" />
                        </svg>
                      ) : (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-red-500"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <polyline points="19 12 12 19 5 12" />
                        </svg>
                      )}
                    </div>

                    {/* Label + date */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {tx.note?.trim() || 'Skill exchange'}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">{formatDate(tx.createdAt)}</p>
                    </div>

                    {/* Amount */}
                    <span
                      className={`text-sm font-bold flex-shrink-0 ${
                        isIncoming ? 'text-[var(--color-primary)]' : 'text-red-500'
                      }`}
                    >
                      {isIncoming ? '+' : '−'}{tx.credits} cr
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Info chip */}
        <div className="flex justify-center pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-muted)] bg-white border border-[var(--color-border)] rounded-full px-3 py-1.5">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Credit transfers are secured server-side
          </span>
        </div>

      </div>
    </div>
  );
}
