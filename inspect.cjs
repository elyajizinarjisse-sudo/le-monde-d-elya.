
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

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

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing ENV vars. URL:", SUPABASE_URL, "KEY:", SUPABASE_KEY ? "Found" : "Missing");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectProduct() {
    console.log("Fetching Product 14...");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', 14) // String/Int agnostic usually in Supabase
        .single();

    if (error) {
        console.error("Error:", error);
    } else {
        console.log("PRODUCT DATA ID 14:");
        console.log("---------------------------------------------------");
        console.log(JSON.stringify(data, null, 2));
        console.log("---------------------------------------------------");
    }
}

inspectProduct();
