
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixCasquetteMenu() {
    console.log("--- Fixing 'Casquette' Menu Link ---");

    // 1. Find the incorrect menu item
    const { data: items, error: findError } = await supabase
        .from('menu_items')
        .select('*')
        .ilike('label', 'casquette');

    if (findError) {
        console.error("Error finding menu item:", findError);
        return;
    }

    // Direct target by ID since we confirmed it's ID 80
    const casquetteItem = items.find(i => i.id === 80);

    if (!casquetteItem) {
        console.log("No incorrect 'casquette' menu item found. Attempting to list all matches:");
        items.forEach(i => console.log(`- ID: ${i.id}, Label: ${i.label}, Path: ${i.path}`));
        return;
    }

    console.log(`Found incorrect item: [${casquetteItem.id}] ${casquetteItem.label} -> ${casquetteItem.path}`);

    // 2. Update the path
    const newPath = '/categorie/personnalisation/casquette';
    // Note: Using 'personnalisation' as category and 'casquette' as subcategory based on product insertion.
    // URL structure: /categorie/:categorySlug/:subcategorySlug

    const { data: updated, error: updateError } = await supabase
        .from('menu_items')
        .update({ path: newPath })
        .eq('id', casquetteItem.id)
        .select();

    if (updateError) {
        console.error("Error updating menu item:", updateError);
    } else {
        console.log(`Successfully updated item [${updated[0].id}] path to: ${updated[0].path}`);
    }
}

fixCasquetteMenu();
