import { Link } from 'react-router-dom';

export function Hero() {
  const scrollToHowItWorks = () => {
    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-[#1A2E1A] text-white py-32 px-4">
      {/* Decorative circles */}
      <span className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[#2C5F2D] opacity-20 z-0" />
      <span className="absolute top-10 right-10 w-48 h-48 rounded-full bg-[#2C5F2D] opacity-25 z-0" />
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#2C5F2D] opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Every skill has a neighbour waiting to learn it.
        </h1>
        <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
          A free platform to teach, learn, and connect with the people around you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-[#2C5F2D] text-white font-semibold rounded-lg hover:bg-[#7CB97E] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2E1A]"
          >
            Join your neighbourhood
          </Link>
          <button
            onClick={scrollToHowItWorks}
            className="inline-block px-8 py-4 border border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A2E1A]"
          >
            See how it works
          </button>
        </div>
      </div>
    </section>
  );
}
