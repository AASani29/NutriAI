import { Inventory, InventoryItem, ConsumptionLog } from '@prisma/client';

// Extending the Prisma-generated types with additional properties as needed
export type InventoryWithItems = Inventory & {
  items: InventoryItem[];
};

export type InventoryRequest = {
  name: string;
  description?: string;
  isPrivate?: boolean;
};

export type UpdateInventoryRequest = {
  name?: string;
  description?: string;
  isPrivate?: boolean;
};

export type InventoryItemRequest = {
  foodItemId?: string;
  customName?: string;
  quantity: number;
  unit?: string;
  expiryDate?: Date;
  notes?: string;
};

export type UpdateInventoryItemRequest = {
  quantity?: number;
  unit?: string;
  expiryDate?: Date;
  notes?: string;
};

export type ConsumptionLogRequest = {
  inventoryId: string;
  inventoryItemId?: string;
  foodItemId?: string;
  itemName: string;
  quantity: number;
  unit?: string;
  consumedAt?: Date;
  notes?: string;
};

export type ConsumptionLogFilters = {
  startDate?: Date;
  endDate?: Date;
  inventoryId?: string;
};

export type InventoryFilters = {
  userId: string;
};

export type InventoryItemFilters = {
  inventoryId: string;
  category?: string;
  expiringSoon?: boolean;
};