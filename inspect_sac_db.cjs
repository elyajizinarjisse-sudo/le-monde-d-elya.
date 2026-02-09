const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data: menu, error: menuErr } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

    if (menuErr) console.error('Menu Error:', menuErr);
    else {
        console.log('--- Menu Items ---');
        console.table(menu.map(m => ({ id: m.id, parent: m.parent_id, label: m.label, path: m.path })));
    }

    const { data: products, error: prodErr } = await supabase
        .from('products')
        .select('id, title, category, subcategory, customization_options, technical_views')
        .or('category.ilike.%sac%,subcategory.ilike.%sac%');

    if (prodErr) console.error('Products Error:', prodErr);
    else {
        console.log('--- Products (Sac) ---');
        products.forEach(p => {
            console.log(`\n[${p.id}] ${p.title}`);
            console.log(`Category: ${p.category}, Subcategory: ${p.subcategory}`);
            console.log('Customization Options:', JSON.stringify(p.customization_options, null, 2));
            console.log('Technical Views:', JSON.stringify(p.technical_views, null, 2));
        });
    }
}

inspect();
