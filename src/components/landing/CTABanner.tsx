import { Link } from 'react-router-dom';

export function CTABanner() {
  return (
    <section className="bg-[#2C5F2D] text-white py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
        <h2 className="text-4xl font-bold">
          Your neighbourhood is full of skills. Find them.
        </h2>
        <p className="text-white/80 text-lg">
          Join hundreds of neighbours already teaching and learning together.
        </p>
        <Link
          to="/register"
          className="px-8 py-3 bg-white text-[#2C5F2D] font-semibold rounded-full hover:bg-[#F4FAF4] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C5F2D]"
        >
          Join free today
        </Link>
      </div>
    </section>
  );
}
