import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="h-16 bg-white border-b border-[var(--color-border)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-full flex items-center justify-between">
        <span className="flex items-center gap-2 font-bold text-lg tracking-tight text-[var(--color-primary)] select-none">
          🌿 <span>NSE</span>
        </span>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              to="/browse"
              className="hidden sm:block text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-primary)] transition-colors"
            >
              Browse
            </Link>
            <Link
              to="/my-listings"
              className="hidden sm:block text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-primary)] transition-colors"
            >
              My Listings
            </Link>
            <Link
              to="/inbox"
              className="hidden sm:block text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-primary)] transition-colors"
            >
              Inbox
            </Link>
            <Link
              to="/wallet"
              className="hidden sm:block text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-primary)] transition-colors"
            >
              Wallet
            </Link>

            <span className="inline-flex items-center gap-1.5 bg-[var(--color-accent-light)] text-[var(--color-primary)] font-semibold text-sm px-3 py-1 rounded-full">
              ⏱ {user.creditBalance} credits
            </span>

            <span className="w-9 h-9 rounded-full bg-[var(--color-primary)] text-white font-bold text-sm flex items-center justify-center">
              {user.name[0].toUpperCase()}
            </span>

            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              className="text-[var(--color-muted)] hover:text-red-500 transition-colors p-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-[var(--color-text-sub)] hover:text-[var(--color-primary)] transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold bg-[var(--color-primary)] text-white px-4 py-2 rounded-full hover:bg-[var(--color-primary-dark)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
            >
              Join free
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
