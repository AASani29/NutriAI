import express from 'express';
import { inventoryController } from './inventory-controller';
import { requireAuth, ensureUserExists } from '../../middleware/auth';

const router = express.Router();

// Apply authentication and user existence middleware to all routes
router.use(requireAuth);
router.use(ensureUserExists);

// Inventory routes
router.get('/', inventoryController.getInventories);
router.post('/', inventoryController.createInventory);
router.get('/:inventoryId', inventoryController.getInventory);
router.put('/:inventoryId', inventoryController.updateInventory);
router.delete('/:inventoryId', inventoryController.deleteInventory);

// Inventory items routes
router.get('/:inventoryId/items', inventoryController.getInventoryItems);
router.post('/:inventoryId/items', inventoryController.addInventoryItem);
router.put('/:inventoryId/items/:itemId', inventoryController.updateInventoryItem);
router.delete('/:inventoryId/items/:itemId', inventoryController.removeInventoryItem);

// Consumption routes
router.post('/consumption', inventoryController.logConsumption);
router.get('/consumption', inventoryController.getConsumptionLogs);

// Analytics routes
router.get('/analytics/inventory-trends', inventoryController.getInventoryTrends);
router.get('/analytics/consumption-patterns', inventoryController.getConsumptionPatterns);

export { router as inventoryRouter };