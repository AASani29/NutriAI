import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useApi } from '../hooks/useApi';
import type { UserProfile } from '../hooks/useApi';

interface ProfileContextType {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isOnboarded: boolean;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!isSignedIn) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.getCurrentUser();
      setProfile(response.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProfile();
  }, [isSignedIn]);

  const isOnboarded = !!(
    profile?.profile?.fullName ||
    profile?.profile?.dietaryPreference ||
    profile?.profile?.location
  );

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        isOnboarded,
        refreshProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}