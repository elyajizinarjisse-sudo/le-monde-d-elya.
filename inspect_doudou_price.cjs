
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

async function checkPrice() {
    const { data } = await supabase.from('products').select('*').eq('id', 10).single();
    if (data) {
        console.log("Title:", data.title);
        console.log("Base Price:", data.price);
        console.log("Variants:", JSON.stringify(data.variants, null, 2));
    }
}
checkPrice();
