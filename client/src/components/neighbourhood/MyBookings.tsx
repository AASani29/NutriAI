import { useState } from 'react';
import {
    Loader2,
    ShoppingBag
} from 'lucide-react';
import { useAuth } from "@clerk/clerk-react";
import ListingCard from './ListingCard';
import { useListings } from './sharing-service';
import { ListingStatus } from './types';
import type { FoodListing } from './types';
import Pagination from './Pagination';

const ITEMS_PER_PAGE = 9;

export default function MyBookings() {
    const { userId } = useAuth();

    // Fetch listings claimed by the current user
    // Only fetch when userId is available
    // Show both CLAIMED (Booked) and COMPLETED (Received) items for history
    const { data: listings, isLoading, refetch } = useListings({
        claimedBy: userId || undefined
    }, { enabled: !!userId });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    const bookedListings = listings || [];
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(bookedListings.length / ITEMS_PER_PAGE);
    const paginatedListings = bookedListings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">My Bookings</h2>
                    <p className="text-foreground/70">Manage food you have booked or received.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-lg border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {bookedListings.filter((l: FoodListing) => l.status === ListingStatus.CLAIMED).length}
                    </div>
                    <div className="text-sm text-foreground/70">Booked</div>
                </div>
                <div className="bg-card rounded-lg border border-border p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {bookedListings.filter((l: FoodListing) => l.status === ListingStatus.COMPLETED).length}
                    </div>
                    <div className="text-sm text-foreground/70">Received</div>
                </div>
            </div>

            {bookedListings.length === 0 ? (
                <div className="text-center py-12 bg-card rounded-xl border border-border">
                    <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingBag className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        No bookings yet
                    </h3>
                    <p className="text-foreground/70 max-w-sm mx-auto mb-6">
                        Browse available food in the neighbourhood and book items you need.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedListings.map((listing: FoodListing) => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                isClaimer={true}
                                onUpdate={refetch}
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
