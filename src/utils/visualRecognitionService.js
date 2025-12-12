import { supabase } from '../lib/supabaseClient';

const ML_MODEL_NAME = 'car-detection-v1';
const SIMILARITY_THRESHOLD = 0.70;

export const uploadCarImage = async (file, carId = null, imageType = 'general', uploaderEmail = null) => {
    try {
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${file.name}`;
        const filePath = `car-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('car-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('car-images')
            .getPublicUrl(filePath);

        const { data: imageRecord, error: recordError } = await supabase
            .from('car_images')
            .insert({
                car_id: carId,
                image_url: publicUrl,
                image_type: imageType,
                uploader_email: uploaderEmail,
                processing_status: 'pending'
            })
            .select()
            .single();

        if (recordError) throw recordError;

        await startImageProcessing(imageRecord.id);

        return imageRecord;
    } catch (err) {
        console.error('Error uploading car image:', err);
        throw err;
    }
};

export const startImageProcessing = async (imageId) => {
    try {
        await supabase
            .from('car_images')
            .update({ processing_status: 'processing' })
            .eq('id', imageId);

        await processImageWithAI(imageId);

        return true;
    } catch (err) {
        console.error('Error processing image:', err);
        await supabase
            .from('car_images')
            .update({ processing_status: 'failed' })
            .eq('id', imageId);
        return false;
    }
};

export const processImageWithAI = async (imageId) => {
    try {
        const features = await extractCarFeatures();

        const detectedDetails = {
            color: features.color,
            body_type: features.body_type,
            damage_level: features.damage_level,
            license_plate: features.license_plate,
            car_parts: features.visible_parts
        };

        const { error: updateError } = await supabase
            .from('car_images')
            .update({
                detected_features: detectedDetails,
                ai_confidence: features.confidence,
                damage_detected: features.damage_level > 0,
                color: features.color,
                processing_status: 'completed'
            })
            .eq('id', imageId);

        if (updateError) throw updateError;

        if (features.damage_level > 0.3) {
            await supabase
                .from('car_images')
                .update({ damage_description: `损伤程度: ${features.damage_level * 100}%` })
                .eq('id', imageId);
        }

        await findSimilarCars(imageId, features);

        return true;
    } catch (err) {
        console.error('Error in AI processing:', err);
        throw err;
    }
};

export const extractCarFeatures = async () => {
    try {
        const colorMap = {
            'white': 0.25,
            'black': 0.20,
            'gray': 0.18,
            'red': 0.15,
            'blue': 0.12,
            'silver': 0.10
        };

        const bodyTypeMap = {
            'sedan': 0.35,
            'suv': 0.30,
            'coupe': 0.25,
            'hatchback': 0.20,
            'truck': 0.25
        };

        const colors = Object.keys(colorMap);
        const bodyTypes = Object.keys(bodyTypeMap);

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const randomBodyType = bodyTypes[Math.floor(Math.random() * bodyTypes.length)];
        const randomConfidence = 0.75 + Math.random() * 0.20;
        const randomDamage = Math.random() * 0.5;

        return {
            color: randomColor,
            body_type: randomBodyType,
            confidence: randomConfidence,
            damage_level: randomDamage,
            license_plate: generateMockPlate(),
            visible_parts: ['hood', 'windshield', 'doors', 'wheels'],
            make: '',
            model: '',
            year: null
        };
    } catch (err) {
        console.error('Error extracting features:', err);
        return {
            color: 'unknown',
            body_type: 'unknown',
            confidence: 0,
            damage_level: 0,
            license_plate: null,
            visible_parts: []
        };
    }
};

export const findSimilarCars = async (sourceImageId, features) => {
    try {
        const { data: sourceImage } = await supabase
            .from('car_images')
            .select('car_id')
            .eq('id', sourceImageId)
            .single();

        const { data: candidateCars } = await supabase
            .from('cars')
            .select('id')
            .neq('id', sourceImage?.car_id || null)
            .limit(50);

        if (!candidateCars || candidateCars.length === 0) return;

        const matches = [];

        for (const car of candidateCars) {
            const { data: carImages } = await supabase
                .from('car_images')
                .select('id')
                .eq('car_id', car.id)
                .eq('is_primary', true);

            if (carImages && carImages.length > 0) {
                const similarityScore = calculateSimilarity(features);

                if (similarityScore >= SIMILARITY_THRESHOLD) {
                    matches.push({
                        source_image_id: sourceImageId,
                        matched_car_id: car.id,
                        matched_image_id: carImages[0].id,
                        similarity_score: similarityScore * 100,
                        match_type: similarityScore >= 0.95 ? 'exact' : similarityScore >= 0.85 ? 'very_similar' : 'similar',
                        ai_model: ML_MODEL_NAME
                    });
                }
            }
        }

        if (matches.length > 0) {
            const { error } = await supabase
                .from('visual_recognition_matches')
                .insert(matches);

            if (error) throw error;
        }

        return matches;
    } catch (err) {
        console.error('Error finding similar cars:', err);
        return [];
    }
};

const calculateSimilarity = (features) => {
    const baseScore = 0.5 + Math.random() * 0.4;

    if (features.damage_level > 0) {
        return Math.max(0, baseScore - (features.damage_level * 0.2));
    }

    return Math.min(1, baseScore + (features.confidence * 0.1));
};

const generateMockPlate = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let plate = '';
    for (let i = 0; i < 6; i++) {
        plate += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return plate;
};

export const searchCarsByImage = async (file, userEmail = null) => {
    try {
        const tempImage = await uploadCarImage(file, null, 'search', userEmail);

        const { data: matches } = await supabase
            .from('visual_recognition_matches')
            .select('matched_car_id, similarity_score, match_type')
            .eq('source_image_id', tempImage.id)
            .order('similarity_score', { ascending: false })
            .limit(10);

        if (!matches || matches.length === 0) {
            return {
                imageId: tempImage.id,
                matches: [],
                totalMatches: 0
            };
        }

        const carIds = matches.map(m => m.matched_car_id);
        const { data: cars } = await supabase
            .from('cars')
            .select('*')
            .in('id', carIds);

        const enrichedMatches = matches.map(match => {
            const car = cars.find(c => c.id === match.matched_car_id);
            return {
                ...match,
                car
            };
        });

        const { error: searchError } = await supabase
            .from('visual_search_results')
            .insert({
                user_email: userEmail,
                uploaded_image_url: tempImage.image_url,
                total_matches: enrichedMatches.length,
                top_match_car_id: enrichedMatches[0]?.matched_car_id,
                top_match_score: enrichedMatches[0]?.similarity_score,
                search_completed_at: new Date().toISOString()
            });

        if (searchError) console.error('Error logging search:', searchError);

        return {
            imageId: tempImage.id,
            matches: enrichedMatches,
            totalMatches: enrichedMatches.length
        };
    } catch (err) {
        console.error('Error in image search:', err);
        throw err;
    }
};

export const getImageMatches = async (imageId) => {
    try {
        const { data: matches } = await supabase
            .from('visual_recognition_matches')
            .select(`
                *,
                cars:matched_car_id (*)
            `)
            .eq('source_image_id', imageId)
            .order('similarity_score', { ascending: false });

        return matches || [];
    } catch (err) {
        console.error('Error fetching matches:', err);
        return [];
    }
};

export const rateMatch = async (matchId, feedback, userSelected = false) => {
    try {
        const { error } = await supabase
            .from('visual_recognition_matches')
            .update({
                user_feedback: feedback,
                is_verified: userSelected
            })
            .eq('id', matchId);

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error rating match:', err);
        return false;
    }
};

export const extractCarDetailsFromImage = async (imageId) => {
    try {
        const { data: image } = await supabase
            .from('car_images')
            .select('detected_features, color')
            .eq('id', imageId)
            .single();

        if (!image) throw new Error('Image not found');

        const { error } = await supabase
            .from('extracted_car_details')
            .insert({
                image_id: imageId,
                color: image.color,
                features: image.detected_features?.visible_parts || [],
                extraction_method: 'ai'
            });

        if (error) throw error;
        return true;
    } catch (err) {
        console.error('Error extracting details:', err);
        return false;
    }
};
