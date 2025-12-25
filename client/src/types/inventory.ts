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