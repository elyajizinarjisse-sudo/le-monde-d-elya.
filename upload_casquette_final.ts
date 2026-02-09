
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

// Local paths from the user upload
// Order received from User: Front, Back, Left, Right
const frontPath = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_1768257907862.png';
const backPath = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_1768257919259.png';
const leftPath = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_1768257953939.png';
const rightPath = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/680363c6-859d-46c4-9b92-d9ba943a748b/uploaded_image_1768257965790.png';

async function uploadImages() {
    try {
        const uploadFile = async (filePath: string) => {
            const fileName = path.basename(filePath);
            const fileBuffer = fs.readFileSync(filePath);
            const storagePath = `public/casquette_final/${Date.now()}_${fileName}`;

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

            console.log(`Uploaded: ${publicUrl}`);
            return publicUrl;
        };

        const frontUrl = await uploadFile(frontPath);
        const backUrl = await uploadFile(backPath);
        const leftUrl = await uploadFile(leftPath);
        const rightUrl = await uploadFile(rightPath);

        // Target Order for App Logic: [Front, Back, Right, Left]
        const newGallery = [frontUrl, backUrl, rightUrl, leftUrl];

        console.log('Updating product images with:', newGallery);

        const { error: updateError } = await supabase
            .from('products')
            .update({
                image: frontUrl, // Set Main Image
                images: newGallery // Set Gallery
            })
            .eq('id', PRODUCT_ID);

        if (updateError) throw updateError;

        console.log('Success! Product images updated.');

    } catch (err) {
        console.error('Error:', err);
    }
}

uploadImages();
