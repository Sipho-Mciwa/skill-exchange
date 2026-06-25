interface Category {
  emoji: string;
  name: string;
  tagline: string;
}

const categories: Category[] = [
  { emoji: '🔧', name: 'Home Repairs', tagline: 'Fix, build, and maintain your home' },
  { emoji: '📚', name: 'Tutoring', tagline: 'Academic support for all ages' },
  { emoji: '🎵', name: 'Music & Arts', tagline: 'Share your creative talents' },
  { emoji: '🌿', name: 'Gardening', tagline: 'Grow food and beautiful spaces' },
  { emoji: '🗣️', name: 'Languages', tagline: "Speak the world's languages" },
  { emoji: '💼', name: 'Career Skills', tagline: 'Level up your professional life' },
];

export function SkillCategories() {
  return (
    <section className="bg-[#F4FAF4] py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-[#1A2E1A] mb-12">
          Skills in your neighbourhood
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white rounded-2xl p-6 flex flex-col gap-3 shadow-sm border-l-4 border-[#2C5F2D] hover:-translate-y-1 transition-transform duration-200"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <h3 className="font-bold text-[#1A2E1A]">{cat.name}</h3>
              <p className="text-sm text-[#6B8F6B]">{cat.tagline}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
