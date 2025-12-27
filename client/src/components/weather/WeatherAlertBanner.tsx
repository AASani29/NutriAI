/**
 * Weather Alert Banner Component
 * Displays food safety alerts at the top of inventory pages
 */

import React from 'react';
import { X, AlertTriangle, AlertCircle, Info, Zap } from 'lucide-react';

export interface WeatherAlert {
    id?: string;
    severity: 'INFO' | 'WARNING' | 'URGENT' | 'CRITICAL';
    message: string;
    recommendation: string;
    itemName: string;
    actionRequired: string;
    riskScore: number;
}

interface WeatherAlertBannerProps {
    alerts: WeatherAlert[];
    onDismiss?: (alert: WeatherAlert) => void;
}

const WeatherAlertBanner: React.FC<WeatherAlertBannerProps> = ({
    alerts,
    onDismiss,
}) => {
    if (!alerts || alerts.length === 0) {
        return null;
    }

    const getSeverityStyles = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return {
                    bg: 'bg-red-50 border-red-200',
                    text: 'text-red-900',
                    icon: 'text-red-600',
                    badge: 'bg-red-100 text-red-800',
                };
            case 'URGENT':
                return {
                    bg: 'bg-orange-50 border-orange-200',
                    text: 'text-orange-900',
                    icon: 'text-orange-600',
                    badge: 'bg-orange-100 text-orange-800',
                };
            case 'WARNING':
                return {
                    bg: 'bg-yellow-50 border-yellow-200',
                    text: 'text-yellow-900',
                    icon: 'text-yellow-600',
                    badge: 'bg-yellow-100 text-yellow-800',
                };
            case 'INFO':
            default:
                return {
                    bg: 'bg-blue-50 border-blue-200',
                    text: 'text-blue-900',
                    icon: 'text-blue-600',
                    badge: 'bg-blue-100 text-blue-800',
                };
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'CRITICAL':
                return <AlertTriangle className="w-5 h-5" />;
            case 'URGENT':
                return <Zap className="w-5 h-5" />;
            case 'WARNING':
                return <AlertCircle className="w-5 h-5" />;
            case 'INFO':
            default:
                return <Info className="w-5 h-5" />;
        }
    };

    // Show only the top 3 most critical alerts
    const displayAlerts = alerts.slice(0, 3);

    return (
        <div className="space-y-3 mb-6">
            {displayAlerts.map((alert, index) => {
                const styles = getSeverityStyles(alert.severity);
                const icon = getSeverityIcon(alert.severity);

                return (
                    <div
                        key={alert.id || index}
                        className={`${styles.bg} border-l-4 ${styles.text} p-4 rounded-lg shadow-sm`}
                        role="alert"
                    >
                        <div className="flex items-start">
                            <div className={`${styles.icon} flex-shrink-0 mt-0.5`}>
                                {icon}
                            </div>
                            <div className="ml-3 flex-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-semibold">
                                            {alert.severity} Alert
                                        </h3>
                                        <span className={`${styles.badge} text-xs px-2 py-0.5 rounded-full font-medium`}>
                                            Risk: {alert.riskScore}%
                                        </span>
                                    </div>
                                    {onDismiss && (
                                        <button
                                            onClick={() => onDismiss(alert)}
                                            className={`${styles.icon} hover:opacity-70 transition-opacity`}
                                            aria-label="Dismiss alert"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="mt-2 text-sm font-medium">{alert.message}</p>
                                {alert.recommendation && (
                                    <p className="mt-2 text-sm opacity-90">
                                        💡 {alert.recommendation}
                                    </p>
                                )}
                                {alert.actionRequired && (
                                    <div className="mt-3">
                                        <span className={`${styles.badge} text-xs px-3 py-1 rounded-md font-semibold inline-block`}>
                                            Action: {alert.actionRequired.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            {alerts.length > 3 && (
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        +{alerts.length - 3} more alert{alerts.length - 3 > 1 ? 's' : ''}
                    </p>
                </div>
            )}
        </div>
    );
};

export default WeatherAlertBanner;
