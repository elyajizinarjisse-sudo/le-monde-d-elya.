
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function cleanup() {
    console.log("Fetching all products...");
    const { data: products, error } = await supabase
        .from('products')
        .select('id, category, subcategory');

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Processing ${products.length} products...`);
    for (const p of products) {
        const trimmedCat = p.category?.trim();
        const trimmedSub = p.subcategory?.trim();

        if (trimmedCat !== p.category || trimmedSub !== p.subcategory) {
            console.log(`Updating product ${p.id}: "${p.category}" -> "${trimmedCat}", "${p.subcategory}" -> "${trimmedSub}"`);
            await supabase
                .from('products')
                .update({
                    category: trimmedCat,
                    subcategory: trimmedSub
                })
                .eq('id', p.id);
        }
    }
    console.log("Cleanup complete.");
}

cleanup();
