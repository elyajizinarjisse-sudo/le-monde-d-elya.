
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

async function checkMenuItems() {
    console.log("Fetching menu_items...");
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching menu_items:", error);
        return;
    }

    console.log(`Found ${data.length} menu items.`);

    // Check for "Personnalisation" specifically
    const perso = data.find(i => i.label.toLowerCase().includes('personnalis'));
    if (perso) {
        console.log("--- 'Personnalisation' Category Found ---");
        console.log("ID:", perso.id);
        console.log("Label:", perso.label);
        console.log("Path:", perso.path);
        console.log("SubItems:", JSON.stringify(perso.subItems, null, 2));
    } else {
        console.log("WARN: No category with 'Personnalis' found in label.");
    }

    // List all just in case
    console.log("\n--- All Categories ---");
    data.forEach(i => console.log(`- ${i.label} (Path: ${i.path})`));
}

checkMenuItems();
