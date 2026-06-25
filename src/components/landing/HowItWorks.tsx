const steps = [
  {
    number: '01',
    title: 'Join & list your skills',
    description:
      "Create a free profile and post what you can teach and what you'd like to learn.",
  },
  {
    number: '02',
    title: 'Find someone nearby',
    description:
      'Browse skills from neighbours in your area and connect with a message.',
  },
  {
    number: '03',
    title: 'Exchange & earn credits',
    description:
      'Agree on a session, earn time credits, and use them for your next learning exchange.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#1A2E1A] mb-12">
          How it works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-full bg-[#2C5F2D] flex items-center justify-center">
                <span className="text-white font-bold text-sm">{step.number}</span>
              </div>
              <h3 className="font-semibold text-lg text-[#1A2E1A]">{step.title}</h3>
              <p className="text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        {/* Callout bar */}
        <div className="w-full bg-[#7CB97E] rounded-2xl py-8 px-6 text-center">
          <p className="text-white text-xl font-semibold">
            Every skill is valuable. Every hour counts.
          </p>
        </div>
      </div>
    </section>
  );
}
