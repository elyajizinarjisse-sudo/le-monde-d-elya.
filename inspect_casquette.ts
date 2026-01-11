
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectCasquette() {
    console.log("--- Inspecting 'Casquette' Data ---");

    // 1. Search in products table loose match
    const { data: products, error } = await supabase
        .from('products')
        .select('id, name, category, subcategory')
        .or('name.ilike.%casquette%,category.ilike.%casquette%,subcategory.ilike.%casquette%,description.ilike.%casquette%');

    if (error) {
        console.error("Error fetching products:", error);
    } else {
        console.log(`Found ${products?.length} products matching 'casquette' loosely:`);
        products?.forEach(p => console.log(`- [${p.id}] ${p.name} | Cat: ${p.category} | Sub: ${p.subcategory}`));
    }

    // 2. Search in menu_items
    const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('*')
        .ilike('label', '%casquette%');

    if (menuError) {
        console.error("Error fetching menu items:", menuError);
    } else {
        console.log(`\nFound ${menuItems?.length} menu items matching 'casquette' label:`);
        menuItems?.forEach(m => console.log(`- [${m.id}] Label: ${m.label} | Path: ${m.path}`));
    }
}

inspectCasquette();
