
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env
const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

const PRODUCT_ID = '15';

// Local paths from the user upload (hardcoded for this run)
const localFiles = [
    '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_0_1768257710099.png',
    '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_1_1768257710099.png',
    '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_2_1768257710099.png'
];

async function uploadImages() {
    try {
        const publicUrls: string[] = [];

        for (const filePath of localFiles) {
            const fileName = path.basename(filePath);
            const fileBuffer = fs.readFileSync(filePath);
            const storagePath = `public/casquette_templates/${Date.now()}_${fileName}`;

            console.log(`Uploading ${fileName}...`);
            const { data, error } = await supabase.storage
                .from('product-images')
                .upload(storagePath, fileBuffer, {
                    contentType: 'image/png',
                    upsert: true
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(storagePath);

            publicUrls.push(publicUrl);
            console.log(`Uploaded: ${publicUrl}`);
        }

        // Fetch current product images
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('images, image') // properties: images (array) and image (main string)
            .eq('id', PRODUCT_ID)
            .single();

        if (fetchError) throw fetchError;

        // Construct new images array.
        // Keep current Main Image (product.image) effectively as the "Face Avant" context,
        // but updating the `images` array which powers the gallery/views.

        // Strategy: 
        // Index 0: Main Image (Keep existing from gallery or use product.image if gallery empty)
        // Index 1: Back (Assuming uploaded_image_2 is back - generic guess)
        // Index 2: Right (Assuming uploaded_image_1 is right)
        // Index 3: Left (Assuming uploaded_image_0 is left)

        let currentGallery = product.images || [];
        if (currentGallery.length === 0 && product.image) {
            currentGallery = [product.image];
        } else if (currentGallery.length === 0) {
            currentGallery = []; // Should ideally have a main image
        }

        // We want to APPEND or REPLACE the view images.
        // Let's assume we keep the first image (Index 0) as is (Real Photo Face).
        // And we set Indices 1, 2, 3 to our new templates.

        const mainImage = currentGallery[0];

        // GUESSING MAPPING based on typical user upload behavior or file naming if we had it.
        // uploaded_image_0 -> Left?
        // uploaded_image_1 -> Right?
        // uploaded_image_2 -> Back?

        // Let's just push them in order and tell the user to check.
        // New Gallery: [Main, Upload 0, Upload 1, Upload 2]

        const newGallery = [mainImage, ...publicUrls];

        console.log('Updating product images with:', newGallery);

        const { error: updateError } = await supabase
            .from('products')
            .update({ images: newGallery })
            .eq('id', PRODUCT_ID);

        if (updateError) throw updateError;

        console.log('Success! Product images updated.');

    } catch (err) {
        console.error('Error:', err);
    }
}

uploadImages();
