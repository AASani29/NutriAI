/**
 * Spoilage Calculator
 * Calculates adjusted expiration dates based on weather conditions
 */

import { getFoodCategory } from '../config/food-categories';
import { WeatherData } from './weather-types';

// Risk levels for food items
export enum RiskLevel {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL',
}

// Spoilage calculation result
export interface SpoilageCalculation {
    originalExpiryDate: Date;
    adjustedExpiryDate: Date;
    daysReduced: number;
    spoilageRate: number; // Multiplier (1.0 = normal, >1.0 = faster spoilage)
    riskLevel: RiskLevel;
    riskScore: number; // 0-100
    weatherImpact: string; // Human-readable description
    recommendations: string[];
}

// Optimal storage conditions (baseline)
const OPTIMAL_TEMPERATURE = 20; // Celsius
const OPTIMAL_HUMIDITY = 50; // Percentage

/**
 * Calculate spoilage rate based on weather conditions
 * Higher rate = faster spoilage
 */
function calculateSpoilageRate(
    weather: WeatherData,
    temperatureSensitivity: number,
    humiditySensitivity: number,
): number {
    // Temperature impact (increases exponentially above optimal)
    const tempDiff = weather.temperature - OPTIMAL_TEMPERATURE;
    const tempImpact = tempDiff > 0 ? tempDiff * 0.08 : tempDiff * 0.02; // Faster spoilage in heat

    // Humidity impact (linear)
    const humidityDiff = weather.humidity - OPTIMAL_HUMIDITY;
    const humidityImpact = humidityDiff * 0.004;

    // Apply sensitivity factors
    const weightedTempImpact = tempImpact * temperatureSensitivity;
    const weightedHumidityImpact = humidityImpact * humiditySensitivity;

    // Base rate is 1.0 (normal spoilage)
    const spoilageRate = 1.0 + weightedTempImpact + weightedHumidityImpact;

    // Ensure minimum rate of 0.5 (can't slow down spoilage too much)
    return Math.max(0.5, spoilageRate);
}

/**
 * Calculate adjusted expiration date
 */
function calculateAdjustedExpiry(
    originalExpiry: Date,
    addedDate: Date,
    spoilageRate: number,
): Date {
    const totalShelfLifeMs = originalExpiry.getTime() - addedDate.getTime();
    const adjustedShelfLifeMs = totalShelfLifeMs / spoilageRate;

    return new Date(addedDate.getTime() + adjustedShelfLifeMs);
}

/**
 * Calculate risk score (0-100)
 * Based on days until expiry and spoilage rate
 */
function calculateRiskScore(
    adjustedExpiry: Date,
    spoilageRate: number,
): number {
    const now = new Date();
    const daysUntilExpiry =
        (adjustedExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    let score = 0;

    // Days until expiry component (0-50 points)
    if (daysUntilExpiry < 0) {
        score += 50; // Already expired
    } else if (daysUntilExpiry < 1) {
        score += 45; // Less than 1 day
    } else if (daysUntilExpiry < 2) {
        score += 35; // 1-2 days
    } else if (daysUntilExpiry < 3) {
        score += 25; // 2-3 days
    } else if (daysUntilExpiry < 7) {
        score += 15; // 3-7 days
    } else {
        score += 5; // More than 7 days
    }

    // Spoilage rate component (0-50 points)
    if (spoilageRate > 2.0) {
        score += 50; // Extremely fast spoilage
    } else if (spoilageRate > 1.5) {
        score += 40; // Very fast spoilage
    } else if (spoilageRate > 1.2) {
        score += 25; // Fast spoilage
    } else if (spoilageRate > 1.0) {
        score += 10; // Slightly faster
    } else {
        score += 0; // Normal or slower
    }

    return Math.min(100, Math.max(0, score));
}

/**
 * Determine risk level from risk score
 */
function getRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 75) return RiskLevel.CRITICAL;
    if (riskScore >= 50) return RiskLevel.HIGH;
    if (riskScore >= 25) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
}

/**
 * Generate weather impact description
 */
function getWeatherImpact(weather: WeatherData, spoilageRate: number): string {
    const isHot = weather.temperature > 30;
    const isVeryHot = weather.temperature > 35;
    const isHumid = weather.humidity > 70;
    const isVeryHumid = weather.humidity > 85;

    if (isVeryHot && isVeryHumid) {
        return `Extreme heat (${weather.temperature}°C) and humidity (${weather.humidity}%) - food spoils ${Math.round((spoilageRate - 1) * 100)}% faster`;
    } else if (isVeryHot) {
        return `Very high temperature (${weather.temperature}°C) - accelerated spoilage`;
    } else if (isHot && isHumid) {
        return `Hot and humid conditions (${weather.temperature}°C, ${weather.humidity}%) - faster spoilage`;
    } else if (isHot) {
        return `High temperature (${weather.temperature}°C) - moderate spoilage risk`;
    } else if (isVeryHumid) {
        return `Very high humidity (${weather.humidity}%) - moisture-related spoilage risk`;
    } else if (spoilageRate > 1.2) {
        return `Current weather conditions increase spoilage rate by ${Math.round((spoilageRate - 1) * 100)}%`;
    } else {
        return 'Weather conditions are favorable for food storage';
    }
}

/**
 * Generate recommendations based on risk level and food category
 */
function generateRecommendations(
    riskLevel: RiskLevel,
    categoryName: string,
    daysUntilExpiry: number,
    storageRecommendations: string[],
): string[] {
    const recommendations: string[] = [];

    if (riskLevel === RiskLevel.CRITICAL) {
        if (daysUntilExpiry < 0) {
            recommendations.push('⚠️ EXPIRED - Discard immediately for safety');
        } else {
            recommendations.push('🔥 URGENT: Cook or consume TODAY');
            recommendations.push('Do not wait - high risk of spoilage');
        }
    } else if (riskLevel === RiskLevel.HIGH) {
        recommendations.push('⚡ Use within 24 hours');
        recommendations.push('Cook tonight or refrigerate immediately');
    } else if (riskLevel === RiskLevel.MEDIUM) {
        recommendations.push('Plan to use within 2-3 days');
        recommendations.push('Check daily for freshness');
    }

    // Add category-specific recommendations
    if (riskLevel >= RiskLevel.MEDIUM) {
        recommendations.push(...storageRecommendations.slice(0, 2));
    }

    return recommendations;
}

/**
 * Calculate spoilage for a food item
 */
export function calculateSpoilage(
    foodName: string,
    expiryDate: Date,
    addedDate: Date,
    weather: WeatherData,
): SpoilageCalculation {
    const category = getFoodCategory(foodName);

    // Calculate spoilage rate
    const spoilageRate = calculateSpoilageRate(
        weather,
        category.temperatureSensitivity,
        category.humiditySensitivity,
    );

    // Calculate adjusted expiry
    const adjustedExpiryDate = calculateAdjustedExpiry(
        expiryDate,
        addedDate,
        spoilageRate,
    );

    // Calculate days reduced
    const daysReduced =
        (expiryDate.getTime() - adjustedExpiryDate.getTime()) /
        (1000 * 60 * 60 * 24);

    // Calculate risk
    const riskScore = calculateRiskScore(adjustedExpiryDate, spoilageRate);
    const riskLevel = getRiskLevel(riskScore);

    // Generate descriptions
    const weatherImpact = getWeatherImpact(weather, spoilageRate);
    const daysUntilExpiry =
        (adjustedExpiryDate.getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24);
    const recommendations = generateRecommendations(
        riskLevel,
        category.name,
        daysUntilExpiry,
        category.storageRecommendations,
    );

    return {
        originalExpiryDate: expiryDate,
        adjustedExpiryDate,
        daysReduced,
        spoilageRate,
        riskLevel,
        riskScore,
        weatherImpact,
        recommendations,
    };
}

/**
 * Batch calculate spoilage for multiple items
 */
export function calculateBatchSpoilage(
    items: Array<{
        foodName: string;
        expiryDate: Date;
        addedDate: Date;
    }>,
    weather: WeatherData,
): SpoilageCalculation[] {
    return items.map((item) =>
        calculateSpoilage(item.foodName, item.expiryDate, item.addedDate, weather),
    );
}
