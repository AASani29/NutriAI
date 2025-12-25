import { Apple } from 'lucide-react';

export default function FoodList({ items }: { items: any[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id} className="bg-card rounded-xl border border-border p-6 shadow hover:shadow-lg transition-smooth">
          <div className="flex items-center gap-3 mb-2">
            <Apple className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">{item.name}</span>
          </div>
          <div className="text-sm text-foreground/70 mb-1">{item.category}</div>
          <div className="text-sm text-foreground/60 mb-2">
            Expiration: {item.typicalExpirationDays ?? 'N/A'} days
          </div>
          <div className="text-sm text-foreground/80">{item.description}</div>
        </div>
      ))}
    </div>
  );
}
