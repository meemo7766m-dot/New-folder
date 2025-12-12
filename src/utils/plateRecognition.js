import { supabase } from '../lib/supabaseClient';

export const recognizeLicensePlate = async (imagePath) => {
    try {
        const arabicNumberMap = {
            '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
            '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
        };

        const englishNumberMap = {
            '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
            '5': '5', '6': '6', '7': '7', '8': '8', '9': '9'
        };

        const arabicLetters = ['ا', 'ب', 'ج', 'د', 'ع', 'ل', 'س', 'ن', 'ص', 'ط', 'خ', 'ش', 'ق', 'ر', 'ت', 'ث', 'ه', 'م', 'ك', 'ي', 'و', 'ز', 'ف', 'غ', 'ض', 'ظ'];

        const loadScript = (src) => {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        };

        if (typeof Tesseract === 'undefined') {
            await loadScript('https://cdn.jsdelivr.net/npm/tesseract.js@4/dist/tesseract.min.js');
        }

        const { data: { recognizeArabic } } = await Tesseract.recognize(
            imagePath,
            ['ara', 'eng'],
            {
                logger: (m) => console.log('OCR Progress:', m)
            }
        );

        const text = recognizeArabic?.data?.text || '';
        const cleanedText = text.replace(/\s+/g, '');

        let convertedText = cleanedText;
        for (let [arabic, english] of Object.entries(arabicNumberMap)) {
            convertedText = convertedText.replace(new RegExp(arabic, 'g'), english);
        }

        const extractedNumbers = convertedText.match(/\d+/g)?.join('') || '';
        const extractedLetters = convertedText.split('').filter(char => arabicLetters.includes(char)).join('');

        return {
            success: true,
            rawText: text,
            processedText: convertedText,
            plateNumber: extractedNumbers,
            plateLetters: extractedLetters,
            fullPlate: `${extractedLetters}-${extractedNumbers}`,
            confidence: recognizeArabic?.data?.confidence || 0
        };
    } catch (err) {
        console.error('Plate recognition error:', err);
        return {
            success: false,
            error: err.message,
            plateNumber: null
        };
    }
};

export const findDuplicateCars = async (carId, plateNumber, make, model) => {
    try {
        const { data: duplicates, error } = await supabase
            .from('cars')
            .select('id, make, model, license_plate, color, year')
            .neq('id', carId)
            .or(
                `license_plate.eq.${plateNumber},and(make.eq.${make},model.eq.${model})`
            )
            .limit(10);

        if (error) throw error;

        return {
            success: true,
            foundDuplicates: duplicates && duplicates.length > 0,
            count: duplicates?.length || 0,
            cars: duplicates || []
        };
    } catch (err) {
        console.error('Duplicate detection error:', err);
        return {
            success: false,
            error: err.message,
            foundDuplicates: false
        };
    }
};

export const compareCarImages = async (image1Url, image2Url) => {
    try {
        if (!window.tf || !window.mobilenet) {
            return {
                success: false,
                error: 'TensorFlow libraries not loaded. Please ensure CDN scripts are available.'
            };
        }
        
        const tf = window.tf;
        const mobilenet = window.mobilenet;

        const loadImageData = async (url) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = url;

            return new Promise((resolve) => {
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    resolve(imageData.data);
                };
            });
        };

        const data1 = await loadImageData(image1Url);
        const data2 = await loadImageData(image2Url);

        const similarity = calculateSimilarity(data1, data2);

        return {
            success: true,
            similarity: similarity,
            isMatch: similarity > 0.8,
            confidence: similarity
        };
    } catch (err) {
        console.error('Image comparison error:', err);
        return {
            success: false,
            error: err.message,
            similarity: 0,
            isMatch: false
        };
    }
};

const calculateSimilarity = (pixels1, pixels2) => {
    if (pixels1.length !== pixels2.length) return 0;

    let diffSum = 0;
    for (let i = 0; i < pixels1.length; i += 4) {
        const r1 = pixels1[i];
        const g1 = pixels1[i + 1];
        const b1 = pixels1[i + 2];

        const r2 = pixels2[i];
        const g2 = pixels2[i + 1];
        const b2 = pixels2[i + 2];

        const diffR = Math.abs(r1 - r2);
        const diffG = Math.abs(g1 - g2);
        const diffB = Math.abs(b1 - b2);

        diffSum += (diffR + diffG + diffB);
    }

    const maxDiff = pixels1.length * 3 * 255;
    const similarity = 1 - (diffSum / maxDiff);

    return Math.max(0, Math.min(1, similarity));
};

export const analyzeCarImage = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return {
            success: true,
            format: blob.type,
            size: blob.size,
            url: imageUrl
        };
    } catch (err) {
        console.error('Image analysis error:', err);
        return {
            success: false,
            error: err.message
        };
    }
};
