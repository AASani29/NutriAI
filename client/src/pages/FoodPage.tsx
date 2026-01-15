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
      <nav className="bg-white border-b border-gray-100 px-8 py-6 flex items-center justify-between shadow-soft">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-lg shadow-black/10 group-hover:bg-primary transition-colors">
            <Apple className="w-6 h-6 text-white group-hover:text-black transition-colors" />
          </div>
          <span className="font-bold text-2xl text-foreground tracking-tighter group-hover:text-primary transition-colors">Food Inventory</span>
        </Link>
        <button
          className="px-6 py-3 bg-secondary text-white rounded-2xl hover:bg-gray-900 transition-all font-bold flex items-center gap-2 shadow-xl shadow-black/10"
          onClick={() => setShowModal(true)}
        >
          <Plus className="w-5 h-5" /> Add Item
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
