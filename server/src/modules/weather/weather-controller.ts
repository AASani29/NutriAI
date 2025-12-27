/**
 * Weather Controller
 * Handles weather and alert-related API requests
 */

import { Request, Response } from 'express';
import { getCurrentWeather, getCacheStats } from '../../services/weather-service';
import {
    generateAlertsForUser,
    generateAlertsForInventory,
    getAlertStatistics,
    checkItemUrgency,
} from '../../services/alert-service';
import { LocationName, BANGLADESH_LOCATIONS } from '../../services/weather-types';

/**
 * GET /api/weather/current
 * Get current weather for a location
 */
export async function getCurrentWeatherHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const location = (req.query.location as LocationName) || 'DHAKA';
        const forceRefresh = req.query.refresh === 'true';

        // Validate location
        if (location && !BANGLADESH_LOCATIONS[location as LocationName]) {
            res.status(400).json({
                error: 'Invalid location',
                validLocations: Object.keys(BANGLADESH_LOCATIONS),
            });
            return;
        }

        const weather = await getCurrentWeather({
            location: location as LocationName,
            forceRefresh,
        });

        res.json({
            success: true,
            data: weather,
        });
    } catch (error) {
        console.error('Error fetching weather:', error);
        res.status(500).json({
            error: 'Failed to fetch weather data',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * GET /api/weather/alerts
 * Get food safety alerts for the authenticated user
 */
export async function getAlertsHandler(req: Request, res: Response): Promise<void> {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const location = (req.query.location as LocationName) || undefined;
        const inventoryId = req.query.inventoryId as string | undefined;

        let alerts;
        if (inventoryId) {
            alerts = await generateAlertsForInventory(userId, inventoryId, location);
        } else {
            alerts = await generateAlertsForUser(userId, location);
        }

        res.json({
            success: true,
            count: alerts.length,
            data: alerts,
        });
    } catch (error) {
        console.error('Error generating alerts:', error);
        res.status(500).json({
            error: 'Failed to generate alerts',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * GET /api/weather/alerts/statistics
 * Get alert statistics for the authenticated user
 */
export async function getAlertStatisticsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const location = (req.query.location as LocationName) || undefined;
        const stats = await getAlertStatistics(userId, location);

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching alert statistics:', error);
        res.status(500).json({
            error: 'Failed to fetch alert statistics',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * GET /api/weather/alerts/item/:itemId
 * Check urgency for a specific inventory item
 */
export async function checkItemUrgencyHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const userId = req.auth?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        const itemId = req.params.itemId;
        const location = (req.query.location as LocationName) || undefined;

        const result = await checkItemUrgency(itemId, location);

        res.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error checking item urgency:', error);
        res.status(500).json({
            error: 'Failed to check item urgency',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * GET /api/weather/locations
 * Get list of supported locations
 */
export async function getLocationsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const locations = Object.entries(BANGLADESH_LOCATIONS).map(([key, value]) => ({
            id: key,
            ...value,
        }));

        res.json({
            success: true,
            data: locations,
        });
    } catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({
            error: 'Failed to fetch locations',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * GET /api/weather/cache/stats
 * Get weather cache statistics (for debugging/monitoring)
 */
export async function getCacheStatsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const stats = getCacheStats();

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        console.error('Error fetching cache stats:', error);
        res.status(500).json({
            error: 'Failed to fetch cache stats',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}
