/**
 * Alert Types and Templates
 * Defines alert structures and message templates
 */

import { RiskLevel } from './spoilage-calculator';

// Alert severity levels
export enum AlertSeverity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    URGENT = 'URGENT',
    CRITICAL = 'CRITICAL',
}

// Alert types
export enum AlertType {
    EXPIRING_SOON = 'EXPIRING_SOON',
    WEATHER_RISK = 'WEATHER_RISK',
    ALREADY_EXPIRED = 'ALREADY_EXPIRED',
    HIGH_TEMPERATURE = 'HIGH_TEMPERATURE',
    HIGH_HUMIDITY = 'HIGH_HUMIDITY',
}

// Action types
export enum AlertAction {
    COOK_TODAY = 'COOK_TODAY',
    USE_WITHIN_24H = 'USE_WITHIN_24H',
    REFRIGERATE = 'REFRIGERATE',
    FREEZE = 'FREEZE',
    DISCARD = 'DISCARD',
    CHECK_FRESHNESS = 'CHECK_FRESHNESS',
    PLAN_MEAL = 'PLAN_MEAL',
}

// Alert data structure
export interface FoodAlert {
    id?: string;
    userId: string;
    inventoryItemId: string;
    itemName: string;
    severity: AlertSeverity;
    alertType: AlertType;
    message: string;
    recommendation: string;
    actionRequired: AlertAction;
    riskScore: number;
    adjustedExpiryDate: Date;
    weatherConditions: {
        temperature: number;
        humidity: number;
        location: string;
    };
    isDismissed: boolean;
    createdAt: Date;
    expiresAt: Date;
}

/**
 * Map risk level to alert severity
 */
export function riskLevelToSeverity(riskLevel: RiskLevel): AlertSeverity {
    switch (riskLevel) {
        case RiskLevel.CRITICAL:
            return AlertSeverity.CRITICAL;
        case RiskLevel.HIGH:
            return AlertSeverity.URGENT;
        case RiskLevel.MEDIUM:
            return AlertSeverity.WARNING;
        case RiskLevel.LOW:
        default:
            return AlertSeverity.INFO;
    }
}

/**
 * Determine alert type based on conditions
 */
export function determineAlertType(
    riskLevel: RiskLevel,
    daysUntilExpiry: number,
    temperature: number,
    humidity: number,
): AlertType {
    if (daysUntilExpiry < 0) {
        return AlertType.ALREADY_EXPIRED;
    }

    if (temperature > 35 && humidity > 80) {
        return AlertType.WEATHER_RISK;
    }

    if (temperature > 35) {
        return AlertType.HIGH_TEMPERATURE;
    }

    if (humidity > 85) {
        return AlertType.HIGH_HUMIDITY;
    }

    if (riskLevel >= RiskLevel.HIGH) {
        return AlertType.EXPIRING_SOON;
    }

    return AlertType.WEATHER_RISK;
}

/**
 * Determine required action
 */
export function determineAction(
    riskLevel: RiskLevel,
    daysUntilExpiry: number,
): AlertAction {
    if (daysUntilExpiry < 0) {
        return AlertAction.DISCARD;
    }

    if (riskLevel === RiskLevel.CRITICAL) {
        return AlertAction.COOK_TODAY;
    }

    if (riskLevel === RiskLevel.HIGH) {
        return AlertAction.USE_WITHIN_24H;
    }

    if (riskLevel === RiskLevel.MEDIUM) {
        return AlertAction.PLAN_MEAL;
    }

    return AlertAction.CHECK_FRESHNESS;
}

/**
 * Generate alert message
 */
export function generateAlertMessage(
    itemName: string,
    alertType: AlertType,
    daysUntilExpiry: number,
    temperature: number,
    humidity: number,
): string {
    const daysText =
        daysUntilExpiry < 1
            ? 'today'
            : daysUntilExpiry < 2
                ? 'tomorrow'
                : `in ${Math.round(daysUntilExpiry)} days`;

    switch (alertType) {
        case AlertType.ALREADY_EXPIRED:
            return `⚠️ ${itemName} has expired - discard immediately for safety`;

        case AlertType.WEATHER_RISK:
            return `🌡️ High Heat Alert! ${itemName} will spoil ${daysText} due to extreme weather (${temperature}°C, ${humidity}% humidity)`;

        case AlertType.HIGH_TEMPERATURE:
            return `🔥 Temperature Alert! ${itemName} at risk due to high heat (${temperature}°C) - will spoil ${daysText}`;

        case AlertType.HIGH_HUMIDITY:
            return `💧 Humidity Alert! ${itemName} at risk due to high moisture (${humidity}%) - will spoil ${daysText}`;

        case AlertType.EXPIRING_SOON:
            return `⏰ ${itemName} will expire ${daysText} - use soon to avoid waste`;

        default:
            return `${itemName} requires attention - expires ${daysText}`;
    }
}

/**
 * Generate recommendation text
 */
export function generateRecommendation(
    itemName: string,
    action: AlertAction,
    recommendations: string[],
): string {
    const baseRecommendation = recommendations[0] || '';

    switch (action) {
        case AlertAction.DISCARD:
            return `For your safety, please discard ${itemName} immediately. Do not consume expired food.`;

        case AlertAction.COOK_TODAY:
            return `Cook ${itemName} today before it spoils. ${baseRecommendation}`;

        case AlertAction.USE_WITHIN_24H:
            return `Use ${itemName} within the next 24 hours. ${baseRecommendation}`;

        case AlertAction.REFRIGERATE:
            return `Refrigerate ${itemName} immediately to extend shelf life. ${baseRecommendation}`;

        case AlertAction.FREEZE:
            return `Consider freezing ${itemName} if you won't use it soon. ${baseRecommendation}`;

        case AlertAction.PLAN_MEAL:
            return `Plan a meal with ${itemName} in the next 2-3 days. ${baseRecommendation}`;

        case AlertAction.CHECK_FRESHNESS:
            return `Check ${itemName} for freshness daily. ${baseRecommendation}`;

        default:
            return baseRecommendation;
    }
}

/**
 * Get alert icon/emoji
 */
export function getAlertIcon(severity: AlertSeverity): string {
    switch (severity) {
        case AlertSeverity.CRITICAL:
            return '🚨';
        case AlertSeverity.URGENT:
            return '⚡';
        case AlertSeverity.WARNING:
            return '⚠️';
        case AlertSeverity.INFO:
        default:
            return 'ℹ️';
    }
}

/**
 * Get alert color (for UI)
 */
export function getAlertColor(severity: AlertSeverity): string {
    switch (severity) {
        case AlertSeverity.CRITICAL:
            return 'red';
        case AlertSeverity.URGENT:
            return 'orange';
        case AlertSeverity.WARNING:
            return 'yellow';
        case AlertSeverity.INFO:
        default:
            return 'blue';
    }
}
