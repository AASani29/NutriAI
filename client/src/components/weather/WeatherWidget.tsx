/**
 * Weather Widget Component
 * Displays current weather conditions and their impact on food storage
 */

import React, { useEffect, useState } from 'react';
import { Cloud, Droplets, ThermometerSun, AlertTriangle } from 'lucide-react';

interface WeatherData {
    location: string;
    temperature: number;
    humidity: number;
    weatherDescription: string;
    fetchedAt: string;
}

interface WeatherWidgetProps {
    location?: string;
    className?: string;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
    location = 'DHAKA',
    className = '',
}) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchWeather();
    }, [location]);

    const fetchWeather = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
            const response = await fetch(
                `${apiUrl}/weather/current?location=${location}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const result = await response.json();
            setWeather(result.data);
        } catch (err) {
            console.error('Error fetching weather:', err);
            setError('Unable to load weather data');
        } finally {
            setLoading(false);
        }
    };

    const getWeatherImpact = (temp: number, humidity: number) => {
        const isHot = temp > 30;
        const isVeryHot = temp > 35;
        const isHumid = humidity > 70;
        const isVeryHumid = humidity > 85;

        if (isVeryHot && isVeryHumid) {
            return {
                level: 'critical',
                message: 'Extreme conditions - food spoils very quickly',
                color: 'text-red-600',
                bgColor: 'bg-red-50',
            };
        } else if (isVeryHot || (isHot && isHumid)) {
            return {
                level: 'high',
                message: 'High spoilage risk - use food quickly',
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
            };
        } else if (isHot || isVeryHumid) {
            return {
                level: 'moderate',
                message: 'Moderate spoilage risk',
                color: 'text-yellow-600',
                bgColor: 'bg-yellow-50',
            };
        } else {
            return {
                level: 'low',
                message: 'Good conditions for food storage',
                color: 'text-green-600',
                bgColor: 'bg-green-50',
            };
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return (
            <div className={`bg-red-50 rounded-lg p-4 ${className}`}>
                <p className="text-sm text-red-600">{error || 'Weather data unavailable'}</p>
            </div>
        );
    }

    const impact = getWeatherImpact(weather.temperature, weather.humidity);

    return (
        <div className={`bg-white rounded-lg shadow-sm p-4 ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                        <Cloud className="w-5 h-5 text-gray-600" />
                        <h3 className="text-sm font-semibold text-gray-900">
                            Current Weather - {weather.location}
                        </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2">
                            <ThermometerSun className="w-4 h-4 text-orange-500" />
                            <div>
                                <p className="text-xs text-gray-600">Temperature</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {weather.temperature.toFixed(1)}°C
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Droplets className="w-4 h-4 text-blue-500" />
                            <div>
                                <p className="text-xs text-gray-600">Humidity</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {weather.humidity.toFixed(0)}%
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className={`${impact.bgColor} rounded-md p-3 border-l-4 ${impact.color.replace('text-', 'border-')}`}>
                        <div className="flex items-start gap-2">
                            <AlertTriangle className={`w-4 h-4 ${impact.color} flex-shrink-0 mt-0.5`} />
                            <div>
                                <p className={`text-xs font-semibold ${impact.color}`}>
                                    Food Storage Impact
                                </p>
                                <p className="text-xs text-gray-700 mt-1">{impact.message}</p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                        {weather.weatherDescription}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
