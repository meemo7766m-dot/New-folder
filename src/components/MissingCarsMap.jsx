import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getMissingCarsForMap, reverseGeocode, addLocationMarker, getSightings } from '../utils/mapService';
import { Loader, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const orangeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LocationMarker = ({ onMarkerAdd, carId }) => {
    const [position, setPosition] = useState(null);
    const [isAddingMarker, setIsAddingMarker] = useState(false);
    const [description, setDescription] = useState('');

    const map = useMapEvents({
        click: async (e) => {
            if (!carId) {
                toast.error('اختر سيارة أولاً');
                return;
            }

            setPosition(e.latlng);
            setIsAddingMarker(true);

            const geocodeResult = await reverseGeocode(e.latlng.lat, e.latlng.lng);
            if (geocodeResult.success) {
                setDescription(geocodeResult.address);
            }
        }
    });

    const handleConfirmMarker = async () => {
        if (position && carId) {
            const result = await addLocationMarker(
                carId,
                position.lat,
                position.lng,
                description
            );

            if (result.success) {
                toast.success('تم إضافة الموقع بنجاح');
                setPosition(null);
                setIsAddingMarker(false);
                setDescription('');
                if (onMarkerAdd) onMarkerAdd();
            } else {
                toast.error('فشل إضافة الموقع');
            }
        }
    };

    return isAddingMarker && position ? (
        <Marker position={[position.lat, position.lng]} icon={orangeIcon}>
            <Popup>
                <div style={{ minWidth: '250px', textAlign: 'right' }}>
                    <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>شهادة رؤية</p>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="أضف وصف إضافي..."
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            marginBottom: '0.5rem',
                            minHeight: '80px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleConfirmMarker}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            تأكيد
                        </button>
                        <button
                            onClick={() => setIsAddingMarker(false)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#ef4444',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            </Popup>
        </Marker>
    ) : null;
};

const MissingCarsMap = ({ selectedCarId = null, onSightingAdded = () => {} }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sightings, setSightings] = useState({});
    const [filterType, setFilterType] = useState('all');

    useEffect(() => {
        fetchCars();
    }, []);

    useEffect(() => {
        if (selectedCarId) {
            fetchSightings(selectedCarId);
        }
    }, [selectedCarId]);

    const fetchCars = async () => {
        try {
            setLoading(true);
            const result = await getMissingCarsForMap();
            if (result.success) {
                setCars(result.cars);
            }
        } catch (err) {
            console.error('Error fetching cars:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSightings = async (carId) => {
        const result = await getSightings(carId);
        if (result.success) {
            setSightings(prev => ({
                ...prev,
                [carId]: result.sightings
            }));
        }
    };

    const filteredCars = cars.filter(car => {
        if (filterType === 'selected' && selectedCarId) {
            return car.id === selectedCarId;
        }
        if (filterType === 'recent') {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return new Date(car.created_at) > dayAgo;
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: '600px' }}>
                <Loader size={40} className="animate-spin" color="var(--accent-primary)" />
            </div>
        );
    }

    return (
        <div style={{ height: '600px', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            <MapContainer center={[25.2048, 55.2708]} zoom={11} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                />

                <LocationMarker carId={selectedCarId} onMarkerAdd={() => {
                    if (selectedCarId) fetchSightings(selectedCarId);
                }} />

                {filteredCars.map(car => (
                    <Marker
                        key={car.id}
                        position={[car.lat, car.lng]}
                        icon={selectedCarId === car.id ? orangeIcon : redIcon}
                    >
                        <Popup>
                            <div style={{ minWidth: '250px', textAlign: 'right' }}>
                                <h4 style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                    {car.year} {car.make} {car.model}
                                </h4>
                                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    📍 {car.license_plate}
                                </p>
                                <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                                    {car.last_seen_location}
                                </p>
                                {sightings[car.id]?.length > 0 && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: '#f0f0f0', borderRadius: '4px' }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                            شهادات رؤية ({sightings[car.id].length})
                                        </p>
                                        {sightings[car.id].slice(0, 3).map((sighting, idx) => (
                                            <p key={idx} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                                                • {sighting.description}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    minWidth: '200px'
                }}
            >
                <p style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: '600' }}>التصفية:</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {['all', 'recent', 'selected'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: filterType === type ? 'var(--accent-primary)' : '#f0f0f0',
                                color: filterType === type ? 'white' : 'black',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            {type === 'all' ? 'الكل' : type === 'recent' ? 'أخيراً' : 'المختار'}
                        </button>
                    ))}
                </div>
                <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', color: '#666' }}>
                    إجمالي: {filteredCars.length} سيارة
                </p>
            </motion.div>
        </div>
    );
};

export default MissingCarsMap;
