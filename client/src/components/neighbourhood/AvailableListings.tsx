import { useState } from 'react';
import { useListings } from './sharing-service';
import { ListingStatus, type ListingFilters } from './types';
import ListingCard from './ListingCard';
import { NeighborhoodMap } from './NeighborhoodMap';
import { Map, List, MapPin, Package, AlertCircle, Filter, Search } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

interface AvailableListingsProps {
  externalSearch?: string;
}

export default function AvailableListings({ externalSearch }: AvailableListingsProps) {
  const [filters, setFilters] = useState<ListingFilters>({
    status: ListingStatus.AVAILABLE,
    excludeOwnListings: true,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;
  const { profile } = useProfile();

  const effectiveSearch = externalSearch || internalSearch;

  const {
    data: listings = [],
    isLoading,
    isError,
    refetch
  } = useListings({
    ...filters,
    search: effectiveSearch || undefined,
  });

  const handleFilterChange = (key: keyof ListingFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: ListingStatus.AVAILABLE,
      excludeOwnListings: true,
    });
    setInternalSearch('');
    setCurrentPage(1);
  };

  const hasActiveFilters = filters.category || filters.location || effectiveSearch;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground/70">Loading available items...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-xl max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error Loading Listings
          </h3>
          <p className="text-red-600 mb-4">
            Failed to fetch available items. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">
            Available Food Items
          </h2>
          <p className="text-foreground/70 text-sm">
            {listings.length} items available for sharing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-2xl mr-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-black' : 'text-gray-500 hover:text-black'}`}
              title="Map View"
            >
              <Map className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl border transition-all font-bold shadow-sm ${showFilters
              ? 'bg-black text-white border-black'
              : 'bg-white border-gray-100 text-muted-foreground hover:text-black hover:bg-gray-50'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Search - only show if no external search */}
      {!externalSearch && (
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for food items, categories, or locations..."
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-100 rounded-2xl bg-white text-foreground placeholder:text-muted-foreground shadow-soft focus:ring-2 focus:ring-black outline-none transition-all font-medium"
          />
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-soft space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-black">Filter Options</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm font-black text-primary hover:text-black transition-colors uppercase tracking-widest"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Category Filter */}
            <div>
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-foreground font-bold focus:ring-2 focus:ring-black outline-none"
              >
                <option value="">All Categories</option>
                <option value="fruit">Fruits</option>
                <option value="vegetable">Vegetables</option>
                <option value="dairy">Dairy</option>
                <option value="meat">Meat</option>
                <option value="grain">Grains</option>
                <option value="spice">Spices</option>
                <option value="condiment">Condiments</option>
                <option value="snack" >Snacks</option>
                <option value="beverage">Beverages</option>
                <option value="custom">Custom Items</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Area or landmark"
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-foreground font-bold focus:ring-2 focus:ring-black outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl bg-gray-50 text-foreground font-bold focus:ring-2 focus:ring-black outline-none"
              >
                <option value={ListingStatus.AVAILABLE}>Available</option>
                <option value={ListingStatus.CLAIMED}>Claimed</option>
                <option value={ListingStatus.COMPLETED}>Completed</option>
                <option value="">All Status</option>
              </select>
            </div>
          </div>

          {/* Toggle Own Listings */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <span className="text-sm font-bold text-black">Hide my own listings</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.excludeOwnListings || false}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  excludeOwnListings: e.target.checked
                }))}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </label>
          </div>
        </div>
      )}

      {/* Results */}
      {listings.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-xl border border-border">
          <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {hasActiveFilters ? 'No matching items found' : 'No items available'}
          </h3>
          <p className="text-foreground/60 mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms.'
              : 'Be the first to share food with your community!'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {listings
              .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
              .map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions={true}
                  isOwner={false}
                  onUpdate={() => refetch()}
                />
              ))}
          </div>

          {/* Pagination Controls */}
          {listings.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-gray-100">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-6 py-2 rounded-full border border-gray-100 font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                Previous
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: Math.ceil(listings.length / ITEMS_PER_PAGE) }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-8 h-8 rounded-full font-black text-[10px] transition-all ${currentPage === i + 1
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-gray-50 text-muted-foreground hover:bg-gray-100'
                      }`}
                  >
                    {i + 1}
                  </button>
                )).slice(Math.max(0, currentPage - 3), Math.min(Math.ceil(listings.length / ITEMS_PER_PAGE), currentPage + 2))}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(listings.length / ITEMS_PER_PAGE), prev + 1))}
                disabled={currentPage === Math.ceil(listings.length / ITEMS_PER_PAGE)}
                className="px-6 py-2 rounded-full border border-gray-100 font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-current"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {listings.some(l => !l.latitude || !l.longitude) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-amber-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Some listings don't have coordinates and won't appear on the map.</span>
            </div>
          )}
          <NeighborhoodMap
            listings={listings}
            userLat={profile?.profile?.latitude || undefined}
            userLng={profile?.profile?.longitude || undefined}
            height="600px"
          />
        </div>
      )}

      {/* Quick Stats */}
      {listings.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-foreground/70">
              Showing {listings.length} available items
            </span>
            <div className="flex items-center gap-4">
              <span className="text-foreground/60">
                Categories: {new Set(listings.map(l =>
                  l.inventoryItem.foodItem?.category || 'Custom'
                )).size}
              </span>
              <span className="text-foreground/60">
                Locations: {new Set(listings.map(l =>
                  l.pickupLocation
                ).filter(Boolean)).size}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}