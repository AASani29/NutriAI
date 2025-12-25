// client/src/services/inventoryService.ts

import { useAuth } from "@clerk/clerk-react";

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  expirationDate?: string;
  purchaseDate?: string;
  location?: string;
  notes?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Function to make authenticated API calls
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { getToken } = useAuth();
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
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || error.message || `API request failed: ${response.status}`);
  }

  return response.json();
}

export const inventoryService = {
  // Get all inventories for the current user
  async getInventories(): Promise<InventoryItem[]> {
    const response = await fetchWithAuth('/inventories');
    return response.data || [];
  },

  // Create a new inventory item
  async createInventory(inventory: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const response = await fetchWithAuth('/inventories', {
      method: 'POST',
      body: JSON.stringify(inventory),
    });
    return response.data || response;
  },

  // Update an existing inventory item
  async updateInventory(id: string, inventory: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetchWithAuth(`/inventories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(inventory),
    });
    return response.data || response;
  },

  // Delete an inventory item
  async deleteInventory(id: string): Promise<void> {
    await fetchWithAuth(`/inventories/${id}`, {
      method: 'DELETE',
    });
  },

  // Get a specific inventory item
  async getInventory(id: string): Promise<InventoryItem> {
    const response = await fetchWithAuth(`/inventories/${id}`);
    return response.data || response;
  },
};