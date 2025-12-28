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
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
                <Utensils className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Direct Consumption</h2>
            </div>

            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    {successMessage}
                    <button onClick={() => setSuccessMessage(null)} className="ml-auto text-sm underline hover:text-green-800">Dismiss</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`pb-3 px-6 font-medium text-sm transition-colors ${activeTab === 'manual'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Manual Entry
                </button>
                <button
                    onClick={() => setActiveTab('scan')}
                    className={`pb-3 px-6 font-medium text-sm transition-colors ${activeTab === 'scan'
                            ? 'border-b-2 border-purple-600 text-purple-600'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Scan Receipt / Image
                </button>
            </div>

            {activeTab === 'manual' ? (
                <form onSubmit={handleManualSubmit} className="max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name
                        </label>
                        <input
                            type="text"
                            required
                            value={manualForm.name}
                            onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., Apple, Milk"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                required
                                value={manualForm.quantity}
                                onChange={(e) => setManualForm({ ...manualForm, quantity: Number(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Unit
                            </label>
                            <select
                                value={manualForm.unit}
                                onChange={(e) => setManualForm({ ...manualForm, unit: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                        className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Plus className="w-4 h-4" /> Log Consumption
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="max-w-lg">
                    {scanStep === 'upload' ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="file-upload"
                            />
                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                {scannedImage ? (
                                    <div className="mb-4">
                                        <img src={URL.createObjectURL(scannedImage)} alt="Preview" className="h-48 object-contain rounded-lg" />
                                        <p className="text-sm text-gray-600 mt-2">{scannedImage.name}</p>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                        <Camera className="w-8 h-8 text-purple-600" />
                                    </div>
                                )}

                                <span className="text-lg font-medium text-gray-900 mb-2">
                                    {scannedImage ? 'Change Image' : 'Upload Receipt or Food Image'}
                                </span>
                                <p className="text-sm text-gray-500 mb-6">
                                    Take a photo of your food or receipt to auto-detect items
                                </p>
                            </label>

                            {scannedImage && (
                                <button
                                    onClick={handleScanSubmit}
                                    disabled={loading}
                                    className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 w-full flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>Processing OCR...</>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" /> Analyze & Extract Items
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-medium text-gray-900">Detected Items</h3>
                                <button onClick={() => setScanStep('upload')} className="text-sm text-gray-500 hover:text-gray-700">Scan Another</button>
                            </div>

                            {scannedItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    No items detected. Please try a clearer image.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {scannedItems.map((item, idx) => (
                                        <div key={idx} className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
                                            <div>
                                                <input
                                                    type="text"
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        const newItems = [...scannedItems];
                                                        newItems[idx].name = e.target.value;
                                                        setScannedItems(newItems);
                                                    }}
                                                    className="font-medium bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none"
                                                />
                                                <div className="flex items-center gap-2 mt-1">
                                                    <input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => {
                                                            const newItems = [...scannedItems];
                                                            newItems[idx].quantity = Number(e.target.value);
                                                            setScannedItems(newItems);
                                                        }}
                                                        className="w-16 px-1 py-0.5 bg-white border rounded text-sm"
                                                    />
                                                    <select
                                                        value={item.unit}
                                                        onChange={(e) => {
                                                            const newItems = [...scannedItems];
                                                            newItems[idx].unit = e.target.value;
                                                            setScannedItems(newItems);
                                                        }}
                                                        className="px-1 py-0.5 bg-white border rounded text-sm"
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
                                                className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                            >
                                                Consume
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
