/**
 * Weather Service (Frontend)
 * API client for weather and alert endpoints
 */

import { authFetch } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface WeatherData {
    location: string;
    latitude: number;
    longitude: number;
    temperature: number;
    humidity: number;
    weatherCode: number;
    weatherDescription: string;
    fetchedAt: string;
    expiresAt: string;
}

export interface FoodAlert {
    id?: string;
    userId: string;
    inventoryItemId: string;
    itemName: string;
    severity: 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL';
    alertType: string;
    message: string;
    recommendation: string;
    actionRequired: string;
    riskScore: number;
    adjustedExpiryDate: string;
    weatherConditions: {
        temperature: number;
        humidity: number;
        location: string;
    };
    isDismissed: boolean;
    createdAt: string;
    expiresAt: string;
}

export interface AlertStatistics {
    total: number;
    critical: number;
    urgent: number;
    warning: number;
    info: number;
    topRisks: FoodAlert[];
}

/**
 * Get current weather for a location
 */
export async function getCurrentWeather(
    location: string = 'DHAKA'
): Promise<WeatherData> {
    const response = await fetch(`${API_URL}/weather/current?location=${location}`);

    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Get food safety alerts for the authenticated user
 */
export async function getAlerts(
    inventoryId?: string,
    location?: string
): Promise<FoodAlert[]> {
    let url = `${API_URL}/weather/alerts`;
    const params = new URLSearchParams();

    if (inventoryId) params.append('inventoryId', inventoryId);
    if (location) params.append('location', location);

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const response = await authFetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch alerts');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Get alert statistics
 */
export async function getAlertStatistics(
    location?: string
): Promise<AlertStatistics> {
    let url = `${API_URL}/weather/alerts/statistics`;

    if (location) {
        url += `?location=${location}`;
    }

    const response = await authFetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch alert statistics');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Check urgency for a specific item
 */
export async function checkItemUrgency(
    itemId: string,
    location?: string
): Promise<{ isUrgent: boolean; alert?: FoodAlert }> {
    let url = `${API_URL}/weather/alerts/item/${itemId}`;

    if (location) {
        url += `?location=${location}`;
    }

    const response = await authFetch(url);

    if (!response.ok) {
        throw new Error('Failed to check item urgency');
    }

    const result = await response.json();
    return result.data;
}

/**
 * Get list of supported locations
 */
export async function getLocations(): Promise<
    Array<{ id: string; name: string; latitude: number; longitude: number }>
> {
    const response = await fetch(`${API_URL}/weather/locations`);

    if (!response.ok) {
        throw new Error('Failed to fetch locations');
    }

    const result = await response.json();
    return result.data;
}
