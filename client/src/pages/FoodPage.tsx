import { useEffect, useState } from 'react';
import { Plus, Apple } from 'lucide-react';
import { Link } from 'react-router-dom';
import FoodList from '../components/food/FoodList';
import FoodFilter from '../components/food/FoodFilter';
import AddFoodModal from '../components/food/AddFoodModal';

export default function FoodPage() {
  const [foodItems, setFoodItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [maxExpiration, setMaxExpiration] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = '/api/foods';
    const params: string[] = [];
    if (category !== 'all') params.push(`category=${category}`);
    if (maxExpiration) params.push(`maxExpiration=${maxExpiration}`);
    if (params.length) url += '?' + params.join('&');
    fetch(url)
      .then(res => res.json())
      .then(data => setFoodItems(data.data || []))
      .finally(() => setLoading(false));
  }, [category, maxExpiration, showModal]);

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card border-b border-border px-4 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2">
          <Apple className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">Food Inventory</span>
        </Link>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium flex items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <FoodFilter
          category={category}
          setCategory={setCategory}
          maxExpiration={maxExpiration}
          setMaxExpiration={setMaxExpiration}
        />
        {loading ? (
          <div className="text-center py-12 text-foreground/60">Loading...</div>
        ) : (
          <FoodList items={foodItems} />
        )}
      </div>

      {showModal && (
        <AddFoodModal onClose={() => setShowModal(false)} onAdded={() => {
          setShowModal(false);
        }} />
      )}
    </div>
  );
}
