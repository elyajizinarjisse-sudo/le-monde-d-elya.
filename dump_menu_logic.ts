
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

async function dump() {
    console.log("--- ALL MENU ITEMS ---");
    const { data: all } = await supabase.from('menu_items').select('*');
    console.table(all?.map(i => ({ id: i.id, label: i.label, path: i.path, parent: i.parent_id })));

    const categorySlug = 'personnalisation';
    const subcategorySlug = 'sac';

    console.log(`\n--- Simulating Strategy C for %${categorySlug}%${subcategorySlug}% ---`);
    const { data: menuData } = await supabase
        .from('menu_items')
        .select('label, path')
        .ilike('path', `%${categorySlug}%${subcategorySlug}%`);

    console.log("Matches found:", menuData);
}

dump();
