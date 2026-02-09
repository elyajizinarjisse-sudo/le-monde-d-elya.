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

    async function listCategories() {
        console.log("Fetching menu items...");

        const { data, error } = await supabase
            .from('menu_items')
            .select('label, path, parent_id')
            .order('label');

        if (error) {
            console.error("Error:", error);
        } else {
            console.log("Categories:", data);
            const posterCats = data.filter(c =>
                c.label.toLowerCase().includes('impress') ||
                c.label.toLowerCase().includes('affiche') ||
                c.label.toLowerCase().includes('poster')
            );
            console.log("Potential Poster Categories:", posterCats);
        }
    }

    listCategories();

} catch (err) {
    console.error('Script error:', err);
}
