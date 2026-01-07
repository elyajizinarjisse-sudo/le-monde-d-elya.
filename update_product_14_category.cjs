
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

async function updateCategory() {
    console.log("Updating Product 14 category...");

    // Update to match the URL /category/sérigraphie/personnalisation
    // Note: The UI likely treats 'Sérigraphie' as the Category and 'Personnalisation' as the Subcategory

    const { data, error } = await supabase
        .from('products')
        .update({
            category: 'Sérigraphie',
            subcategory: 'Personnalisation'
        })
        .eq('id', 14)
        .select();

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("SUCCESS! Product updated:", data[0].category, "/", data[0].subcategory);
    }
}

updateCategory();
