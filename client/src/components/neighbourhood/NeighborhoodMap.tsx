import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FoodListing } from './types';
import { Link } from 'react-router-dom';

// This is the standard way to fix the missing icon issue in some build environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface NeighborhoodMapProps {
    listings: FoodListing[];
    userLat?: number;
    userLng?: number;
    height?: string;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({
    listings,
    userLat,
    userLng,
    height = '500px'
}) => {
    // Filter listings that have coordinates
    const mapListings = listings.filter(l => l.latitude && l.longitude);

    // Haversine formula to calculate distance in km
    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        if (d < 1) return (d * 1000).toFixed(0) + 'm';
        return d.toFixed(1) + 'km';
    };

    // Dhaka as fallback center
    const defaultCenter: [number, number] = userLat && userLng
        ? [userLat, userLng]
        : [23.8103, 90.4125];

    return (
        <div style={{ height, width: '100%', borderRadius: '0.75rem', overflow: 'hidden' }} className="border border-gray-200 shadow-md">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', minHeight: '300px', backgroundColor: '#f3f4f6' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Marker if available */}
                {userLat && userLng && (
                    <Marker
                        position={[userLat, userLng]}
                        icon={L.divIcon({
                            className: 'custom-div-icon',
                            html: `<div style="background-color: #4F46E5; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        })}
                    >
                        <Popup>
                            <div className="p-1 font-bold text-xs">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {mapListings.map(listing => {
                    const distance = (userLat && userLng)
                        ? getDistance(userLat, userLng, listing.latitude!, listing.longitude!)
                        : null;

                    return (
                        <Marker
                            key={listing.id}
                            position={[listing.latitude!, listing.longitude!]}
                        >
                            <Popup>
                                <div className="p-1 min-w-[150px]">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 leading-tight flex-1">{listing.title}</h3>
                                        {distance && (
                                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold ml-2 shrink-0">
                                                {distance} away
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1 line-clamp-2">{listing.description}</p>
                                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                                        <span className="text-xs font-semibold text-indigo-600">
                                            {listing.quantity} {listing.unit}
                                        </span>
                                        <Link
                                            to={`/neighbourhood/listings/${listing.id}`}
                                            className="text-[10px] bg-black text-white px-2 py-1 rounded hover:bg-primary transition-all font-bold uppercase tracking-widest"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
