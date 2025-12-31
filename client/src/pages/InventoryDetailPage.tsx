import { useAuth } from '@clerk/clerk-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Apple,
  Droplet,
  Flame,
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
  const { getToken } = useAuth();
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
        const token = await getToken();
        const alerts = await getAlerts(inventoryId, undefined, token);
        setWeatherAlerts(alerts);
      } catch (err) {
        console.error('Error fetching weather alerts:', err);
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
  }, [inventoryId, inventoryItems, getToken]);

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
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading your premium pantry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white border border-red-100 shadow-xl rounded-2xl max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">
            Unable to Load Inventory
          </h3>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/inventory')}
            className="px-6 py-2.5 bg-black text-white font-medium rounded-xl hover:bg-gray-900 transition-all shadow-lg"
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

    // Calculate total nutrition for the consumed quantity
    const nutrition = selectedItem.foodItem?.nutritionPerUnit as
      | {
        calories?: number;
        protein?: number;
        carbohydrates?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
        sodium?: number;
      }
      | undefined;

    const unit = consumptionData.unit || selectedItem.unit;
    const unitMatch = unit ? unit.match(/^(\d+)(.*)$/) : null;
    const multiplier = unitMatch ? parseInt(unitMatch[1]) : 1;
    const effectiveQuantity = consumptionData.quantity * multiplier;
    const basis = selectedItem.foodItem?.nutritionBasis || 1;
    const ratio = effectiveQuantity / basis;

    const totalNutrition = nutrition ? {
      calories: nutrition.calories ? nutrition.calories * ratio : undefined,
      protein: nutrition.protein ? nutrition.protein * ratio : undefined,
      carbohydrates: nutrition.carbohydrates ? nutrition.carbohydrates * ratio : undefined,
      fat: nutrition.fat ? nutrition.fat * ratio : undefined,
      fiber: nutrition.fiber ? nutrition.fiber * ratio : undefined,
      sugar: nutrition.sugar ? nutrition.sugar * ratio : undefined,
      sodium: nutrition.sodium ? nutrition.sodium * ratio : undefined,
    } : undefined;

    const hasNutrition = totalNutrition && (
      totalNutrition.calories !== undefined ||
      totalNutrition.protein !== undefined ||
      totalNutrition.carbohydrates !== undefined ||
      totalNutrition.fat !== undefined
    );

    try {
      await logConsumptionMutation.mutateAsync({
        inventoryId: inventoryId!,
        inventoryItemId: selectedItem.id,
        foodItemId: selectedItem.foodItemId,
        itemName,
        quantity: consumptionData.quantity,
        unit: consumptionData.unit || selectedItem.unit,
        notes: consumptionData.notes,
        // Pass calculated total nutrition for the consumed quantity
        ...(hasNutrition && totalNutrition),
      } as any);
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
    const ratio = (item.quantity) / (basis > 0 ? basis : 1);
    return acc + (price * ratio);
  }, 0) || 0;

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-2rem)] overflow-hidden rounded-3xl relative">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 pt-2 gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/inventory')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white  shadow-soft hover:text-primary transition-all"
          >
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground font-display flex items-center gap-2">
              {inventory.name}
              {inventory.isPrivate && <span className="material-icons-outlined text-muted-foreground text-sm">lock</span>}
            </h1>
            <p className="text-muted-foreground text-sm">‎৳{totalValue.toFixed(2)} total value • {totalItems} items</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowImageUploadModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 text-slate-800 px-6 py-4 rounded-xl hover:bg-slate-200 transition-all font-black text-[10px] uppercase tracking-widest"
          >
            <span className="material-icons-round text-lg">photo_camera</span>
            <span>Scan Receipt</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full hover:bg-gray-900 transition-all shadow-lg font-medium"
          >
            <span className="material-icons-round text-lg">add</span>
            <span>Add Item</span>
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-6">
        {/* Weather Alerts / Widgets */}
        {!alertsLoading && weatherAlerts.length > 0 && (
          <div className="animate-slide-in">
            <WeatherAlertBanner alerts={weatherAlerts} />
          </div>
        )}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <WeatherWidget className="min-w-[300px] shadow-soft rounded-3xl" />
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-4 px-4">
          <button
            onClick={() => clearFilters()}
            className={`px-5 py-2 rounded-full font-medium text-sm transition-all ${!hasActiveFilters ? 'bg-black text-white' : 'bg-white text-muted-foreground hover:bg-gray-50 shadow-sm border border-transparent hover:border-gray-200'}`}
          >
            All Items
          </button>

          <div className="flex gap-2">
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 rounded-full bg-white  border-none shadow-soft text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="">Categories</option>
              {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>

            <select
              value={filters.expiryStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, expiryStatus: e.target.value }))}
              className="px-4 py-2 rounded-full bg-white  border-none shadow-soft text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="">Freshness</option>
              <option value="fresh">Fresh</option>
              <option value="expiring-soon">Expiring Soon</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Item Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-white  rounded-3xl animate-pulse shadow-soft"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 bg-white  rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons-outlined text-4xl text-gray-300">shopping_basket</span>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Inventory is Empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">Start by adding items manually or scanning a grocery receipt.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-primary text-gray-900 font-bold rounded-full hover:shadow-lg transition-all"
            >
              Add First Item
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map(item => {
              const itemName = item.customName || item.foodItem?.name || 'Unknown Item';
              const category = item.foodItem?.category || 'General';
              const expDate = item.expiryDate ? new Date(item.expiryDate) : null;
              const today = new Date();
              const daysLeft = expDate ? Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

              let statusColor = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
              let statusLabel = 'Fresh';
              if (daysLeft !== null) {
                if (daysLeft < 0) {
                  statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
                  statusLabel = 'Expired';
                } else if (daysLeft <= 3) {
                  statusColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300';
                  statusLabel = 'Low Freshness';
                }
              }

              // Nutrition Calculation
              const nutrition = item.foodItem?.nutritionPerUnit || {};
              const cal = nutrition.calories != null ? Math.round(nutrition.calories) : '-';
              const protein = nutrition.protein != null ? Math.round(nutrition.protein) : '-';
              const carbs = nutrition.carbohydrates != null ? Math.round(nutrition.carbohydrates) : '-';
              const fat = nutrition.fat != null ? Math.round(nutrition.fat) : '-';

              return (
                <div key={item.id} className="bg-white  rounded-3xl p-5 shadow-soft hover:shadow-lg transition-all group relative border border-transparent hover:border-primary/20">
                  <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                    {statusLabel}
                  </div>

                  <div className="flex items-center justify-center h-40 mb-6 bg-slate-50 rounded-[1.5rem] group-hover:bg-primary/5 transition-all duration-500 text-7xl select-none">
                    <span className="group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 block">
                      {category.toLowerCase().includes('fruit') ? '🍎' :
                        category.toLowerCase().includes('veg') ? '🥦' :
                          category.toLowerCase().includes('meat') ? '🥩' :
                            category.toLowerCase().includes('dairy') ? '🥛' :
                              category.toLowerCase().includes('grain') ? '🌾' : '📦'}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="font-black text-xl text-slate-800 mb-1 group-hover:text-primary transition-colors leading-tight line-clamp-1">{itemName}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">
                        {category} HUB • {expDate ? `${daysLeft}d REMAINING` : 'PERPETUAL'}
                      </p>

                      <div className="grid grid-cols-4 gap-2 mb-5 mt-4">
                        <div className="bg-orange-50 rounded-xl p-2 text-center">
                          <div className="flex items-center justify-center text-orange-400 mb-1"><Flame className="w-3 h-3" /></div>
                          <p className="text-lg font-bold text-gray-900">{cal}</p>
                          <p className="text-[10px] text-gray-500">kcal</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-2 text-center">
                          <div className="flex items-center justify-center text-blue-400 mb-1"><Zap className="w-3 h-3" /></div>
                          <p className="text-lg font-bold text-gray-900">{protein}{protein !== '-' ? 'g' : ''}</p>
                          <p className="text-[10px] text-gray-500">prot</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-2 text-center">
                          <div className="flex items-center justify-center text-green-400 mb-1"><Apple className="w-3 h-3" /></div>
                          <p className="text-lg font-bold text-gray-900">{carbs}{carbs !== '-' ? 'g' : ''}</p>
                          <p className="text-[10px] text-gray-500">carb</p>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-2 text-center">
                          <div className="flex items-center justify-center text-yellow-400 mb-1"><Droplet className="w-3 h-3" /></div>
                          <p className="text-lg font-bold text-gray-900">{fat}{fat !== '-' ? 'g' : ''}</p>
                          <p className="text-[10px] text-gray-500">fat</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Stock Load</span>
                        <div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-800">{item.quantity}</span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit || 'pcs'}</span>
                          </div>
                        </div>
                        {item.foodItem?.basePrice ? (
                          <div className="text-sm font-semibold text-foreground/80">
                            ৳{((item.foodItem.basePrice * item.quantity) / (item.foodItem.nutritionBasis || 1)).toFixed(0)}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground">No price</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleConsumption(item)}
                        disabled={item.quantity <= 0}
                        className="w-12 h-12 rounded-xl bg-slate-900 text-white hover:bg-black transition-all shadow-lg active:scale-90 disabled:opacity-20 flex items-center justify-center"
                        title="Log Consumption"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* --- MODALS & OVERLAYS --- */}
      {showAddModal && (
        <AddItemModal
          onClose={() => setShowAddModal(false)}
          onAdd={(itemData) => {
            addItemMutation.mutate(itemData);
            setShowAddModal(false);
          }}
          onScan={() => {
            setShowAddModal(false);
            setShowImageUploadModal(true);
          }}
        />
      )}

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

      {showImageUploadModal && (
        <ImageUploadModal
          inventoryId={inventoryId!}
          onClose={() => setShowImageUploadModal(false)}
          onSuccess={handleImageUploadSuccess}
        />
      )}
    </main>
  );
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
          <h3 className="text-lg font-bold text-foreground">Log Consumption</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-black transition-colors">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Item</label>
            <div className="text-foreground font-semibold text-lg">{itemName}</div>
            <div className="text-sm text-muted-foreground">Current Stock: {maxQuantity} {item.unit}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Quantity Consumed</label>
            <div className="flex gap-2">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                  disabled={form.quantity <= 0}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-icons-outlined text-sm">remove</span>
                </button>
                <input
                  type="number"
                  name="quantity"
                  min="0.1"
                  step="0.1"
                  max={maxQuantity}
                  value={form.quantity}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 text-center border-0 focus:ring-0 focus:outline-none text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: Math.min(maxQuantity, prev.quantity + 1) }))}
                  disabled={form.quantity >= maxQuantity}
                  className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span className="material-icons-outlined text-sm">add</span>
                </button>
              </div>
              <div className="px-4 py-2 bg-gray-100 rounded-xl text-muted-foreground font-medium flex items-center">
                {item.unit || 'units'}
              </div>
            </div>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, quantity: maxQuantity }))}
                className="text-sm text-primary-dark hover:text-primary font-bold transition-colors"
              >
                Consume All ({maxQuantity} {item.unit})
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes (Optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g., Used for dinner..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none text-foreground placeholder-muted-foreground"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-icons-outlined">restaurant</span>}
              {loading ? 'Logging...' : 'Confirm Consumption'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddItemModal({ onClose, onAdd, onScan }: {
  onClose: () => void,
  onAdd: (item: any) => void, // Relaxing type to any to avoid strict type complex errors for now, or define explicitly
  onScan: () => void
}) {
  const { searchFood } = useInventory();
  const [form, setForm] = useState<{
    name: string;
    quantity: number;
    unit: string;
    category: string;
    expiryDate: string;
    nutritionPerUnit?: any;
    nutritionBasis?: number;
    nutritionUnit?: string;
    basePrice?: number;
  }>({ name: '', quantity: 1, unit: 'pcs', category: 'General', expiryDate: '' });

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
      unit: item.unitName || 'g',
      nutritionPerUnit: item.nutrients,
      nutritionBasis: 100, // USDA is per 100g/ml
      nutritionUnit: item.unitName || 'g'
    }));
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  /* --- GEOLOCATION & PRICE ESTIMATION --- */
  const { estimatePrice } = useInventory();
  const [locationMode, setLocationMode] = useState<'auto' | 'manual' | 'none'>('none');
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number } | undefined>(undefined);
  const [manualRegion, setManualRegion] = useState('');
  const [locating, setLocating] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);

  const handleUseLocation = () => {
    if (locationMode === 'auto') {
      setLocationMode('none');
      setCoordinates(undefined);
      return;
    }

    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationMode('auto');
          setLocating(false);
        },
        (error) => {
          console.error("Geo error:", error);
          alert("Could not get location. Please allow location access.");
          setLocating(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      setLocating(false);
    }
  };

  // Trigger price estimation
  useEffect(() => {
    const fetchPrice = async () => {
      // Check if we have enough info to estimate (valid item + explicit location intent)
      const hasLocation = (locationMode === 'auto' && coordinates) || (locationMode === 'manual' && manualRegion.length > 2);

      if (form.name && form.quantity > 0 && hasLocation) {
        setPriceLoading(true);
        const result = await estimatePrice({
          foodName: form.name,
          quantity: form.quantity,
          unit: form.unit,
          coordinates: locationMode === 'auto' ? coordinates : undefined,
          region: locationMode === 'manual' ? manualRegion : undefined
        });

        if (result && result.estimatedPrice) {
          setForm(prev => ({ ...prev, basePrice: result.estimatedPrice }));
        }
        setPriceLoading(false);
      }
    };

    const debounce = setTimeout(fetchPrice, 800);
    return () => clearTimeout(debounce);
  }, [form.name, form.quantity, form.unit, locationMode, coordinates, manualRegion]);


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full relative max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Add Item</h3>

        {/* Quick Action for OCR */}
        <button
          onClick={() => { onClose(); onScan(); }}
          className="w-full mb-4 py-3 bg-primary/20 text-black font-bold rounded-xl flex items-center justify-center gap-2 border border-primary/30 hover:bg-primary/30 transition-colors"
        >
          <span className="material-icons-outlined">photo_camera</span>
          Scan Receipt (OCR)
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-muted-foreground">Or add manually</span></div>
        </div>

        {/* USDA Search */}
        <div className="mb-4 relative">
          <div className="relative">
            <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
            <input
              className="w-full border border-gray-100 pl-10 pr-10 py-3 rounded-xl bg-gray-50 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground"
              placeholder="Search USDA (e.g. 'Apple', 'Oats')"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                  className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="font-bold text-foreground">{item.description}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.dataType} • {item.unitName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <input
            className="w-full border border-gray-100 p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            placeholder="Item Name (e.g. Fuji Apple)"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex gap-2">
            <input
              type="number"
              className="w-1/2 border border-gray-100 p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) })}
            />
            <input
              className="w-1/2 border border-gray-100 p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              placeholder="Unit"
              value={form.unit}
              onChange={e => setForm({ ...form, unit: e.target.value })}
            />
          </div>
          <input
            type="date"
            className="w-full border border-gray-100 p-3 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
            value={form.expiryDate}
            onChange={e => setForm({ ...form, expiryDate: e.target.value })}
          />

          {/* Location & Price Section */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground">Price Estimation</label>

              <div className="flex gap-2">
                {/* Auto Location Toggle */}
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locating || locationMode === 'manual'}
                  className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${locationMode === 'auto'
                    ? 'bg-primary text-black border-primary/50 font-bold'
                    : 'bg-white text-muted-foreground border-gray-200 hover:bg-gray-50 hover:text-black disabled:opacity-50'
                    }`}
                >
                  {locating ? (
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-3 h-3">📍</div>
                  )}
                  {locationMode === 'auto' ? 'Active' : 'Auto'}
                </button>

                {/* Manual Location Toggle */}
                <button
                  type="button"
                  onClick={() => setLocationMode(prev => prev === 'manual' ? 'none' : 'manual')}
                  disabled={locating || locationMode === 'auto'}
                  className={`text-xs px-2 py-1 rounded-lg border flex items-center gap-1 transition-all ${locationMode === 'manual'
                    ? 'bg-primary text-black border-primary/50 font-bold'
                    : 'bg-white text-muted-foreground border-gray-200 hover:bg-gray-50 hover:text-black disabled:opacity-50'
                    }`}
                >
                  <div className="w-3 h-3">📝</div>
                  {locationMode === 'manual' ? 'Manual' : 'Manual'}
                </button>
              </div>
            </div>

            {/* Manual Region Input */}
            {locationMode === 'manual' && (
              <div className="mb-2 animate-in slide-in-from-top-2 fade-in duration-200">
                <input
                  type="text"
                  placeholder="Enter Country or City (e.g. London, UK)"
                  className="w-full border border-gray-100 p-2 text-sm rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  value={manualRegion}
                  onChange={e => setManualRegion(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <input
                type="number"
                disabled={priceLoading}
                className={`w-full border border-gray-100 p-3 pl-8 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground ${priceLoading ? 'opacity-50' : ''}`}
                placeholder="0.00"
                value={form.basePrice || ''}
                onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) })}
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">৳</div>
              {priceLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            {locationMode !== 'none' && form.basePrice && (
              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                *Estimated for {locationMode === 'manual' ? (manualRegion || 'your region') : 'your location'}
              </p>
            )}
          </div>


          <button
            onClick={() => {
              onAdd({
                customName: form.name,
                quantity: form.quantity,
                unit: form.unit,
                expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
                nutritionPerUnit: form.nutritionPerUnit,
                nutritionBasis: form.nutritionBasis,
                nutritionUnit: form.nutritionUnit,
                basePrice: form.basePrice // Pass the price to the mutation
              });
              onClose();
            }}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-900 transition-all shadow-lg active:scale-[0.98]"
          >
            Add Item Manually
          </button>
          <button onClick={onClose} className="w-full text-muted-foreground py-2 hover:text-black font-medium">Cancel</button>
        </div>
      </div>
    </div>
  )
}
