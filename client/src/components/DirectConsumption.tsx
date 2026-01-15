import { useAuth } from '@clerk/clerk-react';
import { Camera, Check, Plus, Upload, Utensils } from 'lucide-react';
import React, { useState } from 'react';

interface ScannedItem {
    id?: string;
    name: string;
    quantity: number;
    unit: string;
    expiryDate?: string; // OCR might pick this up, though less relevant for immediate consumption
}

const DirectConsumption: React.FC = () => {
    const { getToken } = useAuth();
    const [activeTab, setActiveTab] = useState<'manual' | 'scan'>('manual');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Manual Form State
    const [manualForm, setManualForm] = useState({
        name: '',
        quantity: 1,
        unit: 'pcs',
    });

    // scan State
    const [scannedImage, setScannedImage] = useState<File | null>(null);
    const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
    const [scanStep, setScanStep] = useState<'upload' | 'review'>('upload');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setSuccessMessage(null);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/inventories/consumption`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemName: manualForm.name,
                    quantity: Number(manualForm.quantity),
                    unit: manualForm.unit,
                }),
            });

            if (!response.ok) throw new Error('Failed to log consumption');

            setSuccessMessage(`Successfully consumed ${manualForm.quantity} ${manualForm.unit} of ${manualForm.name}`);
            setManualForm({ name: '', quantity: 1, unit: 'pcs' });
        } catch (error) {
            console.error('Error logging consumption:', error);
            alert('Failed to log consumption. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setScannedImage(e.target.files[0]);
        }
    };

    const handleScanSubmit = async () => {
        if (!scannedImage) return;
        setLoading(true);

        const formData = new FormData();
        formData.append('image', scannedImage);

        try {
            const token = await getToken();
            const response = await fetch(`${API_URL}/intelligence/analyze-image`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to analyze image');

            const data = await response.json();
            // Assume Response format: { success: true, data: { items: [...] } }
            // Map OCR items to ScannedItem interface
            const items: ScannedItem[] = (data.data.items || []).map((item: any) => ({
                name: item.name || item.text || 'Unknown Item',
                quantity: item.quantity || 1,
                unit: item.unit || 'pcs',
                expiryDate: item.expiryDate
            }));

            setScannedItems(items);
            setScanStep('review');
        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('Failed to analyze image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConsumeScannedItem = async (index: number) => {
        const item = scannedItems[index];
        setLoading(true);
        try {
            const token = await getToken();
            // Log consumption
            const response = await fetch(`${API_URL}/inventories/consumption`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    itemName: item.name,
                    quantity: Number(item.quantity),
                    unit: item.unit,
                }),
            });

            if (!response.ok) throw new Error('Failed to log consumption');

            // Remove from list
            const newItems = [...scannedItems];
            newItems.splice(index, 1);
            setScannedItems(newItems);

            if (newItems.length === 0) {
                setSuccessMessage('All items consumed successfully!');
                setScanStep('upload');
                setScannedImage(null);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to consume item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background/20 rounded-2xl p-6 shadow-soft transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-secondary/10 rounded-xl">
                    <Utensils className="w-6 h-6 text-secondary" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Direct Consumption</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">Quickly log meals consumed outside inventory</p>
                </div>
            </div>

            {successMessage && (
                <div className="mb-8 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="bg-green-100 p-1 rounded-full">
                        <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">{successMessage}</span>
                    <button onClick={() => setSuccessMessage(null)} className="ml-auto text-xs font-bold uppercase tracking-widest hover:text-green-800">Dismiss</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-gray-50 rounded-xl mb-8">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'manual'
                            ? 'bg-white text-secondary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                >
                    Manual Entry
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-300 ${activeTab === 'scan'
                            ? 'bg-white text-secondary shadow-sm'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50'
                        }`}
                >
                    Scan Receipt
                </button>
            </div>

            {activeTab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                            Item Name
                        </label>
                        <input
                            type="text"
                            required
                            value={manualForm.name}
                            onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                            className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all placeholder:text-gray-300 font-medium"
                            placeholder="e.g., Organic Apple, Oats..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={manualForm.quantity}
                                onChange={(e) => setManualForm({ ...manualForm, quantity: Number(e.target.value) })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
                                Unit
                            </label>
                            <select
                                value={manualForm.unit}
                                onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                                className="w-full px-5 py-3.5 bg-white border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all appearance-none cursor-pointer font-medium"
                                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'currentColor\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.25rem center', backgroundSize: '1rem' }}
                            >
                                <option value="pcs">Pieces</option>
                                <option value="kg">kg</option>
                                <option value="g">g</option>
                                <option value="L">L</option>
                                <option value="ml">ml</option>
                                <option value="pack">Pack</option>
                            </select>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-secondary hover:bg-secondary/90 text-white rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Plus className="w-5 h-5" /> Log Consumption
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    {scanStep === 'upload' ? (
                        <div className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 group ${scannedImage ? 'border-secondary bg-secondary/5' : 'border-gray-100 hover:border-secondary/50 hover:bg-gray-50/50'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                {scannedImage ? (
                                    <div className="mb-6 relative">
                                        <img src={URL.createObjectURL(scannedImage)} alt="Preview" className="h-56 object-contain rounded-xl shadow-md border-4 border-white" />
                                        <div className="absolute -bottom-3 -right-3 p-2 bg-secondary text-white rounded-full shadow-lg">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Camera className="w-10 h-10 text-secondary" />
                                    </div>
                                )}

                                <span className={`text-xl font-bold mb-2 transition-colors ${scannedImage ? 'text-secondary' : 'text-foreground group-hover:text-secondary'}`}>
                                    {scannedImage ? 'Ready to Analysis' : 'Upload or Snap Image'}
                                </span>
                                <p className="text-sm text-muted-foreground mb-8">
                                    {scannedImage ? scannedImage.name : 'Photo of your food or receipt to auto-detect items'}
                                </p>
                            </label>

                            {scannedImage && (
                                <button
                                    onClick={handleScanSubmit}
                                    disabled={loading}
                                    className="px-8 py-4 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all duration-300 shadow-lg hover:shadow-xl w-full flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Analyzing...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5" /> Analyze & Extract
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-sm font-bold text-foreground">Detected Items <span className="text-secondary ml-1">({scannedItems.length})</span></h3>
                                <button 
                                    onClick={() => setScanStep('upload')} 
                                    className="text-xs font-bold text-muted-foreground hover:text-secondary transition-colors underline underline-offset-4"
                                >
                                    Scan Another
                                </button>
                            </div>

                            {scannedItems.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-100">
                                    <Utensils className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-muted-foreground text-sm font-medium">No items detected. Try another photo.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {scannedItems.map((item, idx) => (
                                        <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                                            <div className="flex-1 mr-4">
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newItems = [...scannedItems];
                                                        newItems[idx].name = e.target.value;
                                                        setScannedItems(newItems);
                                                    }}
                                                    className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-secondary/30 outline-none w-full mb-2 group-hover:text-secondary transition-colors"
                                                />
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...scannedItems];
                                                            newItems[idx].quantity = Number(e.target.value);
                                                            setScannedItems(newItems);
                                                        }}
                                                        className="w-14 px-2 py-0.5 bg-gray-50/50 border border-gray-100 rounded text-xs font-bold focus:border-secondary outline-none"
                                                    />
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) => {
                                                            const newItems = [...scannedItems];
                                                            newItems[idx].unit = e.target.value;
                                                            setScannedItems(newItems);
                                                        }}
                                                        className="px-2 py-0.5 bg-gray-50/50 border border-gray-100 rounded text-[10px] font-bold uppercase tracking-widest outline-none cursor-pointer"
                                                    >
                                                        <option value="pcs">pcs</option>
                                                        <option value="kg">kg</option>
                                                        <option value="g">g</option>
                                                        <option value="L">L</option>
                                                        <option value="ml">ml</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleConsumeScannedItem(idx)}
                                                disabled={loading}
                                                className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                Log
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DirectConsumption;
