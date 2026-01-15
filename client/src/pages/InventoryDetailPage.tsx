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
          <div className="w-16 h-16 border-4 border-primary border-t-secondary rounded-full animate-spin mx-auto mb-6 shadow-sm" />
          <p className="text-secondary/60 font-bold tracking-tight animate-pulse">Loading your premium pantry...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-12 bg-white border border-primary/20 shadow-2xl rounded-[3rem] max-w-md animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-3 tracking-tight">
            Unable to Load Inventory
          </h3>
          <p className="text-muted-foreground mb-8 font-medium">{error}</p>
          <button
            onClick={() => navigate('/inventory')}
            className="w-full px-8 py-4 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 transition-all shadow-lg active:scale-95"
          >
            Return to Inventory
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
    <main className="flex-1 flex flex-col h-[calc(100vh-2rem)] overflow-hidden rounded-[2.5rem] relative bg-background/30 px-6">
      {/* Premium Header */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 pt-6 gap-6">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/inventory')}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white shadow-soft text-secondary hover:bg-primary/20 hover:text-secondary transition-all active:scale-90 border border-border/40"
          >
            <span className="material-icons-outlined text-xl">arrow_back</span>
          </button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              {inventory.name}
              {inventory.isPrivate && <span className="material-icons-outlined text-muted-foreground text-base bg-gray-100 p-1.5 rounded-lg shadow-inner">lock</span>}
            </h1>
            <p className="text-secondary/60 font-bold text-xs uppercase tracking-widest mt-1.5 opacity-80">
              <span className="text-secondary">‎৳{totalValue.toFixed(2)}</span> total value • <span className="text-secondary">{totalItems}</span> items
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setShowImageUploadModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-white text-secondary px-6 py-4 rounded-2xl border border-primary/20 hover:bg-primary/10 transition-all font-bold text-[10px] uppercase tracking-widest shadow-soft"
          >
            <span className="material-icons-round text-xl">photo_camera</span>
            <span>Upload Image</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-secondary text-white px-8 py-4 rounded-2xl hover:bg-secondary/90 transition-all shadow-lg font-bold text-[10px] uppercase tracking-widest active:scale-95 shadow-secondary/20"
          >
            <span className="material-icons-round text-xl">add</span>
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
        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => clearFilters()}
            className={`px-6 py-3 rounded-2xl font-bold text-[10px] uppercase tracking-widest transition-all duration-300 ${
              !hasActiveFilters 
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20' 
                : 'bg-white text-muted-foreground hover:text-secondary hover:shadow-sm border border-border/50'
            }`}
          >
            All Items
          </button>

          <div className="flex gap-2">
            {/* <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="px-4 py-2 rounded-full bg-white  border-none shadow-soft text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            >
              <option value="">Categories</option>
              {availableCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select> */}

            <select
              value={filters.expiryStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, expiryStatus: e.target.value }))}
              className="px-6 py-3 rounded-2xl bg-white border border-border/50 shadow-soft text-[10px] font-bold uppercase tracking-widest text-secondary focus:ring-4 focus:ring-primary/20 outline-none transition-all cursor-pointer hover:border-primary/40"
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
          <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-primary/30 animate-in fade-in duration-700 shadow-soft">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-primary/20">
              <span className="material-icons-outlined text-5xl text-secondary/40">shopping_basket</span>
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight">Inventory is Empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium">Start by adding items manually or scanning a grocery receipt.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-10 py-5 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 hover:shadow-xl hover:shadow-secondary/20 transition-all active:scale-95"
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

              let statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
              let statusLabel = 'Fresh';
              if (daysLeft !== null) {
                if (daysLeft < 0) {
                  statusColor = 'bg-rose-50 text-rose-700 border border-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
                  statusLabel = 'Expired';
                } else if (daysLeft <= 3) {
                  statusColor = 'bg-orange-50 text-orange-700 border border-orange-100 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
                  statusLabel = 'Expiring Soon';
                }
              }

              // Nutrition Calculation
              const nutrition = item.foodItem?.nutritionPerUnit || {};
              const cal = nutrition.calories != null ? Math.round(nutrition.calories) : '-';
              const protein = nutrition.protein != null ? Math.round(nutrition.protein) : '-';
              const carbs = nutrition.carbohydrates != null ? Math.round(nutrition.carbohydrates) : '-';
              const fat = nutrition.fat != null ? Math.round(nutrition.fat) : '-';

              return (
                <div key={item.id} className="bg-white rounded-[3rem] p-8 shadow-soft hover:shadow-2xl transition-all duration-500 group relative border border-border/40 hover:border-primary/40 flex flex-col shrink-0 animate-in fade-in slide-in-from-bottom-4">
                  <div className={`absolute top-6 right-6 text-[9px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-widest z-10 ${statusColor}`}>
                    {statusLabel}
                  </div>

                  <div className="flex items-center justify-center h-48 mb-8 bg-gray-50/50 rounded-[2.5rem] group-hover:bg-primary/20 transition-all duration-700 text-8xl select-none shadow-inner border border-border/20">
                    <span className="group-hover:scale-125 group-hover:rotate-12 transition-all duration-1000 block filter drop-shadow-md">
                      {category.toLowerCase().includes('fruit') ? '🍎' :
                        category.toLowerCase().includes('veg') ? '🥦' :
                          category.toLowerCase().includes('meat') ? '🥩' :
                            category.toLowerCase().includes('dairy') ? '🥛' :
                              category.toLowerCase().includes('grain') ? '🌾' : '📦'}
                    </span>
                  </div>

                  <div className="space-y-4 flex-1 flex flex-col">
                    <div>
                      <h4 className="font-bold text-2xl text-foreground mb-1.5 group-hover:text-secondary transition-colors leading-tight line-clamp-1 tracking-tight">{itemName}</h4>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-80 mb-2">
                        {category} • {expDate ? `${daysLeft} days remaining` : 'No expiry'}
                      </p>

                      <div className="grid grid-cols-4 gap-3 mb-6 mt-6">
                        <div className="bg-orange-50/50 rounded-2xl p-2.5 text-center border border-orange-100/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center justify-center text-orange-400 mb-1.5"><Flame className="w-3.5 h-3.5" /></div>
                          <p className="text-xl font-bold text-foreground">{cal}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">kcal</p>
                        </div>
                        <div className="bg-primary/10 rounded-2xl p-2.5 text-center border border-primary/20 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center justify-center text-secondary mb-1.5"><Zap className="w-3.5 h-3.5" /></div>
                          <p className="text-xl font-bold text-foreground">{protein}{protein !== '-' ? 'g' : ''}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">prot</p>
                        </div>
                        <div className="bg-amber-50 rounded-2xl p-2.5 text-center border border-amber-100/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center justify-center text-amber-500 mb-1.5"><Apple className="w-3.5 h-3.5" /></div>
                          <p className="text-xl font-bold text-foreground">{carbs}{carbs !== '-' ? 'g' : ''}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">carb</p>
                        </div>
                        <div className="bg-yellow-50 rounded-2xl p-2.5 text-center border border-yellow-100/50 hover:bg-white hover:shadow-md transition-all">
                          <div className="flex items-center justify-center text-yellow-500 mb-1.5"><Droplet className="w-3.5 h-3.5" /></div>
                          <p className="text-xl font-bold text-foreground">{fat}{fat !== '-' ? 'g' : ''}</p>
                          <p className="text-[9px] font-bold text-muted-foreground uppercase">fat</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-border/40 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 opacity-60">Stock Load</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl font-bold text-foreground tracking-tight">{item.quantity}</span>
                          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{item.unit || 'pcs'}</span>
                        </div>
                        {item.foodItem?.basePrice ? (
                          <div className="text-xs font-bold text-secondary/70 mt-1">
                            ৳{((item.foodItem.basePrice * item.quantity) / (item.foodItem.nutritionBasis || 1)).toFixed(0)} Total
                          </div>
                        ) : (
                          <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-40">Unpriced</div>
                        )}
                      </div>

                      <button
                        onClick={() => handleConsumption(item)}
                        disabled={item.quantity <= 0}
                        className="w-14 h-14 rounded-2xl bg-secondary text-white hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 hover:shadow-xl active:scale-90 disabled:opacity-20 flex items-center justify-center group/btn"
                        title="Log Consumption"
                      >
                        <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-1 transition-transform" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-500 border border-primary/20">
        <div className="px-8 py-6 border-b border-border/40 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-xl font-bold text-foreground tracking-tight">Log Consumption</h3>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white text-muted-foreground hover:text-secondary hover:bg-primary/10 transition-all shadow-sm">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-widest rounded-2xl flex items-center gap-2 border border-rose-100 animate-shake">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="bg-primary/10 p-5 rounded-[2rem] border border-primary/20">
            <label className="block text-[10px] font-bold text-secondary uppercase tracking-widest mb-2 opacity-60">Item Selected</label>
            <div className="text-foreground font-bold text-2xl tracking-tight mb-1">{itemName}</div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Available: {maxQuantity} {item.unit}</div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 ml-2">Quantity Consumed</label>
            <div className="flex gap-3">
              <div className="flex items-center bg-white border border-border/60 rounded-2xl overflow-hidden flex-1 shadow-sm focus-within:ring-4 focus-within:ring-primary/20 transition-all">
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(0, prev.quantity - 1) }))}
                  disabled={form.quantity <= 0}
                  className="px-4 py-4 bg-gray-50 hover:bg-primary/20 hover:text-secondary text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  className="flex-1 w-20 px-4 py-4 text-center border-0 focus:ring-0 focus:outline-none text-foreground font-bold text-lg"
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, quantity: Math.min(maxQuantity, prev.quantity + 1) }))}
                  disabled={form.quantity >= maxQuantity}
                  className="px-4 py-4 bg-gray-50 hover:bg-primary/20 hover:text-secondary text-foreground font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <span className="material-icons-outlined text-sm">add</span>
                </button>
              </div>
              <div className="px-6 py-4 bg-primary/20 border border-primary/20 rounded-2xl text-secondary font-bold text-xs uppercase tracking-widest flex items-center shadow-sm">
                {item.unit || 'units'}
              </div>
            </div>
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, quantity: maxQuantity }))}
                className="text-[10px] font-bold text-secondary uppercase tracking-widest hover:text-secondary/70 transition-colors bg-primary/10 px-3 py-1.5 rounded-lg"
              >
                Consume All stock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 ml-2">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="e.g., Used for today's dinner recipe..."
              className="w-full px-6 py-4 bg-gray-50 border border-border/40 rounded-2xl focus:ring-4 focus:ring-primary/20 focus:bg-white focus:border-transparent outline-none resize-none text-foreground font-medium transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-secondary text-white font-bold rounded-2xl hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-3 active:scale-[0.98]"
            >
              {loading ? <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" /> : <span className="material-icons-outlined text-xl">check_circle</span>}
              <span className="text-[10px] font-bold uppercase tracking-widest">{loading ? 'Processing...' : 'Confirm Consumption'}</span>
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

  /* --- PRICE ESTIMATION --- */
  const { estimatePrice } = useInventory();
  const [priceLoading, setPriceLoading] = useState(false);

  const handleEstimatePrice = async () => {
    if (!form.name || form.quantity <= 0) {
      alert("Please enter item name and quantity first.");
      return;
    }

    setPriceLoading(true);
    try {
      const result = await estimatePrice({
        foodName: form.name,
        quantity: form.quantity,
        unit: form.unit,
        region: 'Bangladesh' // Fallback/Target region set to Bangladesh
      });

      if (result && result.estimatedPrice) {
        setForm(prev => ({ ...prev, basePrice: result.estimatedPrice }));
      }
    } catch (error) {
      console.error("Estimation error:", error);
    } finally {
      setPriceLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/30 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full relative max-h-[90vh] overflow-y-auto shadow-2xl border border-primary/20 scrollbar-hide">
        <h3 className="text-3xl font-bold mb-8 text-foreground tracking-tight">Add New Pantry Item</h3>

        {/* Quick Action for OCR */}
        <button
          onClick={() => { onClose(); onScan(); }}
          className="w-full mb-6 py-5 bg-primary/20 text-secondary font-bold rounded-2xl flex items-center justify-center gap-3 border border-primary/30 hover:bg-primary/30 transition-all shadow-sm hover:shadow-md active:scale-95"
        >
          <span className="material-icons-outlined text-xl">photo_camera</span>
          <span className="text-[10px] font-bold uppercase tracking-widest">Scan Shopping Receipt</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-muted-foreground">Or add manually</span></div>
        </div>

        {/* USDA Search */}
        <div className="mb-6 relative group">
          <div className="relative">
            <span className="material-icons-outlined absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-secondary transition-colors">search</span>
            <input
              className="w-full border border-border/40 pl-14 pr-12 py-4.5 rounded-2xl bg-gray-50 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all text-foreground font-bold"
              placeholder="Search USDA database..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-5 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-3 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {showResults && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-3 bg-white border border-primary/20 rounded-[2rem] shadow-2xl max-h-64 overflow-y-auto animate-in slide-in-from-top-2 duration-300 p-2 scrollbar-hide">
              {searchResults.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectFood(item)}
                  className="w-full text-left px-5 py-4 rounded-xl hover:bg-primary/10 transition-colors flex flex-col gap-1 group/item border-b border-gray-50 last:border-0"
                >
                  <div className="font-bold text-sm text-foreground group-hover/item:text-secondary transition-colors">{item.description}</div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{item.dataType} • {item.unitName}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Item Name</label>
            <input
              className="w-full border border-border/40 p-4.5 rounded-2xl bg-gray-50 text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-gray-300"
              placeholder="e.g. Fuji Apple"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="w-1/2 space-y-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Quantity</label>
              <input
                type="number"
                className="w-full border border-border/40 p-4.5 rounded-2xl bg-gray-50 text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all"
                value={form.quantity}
                onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) })}
              />
            </div>
            <div className="w-1/2 space-y-2">
              <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Unit</label>
              <input
                className="w-full border border-border/40 p-4.5 rounded-2xl bg-gray-50 text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all placeholder:text-gray-300"
                placeholder="pcs, kg, etc."
                value={form.unit}
                onChange={e => setForm({ ...form, unit: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">Expiry Date</label>
            <input
              type="date"
              className="w-full border border-border/40 p-4.5 rounded-2xl bg-gray-50 text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all"
              value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
            />
          </div>

          {/* Price Section */}
          <div className="p-5 bg-primary/10 rounded-[2rem] border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-bold text-secondary uppercase tracking-widest ml-2 px-1">Estimated Value</label>

              <button
                type="button"
                onClick={handleEstimatePrice}
                disabled={priceLoading}
                className="px-3 py-1.5 bg-white text-[10px] font-bold uppercase tracking-widest text-secondary rounded-lg border border-primary/20 shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
              >
                {priceLoading ? (
                  <div className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-icons-outlined text-sm">auto_awesome</span>
                )}
                AI Estimate
              </button>
            </div>

            <div className="relative">
              <input
                type="number"
                className="w-full border border-border/40 p-4.5 pl-10 rounded-2xl bg-white text-foreground font-bold focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all font-bold"
                placeholder="0.00"
                value={form.basePrice || ''}
                onChange={e => setForm({ ...form, basePrice: parseFloat(e.target.value) })}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary font-bold text-lg">৳</div>
            </div>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
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
              className="py-5 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] order-1 sm:order-2"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">Add to Pantry</span>
              </div>
            </button>
            <button 
              onClick={onClose} 
              className="py-5 bg-white text-muted-foreground rounded-2xl hover:bg-gray-50 transition-all font-bold border border-border/40 hover:border-border order-2 sm:order-1"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
