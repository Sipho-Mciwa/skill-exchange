const scrollToHowItWorks = () => {
  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
};

export function Footer() {
  return (
    <footer className="bg-[#1A2E1A] text-white px-4 pt-12 pb-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8">
          {/* Left: branding */}
          <div className="flex flex-col gap-2">
            <span className="text-xl font-bold">NSE</span>
            <span className="text-white/60 text-sm">
              Connecting neighbourhoods through skills
            </span>
          </div>

          {/* Right: links */}
          <nav className="flex flex-wrap gap-6" aria-label="Footer navigation">
            <a
              href="#about"
              className="text-white/60 hover:text-white text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              About
            </a>
            <button
              onClick={scrollToHowItWorks}
              className="text-white/60 hover:text-white text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              How it works
            </button>
            <a
              href="#privacy"
              className="text-white/60 hover:text-white text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              Privacy
            </a>
            <a
              href="mailto:hello@nse.app"
              className="text-white/60 hover:text-white text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-center text-white/40 text-sm">
            &copy; 2026 Neighbourhood Skill Exchange. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
