const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(__dirname, '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const env = {};
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) env[key.trim()] = value.trim();
    });

    const supabaseUrl = env['VITE_SUPABASE_URL'];
    const supabaseKey = env['VITE_SUPABASE_ANON_KEY'];

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase credentials in .env');
        process.exit(1);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    async function inspectProduct() {
        console.log("Fetching Product 21...");

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', 21)
            .single();

        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Product Data:", {
                id: data.id,
                title: data.title,
                category: data.category,
                subcategory: data.subcategory,
                variants: data.variants,
                customization_options: data.customization_options
            });
        }
    }

    inspectProduct();

} catch (err) {
    console.error('Script error:', err);
}
