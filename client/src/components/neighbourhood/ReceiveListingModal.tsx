import { useState } from 'react';
import { Package, CheckCircle, AlertCircle } from 'lucide-react';
import { useInventory } from '../../hooks/useInventory';

interface ReceiveListingModalProps {
    listingTitle: string;
    onClose: () => void;
    onReceive: (targetInventoryId: string) => void;
    isLoading: boolean;
}

export default function ReceiveListingModal({ listingTitle, onClose, onReceive, isLoading }: ReceiveListingModalProps) {
    const [selectedInventoryId, setSelectedInventoryId] = useState('');
    const { useGetInventories } = useInventory();
    const { data: inventories = [], isLoading: isLoadingInventories } = useGetInventories();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedInventoryId) {
            onReceive(selectedInventoryId);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md">
                <div className="p-6 border-b border-border">
                    <h3 className="text-lg font-bold text-foreground mb-2">
                        Receive "{listingTitle}"
                    </h3>
                    <p className="text-foreground/70 text-sm">
                        Select an inventory to add this item to.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground mb-1">
                            Select Inventory
                        </label>
                        {isLoadingInventories ? (
                            <div className="text-sm text-foreground/60">Loading inventories...</div>
                        ) : inventories.length === 0 ? (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg flex gap-2">
                                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                <p className="text-sm text-orange-800">You don't have any inventories. Please create one first.</p>
                            </div>
                        ) : (
                            <div className="grid gap-2">
                                {inventories.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className={`
                            border rounded-lg p-3 cursor-pointer transition-all flex items-center gap-3
                            ${selectedInventoryId === inv.id
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'border-border hover:border-primary/50 hover:bg-secondary/5'}
                          `}
                                        onClick={() => setSelectedInventoryId(inv.id)}
                                    >
                                        <Package className={`w-5 h-5 ${selectedInventoryId === inv.id ? 'text-primary' : 'text-foreground/40'}`} />
                                        <div>
                                            <h4 className="font-medium text-foreground text-sm">{inv.name}</h4>
                                            <p className="text-xs text-foreground/60">{inv.description || "No description"}</p>
                                        </div>
                                        {selectedInventoryId === inv.id && (
                                            <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
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
                            disabled={isLoading || !selectedInventoryId}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-smooth font-medium"
                        >
                            {isLoading ? 'Receiving...' : 'Receive Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
