
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let SUPABASE_URL = '', SUPABASE_KEY = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key.trim() === 'VITE_SUPABASE_URL') SUPABASE_URL = value.trim();
        if (key.trim() === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = value.trim();
    });
} catch (e) { }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
    const { data, error } = await supabase
        .from('products')
        .select('id, title, customization_options')
        .eq('id', 10)
        .single();

    if (error) console.error(error);
    else console.log(JSON.stringify(data.customization_options, null, 2));
}
check();
