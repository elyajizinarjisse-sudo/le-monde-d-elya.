
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

async function checkRelationships() {
    console.log("Fetching menu_items...");
    const { data, error } = await supabase
        .from('menu_items')
        .select('id, label, parent_id, path')
        .order('id', { ascending: true });

    if (error) {
        console.error("Error fetching menu_items:", error);
        return;
    }

    console.log(`Found ${data.length} items.`);

    // Find Personnalisation
    const perso = data.find(i => i.label.toLowerCase().includes('personnalis'));
    if (perso) {
        console.log(`\nTARGET PARENT: [${perso.id}] ${perso.label}`);

        // Find children
        const children = data.filter(i => i.parent_id === perso.id);
        console.log(`CHILDREN (via parent_id=${perso.id}):`);
        if (children.length === 0) console.log("  - None found.");
        children.forEach(c => console.log(`  - [${c.id}] ${c.label}`));
    } else {
        console.log("TARGET PARENT 'Personnalisation' NOT FOUND.");
    }

    // Check Tasse, T-shirt, etc.
    console.log("\nPOTENTIAL ORPHANS:");
    const orphans = data.filter(i =>
        ['tasse', 'mug', 't-shirt', 'poster', 'sac'].some(k => i.label.toLowerCase().includes(k))
    );
    orphans.forEach(o => {
        console.log(`- [${o.id}] ${o.label} (Parent ID: ${o.parent_id}) Path: ${o.path}`);
    });
}

checkRelationships();
