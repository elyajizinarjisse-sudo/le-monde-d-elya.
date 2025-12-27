import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Manual .env parser
function loadEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const content = fs.readFileSync(filePath, 'utf-8');
    const env = {};
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
        }
    });
    return env;
}

const envPath = path.resolve(process.cwd(), '.env');
const env = loadEnv(envPath);
console.log(`Loaded env from: ${envPath}`);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMenu() {
    console.log("Fetching menu items from DB...");
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error("Error fetching menu:", error);
    } else {
        console.log(`Successfully fetched ${data.length} items.`);
        console.table(data.map(i => ({
            id: i.id,
            label: i.label,
            parent: i.parent_id,
            type: i.type,
            path: i.path
        })));
    }
}

checkMenu();
