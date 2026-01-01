import { useState, useEffect } from 'react';
import { Plus, Package, MapPin, Calendar, AlertCircle, CheckCircle, Search } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';
import { useCreateListing } from './sharing-service';
import { MapPicker } from './MapPicker';

interface InventoryItem {
  id: string;
  inventoryId: string;
  customName?: string;
  quantity: number;
  unit?: string;
  expiryDate?: string;
  notes?: string;
  foodItem?: {
    id?: string;
    name: string;
    category: string;
    unit?: string;
  };
  inventory: {
    id: string;
    name: string;
  };
}

interface CreateListingProps {
  onSuccess?: () => void;
}

export default function CreateListing({ onSuccess }: CreateListingProps) {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    quantity: 0,
    pickupLocation: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    availableUntil: '',
  });
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const { useGetInventories, useGetMultipleInventoryItems } = useInventory();
  const { data: inventories = [] } = useGetInventories();
  const createListingMutation = useCreateListing();

  // Get all inventory items from all inventories using useQueries via the new hook
  const inventoryIds = inventories.map(inv => inv.id);
  const inventoryQueries = useGetMultipleInventoryItems(inventoryIds);

  const allItems: InventoryItem[] = inventoryQueries.reduce((acc: InventoryItem[], query, index) => {
    if (query.data) {
      const inventory = inventories[index];
      // Type assertion needed because query.data comes from the hook as unknown in map context sometimes, 
      // but we know it returns InventoryItem[] based on our implementation
      const items = query.data as InventoryItem[];

      const itemsWithInventory = items.map(item => ({
        ...item,
        inventory: inventory || {
          id: item.inventoryId,
          name: 'Unknown Inventory'
        }
      }));
      acc.push(...itemsWithInventory);
    }
    return acc;
  }, [] as InventoryItem[]);

  // Filter out items with 0 quantity
  const availableItems = allItems.filter(item => item.quantity > 0);

  useEffect(() => {
    if (selectedItem) {
      const itemName = selectedItem.customName || selectedItem.foodItem?.name || 'Food Item';
      setForm(prev => ({
        ...prev,
        title: `${itemName} - Free to Good Home`,
        quantity: selectedItem.quantity,
      }));
    }
  }, [selectedItem]);

  const handleItemSelect = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowItemSelector(false);
    setError('');
  };

  const handleAddressSearch = async () => {
    if (!form.pickupLocation.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(form.pickupLocation)}&limit=1`, {
        headers: {
          'User-Agent': 'LocaNutri-Smart-App'
        }
      });
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setForm(prev => ({
          ...prev,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon)
        }));
      } else {
        setError("Location not found. Please try a more specific address.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search for location.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedItem) {
      setError('Please select an inventory item to share');
      return;
    }

    if (!form.title.trim()) {
      setError('Please provide a title for your listing');
      return;
    }

    if (form.quantity <= 0 || form.quantity > selectedItem.quantity) {
      setError(`Quantity must be between 0 and ${selectedItem.quantity}`);
      return;
    }

    try {
      await createListingMutation.mutateAsync({
        inventoryItemId: selectedItem.id,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        quantity: form.quantity,
        pickupLocation: form.pickupLocation.trim() || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
        availableUntil: form.availableUntil ? new Date(form.availableUntil) : undefined,
      });

      // Reset form
      setSelectedItem(null);
      setForm({
        title: '',
        description: '',
        quantity: 0,
        pickupLocation: '',
        latitude: undefined,
        longitude: undefined,
        availableUntil: '',
      });

      setError('');
      onSuccess?.();
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-black tracking-tight mb-2">
          Share Food
        </h2>
        <p className="text-muted-foreground font-medium">
          Turn your surplus into someone else's meal. Simple, fast, and sustainable.
        </p>
      </div>

      {/* Success Message */}
      {createListingMutation.isSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-medium text-green-800">
                Listing Created Successfully!
              </h3>
              <p className="text-green-700 text-sm">
                Your item is now available for others to claim.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 space-y-8 shadow-soft">
        {/* Item Selection */}
        <div>
          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
            Select Item to Share
          </label>

          {selectedItem ? (
            <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50/50">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">
                    {selectedItem.customName || selectedItem.foodItem?.name}
                  </h4>
                  <p className="text-sm text-foreground/70">
                    {selectedItem.inventory.name} • {selectedItem.foodItem?.category || 'Custom'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowItemSelector(true)}
                  className="text-primary hover:text-primary/80 text-sm transition-colors"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-foreground/60">
                <span>Available: {selectedItem.quantity} {selectedItem.unit}</span>
                {selectedItem.expiryDate && (
                  <span>Expires: {formatDate(selectedItem.expiryDate)}</span>
                )}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowItemSelector(true)}
              className="w-full border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <Package className="w-12 h-12 text-foreground/40 mx-auto mb-3" />
              <h4 className="font-medium text-foreground mb-1">
                Choose Item from Inventory
              </h4>
              <p className="text-sm text-foreground/60">
                Select an item from your inventory to share
              </p>
            </button>
          )}
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Listing Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="e.g., Fresh Apples - Free to Good Home"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Tell people more about the item, its condition, or any special notes..."
            rows={4}
            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
          />
        </div>

        {/* Quantity and Pickup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Quantity to Share *
            </label>
            <input
              type="number"
              min="0.1"
              max={selectedItem?.quantity || 0}
              step="0.1"
              value={form.quantity || ''}
              onChange={(e) => setForm(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
              placeholder="0"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              required
            />
            {selectedItem && (
              <p className="text-xs text-foreground/60 mt-1">
                Max: {selectedItem.quantity} {selectedItem.unit}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Pickup Location Detail
            </label>
            <div className="relative group">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" />
              <input
                type="text"
                value={form.pickupLocation}
                onChange={(e) => setForm(prev => ({ ...prev, pickupLocation: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddressSearch())}
                placeholder="e.g., Main Street, Building A"
                className="w-full pl-10 pr-24 py-2 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleAddressSearch}
                disabled={isSearching || !form.pickupLocation.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white px-3 py-1 rounded-md text-[10px] font-bold hover:bg-primary hover:text-black transition-all disabled:opacity-50 flex items-center gap-1"
              >
                {isSearching ? '...' : (
                  <>
                    <Search className="w-3 h-3" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              You can also select the precise location on the map below.
            </p>
          </div>
        </div>

        {/* Map Selection Area */}
        <div className="pt-2">
          <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-4">
            Specify Precise Location
          </label>
          <MapPicker
            initialLat={form.latitude}
            initialLng={form.longitude}
            onLocationSelect={(lat, lng) => setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))}
            onAddressSelect={(address) => setForm(prev => ({ ...prev, pickupLocation: address }))}
            height="300px"
          />
        </div>

        {/* Available Until */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Available Until
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" />
            <input
              type="datetime-local"
              value={form.availableUntil}
              onChange={(e) => setForm(prev => ({ ...prev, availableUntil: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
          <p className="text-xs text-foreground/60 mt-1">
            Leave empty if no deadline
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!selectedItem || createListingMutation.isPending}
          className="w-full px-6 py-4 bg-black text-white rounded-2xl hover:bg-primary hover:text-black disabled:opacity-50 transition-all font-black flex items-center justify-center gap-2 shadow-xl shadow-black/10 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          {createListingMutation.isPending ? 'Creating Listing...' : 'Broadcast to Neighbourhood'}
        </button>
      </form>

      {/* Item Selector Modal */}
      {showItemSelector && (
        <ItemSelectorModal
          items={availableItems}
          onSelect={handleItemSelect}
          onClose={() => setShowItemSelector(false)}
        />
      )}
    </div>
  );
}

interface ItemSelectorModalProps {
  items: InventoryItem[];
  onSelect: (item: InventoryItem) => void;
  onClose: () => void;
}

function ItemSelectorModal({ items, onSelect, onClose }: ItemSelectorModalProps) {
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item => {
    const itemName = item.customName || item.foodItem?.name || '';
    const category = item.foodItem?.category || '';
    const inventoryName = item.inventory.name;

    return (
      itemName.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase()) ||
      inventoryName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">
            Select Item to Share
          </h3>
          <div className="relative">
            <Package className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/60" />
            <input
              type="text"
              placeholder="Search your inventory items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">
                {items.length === 0 ? 'No Items Available' : 'No Matching Items'}
              </h4>
              <p className="text-foreground/60">
                {items.length === 0
                  ? 'Add items to your inventory first to share them.'
                  : 'Try adjusting your search terms.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="border border-border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-foreground">
                        {item.customName || item.foodItem?.name}
                      </h4>
                      <p className="text-sm text-foreground/70">
                        {item.inventory.name} • {item.foodItem?.category || 'Custom'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {item.quantity} {item.unit}
                      </p>
                      {item.expiryDate && (
                        <p className="text-xs text-foreground/60">
                          Expires {formatDate(item.expiryDate)}
                        </p>
                      )}
                    </div>
                  </div>
                  {item.notes && (
                    <p className="text-sm text-foreground/60 truncate">
                      {item.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary/10 transition-smooth"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}