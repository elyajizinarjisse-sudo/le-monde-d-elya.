
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load env vars manually
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Product ID for "Sac weekender personalisable" -> ID 24 (from inspection)
const PRODUCT_ID = 24;

// The uploaded file from the user
const localFile = '/Users/sylvainrobert68hotmail.com/.gemini/antigravity/brain/edd00b13-5e0a-4b24-b93f-1bcd72aa2070/uploaded_media_1769295185583.png';

async function updateBag() {
    try {
        console.log(`Uploading bag template...`);
        const fileBuffer = fs.readFileSync(localFile);
        const storagePath = `public/bag_templates/${Date.now()}_bag_template.png`;

        const { data, error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(storagePath, fileBuffer, {
                contentType: 'image/png',
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(storagePath);

        console.log(`Uploaded Template URL: ${publicUrl}`);

        // Update product configurations
        console.log("Updating product configuration...");

        // Define print zones based on the template
        // 1. Top rect (circles)
        // 2. Bottom rect (circles)
        // We will configure a 'flat' view for now with the template.

        const technicalViews = {
            flat: publicUrl,
            // We can add print_zones metadata here if the UI supports it, 
            // otherwise just setting the view is the first step.
            zones: [
                {
                    id: "top_panel",
                    ticket: "Top Panel",
                    // Approximate percentages based on image visual (assuming image is 100% x 100%)
                    // Top rect: starts ~ 8% from top, ~10% from left
                    // Needs fine tuning in UI, but setting initial values.
                    x: 10, y: 8, width: 80, height: 35
                },
                {
                    id: "bottom_panel",
                    label: "Bottom Panel",
                    x: 10, y: 58, width: 80, height: 35
                }
            ]
        };

        const { error: updateError } = await supabase
            .from('products')
            .update({
                technical_views: technicalViews,
                // Ensure it uses the template for the main preview if desired, 
                // or just accessible via customization.
            })
            .eq('id', PRODUCT_ID);

        if (updateError) throw updateError;

        console.log('Success! Bag product updated with new template.');

    } catch (err) {
        console.error('Error:', err);
    }
}

updateBag();
