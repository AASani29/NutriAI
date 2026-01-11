import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// This is the standard way to fix the missing icon issue in some build environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
    onAddressSelect?: (address: string) => void;
    height?: string;
}

const LocationMarker = ({ position, setPosition, onLocationSelect, onAddressSelect }: {
    position: [number, number] | null,
    setPosition: (pos: [number, number]) => void,
    onLocationSelect: (lat: number, lng: number) => void,
    onAddressSelect?: (address: string) => void
}) => {
    const fetchAddress = async (lat: number, lng: number) => {
        if (!onAddressSelect) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                headers: {
                    'User-Agent': 'LocaNutri-Smart-App'
                }
            });
            const data = await response.json();
            if (data.display_name) {
                onAddressSelect(data.display_name);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        }
    };

    const map = useMapEvents({
        click(e) {
            const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
            setPosition(newPos);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
            fetchAddress(e.latlng.lat, e.latlng.lng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
};

// Component to handle map center updates when initial coordinates change
const ChangeView = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export const MapPicker: React.FC<MapPickerProps> = ({
    initialLat,
    initialLng,
    onLocationSelect,
    onAddressSelect,
    height = '300px'
}) => {
    const [position, setPosition] = useState<[number, number] | null>(
        initialLat && initialLng ? [initialLat, initialLng] : null
    );

    // Default to a reasonable center (e.g., Dhaka, Bangladesh if nothing provided)
    const defaultCenter: [number, number] = [23.8103, 90.4125];
    const center = position || defaultCenter;

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                    onLocationSelect(latitude, longitude);

                    // Fetch address for GPS location too
                    if (onAddressSelect) {
                        try {
                            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, {
                                headers: {
                                    'User-Agent': 'LocaNutri-Smart-App'
                                }
                            });
                            const data = await response.json();
                            if (data.display_name) {
                                onAddressSelect(data.display_name);
                            }
                        } catch (error) {
                            console.error("Geocoding error:", error);
                        }
                    }
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    alert("Could not get your current location. Please select it manually on the map.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 font-bold uppercase tracking-wider text-[10px]">Select on Map</label>
                <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="text-[10px] bg-primary text-black px-3 py-1 rounded-full hover:bg-black hover:text-white transition-all font-black uppercase tracking-widest"
                >
                    Use GPS
                </button>
            </div>
            <div style={{ height, width: '100%', borderRadius: '1rem', overflow: 'hidden', position: 'relative', minHeight: '200px' }} className="border border-gray-100 shadow-soft">
                <MapContainer
                    center={center}
                    zoom={13}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%', minHeight: '200px', backgroundColor: '#f3f4f6' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker
                        position={position}
                        setPosition={setPosition}
                        onLocationSelect={onLocationSelect}
                        onAddressSelect={onAddressSelect}
                    />
                    {position && <ChangeView center={position} />}
                </MapContainer>
            </div>
            {position && (
                <p className="text-[10px] text-muted-foreground font-medium italic">
                    Coordinates: {position[0].toFixed(4)}, {position[1].toFixed(4)}
                </p>
            )}
        </div>
    );
};
