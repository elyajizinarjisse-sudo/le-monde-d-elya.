
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

async function inspect() {
    console.log("--- Inspecting Products with 'Sac' ---");
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('id, title, category, subcategory')
        .select('id, title, category, subcategory')
        .or('title.ilike.%sac%,title.ilike.%affiche%,title.ilike.%poster%');

    if (prodError) console.error(prodError);
    else console.table(products);

    console.log("\n--- Inspecting Menu Items for 'Sac' and 'Poster' ---");
    const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, label, path')
        .or('label.ilike.%sac%,label.ilike.%poster%');

    if (menuError) console.error(menuError);
    else console.table(menuItems);
}

inspect();
