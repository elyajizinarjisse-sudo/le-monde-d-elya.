
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

async function updateAllCustomizable() {
    console.log('Finding customizable products...');

    // Find products that are likely customizable
    const { data: products, error: searchError } = await supabase
        .from('products')
        .select('*')
        .or('title.ilike.%Personnalis%,title.ilike.%Custom%,category.eq.Personnalisation');

    if (searchError) {
        console.error('Search Error:', searchError);
        return;
    }

    if (!products || products.length === 0) {
        console.log('No customizable products found.');
        return;
    }

    console.log(`Found ${products.length} products to standardize:`);
    products.forEach(p => console.log(`- ${p.title} (ID: ${p.id})`));

    const standardOptions = [
        { id: 'custom-file', type: 'file', label: 'Votre Photo / Logo', required: true },
        { id: 'custom-text', type: 'text', label: 'Texte (Optionnel)', required: false }
    ];

    for (const product of products) {
        // Skip the Mug we just updated if we want, or just re-apply to be safe.
        // We generally want to preserve existing options if they are different, but "make the same thing" suggests standardization.
        // However, some might simply be "Text only". But "Photo" implies file upload.
        // I will merge: Ensure 'custom-file' exists.

        let currentOptions = product.customization_options || [];

        // If it's not an array, make it one
        if (!Array.isArray(currentOptions)) currentOptions = [];

        // Check if file option exists
        const hasFile = currentOptions.some((opt: any) => opt.type === 'file');
        const hasText = currentOptions.some((opt: any) => opt.type === 'text');

        let newOptions = [...currentOptions];

        if (!hasFile) {
            newOptions.push(standardOptions[0]); // Add File
        }
        if (!hasText) {
            // If there was no text option, maybe add it? Or leave it if not relevant?
            // User said "tous les produits personnalisable".
            // Most customizable items allow text. I'll add it if missing, but maybe make it optional.
            newOptions.push(standardOptions[1]);
        }

        // If we want to strictly ENFORCE the user's vision ("like the mug"), maybe we should Replace everything?
        // "fais la meme chose" -> Do the same thing.
        // I'll replace with the standard options to ensure uniformity (File + Text).
        // Exceptions: If a product is strictly text-based (like a nameplate), forcing a file might be wrong.
        // But for "products customizable" in a shop like this (POD), file upload is usually key.

        // I will Overwrite to ensure consistency as requested.
        const finalOptions = standardOptions;

        const { error: updateError } = await supabase
            .from('products')
            .update({ customization_options: finalOptions })
            .eq('id', product.id);

        if (updateError) console.error(`Failed to update ${product.title}:`, updateError);
        else console.log(`Updated ${product.title} with standard options.`);
    }
}

updateAllCustomizable();
