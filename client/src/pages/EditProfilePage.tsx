import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Utensils, MapPin, Save, ArrowLeft, Ruler, Scale, Target, AlertCircle, Heart } from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useApi } from '../hooks/useApi';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, refreshProfile } = useProfile();
  const api = useApi();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    dietaryPreference: '',
    location: '',
    budgetRange: '',
    height: '',
    weight: '',
    weightPreference: '',
    allergies: '',
    healthConditions: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });

  useEffect(() => {
    if (profile?.profile) {
      setFormData({
        fullName: profile.profile.fullName || '',
        dietaryPreference: profile.profile.dietaryPreference || '',
        location: profile.profile.location || '',
        budgetRange: profile.profile.budgetRange?.toString() || '',
        height: profile.profile.height?.toString() || '',
        weight: profile.profile.weight?.toString() || '',
        weightPreference: profile.profile.weightPreference || '',
        allergies: profile.profile.allergies || '',
        healthConditions: profile.profile.healthConditions || '',
        latitude: profile.profile.latitude || undefined,
        longitude: profile.profile.longitude || undefined,
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
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.updateProfile({
        fullName: formData.fullName,
        dietaryPreference: formData.dietaryPreference || undefined,
        location: formData.location || undefined,
        budgetRange: formData.budgetRange ? parseFloat(formData.budgetRange) : undefined,
        height: formData.height ? parseFloat(formData.height) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        weightPreference: formData.weightPreference || undefined,
        allergies: formData.allergies || undefined,
        healthConditions: formData.healthConditions || undefined,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      await refreshProfile();
      setSuccess(true);

      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    { value: '', label: 'Select preference' },
    { value: 'vegetarian', label: 'Vegetarian' },
    { value: 'vegan', label: 'Vegan' },
    { value: 'pescatarian', label: 'Pescatarian' },
    { value: 'omnivore', label: 'Omnivore' },
    { value: 'keto', label: 'Keto' },
    { value: 'paleo', label: 'Paleo' },
    { value: 'gluten-free', label: 'Gluten-Free' },
    { value: 'other', label: 'Other' },
  ];

  const healthOptions = [
    { value: '', label: 'None' },
    { value: 'diabetes', label: 'Diabetes' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'heart-disease', label: 'Heart Disease' },
    { value: 'kidney-disease', label: 'Kidney Disease' },
    { value: 'celiac-disease', label: 'Celiac Disease' },
    { value: 'ibs', label: 'IBS' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link
              to="/profile"
              className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black border border-gray-100 rounded-full hover:bg-gray-50 transition-all font-black uppercase tracking-widest text-[10px] shadow-sm group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Profile
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 md:p-12 shadow-soft relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <div className="relative z-10">
              <header className="mb-12">
                <h1 className="text-4xl font-black text-black tracking-tight mb-2">Edit Metadata</h1>
                <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">Registry & Personal Metrics</p>
              </header>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                </div>

                {/* Dietary Preference */}
                <div>
                  <label htmlFor="dietaryPreference" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Dietary Preference
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <select
                      id="dietaryPreference"
                      name="dietaryPreference"
                      value={formData.dietaryPreference}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black transition-all appearance-none"
                    >
                      {dietaryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Location
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                      placeholder="e.g., Dhaka, Bangladesh"
                    />
                  </div>
                </div>

                {/* Budget Range */}
                <div>
                  <label htmlFor="budgetRange" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Monthly Budget (৳)
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors font-bold text-lg">
                      <span className="ml-1">৳</span>
                    </div>
                    <input
                      type="number"
                      id="budgetRange"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                      placeholder="e.g., 5000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="height" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                      Height (cm)
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                        <Ruler className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        id="height"
                        name="height"
                        value={formData.height}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                        placeholder="e.g., 170"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="weight" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                      Weight (kg)
                    </label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                        <Scale className="w-5 h-5" />
                      </div>
                      <input
                        type="number"
                        id="weight"
                        name="weight"
                        value={formData.weight}
                        onChange={handleChange}
                        min="0"
                        step="0.1"
                        className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                        placeholder="e.g., 70"
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Preference */}
                <div>
                  <label htmlFor="weightPreference" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Weight Goal
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <Target className="w-5 h-5" />
                    </div>
                    <select
                      id="weightPreference"
                      name="weightPreference"
                      value={formData.weightPreference}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black transition-all appearance-none"
                    >
                      <option value="">Select a goal</option>
                      <option value="lose">Lose Weight</option>
                      <option value="maintain">Maintain Weight</option>
                      <option value="gain">Gain Weight</option>
                    </select>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label htmlFor="allergies" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Allergies
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black placeholder:text-muted-foreground/50 transition-all"
                      placeholder="e.g., Peanuts, Seafood, Dairy"
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">Separate allergies with commas</p>
                </div>

                {/* Health Conditions */}
                <div>
                  <label htmlFor="healthConditions" className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 block">
                    Health Condition
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-black transition-colors">
                      <Heart className="w-5 h-5" />
                    </div>
                    <select
                      id="healthConditions"
                      name="healthConditions"
                      value={formData.healthConditions}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-5 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/20 text-foreground font-black transition-all appearance-none"
                    >
                      {healthOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground font-medium">Used to provide health-safe meal recommendations</p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50/50 border border-red-100 rounded-xl">
                    <p className="text-sm text-red-600 font-bold">{error}</p>
                  </div>
                )}

                {/* Success Message */}
                {success && (
                  <div className="p-4 bg-primary/20 border border-primary/30 rounded-xl">
                    <p className="text-sm text-black font-bold">Profile updated successfully! Redirecting...</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => navigate('/profile')}
                    className="flex-1 px-8 py-5 bg-gray-50 text-black border border-gray-200 rounded-2xl hover:bg-gray-100 transition-all font-black uppercase tracking-widest text-xs active:scale-95"
                    disabled={loading}
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-5 bg-primary text-white rounded-2xl hover:bg-primary-dark transition-all font-black uppercase tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_20px_40px_-15px_rgba(172,156,6,0.3)] active:scale-95"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Synchronizing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Commit Updates
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div >
    </main >
  );
}