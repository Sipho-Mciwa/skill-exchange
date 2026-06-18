import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Wallet, ListPlus, Search, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/browse" className="text-lg font-bold text-indigo-600">
          SkillXchange
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/browse"
            className="hidden items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 sm:flex"
          >
            <Search size={16} /> Browse
          </Link>
          <Link
            to="/my-listings"
            className="hidden items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 sm:flex"
          >
            <ListPlus size={16} /> My Listings
          </Link>
          <Link
            to="/inbox"
            className="hidden items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 sm:flex"
          >
            <MessageSquare size={16} /> Inbox
          </Link>
          <Link
            to="/wallet"
            className="flex items-center gap-1 rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700"
          >
            <Wallet size={14} />
            {user.creditBalance} cr
          </Link>

          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={handleSignOut}
            aria-label="Sign out"
            className="text-gray-500 hover:text-red-600"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
