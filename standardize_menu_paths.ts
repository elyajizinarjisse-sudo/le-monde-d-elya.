
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

async function standardize() {
    console.log("Fetching customization menu items...");

    // Get all items that are either label 'Personnalisation' or have it as a parent (indirectly)
    // Actually, let's just target the ones we know are problematic.

    const mappings = [
        { label: 'Tee-shirt', path: '/category/personnalisation/tee-shirt' },
        { label: 'Tasse', path: '/category/personnalisation/tasse' },
        { label: 'Poster', path: '/category/personnalisation/poster' },
        { label: 'Sac', path: '/category/personnalisation/sac' },
        { label: 'Doudou', path: '/category/personnalisation/doudou' },
        { label: 'casquette', path: '/category/personnalisation/casquette' },
        { label: 'Personnalisation', path: '/category/personnalisation' }
    ];

    for (const m of mappings) {
        console.log(`Updating ${m.label} to ${m.path}...`);
        const { error } = await supabase
            .from('menu_items')
            .update({ path: m.path })
            .ilike('label', m.label);

        if (error) console.error(`Error updating ${m.label}:`, error);
    }

    console.log("Standardization complete.");

    // Also check for "doudou" (lowercase) which appeared in previous dumps
    await supabase.from('menu_items').update({ path: '/category/personnalisation/doudou' }).eq('label', 'doudou');
}

standardize();
