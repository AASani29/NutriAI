/**
 * Weather Service Types
 * Type definitions for weather data and API responses
 */

// Bangladesh major cities with coordinates
export const BANGLADESH_LOCATIONS = {
  DHAKA: {
    name: 'Dhaka',
    latitude: 23.8103,
    longitude: 90.4125,
  },
  CHITTAGONG: {
    name: 'Chittagong',
    latitude: 22.3569,
    longitude: 91.7832,
  },
  KHULNA: {
    name: 'Khulna',
    latitude: 22.8456,
    longitude: 89.5403,
  },
  RAJSHAHI: {
    name: 'Rajshahi',
    latitude: 24.3745,
    longitude: 88.6042,
  },
  SYLHET: {
    name: 'Sylhet',
    latitude: 24.8949,
    longitude: 91.8687,
  },
} as const;

export type LocationName = keyof typeof BANGLADESH_LOCATIONS;

export interface LocationCoordinates {
  name: string;
  latitude: number;
  longitude: number;
}

// Weather data structure
export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  temperature: number; // Celsius
  humidity: number; // Percentage (0-100)
  weatherCode: number; // WMO weather code
  weatherDescription: string;
  fetchedAt: Date;
  expiresAt: Date;
}

// Open-Meteo API response structure
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    weather_code: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
  };
}

// WMO Weather interpretation codes
export const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Foggy',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  71: 'Slight snow',
  73: 'Moderate snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail',
};

// Weather service errors
export class WeatherServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
  ) {
    super(message);
    this.name = 'WeatherServiceError';
  }
}

// Weather fetch options
export interface WeatherFetchOptions {
  location?: LocationName | LocationCoordinates;
  forceRefresh?: boolean; // Skip cache and fetch fresh data
}

// Weather cache entry
export interface WeatherCacheEntry {
  data: WeatherData;
  expiresAt: Date;
}
