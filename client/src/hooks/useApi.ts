import { useAuth } from '@clerk/clerk-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Export the interface
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string | null;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    id: string;
    fullName: string | null;
    dietaryPreference: string | null;
    location: string | null;
    budgetRange: number | null;
  } | null;
}

export interface UpdateProfileData {
  fullName?: string;
  dietaryPreference?: string;
  location?: string;
  budgetRange?: number;
}

// Custom hook for authenticated API calls
export function useApi() {
  const { getToken } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = await getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  };

  return {
    // User endpoints
    getCurrentUser: () => fetchWithAuth('/users/me'),
    getProfile: () => fetchWithAuth('/users/profile'),
    updateProfile: (data: UpdateProfileData) =>
      fetchWithAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  };
}