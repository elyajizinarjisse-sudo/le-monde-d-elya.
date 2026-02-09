import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectMenu() {
    const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('display_order', { ascending: true });

    if (error) {
        console.error('Error fetching menu items:', error);
        return;
    }

    console.log('Menu Items:');
    console.table(data);
}

inspectMenu();
