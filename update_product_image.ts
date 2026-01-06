
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function updateMug() {
    const imagePath = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/113b6324-2897-42e1-966d-8aae0452c689/uploaded_image_1767315983328.jpg';
    const imageFile = fs.readFileSync(imagePath);
    const fileExt = path.extname(imagePath);
    // Use .jpg for the new file, unique name
    const fileName = `mug-custom-final-${Date.now()}${fileExt}`;
    const filePath = `${fileName}`;

    console.log('Uploading image...');
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, {
            contentType: 'image/jpeg',
            upsert: true
        });

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        return;
    }

    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

    console.log('Image uploaded:', publicUrl);

    // Find Mug
    const { data: products, error: searchError } = await supabase
        .from('products')
        .select('*')
        .ilike('title', '%Mug%');

    if (searchError) {
        console.error('Search Error:', searchError);
        return;
    }

    // Standard Variants for Mugs
    const mugVariants = [
        { name: 'Ceramique - 11oz', price: '19.99', stock: 50, image: publicUrl },
        { name: 'Ceramique - 15oz', price: '24.99', stock: 50, image: publicUrl },
        { name: 'Noir - 11oz', price: '22.99', stock: 50, image: publicUrl },
        { name: 'Noir - 15oz', price: '27.99', stock: 50, image: publicUrl }
    ];

    const customizationOptions = [
        { id: 'custom-file', type: 'file', label: 'Votre Photo / Logo', required: true },
        { id: 'custom-text', type: 'text', label: 'Texte (Optionnel)', required: false }
    ];

    if (products && products.length > 0) {
        console.log('Found existing Mug(s):', products.map(p => p.title));
        // Update ALL matched mugs to be safe, or just the first one? User said "the mug".
        // I will update the first one found as the primary product.
        const productId = products[0].id;

        // Removing 'slug' from update to avoid schema errors if it's missing/protected
        const { error: updateError } = await supabase
            .from('products')
            .update({
                image: publicUrl,
                title: 'Mug Personnalisable (Noir & Blanc)',
                variants: mugVariants,
                customization_options: customizationOptions
            })
            .eq('id', productId);

        if (updateError) console.error('Update Error:', updateError);
        else console.log(`Updated product ${productId} with new image and variants.`);

    } else {
        console.log('No Mug found. Creating new one...');

        const { data: newProds, error: createError } = await supabase
            .from('products')
            .insert([{
                title: 'Mug Personnalisable (Noir & Blanc)',
                description: 'Créez votre mug unique. Disponible en céramique blanche ou noire, deux tailles (11oz et 15oz). Téléchargez votre photo ou logo !',
                price: 19.99,
                image: publicUrl,
                category: 'Personnalisation',
                subcategory: 'Mugs',
                // Removing slug from insert if schema doesn't match, or try to include it if standard
                // slug: 'mug-personnalisable-final', 
                variants: mugVariants,
                customization_options: customizationOptions
            }])
            .select();

        if (createError) console.error('Create Error:', createError);
        else {
            console.log('Created new Mug:', newProds[0]);
        }
    }
}

updateMug();
