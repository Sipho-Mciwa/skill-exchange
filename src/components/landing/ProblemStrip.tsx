export function ProblemStrip() {
  return (
    <section className="bg-[#F4FAF4] py-20 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-3">
          <span className="text-5xl font-bold text-[#2C5F2D]">68%</span>
          <p className="text-[#1A2E1A]">
            of adults want to learn a new skill but can't afford formal classes
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-3">
          <span className="text-5xl font-bold text-[#2C5F2D]">1 in 3</span>
          <p className="text-[#1A2E1A]">
            people don't know their immediate neighbours by name
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm p-8 flex flex-col gap-3">
          <span className="text-5xl">💡</span>
          <p className="text-[#1A2E1A]">
            Skills are all around you — invisible and untapped
          </p>
        </div>
      </div>
    </section>
  );
}
