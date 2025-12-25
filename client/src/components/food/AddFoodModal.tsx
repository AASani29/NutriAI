import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './calendar.css';

const categories = [
  'fruit', 'vegetable', 'dairy', 'grain', 'protein', 'pantry'
];

export default function AddFoodModal({ onClose, onAdded }: { onClose: () => void, onAdded: () => void }) {
  const [form, setForm] = useState({
    name: '', unit: '', category: '', expirationDate: '', sampleCostPerUnit: '', description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
        if (!expirationDate) {
          setError('Expiration date is required');
          setLoading(false);
          return;
        }
        // Calculate days until expiration
        const today = new Date();
        const diffTime = expirationDate.getTime() - today.setHours(0,0,0,0);
        const typicalExpirationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const payload = {
          ...form,
          typicalExpirationDays: typicalExpirationDays > 0 ? typicalExpirationDays : 1
        };
    const res = await fetch('/api/foods', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      onAdded();
    } else {
      setError(data.message || 'Failed to add item');
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-50">
      <form
        className="bg-card rounded-2xl border border-border shadow-xl p-8 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-xl font-bold text-foreground mb-4">Add Food Item</h2>
        <div className="flex flex-col gap-3">
          <input
            name="name"
            required
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <input
            name="unit"
            placeholder="Unit (e.g. kg, pcs)"
            value={form.unit}
            onChange={handleChange}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Expiration Date</label>
            <DatePicker
              selected={expirationDate}
              onChange={date => setExpirationDate(date)}
              dateFormat="MMM dd, yyyy"
              minDate={new Date()}
              className="date-picker-input px-3 py-2 border border-border rounded-lg bg-background text-foreground w-full"
              wrapperClassName="w-full"
              placeholderText="Select expiration date"
              showPopperArrow={false}
              todayButton="Today"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              popperPlacement="bottom"
              required
            />
          </div>
          <input
            name="sampleCostPerUnit"
            type="number"
            step="0.01"
            placeholder="Sample Cost Per Unit"
            value={form.sampleCostPerUnit}
            onChange={handleChange}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        <div className="flex gap-2 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-smooth font-medium"
          >
            {loading ? 'Adding...' : 'Add'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-card border border-border text-foreground rounded-lg hover:bg-secondary/10 transition-smooth font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
