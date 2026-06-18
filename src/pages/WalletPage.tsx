import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';
import { getUserTransactions } from '../services/transactions';
import { useAuth } from '../contexts/AuthContext';
import { Skeleton } from '../components/Skeleton';
import { Transaction } from '../types';

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

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Wallet</h1>

      {/* Balance card */}
      <div className="mb-8 flex items-center gap-4 rounded-2xl bg-indigo-600 p-6 text-white">
        <Wallet size={32} className="opacity-80" />
        <div>
          <p className="text-sm opacity-80">Current balance</p>
          <p className="text-4xl font-bold">{user.creditBalance}</p>
          <p className="text-sm opacity-80">credits</p>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold text-gray-800">Transaction history</h2>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          No transactions yet. Complete a skill exchange to earn or spend credits.
        </p>
      ) : (
        <div className="space-y-3">
          {transactions.map((tx) => {
            const isIncoming = tx.toUserId === user.id;
            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${
                    isIncoming ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {isIncoming ? (
                    <ArrowDownLeft size={16} className="text-green-600" />
                  ) : (
                    <ArrowUpRight size={16} className="text-red-600" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {tx.note ?? (isIncoming ? 'Credits received' : 'Credits spent')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    isIncoming ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isIncoming ? '+' : '-'}{tx.credits}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-8 rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
        ⚠️ Credit transfers are processed server-side via Cloud Function to ensure atomicity.
        Never refresh during a transfer.
      </p>
    </main>
  );
}
