import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { BASE_URL } from '../services/utils';

export interface NutritionStats {
  period: 'daily' | 'monthly';
  date: string;
  startDate: string;
  endDate: string;
  totals: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  recommended: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
  percentage: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface NutritionHistory {
  type: 'daily' | 'monthly';
  history: Array<{
    period: string;
    protein: number;
    carbohydrates: number;
    fat: number;
  }>;
}

export const useNutritionStats = (period: 'daily' | 'monthly' = 'daily', date?: Date) => {
  const { getToken } = useAuth();
  
  const params = new URLSearchParams();
  params.append('period', period);
  if (date) {
    params.append('date', date.toISOString().split('T')[0]);
  }

  return useQuery<NutritionStats>({
    queryKey: ['nutrition-stats', period, date?.toISOString().split('T')[0]],
    queryFn: async () => {
      const token = await getToken();
      
      const response = await fetch(`${BASE_URL}/nutrition/stats?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nutrition stats');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};

export const useNutritionHistory = (type: 'daily' | 'monthly' = 'daily') => {
  const { getToken } = useAuth();
  
  return useQuery<NutritionHistory>({
    queryKey: ['nutrition-history', type],
    queryFn: async () => {
      const token = await getToken();
      
      const response = await fetch(`${BASE_URL}/nutrition/history?type=${type}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch nutrition history');
      }

      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
