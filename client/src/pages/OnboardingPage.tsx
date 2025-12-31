import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Leaf, User, Utensils, MapPin, DollarSign, ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useProfile } from '../context/ProfileContext';

export default function OnboardingPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const api = useApi();
  const { refreshProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    dietaryPreference: '',
    location: '',
    budgetRange: '',
  });

  useEffect(() => {
    // Pre-fill name from Clerk if available
    if (user?.firstName || user?.lastName) {
      setFormData((prev) => ({
        ...prev,
        fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (step === 1 && !formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }
    setError(null);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.updateProfile({
        fullName: formData.fullName,
        dietaryPreference: formData.dietaryPreference || undefined,
        location: formData.location || undefined,
        budgetRange: formData.budgetRange ? parseFloat(formData.budgetRange) : undefined,
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
      console.error('Error saving profile:', err);
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(210,232,35,0.1),transparent_50%)]"></div>
      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/20 rounded-2xl mb-4">
            <Leaf className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to NutriAI! 🌱</h1>
          <p className="text-muted-foreground font-medium">Let's set up your profile to get started</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-foreground uppercase tracking-wider">Step {step} of 4</span>
            <span className="text-sm font-bold text-primary-dark">{Math.round((step / 4) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 border border-gray-200">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Form */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Full Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <User className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">What's your name?</h2>
                    <p className="text-sm text-muted-foreground font-medium">Let us know how to address you</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                    Full Name <span className="text-primary-dark">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 2: Dietary Preference */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <Utensils className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Dietary Preference</h2>
                    <p className="text-sm text-muted-foreground font-medium">Help us personalize your experience</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="dietaryPreference" className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                    What's your dietary preference?
                  </label>
                  <select
                    id="dietaryPreference"
                    name="dietaryPreference"
                    value={formData.dietaryPreference}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold transition-all"
                  >
                    {dietaryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <MapPin className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Where are you located?</h2>
                    <p className="text-sm text-muted-foreground font-medium">For local community features</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                    Location (City, Country)
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium placeholder:text-muted-foreground transition-all"
                    placeholder="e.g., Dhaka, Bangladesh"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Budget Range */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                    <DollarSign className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-tight">Monthly Food Budget</h2>
                    <p className="text-sm text-muted-foreground font-medium">Optional - helps track spending</p>
                  </div>
                </div>

                <div>
                  <label htmlFor="budgetRange" className="block text-sm font-bold text-foreground mb-3 uppercase tracking-wider">
                    Budget Range (in your currency)
                  </label>
                  <input
                    type="number"
                    id="budgetRange"
                    name="budgetRange"
                    value={formData.budgetRange}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-bold placeholder:text-muted-foreground transition-all"
                    placeholder="e.g., 3000"
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 px-6 py-4 bg-gray-100 text-black rounded-xl hover:bg-gray-200 transition-all font-bold shadow-sm"
                  disabled={loading}
                >
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-4 bg-black text-white rounded-xl hover:bg-gray-900 transition-all font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? 'Saving...' : 'Complete Setup'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Skip Option */}
          {step < 4 && (
            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="text-sm font-bold text-muted-foreground hover:text-black hover:underline transition-all"
              >
                Skip for now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}