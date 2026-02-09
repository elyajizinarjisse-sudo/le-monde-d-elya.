
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

async function dumpProducts() {
    console.log("--- PERSONALISATION PRODUCTS ---");
    const { data: prods } = await supabase
        .from('products')
        .select('id, title, category, subcategory')
        .or('category.ilike.%personnalis%,subcategory.ilike.%personnalis%');

    console.table(prods);
}

dumpProducts();
