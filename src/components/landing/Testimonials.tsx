interface Testimonial {
  quote: string;
  name: string;
  neighbourhood: string;
}

const testimonials: Testimonial[] = [
  {
    quote:
      'I taught a neighbour to bake sourdough and learned basic plumbing in return.',
    name: 'Sarah K.',
    neighbourhood: 'Greenside',
  },
  {
    quote:
      'My kids are getting free guitar lessons from the retired teacher two streets away.',
    name: 'Marcus T.',
    neighbourhood: 'Northcliff',
  },
  {
    quote: 'I finally met the people on my street because of this platform.',
    name: 'Priya M.',
    neighbourhood: 'Melville',
  },
];

export function Testimonials() {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#1A2E1A] mb-12">
          Built for real communities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col gap-4"
            >
              <span className="text-4xl font-serif text-[#7CB97E] leading-none">&ldquo;</span>
              <p className="italic text-[#1A2E1A] flex-1">{t.quote}</p>
              <p className="text-sm text-[#6B8F6B]">
                {t.name}, {t.neighbourhood}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
