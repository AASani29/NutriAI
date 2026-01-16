import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useApi } from '../hooks/useApi';

interface EditProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileDialog({ isOpen, onClose }: EditProfileDialogProps) {
  const { profile, refreshProfile } = useProfile();
  const api = useApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    dietaryPreference: '',
    budgetRange: '',
    height: '',
    weight: '',
    weightPreference: '',
    allergies: '',
    healthConditions: '',
    proteinGoal: '',
    carbGoal: '',
    fatGoal: '',
    energyGoal: '',
  });

  useEffect(() => {
    if (profile?.profile) {
      setFormData({
        fullName: profile.profile.fullName || '',
        dietaryPreference: profile.profile.dietaryPreference || '',
        budgetRange: profile.profile.budgetRange?.toString() || '',
        height: profile.profile.height?.toString() || '',
        weight: profile.profile.weight?.toString() || '',
        weightPreference: profile.profile.weightPreference || '',
        allergies: profile.profile.allergies || '',
        healthConditions: profile.profile.healthConditions || '',
        proteinGoal: (profile.profile as any).proteinGoal?.toString() || '',
        carbGoal: (profile.profile as any).carbGoal?.toString() || '',
        fatGoal: (profile.profile as any).fatGoal?.toString() || '',
        energyGoal: (profile.profile as any).energyGoal?.toString() || '',
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.updateProfile({
        fullName: formData.fullName,
        dietaryPreference: formData.dietaryPreference || undefined,
        budgetRange: formData.budgetRange ? parseFloat(formData.budgetRange) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        weightPreference: formData.weightPreference || undefined,
        allergies: formData.allergies || undefined,
        healthConditions: formData.healthConditions || undefined,
        proteinGoal: formData.proteinGoal ? parseFloat(formData.proteinGoal) : undefined,
        carbGoal: formData.carbGoal ? parseFloat(formData.carbGoal) : undefined,
        fatGoal: formData.fatGoal ? parseFloat(formData.fatGoal) : undefined,
        energyGoal: formData.energyGoal ? parseFloat(formData.energyGoal) : undefined,
      });

      await refreshProfile();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Height (cm)
              </label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                placeholder="170"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Weight (kg)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.1"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                placeholder="70"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Diet Type
              </label>
              <select
                name="dietaryPreference"
                value={formData.dietaryPreference}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
              >
                <option value="">Select</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="omnivore">Omnivore</option>
                <option value="keto">Keto</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Weight Goal
              </label>
              <select
                name="weightPreference"
                value={formData.weightPreference}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
              >
                <option value="">Select</option>
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain Weight</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Budget (৳/month)
              </label>
              <input
                type="number"
                name="budgetRange"
                value={formData.budgetRange}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                placeholder="5000"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Allergies
              </label>
              <input
                type="text"
                name="allergies"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                placeholder="e.g., Peanuts, Seafood"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                Health Condition
              </label>
              <select
                name="healthConditions"
                value={formData.healthConditions}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
              >
                <option value="">None</option>
                <option value="diabetes">Diabetes</option>
                <option value="hypertension">Hypertension</option>
                <option value="heart-disease">Heart Disease</option>
                <option value="kidney-disease">Kidney Disease</option>
              </select>
            </div>
          </div>

          {/* Nutrition Goals */}
          <div className="pt-4 border-t border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Daily Nutrition Goals</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  name="energyGoal"
                  value={formData.energyGoal}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                  placeholder="2000"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                  Protein (g)
                </label>
                <input
                  type="number"
                  name="proteinGoal"
                  value={formData.proteinGoal}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  name="carbGoal"
                  value={formData.carbGoal}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                  placeholder="250"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1 block">
                  Fats (g)
                </label>
                <input
                  type="number"
                  name="fatGoal"
                  value={formData.fatGoal}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/20 text-sm"
                  placeholder="70"
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
