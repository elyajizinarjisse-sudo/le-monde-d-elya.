
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env
const envPath = path.resolve(__dirname, '.env');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                if (key.trim() === 'VITE_SUPABASE_URL') SUPABASE_URL = value.trim();
                if (key.trim() === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = value.trim();
            }
        });
    }
} catch (e) {
    console.error("Could not read .env file");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectMenu() {
    console.log("Fetching Menu Items...");
    const { data, error } = await supabase.from('menu_items').select('*');
    if (error) console.error(error);
    else console.log(JSON.stringify(data, null, 2));
}

inspectMenu();
