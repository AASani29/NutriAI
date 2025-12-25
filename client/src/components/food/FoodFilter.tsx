import { Filter } from 'lucide-react';

const categories = [
  'all', 'fruit', 'vegetable', 'dairy', 'grain', 'protein', 'pantry'
];

export default function FoodFilter({ category, setCategory, maxExpiration, setMaxExpiration }: {
  category: string;
  setCategory: (cat: string) => void;
  maxExpiration: string;
  setMaxExpiration: (val: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-smooth ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-foreground hover:bg-primary/10'
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-foreground/60" />
        <input
          type="number"
          placeholder="Max Expiration (days)"
          value={maxExpiration}
          onChange={e => setMaxExpiration(e.target.value)}
          className="px-2 py-1 border border-border rounded-lg bg-background text-foreground w-40"
        />
      </div>
    </div>
  );
}
