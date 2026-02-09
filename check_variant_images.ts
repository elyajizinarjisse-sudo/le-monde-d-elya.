
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);
const PRODUCT_ID = '15';

async function checkVariants() {
    const { data: product, error } = await supabase
        .from('products')
        .select('title, image, variants')
        .eq('id', PRODUCT_ID)
        .single();

    if (error) { console.error(error); return; }

    console.log("Main Product Image:", product.image);
    console.log("--- Variants ---");
    const variants = product.variants || [];
    variants.forEach((v: any) => {
        console.log(`Variant: ${v.name} | Image: ${v.image}`);
        if (v.image === product.image) {
            console.log("  *** MATCHES MAIN IMAGE ***");
        }
    });
}

checkVariants();
