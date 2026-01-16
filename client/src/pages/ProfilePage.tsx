import { Link } from 'react-router-dom';
import {
  User, Mail, Utensils, Edit, ArrowLeft, Target, AlertCircle, Heart, ShieldCheck, Activity
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';
import { useUser } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';
import { MapPicker } from '../components/neighbourhood/MapPicker';
import { useState } from 'react';

export default function ProfilePage() {
  const { profile, loading, error, refreshProfile } = useProfile();
  const { user } = useUser();
  const api = useApi();
  const [updating, setUpdating] = useState(false);
  const [localLocation, setLocalLocation] = useState<string | null>(null);

  const handleLocationUpdate = async (lat: number, lng: number) => {
    setUpdating(true);
    try {
      await api.updateProfile({
        latitude: lat,
        longitude: lng,
      });
      await refreshProfile(true);
    } catch (err) {
      console.error("Failed to update coordinates:", err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddressUpdate = async (address: string) => {
    // Optimistic update
    setLocalLocation(address);
    try {
      await api.updateProfile({
        location: address,
      });
      await refreshProfile(true);
    } catch (err) {
      console.error("Failed to update address:", err);
      setLocalLocation(profile?.profile?.location || null);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-black mb-3">System Error</h2>
          <p className="text-muted-foreground font-medium mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50/30">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Profile Information</h1>
            <p className="text-gray-500 mt-1">Manage your personal metrics and wellness preferences</p>
          </div>
          <Link 
            to="/profile/edit"
            className="bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-all flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Link>
        </header>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Profile Card */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-secondary to-primary">
                <div className="w-full h-full rounded-full bg-white p-1">
                  <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center overflow-hidden">
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} className="rounded-full w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <User className="w-12 h-12 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">{profile?.profile?.fullName || 'Anonymous User'}</h2>
            <p className="text-sm text-gray-500 mb-6">{profile?.email || 'No email'}</p>

            <div className="w-full space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Height</span>
                <span className="font-bold text-gray-900">{profile?.profile?.height || '--'} cm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weight</span>
                <span className="font-bold text-gray-900">{profile?.profile?.weight || '--'} kg</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Goal</span>
                <span className="font-bold text-gray-900">{profile?.profile?.weightPreference || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Contact</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">{profile?.email || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Location</p>
                  <p className="text-sm font-semibold text-gray-900">{localLocation || profile?.profile?.location || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Utensils className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Preferences</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Diet Type</p>
                  <div className="inline-flex px-3 py-1 bg-secondary/10 text-secondary rounded-lg text-sm font-bold">
                    {profile?.profile?.dietaryPreference || 'Omnivore'}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Budget</p>
                  <p className="text-xl font-bold text-gray-900">
                    ৳{profile?.profile?.budgetRange?.toLocaleString() || '0'}
                    <span className="text-xs text-gray-500 font-medium ml-1">/month</span>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Health & Nutrition Goals */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Target className="w-5 h-5 text-secondary mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.profile?.energyGoal || '--'}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Cal Goal</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Activity className="w-5 h-5 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.profile?.proteinGoal || '--'}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Protein Goal</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Activity className="w-5 h-5 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.profile?.carbGoal || '--'}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Carb Goal</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 text-center">
            <Activity className="w-5 h-5 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{profile?.profile?.fatGoal || '--'}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">Fat Goal</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Location</h3>
          <div className="border border-gray-200 rounded-xl overflow-hidden relative">
            {updating && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <MapPicker
              initialLat={profile?.profile?.latitude || undefined}
              initialLng={profile?.profile?.longitude || undefined}
              onLocationSelect={handleLocationUpdate}
              onAddressSelect={handleAddressUpdate}
              height="300px"
            />
          </div>
        </div>

        {/* Health Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Allergies</h3>
                <p className="text-sm text-gray-600">{profile?.profile?.allergies || 'None reported'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-50 rounded-lg">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Health Conditions</h3>
                <p className="text-sm text-gray-600">{profile?.profile?.healthConditions || 'None reported'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-secondary text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Account Status</h3>
              <p className="text-sm text-white/80">
                Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
            <ShieldCheck className="w-12 h-12 text-white/30" />
          </div>
        </div>

      </div>
    </main>
  );
}