import { useState } from 'react';
import type { FoodListing, ClaimListingRequest } from '../types';
import { useUser } from '@clerk/clerk-react';

interface ClaimModalProps {
    listing: FoodListing;
    onClose: () => void;
    onClaim: (data: ClaimListingRequest) => void;
    isLoading: boolean;
}

export default function ClaimModal({ listing, onClose, onClaim, isLoading }: ClaimModalProps) {
    const { user } = useUser();
    const [form, setForm] = useState({
        claimerName: user?.fullName || '',
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onClaim({
            claimerName: form.claimerName,
            notes: form.notes || undefined,
            quantityClaimed: listing.quantity, // Automatically claim full quantity
        });
    };

    return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                        Book "{listing.title}"
                    </h3>
                    <p className="text-foreground/70 text-sm">
                        Lock this item to pick it up. You are booking the full available quantity ({listing.quantity} {listing.unit}).
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Your Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.claimerName}
                            onChange={(e) => setForm(prev => ({ ...prev, claimerName: e.target.value }))}
                            placeholder="How should they contact you?"
                            required
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Message (Optional)
                        </label>
                        <textarea
                            value={form.notes}
                            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                            placeholder="Any special requests or pickup preferences?"
                            rows={3}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 border border-border text-foreground rounded-lg hover:bg-secondary/10 disabled:opacity-50 transition-smooth"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-smooth font-medium"
                        >
                            {isLoading ? 'Booking...' : 'Book'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
