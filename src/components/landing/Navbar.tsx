import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function useScrolled(threshold: number): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return scrolled;
}

export function Navbar() {
  const scrolled = useScrolled(10);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] rounded">
              <span className="font-bold text-xl text-[#2C5F2D]">NSE</span>
              <span className="hidden sm:block text-sm font-medium text-[#1A2E1A]">
                Neighbourhood Skill Exchange
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#2C5F2D] border border-[#2C5F2D] rounded-lg hover:bg-[#F4FAF4] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-[#2C5F2D] rounded-lg hover:bg-[#1A2E1A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2"
              >
                Join free
              </Link>
            </div>

            {/* Hamburger */}
            <button
              className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <span className="block w-6 h-0.5 bg-[#1A2E1A]" />
              <span className="block w-6 h-0.5 bg-[#1A2E1A]" />
              <span className="block w-6 h-0.5 bg-[#1A2E1A]" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={closeDrawer}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-bold text-[#2C5F2D]">NSE</span>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
            aria-label="Close menu"
          >
            <span className="text-xl leading-none text-[#1A2E1A]">&times;</span>
          </button>
        </div>
        <div className="flex flex-col gap-3 p-6">
          <Link
            to="/login"
            onClick={closeDrawer}
            className="px-4 py-2 text-center text-sm font-medium text-[#2C5F2D] border border-[#2C5F2D] rounded-lg hover:bg-[#F4FAF4] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D]"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            onClick={closeDrawer}
            className="px-4 py-2 text-center text-sm font-medium text-white bg-[#2C5F2D] rounded-lg hover:bg-[#1A2E1A] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2C5F2D] focus-visible:ring-offset-2"
          >
            Join free
          </Link>
        </div>
      </div>
    </>
  );
}
