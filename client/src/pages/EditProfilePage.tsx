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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        to="/profile"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-black transition-all font-bold group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        Back to Profile
      </Link>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-soft">
        <h1 className="text-3xl font-black text-foreground mb-8 tracking-tight">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
              Full Name <span className="text-primary-dark">*</span>
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                 placeholder="Enter your full name"
                 required
               />
            </div>
          </div>

          {/* Dietary Preference */}
          <div>
            <label htmlFor="dietaryPreference" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium transition-all appearance-none"
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
            <label htmlFor="location" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                 placeholder="e.g., Dhaka, Bangladesh"
               />
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <label htmlFor="budgetRange" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                 placeholder="e.g., 5000"
               />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="height" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                   className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                   placeholder="e.g., 170"
                 />
              </div>
            </div>

            <div>
              <label htmlFor="weight" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                   className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                   placeholder="e.g., 70"
                 />
              </div>
            </div>
          </div>

          {/* Weight Preference */}
          <div>
            <label htmlFor="weightPreference" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium transition-all appearance-none"
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
            <label htmlFor="allergies" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                 placeholder="e.g., Peanuts, Seafood, Dairy"
               />
            </div>
            <p className="mt-2 text-xs text-muted-foreground font-medium">Separate allergies with commas</p>
          </div>

          {/* Health Conditions */}
          <div>
            <label htmlFor="healthConditions" className="block text-xs font-bold text-muted-foreground mb-3 uppercase tracking-wider">
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
                 className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium transition-all appearance-none"
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
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 px-6 py-4 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all font-bold shadow-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      </div>
    </div>
  );
}