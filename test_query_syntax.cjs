
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

async function testQuery() {
    const label = "Doudou";
    console.log(`Testing query for label: "${label}"`);

    // Mimic the exact logic in CategoryPage.tsx
    // query.or(`category.ilike.%${categoryLabel}%,subcategory.ilike.%${categoryLabel}%`);

    const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`category.ilike.%${label}%,subcategory.ilike.%${label}%`);

    if (error) {
        console.error("Query Error:", error);
    } else {
        console.log(`Found ${data.length} products.`);
        data.forEach(p => console.log(`- ${p.title} (Cat: "${p.category}", Sub: "${p.subcategory}")`));
    }
}
testQuery();
