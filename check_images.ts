
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

async function checkImages() {
    const { data: product, error } = await supabase
        .from('products')
        .select('title, image, images')
        .eq('id', '15')
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log("Product:", product.title);
    console.log("Main Image (Home Page):", product.image);
    console.log("Gallery Images Array:", JSON.stringify(product.images, null, 2));
}

checkImages();
