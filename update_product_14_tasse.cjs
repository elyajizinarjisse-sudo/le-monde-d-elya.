
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let SUPABASE_URL = '', SUPABASE_KEY = '';

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
} catch (e) { }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function update() {
    console.log("Updating Product 14 to Tasse...");
    const { data, error } = await supabase
        .from('products')
        .update({ category: 'Tasse', subcategory: 'Personnalisation' })
        .eq('id', 14)
        .select();
    if (error) console.error(error);
    else console.log("Done:", data[0].category);
}
update();
