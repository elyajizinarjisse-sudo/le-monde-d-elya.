
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

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMenuItems() {
    console.log("Updating 'Sac' menu item...");
    const { error: errorSac } = await supabase
        .from('menu_items')
        .update({ path: '/category/personnalisation/sac' })
        .eq('label', 'Sac');

    if (errorSac) console.error("Error updating Sac:", errorSac);
    else console.log("Updated Sac path to /category/personnalisation/sac");

    console.log("Updating 'Poster' menu item...");
    // Note: The label in DB is 'Poster' 
    const { error: errorPoster } = await supabase
        .from('menu_items')
        .update({ path: '/category/personnalisation/poster' })
        .eq('label', 'Poster');

    if (errorPoster) console.error("Error updating Poster:", errorPoster);
    else console.log("Updated Poster path to /category/personnalisation/poster");
}

fixMenuItems();
