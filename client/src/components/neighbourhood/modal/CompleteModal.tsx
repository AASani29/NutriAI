import { useState } from 'react';
import type { FoodListing } from '../types';

interface CompleteModalProps {
    listing: FoodListing;
    onClose: () => void;
    onComplete: (notes: string) => void;
    isLoading: boolean;
}

export default function CompleteModal({ listing, onClose, onComplete, isLoading }: CompleteModalProps) {
    const [notes, setNotes] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(notes);
    };

    return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                        Complete Sharing
                    </h3>
                    <p className="text-foreground/70 text-sm">
                        Mark "{listing.title}" as successfully shared.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Completion Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="How did the sharing go? Any feedback?"
                            rows={4}
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
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-smooth font-medium"
                        >
                            {isLoading ? 'Completing...' : 'Mark Complete'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
