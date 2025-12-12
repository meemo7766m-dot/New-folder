import { supabase } from '../lib/supabaseClient';

const colorNames = {
    'red': { rgb: [255, 0, 0], hex: '#FF0000' },
    'blue': { rgb: [0, 0, 255], hex: '#0000FF' },
    'green': { rgb: [0, 128, 0], hex: '#008000' },
    'yellow': { rgb: [255, 255, 0], hex: '#FFFF00' },
    'white': { rgb: [255, 255, 255], hex: '#FFFFFF' },
    'black': { rgb: [0, 0, 0], hex: '#000000' },
    'gray': { rgb: [128, 128, 128], hex: '#808080' },
    'orange': { rgb: [255, 165, 0], hex: '#FFA500' },
    'pink': { rgb: [255, 192, 203], hex: '#FFC0CB' },
    'purple': { rgb: [128, 0, 128], hex: '#800080' },
    'brown': { rgb: [165, 42, 42], hex: '#A52A2A' },
    'silver': { rgb: [192, 192, 192], hex: '#C0C0C0' },
    'gold': { rgb: [255, 215, 0], hex: '#FFD700' }
};

export const extractImageColors = async (imageUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 50;
            canvas.height = 50;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 50, 50);

            const imageData = ctx.getImageData(0, 0, 50, 50);
            const data = imageData.data;
            
            const colorFrequency = {};
            const dominantColors = [];

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const colorName = rgbToColorName(r, g, b);

                if (!colorFrequency[colorName]) {
                    colorFrequency[colorName] = 0;
                }
                colorFrequency[colorName]++;
            }

            const sortedColors = Object.entries(colorFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5);

            sortedColors.forEach(([color, count]) => {
                const percentage = ((count / (50 * 50)) * 100).toFixed(2);
                dominantColors.push({
                    color,
                    percentage: parseFloat(percentage)
                });
            });

            const primaryColor = dominantColors[0]?.color || 'unknown';
            const secondaryColor = dominantColors[1]?.color || null;

            resolve({
                primaryColor,
                secondaryColor,
                dominantColors,
                confidence: 0.85
            });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };
    });
};

const rgbToColorName = (r, g, b) => {
    let colorName = 'unknown';
    let minDistance = Infinity;

    Object.entries(colorNames).forEach(([name, { rgb }]) => {
        const distance = Math.sqrt(
            Math.pow(r - rgb[0], 2) +
            Math.pow(g - rgb[1], 2) +
            Math.pow(b - rgb[2], 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            colorName = name;
        }
    });

    return colorName;
};

export const searchCarsByColor = async (primaryColor, secondaryColor = null, makeFilter = null) => {
    try {
        let query = supabase
            .from('car_colors')
            .select('*, cars(*)');

        const { data, error } = await query;

        if (error) throw error;

        let matches = data.filter(item => {
            const colorMatch = item.primary_color === primaryColor ||
                             (secondaryColor && item.secondary_color === secondaryColor);
            
            if (!colorMatch) return false;

            if (makeFilter) {
                return item.cars?.make?.toLowerCase().includes(makeFilter.toLowerCase());
            }
            return true;
        });

        return matches.map(item => ({
            ...item.cars,
            colorMatch: {
                primaryColor: item.primary_color,
                secondaryColor: item.secondary_color,
                confidence: item.color_confidence
            }
        }));
    } catch (err) {
        console.error('Error searching by color:', err);
        return [];
    }
};

export const saveColorAnalysis = async (carId, colors) => {
    try {
        const { data, error } = await supabase
            .from('car_colors')
            .upsert([{
                car_id: carId,
                primary_color: colors.primaryColor,
                secondary_color: colors.secondaryColor,
                color_confidence: colors.confidence,
                dominant_colors: colors.dominantColors,
                last_analyzed: new Date().toISOString()
            }], { onConflict: 'car_id' })
            .select();

        if (error) throw error;
        return data[0];
    } catch (err) {
        console.error('Error saving color analysis:', err);
        return null;
    }
};

export const searchCarsByImage = async (imageUrl, makeFilter = null) => {
    try {
        const colors = await extractImageColors(imageUrl);
        const matches = await searchCarsByColor(colors.primaryColor, colors.secondaryColor, makeFilter);
        
        return {
            colors,
            matches,
            resultCount: matches.length
        };
    } catch (err) {
        console.error('Error in image search:', err);
        return {
            colors: null,
            matches: [],
            resultCount: 0
        };
    }
};

export const calculateColorSimilarity = (color1, color2) => {
    if (!color1 || !color2) return 0;
    
    const colors = Object.keys(colorNames);
    const index1 = colors.indexOf(color1);
    const index2 = colors.indexOf(color2);
    
    if (index1 === -1 || index2 === -1) return 0;
    
    const maxDistance = colors.length;
    const distance = Math.abs(index1 - index2);
    
    return (1 - (distance / maxDistance)) * 100;
};
