import { supabase } from '../lib/supabaseClient';

export const getMissingCarsForMap = async () => {
    try {
        const { data: cars, error } = await supabase
            .from('cars')
            .select('*')
            .eq('status', 'missing')
            .limit(100);

        if (error) throw error;

        return {
            success: true,
            cars: cars?.map(car => ({
                ...car,
                lat: car.last_seen_latitude || 25.2048,
                lng: car.last_seen_longitude || 55.2708,
                title: `${car.year} ${car.make} ${car.model}`
            })) || []
        };
    } catch (err) {
        console.error('Error fetching cars for map:', err);
        return { success: false, error: err.message, cars: [] };
    }
};

export const updateCarLocation = async (carId, latitude, longitude, location) => {
    try {
        const { error } = await supabase
            .from('cars')
            .update({
                last_seen_latitude: latitude,
                last_seen_longitude: longitude,
                last_seen_location: location
            })
            .eq('id', carId);

        if (error) throw error;

        return { success: true };
    } catch (err) {
        console.error('Error updating car location:', err);
        return { success: false, error: err.message };
    }
};

export const addLocationMarker = async (carId, latitude, longitude, description) => {
    try {
        const { data: marker, error } = await supabase
            .from('car_sightings')
            .insert({
                car_id: carId,
                latitude,
                longitude,
                description,
                sighting_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        return { success: true, marker };
    } catch (err) {
        console.error('Error adding location marker:', err);
        return { success: false, error: err.message };
    }
};

export const getSightings = async (carId) => {
    try {
        const { data: sightings, error } = await supabase
            .from('car_sightings')
            .select('*')
            .eq('car_id', carId)
            .order('sighting_date', { ascending: false });

        if (error) throw error;

        return { success: true, sightings: sightings || [] };
    } catch (err) {
        console.error('Error fetching sightings:', err);
        return { success: false, error: err.message, sightings: [] };
    }
};

export const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        return {
            success: true,
            address: data.address?.city || data.address?.town || data.address?.village || 'موقع غير معروف',
            fullAddress: data.display_name
        };
    } catch (err) {
        console.error('Error reverse geocoding:', err);
        return { success: false, error: err.message, address: 'موقع غير معروف' };
    }
};
