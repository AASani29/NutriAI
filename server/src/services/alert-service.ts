/**
 * Alert Service
 * Generates and manages food safety alerts
 */

import prisma from '../config/database';
import { calculateSpoilage } from './spoilage-calculator';
import { getCurrentWeather } from './weather-service';
import { LocationName } from './weather-types';
import {
    AlertAction,
    AlertSeverity,
    AlertType,
    determineAction,
    determineAlertType,
    FoodAlert,
    generateAlertMessage,
    generateRecommendation,
    riskLevelToSeverity,
} from './alert-types';

/**
 * Generate alerts for a user's inventory items
 */
export async function generateAlertsForUser(
    userId: string,
    location?: LocationName,
): Promise<FoodAlert[]> {
    try {
        // Get user's inventory items that haven't expired yet (or recently expired)
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
                addedBy: {
                    clerkId: userId,
                },
                removed: false,
                isDeleted: false,
                expiryDate: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Include items expired up to 7 days ago
                },
            },
            include: {
                foodItem: true,
                inventory: true,
            },
        });

        if (inventoryItems.length === 0) {
            return [];
        }

        // Get current weather
        const weather = await getCurrentWeather({ location });

        // Generate alerts for each item
        const alerts: FoodAlert[] = [];

        for (const item of inventoryItems) {
            if (!item.expiryDate) continue;

            const foodName = item.customName || item.foodItem?.name || 'Unknown';

            // Calculate spoilage
            const spoilage = calculateSpoilage(
                foodName,
                item.expiryDate,
                item.addedAt,
                weather,
            );

            // Only create alerts for items with medium risk or higher
            if (spoilage.riskScore < 25) continue;

            const daysUntilExpiry =
                (spoilage.adjustedExpiryDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24);

            // Determine alert properties
            const severity = riskLevelToSeverity(spoilage.riskLevel);
            const alertType = determineAlertType(
                spoilage.riskLevel,
                daysUntilExpiry,
                weather.temperature,
                weather.humidity,
            );
            const action = determineAction(spoilage.riskLevel, daysUntilExpiry);

            // Generate messages
            const message = generateAlertMessage(
                foodName,
                alertType,
                daysUntilExpiry,
                weather.temperature,
                weather.humidity,
            );
            const recommendation = generateRecommendation(
                foodName,
                action,
                spoilage.recommendations,
            );

            // Create alert object
            const alert: FoodAlert = {
                userId,
                inventoryItemId: item.id,
                itemName: foodName,
                severity,
                alertType,
                message,
                recommendation,
                actionRequired: action,
                riskScore: spoilage.riskScore,
                adjustedExpiryDate: spoilage.adjustedExpiryDate,
                weatherConditions: {
                    temperature: weather.temperature,
                    humidity: weather.humidity,
                    location: weather.location,
                },
                isDismissed: false,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Alerts expire after 24 hours
            };

            alerts.push(alert);
        }

        // Sort by risk score (highest first)
        alerts.sort((a, b) => b.riskScore - a.riskScore);

        return alerts;
    } catch (error) {
        console.error('Error generating alerts:', error);
        throw new Error(
            `Failed to generate alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}

/**
 * Generate alerts for a specific inventory
 */
export async function generateAlertsForInventory(
    userId: string,
    inventoryId: string,
    location?: LocationName,
): Promise<FoodAlert[]> {
    try {
        // Get inventory items
        const inventoryItems = await prisma.inventoryItem.findMany({
            where: {
                inventoryId,
                removed: false,
                isDeleted: false,
                expiryDate: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                },
            },
            include: {
                foodItem: true,
            },
        });

        if (inventoryItems.length === 0) {
            return [];
        }

        // Get current weather
        const weather = await getCurrentWeather({ location });

        // Generate alerts (similar logic to generateAlertsForUser)
        const alerts: FoodAlert[] = [];

        for (const item of inventoryItems) {
            if (!item.expiryDate) continue;

            const foodName = item.customName || item.foodItem?.name || 'Unknown';
            const spoilage = calculateSpoilage(
                foodName,
                item.expiryDate,
                item.addedAt,
                weather,
            );

            if (spoilage.riskScore < 25) continue;

            const daysUntilExpiry =
                (spoilage.adjustedExpiryDate.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24);

            const severity = riskLevelToSeverity(spoilage.riskLevel);
            const alertType = determineAlertType(
                spoilage.riskLevel,
                daysUntilExpiry,
                weather.temperature,
                weather.humidity,
            );
            const action = determineAction(spoilage.riskLevel, daysUntilExpiry);

            const message = generateAlertMessage(
                foodName,
                alertType,
                daysUntilExpiry,
                weather.temperature,
                weather.humidity,
            );
            const recommendation = generateRecommendation(
                foodName,
                action,
                spoilage.recommendations,
            );

            alerts.push({
                userId,
                inventoryItemId: item.id,
                itemName: foodName,
                severity,
                alertType,
                message,
                recommendation,
                actionRequired: action,
                riskScore: spoilage.riskScore,
                adjustedExpiryDate: spoilage.adjustedExpiryDate,
                weatherConditions: {
                    temperature: weather.temperature,
                    humidity: weather.humidity,
                    location: weather.location,
                },
                isDismissed: false,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            });
        }

        alerts.sort((a, b) => b.riskScore - a.riskScore);
        return alerts;
    } catch (error) {
        console.error('Error generating inventory alerts:', error);
        throw new Error(
            `Failed to generate inventory alerts: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
    }
}

/**
 * Get alert statistics for a user
 */
export async function getAlertStatistics(
    userId: string,
    location?: LocationName,
): Promise<{
    total: number;
    critical: number;
    urgent: number;
    warning: number;
    info: number;
    topRisks: FoodAlert[];
}> {
    const alerts = await generateAlertsForUser(userId, location);

    const stats = {
        total: alerts.length,
        critical: alerts.filter((a) => a.severity === AlertSeverity.CRITICAL).length,
        urgent: alerts.filter((a) => a.severity === AlertSeverity.URGENT).length,
        warning: alerts.filter((a) => a.severity === AlertSeverity.WARNING).length,
        info: alerts.filter((a) => a.severity === AlertSeverity.INFO).length,
        topRisks: alerts.slice(0, 5), // Top 5 highest risk items
    };

    return stats;
}

/**
 * Check if an item needs immediate attention
 */
export async function checkItemUrgency(
    itemId: string,
    location?: LocationName,
): Promise<{
    isUrgent: boolean;
    alert?: FoodAlert;
}> {
    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId },
            include: { foodItem: true },
        });

        if (!item || !item.expiryDate) {
            return { isUrgent: false };
        }

        const weather = await getCurrentWeather({ location });
        const foodName = item.customName || item.foodItem?.name || 'Unknown';
        const spoilage = calculateSpoilage(
            foodName,
            item.expiryDate,
            item.addedAt,
            weather,
        );

        if (spoilage.riskScore < 50) {
            return { isUrgent: false };
        }

        const daysUntilExpiry =
            (spoilage.adjustedExpiryDate.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24);

        const severity = riskLevelToSeverity(spoilage.riskLevel);
        const alertType = determineAlertType(
            spoilage.riskLevel,
            daysUntilExpiry,
            weather.temperature,
            weather.humidity,
        );
        const action = determineAction(spoilage.riskLevel, daysUntilExpiry);

        const alert: FoodAlert = {
            userId: item.addedById || '',
            inventoryItemId: item.id,
            itemName: foodName,
            severity,
            alertType,
            message: generateAlertMessage(
                foodName,
                alertType,
                daysUntilExpiry,
                weather.temperature,
                weather.humidity,
            ),
            recommendation: generateRecommendation(
                foodName,
                action,
                spoilage.recommendations,
            ),
            actionRequired: action,
            riskScore: spoilage.riskScore,
            adjustedExpiryDate: spoilage.adjustedExpiryDate,
            weatherConditions: {
                temperature: weather.temperature,
                humidity: weather.humidity,
                location: weather.location,
            },
            isDismissed: false,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        };

        return { isUrgent: true, alert };
    } catch (error) {
        console.error('Error checking item urgency:', error);
        return { isUrgent: false };
    }
}
