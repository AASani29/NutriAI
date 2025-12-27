/**
 * Weather Router
 * Routes for weather and alert endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
    getCurrentWeatherHandler,
    getAlertsHandler,
    getAlertStatisticsHandler,
    checkItemUrgencyHandler,
    getLocationsHandler,
    getCacheStatsHandler,
} from './weather-controller';

const router = Router();

// Public routes
router.get('/current', getCurrentWeatherHandler);
router.get('/locations', getLocationsHandler);

// Protected routes (require authentication)
router.get('/alerts', requireAuth, getAlertsHandler);
router.get('/alerts/statistics', requireAuth, getAlertStatisticsHandler);
router.get('/alerts/item/:itemId', requireAuth, checkItemUrgencyHandler);

// Debug/monitoring routes
router.get('/cache/stats', getCacheStatsHandler);

export default router;
