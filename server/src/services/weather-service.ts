/**
 * Weather Service
 * Fetches and caches weather data from Open-Meteo API
 */

import {
    BANGLADESH_LOCATIONS,
    LocationCoordinates,
    LocationName,
    OpenMeteoResponse,
    WEATHER_CODES,
    WeatherCacheEntry,
    WeatherData,
    WeatherFetchOptions,
    WeatherServiceError,
} from './weather-types';

// In-memory cache for weather data
const weatherCache = new Map<string, WeatherCacheEntry>();

// Configuration
const WEATHER_API_BASE_URL =
    process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1';
const CACHE_DURATION_MINUTES = parseInt(
    process.env.WEATHER_CACHE_DURATION_MINUTES || '30',
    10,
);

/**
 * Get cache key for a location
 */
function getCacheKey(latitude: number, longitude: number): string {
    return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

/**
 * Check if cached data is still valid
 */
function isCacheValid(entry: WeatherCacheEntry): boolean {
    return new Date() < entry.expiresAt;
}

/**
 * Get weather description from WMO code
 */
function getWeatherDescription(code: number): string {
    return WEATHER_CODES[code] || 'Unknown';
}

/**
 * Resolve location to coordinates
 */
function resolveLocation(
    location?: LocationName | LocationCoordinates,
): LocationCoordinates {
    if (!location) {
        // Default to Dhaka
        return BANGLADESH_LOCATIONS.DHAKA;
    }

    if (typeof location === 'string') {
        const coords = BANGLADESH_LOCATIONS[location];
        if (!coords) {
            throw new WeatherServiceError(
                `Unknown location: ${location}`,
                'INVALID_LOCATION',
                400,
            );
        }
        return coords;
    }

    return location;
}

/**
 * Fetch weather data from Open-Meteo API
 */
async function fetchWeatherFromAPI(
    latitude: number,
    longitude: number,
): Promise<OpenMeteoResponse> {
    const url = `${WEATHER_API_BASE_URL}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=Asia/Dhaka`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new WeatherServiceError(
                `Weather API returned status ${response.status}`,
                'API_ERROR',
                response.status,
            );
        }

        const data = (await response.json()) as OpenMeteoResponse;
        return data;
    } catch (error) {
        if (error instanceof WeatherServiceError) {
            throw error;
        }

        throw new WeatherServiceError(
            `Failed to fetch weather data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'FETCH_ERROR',
            500,
        );
    }
}

/**
 * Parse Open-Meteo response into WeatherData
 */
function parseWeatherResponse(
    response: OpenMeteoResponse,
    locationName: string,
): WeatherData {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION_MINUTES * 60 * 1000);

    return {
        location: locationName,
        latitude: response.latitude,
        longitude: response.longitude,
        temperature: response.current.temperature_2m,
        humidity: response.current.relative_humidity_2m,
        weatherCode: response.current.weather_code,
        weatherDescription: getWeatherDescription(response.current.weather_code),
        fetchedAt: now,
        expiresAt,
    };
}

/**
 * Get current weather data for a location
 * Uses cache when available and valid
 */
export async function getCurrentWeather(
    options: WeatherFetchOptions = {},
): Promise<WeatherData> {
    const location = resolveLocation(options.location);
    const cacheKey = getCacheKey(location.latitude, location.longitude);

    // Check cache first (unless force refresh)
    if (!options.forceRefresh) {
        const cached = weatherCache.get(cacheKey);
        if (cached && isCacheValid(cached)) {
            return cached.data;
        }
    }

    // Fetch fresh data from API
    try {
        const response = await fetchWeatherFromAPI(
            location.latitude,
            location.longitude,
        );
        const weatherData = parseWeatherResponse(response, location.name);

        // Update cache
        weatherCache.set(cacheKey, {
            data: weatherData,
            expiresAt: weatherData.expiresAt,
        });

        return weatherData;
    } catch (error) {
        // If API fails and we have cached data (even expired), use it
        const cached = weatherCache.get(cacheKey);
        if (cached) {
            console.warn(
                'Weather API failed, using expired cache:',
                error instanceof Error ? error.message : error,
            );
            return cached.data;
        }

        // No cache available, throw error
        throw error;
    }
}

/**
 * Get weather data for multiple locations
 */
export async function getWeatherForLocations(
    locations: (LocationName | LocationCoordinates)[],
): Promise<WeatherData[]> {
    const promises = locations.map((loc) => getCurrentWeather({ location: loc }));
    return Promise.all(promises);
}

/**
 * Clear weather cache (useful for testing)
 */
export function clearWeatherCache(): void {
    weatherCache.clear();
}

/**
 * Get cache statistics (useful for monitoring)
 */
export function getCacheStats(): {
    size: number;
    entries: Array<{ location: string; expiresAt: Date }>;
} {
    const entries = Array.from(weatherCache.entries()).map(([key, entry]) => ({
        location: entry.data.location,
        expiresAt: entry.expiresAt,
    }));

    return {
        size: weatherCache.size,
        entries,
    };
}
