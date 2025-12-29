import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Apple,
  ArrowLeft,
  Camera,
  ChevronDown,
  DollarSign,
  Droplet,
  Filter,
  Flame,
  Layers,
  Package,
  Plus,
  Search,
  Timer,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUploadModal from '../components/inventory/ImageUploadModal';
import WeatherAlertBanner from '../components/weather/WeatherAlertBanner';
import WeatherWidget from '../components/weather/WeatherWidget';
import { useInventory, type InventoryItem } from '../hooks/useInventory';
import { getAlerts, type FoodAlert } from '../services/weather-service';

export interface Inventory {
  id: string;
  name: string;
  description?: string;
  isPrivate?: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function InventoryDetailPage() {
  // Image upload modal state
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);

  // Weather alerts state
  const [weatherAlerts, setWeatherAlerts] = useState<FoodAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Rest of the states
  const { inventoryId } = useParams<{ inventoryId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    expiryStatus: '',
    stockLevel: '',
  });

  const {
    useGetInventories,
    useGetInventoryItems,
    useAddItemToInventory,
    useLogConsumption,
  } = useInventory();
  const { data: inventories, isLoading } = useGetInventories();
  const { data: inventoryItems, isLoading: itemsLoading } =
    useGetInventoryItems(inventoryId!);
  const addItemMutation = useAddItemToInventory(inventoryId!);
  const logConsumptionMutation = useLogConsumption(inventoryId!);

  useEffect(() => {
    if (!inventoryId) {
      setError('Inventory ID is required');
      setLoading(false);
      return;
    }

    if (isLoading) return;

    try {
      if (inventories) {
        const foundInventory = inventories.find(inv => inv.id === inventoryId);
        if (foundInventory) {
          setInventory(foundInventory);
          setLoading(false);
        } else {
          setError('Inventory not found');
          setLoading(false);
        }
      } else {
        setError('Failed to load inventories');
        setLoading(false);
      }
    } catch (err) {
      setError('Failed to load inventory');
      console.error(err);
      setLoading(false);
    }
  }, [inventoryId, inventories, isLoading]);

  // Fetch weather alerts
  useEffect(() => {
    const fetchAlerts = async () => {
      if (!inventoryId) return;

      try {
        setAlertsLoading(true);
        const alerts = await getAlerts(inventoryId);
        setWeatherAlerts(alerts);
      } catch (err) {
        console.error('Error fetching weather alerts:', err);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
  }, [inventoryId, inventoryItems]);

  // Handle image upload success
  const handleImageUploadSuccess = (extractedItems: any[]) => {
    console.log('OCR items added successfully:', extractedItems);
    setShowImageUploadModal(false);
    // Refresh the inventory data
    queryClient.invalidateQueries({
      queryKey: ['inventory-items', inventoryId],
    });
  };

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your premium pantry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white border border-red-100 shadow-xl rounded-2xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Inventory
          </h3>
          <p className="text-gray-500 mb-6">{error}</p>
          <button
            onClick={() => navigate('/inventory')}
            className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!inventory) return null;

  const filteredItems = (inventoryItems || []).filter(item => {
    const itemName = item.customName || item.foodItem?.name || '';
    const itemNotes = item.notes || '';
    const itemCategory =
      item.foodItem?.category || (item.foodItemId ? 'uncategorized' : 'custom');

    const matchesSearch =
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      itemNotes.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      !filters.category || itemCategory === filters.category;

    let matchesExpiry = true;
    if (filters.expiryStatus) {
      const today = new Date();
      if (item.expiryDate) {
        const expDate = new Date(item.expiryDate);
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        switch (filters.expiryStatus) {
          case 'expired':
            matchesExpiry = diffDays < 0;
            break;
          case 'expiring-soon':
            matchesExpiry = diffDays >= 0 && diffDays <= 3;
            break;
          case 'fresh':
            matchesExpiry = diffDays > 3;
            break;
          default:
            matchesExpiry = true;
        }
      } else {
        matchesExpiry = filters.expiryStatus === 'no-expiry';
      }
    }

    let matchesStock = true;
    if (filters.stockLevel) {
      switch (filters.stockLevel) {
        case 'out-of-stock':
          matchesStock = item.quantity <= 0;
          break;
        case 'low-stock':
          matchesStock = item.quantity > 0 && item.quantity <= 2;
          break;
        case 'in-stock':
          matchesStock = item.quantity > 2;
          break;
        default:
          matchesStock = true;
      }
    }

    return matchesSearch && matchesCategory && matchesExpiry && matchesStock;
  });

  const handleConsumption = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowConsumptionModal(true);
  };

  const handleConsumptionSubmit = async (consumptionData: {
    quantity: number;
    unit?: string;
    notes?: string;
  }) => {
    if (!selectedItem) return;

    const itemName =
      selectedItem.customName || selectedItem.foodItem?.name || 'Unknown Item';

    try {
      await logConsumptionMutation.mutateAsync({
        inventoryId: inventoryId!,
        inventoryItemId: selectedItem.id,
        foodItemId: selectedItem.foodItemId,
        itemName,
        quantity: consumptionData.quantity,
        unit: consumptionData.unit || selectedItem.unit,
        notes: consumptionData.notes,
      });
      setShowConsumptionModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error logging consumption:', error);
      alert('Failed to log consumption. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      expiryStatus: '',
      stockLevel: '',
    });
    setSearch('');
  };

  const hasActiveFilters =
    filters.category || filters.expiryStatus || filters.stockLevel || search;

  const availableCategories = Array.from(
    new Set(
      (inventoryItems || [])
        .map(
          item =>
            item.foodItem?.category ||
            (item.foodItemId ? 'uncategorized' : 'custom'),
        )
        .filter(Boolean),
    ),
  ).sort();

  // --- STATS CALCULATION ---
  const totalItems = inventoryItems?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  const totalValue = inventoryItems?.reduce((acc, item) => {
    const price = item.foodItem?.basePrice || 0;
    const basis = item.foodItem?.nutritionBasis || 1;
    // Simple estimation: (quantity / basis) * price
    // If basis is 100g and we have 500g, ratio is 5.
    // If unit is 'pcs' basis is 1, quantity 5, ratio 5.
    const ratio = (item.quantity) / (basis > 0 ? basis : 1);

    // Fallback if strict unit conversion logic isn't fully robust yet
    // We assume incoming 'quantity' matches the stored 'nutritionPerUnit' scale roughly for MVP
    return acc + (price * ratio);
  }, 0) || 0;

  const expiringSoonCount = inventoryItems?.filter(item => {
    if (!item.expiryDate) return false;
    const diff = new Date(item.expiryDate).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 && days <= 3;
  }).length || 0;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* --- PREMIUM HEADER --- */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10 backdrop-blur-md bg-white/90 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/inventory')}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {inventory.name}
                  {inventory.isPrivate && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">Private</span>}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Active Inventory
                </p>
              </div>
            </div>

            {/* Stats Pills */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-900 text-white rounded-xl shadow-lg shadow-gray-200 min-w-max">
                <div className="p-1.5 bg-gray-800 rounded-lg">
                  <DollarSign className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Value</p>
                  <p className="text-lg font-bold">‎৳{totalValue.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl min-w-max">
                <div className="p-1.5 bg-purple-50 rounded-lg">
                  <Layers className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Items</p>
                  <p className="text-lg font-bold text-gray-900">{totalItems}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 px-4 py-2 bg-white border border-gray-200 rounded-xl min-w-max">
                <div className="p-1.5 bg-orange-50 rounded-lg">
                  <Timer className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Expiring</p>
                  <p className="text-lg font-bold text-gray-900">{expiringSoonCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Weather Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <div className="flex gap-2 overflow-x-auto pb-4">
              <WeatherWidget className="min-w-[300px]" />
              {/* Could add generic nutrient summary widget here too */}
            </div>
            {!alertsLoading && weatherAlerts.length > 0 && <WeatherAlertBanner alerts={weatherAlerts} />}
          </div>
        </div>

        {/* --- ACTIONS & FILTERS --- */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
            <input
              type="text"
              placeholder="Search food, nutrients, or notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-medium transition-all ${showFilters || hasActiveFilters
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {hasActiveFilters && <span className="w-2 h-2 bg-purple-600 rounded-full" />}
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>

            <button
              onClick={() => setShowImageUploadModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg hover:shadow-purple-200 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Camera className="w-4 h-4" />
              <span>Scan Receipt (OCR)</span>
            </button>
          </div>
        </div>

        {/* Detailed Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Category</label>
              <div className="relative">
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Freshness</label>
              <div className="relative">
                <select
                  value={filters.expiryStatus}
                  onChange={(e) => setFilters(prev => ({ ...prev, expiryStatus: e.target.value }))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Any Status</option>
                  <option value="fresh">Fresh & Good</option>
                  <option value="expiring-soon">Expiring Soon (3 days)</option>
                  <option value="expired">Expired</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Stock</label>
              <div className="relative">
                <select
                  value={filters.stockLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, stockLevel: e.target.value }))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Any Level</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Running Low</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            {hasActiveFilters && (
              <div className="md:col-span-3 flex justify-end border-t border-gray-100 pt-4">
                <button onClick={clearFilters} className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                  <X className="w-4 h-4" /> Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- GRID LAYOUT --- */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pantry is Empty</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">It looks like this inventory is empty or no items match your search.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-gray-900 text-white font-medium rounded-xl hover:bg-gray-800 transition-all"
            >
              Add First Item
            </button>
            <button
              onClick={() => setShowImageUploadModal(true)}
              className="mt-4 text-purple-600 font-medium hover:text-purple-700 flex items-center justify-center gap-2 mx-auto"
            >
              <Camera className="w-4 h-4" /> Scan Receipt instead
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => {
              const itemName = item.customName || item.foodItem?.name || 'Unknown Item';
              const category = item.foodItem?.category || 'General';
              const expDate = item.expiryDate ? new Date(item.expiryDate) : null;
              const today = new Date();
              const daysLeft = expDate ? Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

              let statusColor = 'bg-gray-100 text-gray-600 border-gray-200';
              let statusLabel = 'No Date';
              if (daysLeft !== null) {
                if (daysLeft < 0) { statusColor = 'bg-red-50 text-red-700 border-red-100'; statusLabel = 'Expired'; }
                else if (daysLeft <= 3) { statusColor = 'bg-amber-50 text-amber-700 border-amber-100'; statusLabel = `Exp ${daysLeft}d`; }
                else { statusColor = 'bg-green-50 text-green-700 border-green-100'; statusLabel = 'Fresh'; }
              }

              // Nutrition Calculation
              const nutrition = item.foodItem?.nutritionPerUnit || {};
              // Show nutrition PER 100g/ml if basis is > 1 for standard comparison, OR per unit if standard is 1.
              // Actually, let's just show what we have "per unit" or "per 100g" clearly.
              // To keep it clean, we show the raw values linked to the basis.

              const cal = nutrition.calories != null ? Math.round(nutrition.calories) : '-';
              const protein = nutrition.protein != null ? Math.round(nutrition.protein) : '-';
              const carbs = nutrition.carbohydrates != null ? Math.round(nutrition.carbohydrates) : '-';
              const fat = nutrition.fat != null ? Math.round(nutrition.fat) : '-';

              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300 group flex flex-col justify-between">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                          {/* Simple emoji mapping or generic icon based on category */}
                          {category.toLowerCase().includes('fruit') ? '🍎' :
                            category.toLowerCase().includes('veg') ? '🥦' :
                              category.toLowerCase().includes('meat') ? '🥩' :
                                category.toLowerCase().includes('dairy') ? '🥛' :
                                  category.toLowerCase().includes('grain') ? '🌾' : '📦'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 line-clamp-1 text-lg group-hover:text-purple-700 transition-colors">{itemName}</h3>
                          <p className="text-sm text-gray-500">{category}</p>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg border text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                        {statusLabel}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 mb-5">
                      <div className="bg-orange-50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center text-orange-400 mb-1"><Flame className="w-3 h-3" /></div>
                        <p className="text-xl font-bold text-gray-900">{cal}</p>
                        <p className="text-sm text-gray-500">kcal</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center text-blue-400 mb-1"><Zap className="w-3 h-3" /></div>
                        <p className="text-xl font-bold text-gray-900">{protein}{protein !== '-' ? 'g' : ''}</p>
                        <p className="text-sm text-gray-500">prot</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center text-green-400 mb-1"><Apple className="w-3 h-3" /></div>
                        <p className="text-xl font-bold text-gray-900">{carbs}{carbs !== '-' ? 'g' : ''}</p>
                        <p className="text-sm text-gray-500">carb</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-2 text-center">
                        <div className="flex items-center justify-center text-yellow-400 mb-1"><Droplet className="w-3 h-3" /></div>
                        <p className="text-xl font-bold text-gray-900">{fat}{fat !== '-' ? 'g' : ''}</p>
                        <p className="text-sm text-gray-500">fat</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm py-3 border-t border-gray-50">
                      <div className="text-gray-500 font-medium">
                        Qty: <span className="text-gray-900">{item.quantity} {item.unit}</span>
                      </div>
                      {item.foodItem?.basePrice && (
                        <div className="text-gray-900 font-bold">
                          ৳{((item.foodItem.basePrice * item.quantity) / (item.foodItem.nutritionBasis || 1)).toFixed(0)}
                        </div>
                      )}
                      {!item.foodItem?.basePrice && <div className="text-gray-300 text-xs">No price</div>}
                    </div>
                  </div>

                  <button
                    onClick={() => handleConsumption(item)}
                    disabled={item.quantity <= 0}
                    className="w-full py-3 bg-gray-50 text-gray-600 font-medium text-sm hover:bg-purple-600 hover:text-white transition-colors flex items-center justify-center gap-2 rounded-b-2xl border-t border-gray-100"
                  >
                    <Utensils className="w-4 h-4" />
                    {item.quantity <= 0 ? 'Out of Stock' : 'Log Consumption'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consumption Modal */}
      {showConsumptionModal && selectedItem && (
        <ConsumptionModal
          item={selectedItem}
          onClose={() => {
            setShowConsumptionModal(false);
            setSelectedItem(null);
          }}
          onConsume={handleConsumptionSubmit}
        />
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={addItemMutation.mutate}
          onScan={() => {
            setShowAddModal(false);
            setShowImageUploadModal(true);
          }}
        />
      )}

      {/* Smart OCR Upload Modal */}
      {showImageUploadModal && (
        <ImageUploadModal
          inventoryId={inventoryId!}
          onClose={() => setShowImageUploadModal(false)}
          onSuccess={handleImageUploadSuccess}
        />
      )}
    </div>
  );
}

// Stats Card Component (Internal)
function StatsCard({ icon: Icon, label, value, colorClass }: any) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClass.bg}`}>
        <Icon className={`w-6 h-6 ${colorClass.text}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )
}

// ConsumptionModal Component
interface ConsumptionModalProps {
  item: InventoryItem;
  onClose: () => void;
  onConsume: (data: {
    quantity: number;
    unit?: string;
    notes?: string;
  }) => void;
}

function ConsumptionModal({ item, onClose, onConsume }: ConsumptionModalProps) {
  const [form, setForm] = useState({
    quantity: 1,
    unit: item.unit || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const itemName = item.customName || item.foodItem?.name || 'Unknown Item';
  const maxQuantity = item.quantity;
  // const remainingAfterConsumption = Math.max(0, maxQuantity - form.quantity);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'quantity' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (form.quantity <= 0) {
      setError('Quantity must be greater than 0');
      setLoading(false);
      return;
    }

    if (form.quantity > maxQuantity) {
      setError(`Cannot consume more than ${maxQuantity} ${item.unit}`);
      setLoading(false);
      return;
    }

    try {
      await onConsume({
        quantity: form.quantity,
        unit: form.unit,
        notes: form.notes || undefined,
      });
    } catch (err) {
      console.error('Error logging consumption:', err);
      setError('Failed to log consumption');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Log Consumption</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
            <div className="text-gray-900 font-semibold text-lg">{itemName}</div>
            <div className="text-sm text-gray-500">Current Stock: {maxQuantity} {item.unit}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Consumed</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="quantity"
                min="0.1"
                step="0.1"
                max={maxQuantity}
                value={form.quantity}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="px-4 py-2 bg-gray-100 rounded-xl text-gray-600 font-medium flex items-center">
                {item.unit || 'units'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g., Used for dinner..."
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Utensils className="w-5 h-5" />}
              {loading ? 'Logging...' : 'Confirm Consumption'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onAdd, onScan }: { onClose: () => void, onAdd: any, onScan: () => void }) {
  const { searchFood } = useInventory();
  const [form, setForm] = useState({ name: '', quantity: 1, unit: 'pcs', category: 'General', expiryDate: '' });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchFood(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectFood = (item: any) => {
    setForm(prev => ({
      ...prev,
      name: item.description,
      unit: item.unitName || 'g'
    }));
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full relative">
        <h3 className="text-xl font-bold mb-4">Add Item</h3>

        {/* Quick Action for OCR */}
        <button
          onClick={() => { onClose(); onScan(); }}
          className="w-full mb-4 py-3 bg-purple-50 text-purple-700 font-bold rounded-xl flex items-center justify-center gap-2 border border-purple-100 hover:bg-purple-100 transition-colors"
        >
          <Camera className="w-5 h-5" />
          Scan Receipt (OCR)
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or add manually</span></div>
        </div>

        {/* USDA Search */}
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full border pl-10 pr-10 py-3 rounded-xl bg-gray-50 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              placeholder="Search USDA (e.g. 'Apple', 'Oats')"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectFood(item)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="font-bold text-gray-900">{item.description}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">{item.dataType} • {item.unitName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <input
            className="w-full border p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Item Name (e.g. Fuji Apple)"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/2 border p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) })}
            />
            <input
              className="w-1/2 border p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Unit"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <input
            type="date"
            className="w-full border p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={form.expiryDate}
            onChange={e => setForm({ ...form, expiryDate: e.target.value })}
          />
          <button
            onClick={() => {
              onAdd({ customName: form.name, quantity: form.quantity, unit: form.unit, expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined });
              onClose();
            }}
            className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
          >
            Add Item Manually
          </button>
          <button onClick={onClose} className="w-full text-gray-500 py-2 hover:text-gray-700 font-medium">Cancel</button>
        </div>
      </div>
    </div>
  )
}
