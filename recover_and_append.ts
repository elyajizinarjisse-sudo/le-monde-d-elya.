
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

async function restoreAndAppend() {
    try {
        console.log("Fetching variants for product:", PRODUCT_ID);
        // 1. Fetch Variants to recover Marketing Images
        // Variants are likely stored in the 'variants' column of the 'products' table, matching the output of inspect_product_15.ts
        const { data: productData, error: prodErr } = await supabase
            .from('products')
            .select('variants')
            .eq('id', PRODUCT_ID)
            .single();

        if (prodErr) throw prodErr;

        const variants = productData.variants || [];

        console.log("Variants found:", variants?.length);
        if (variants && variants.length > 0) {
            console.log("First variant sample:", JSON.stringify(variants[0], null, 2));
        }

        // Extract unique, non-null images from variants
        const marketingImages = Array.from(new Set(
            (variants || [])
                .map(v => v.image)
                .filter(url => url && url.length > 0 && !url.includes('casquette_final')) // Exclude the tech images if they somehow got into variants
        ));

        console.log("Extracted Marketing Images:", marketingImages);

        // 2. Fetch Current Images (which should be the 4 tech ones)
        const { data: product, error: prodError } = await supabase
            .from('products')
            .select('images')
            .eq('id', PRODUCT_ID)
            .single();

        if (prodError) throw prodError;

        // Identify Technical Images
        // If current images are ONLY the tech ones (which seems to be the case), we keep them.
        // We can identify them by path 'casquette_final' or just assume current content is tech.
        const currentImages = product.images || [];
        const technicalImages = currentImages.filter(url => url.includes('casquette_final') || url.includes('template'));

        // If technical images are missing from current, we might be in trouble, but let's assume they are there.
        if (technicalImages.length === 0 && currentImages.length === 4) {
            // Fallback: Assume all 4 are tech
            technicalImages.push(...currentImages);
        }

        console.log("Identified Technical Images:", technicalImages);

        if (marketingImages.length === 0) {
            console.error("CRITICAL: No marketing images found in variants! Cannot restore gallery.");
            // If no variants have images, maybe we need to look at 'product_options' or another source?
            // Or maybe the user needs to re-upload the main marketing image?
            return;
        }

        // 3. Combine: Marketing First, then Technical
        const newGallery = [...marketingImages, ...technicalImages];

        console.log("New Gallery Plan:", newGallery);

        // 4. Update Product
        const mainImage = marketingImages[0]; // Set main image to first marketing photo

        const { error: updateError } = await supabase
            .from('products')
            .update({
                image: mainImage,
                images: newGallery
            })
            .eq('id', PRODUCT_ID);

        if (updateError) throw updateError;

        console.log("Success! Gallery Restored with", newGallery.length, "images.");

    } catch (err) {
        console.error("Error:", err);
    }
}

restoreAndAppend();
