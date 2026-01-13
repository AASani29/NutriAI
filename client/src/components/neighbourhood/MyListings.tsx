import { useState } from 'react';
import { Package } from 'lucide-react';
import { useUserListings } from './sharing-service';
import { ListingStatus } from './types';
import type { FoodListing } from './types';
import ListingCard from './ListingCard';
import Pagination from './Pagination';

export default function MyListings() {
  const [statusFilter, setStatusFilter] = useState<'all' | ListingStatus>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  const { data: listings = [], isLoading, error } = useUserListings();


  const filteredListings = listings.filter((listing: FoodListing) =>
    statusFilter === 'all' || listing.status === statusFilter
  );

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">My Listings</h2>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-foreground/10 rounded w-3/4"></div>
                <div className="h-4 bg-foreground/10 rounded w-1/2"></div>
                <div className="h-4 bg-foreground/10 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-foreground">My Listings</h2>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600">Failed to load your listings</p>
          <p className="text-red-500 text-sm mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            My Listings
          </h2>
          <p className="text-foreground/70">
            Manage your shared food items
          </p>
        </div>

        {/* Status Filter */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as 'all' | ListingStatus);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm"
          >
            <option value="all">All Status</option>
            <option value={ListingStatus.AVAILABLE}>Available</option>
            <option value={ListingStatus.CLAIMED}>Booked</option>
            <option value={ListingStatus.COMPLETED}>Completed</option>
            <option value={ListingStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {listings.filter((l: FoodListing) => l.status === ListingStatus.AVAILABLE).length}
          </div>
          <div className="text-sm text-foreground/70">Available</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {listings.filter((l: FoodListing) => l.status === ListingStatus.COMPLETED).length}
          </div>
          <div className="text-sm text-foreground/70">Completed</div>
        </div>
        <div className="bg-card rounded-lg border border-border p-4 text-center">
          <div className="text-2xl font-bold text-gray-600">
            {listings.filter((l: FoodListing) => l.status === ListingStatus.CANCELLED).length}
          </div>
          <div className="text-sm text-foreground/70">Cancelled</div>
        </div>
      </div>

      {/* Listings */}
      {filteredListings.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="w-16 h-16 text-foreground/20 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {statusFilter === 'all' ? 'No Listings Yet' : `No ${String(statusFilter).toLowerCase()} listings`}
          </h3>
          <p className="text-foreground/60">
            {statusFilter === 'all'
              ? 'Share your surplus food to help others in your neighborhood'
              : `You don't have any ${String(statusFilter).toLowerCase()} listings right now`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {paginatedListings.map((listing: FoodListing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isOwner={true}
                onUpdate={() => {
                  // Invalidate queries or refetch handled by React Query cache
                }}
              />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}