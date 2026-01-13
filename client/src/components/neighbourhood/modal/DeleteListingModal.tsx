import { Trash2 } from 'lucide-react';
import type { FoodListing } from '../types';

interface DeleteListingModalProps {
    listing: FoodListing;
    onClose: () => void;
    onDelete: () => void;
    isLoading: boolean;
}

export default function DeleteListingModal({ listing, onClose, onDelete, isLoading }: DeleteListingModalProps) {
    return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl p-6 w-full max-w-md">
                <div className="flex items-center gap-3 mb-4">
                    <Trash2 className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-bold text-foreground">
                        Delete Listing
                    </h3>
                </div>
                <p className="text-foreground/70 mb-6">
                    Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary/10 transition-smooth disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-smooth disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
