
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Environmental setup
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function simulateCategoryPage(categorySlug: string, subcategorySlug?: string) {
    console.log(`\n=== Simulating /category/${categorySlug}${subcategorySlug ? '/' + subcategorySlug : ''} ===`);

    let categoryLabel = '';
    let targetSlug = subcategorySlug;
    let products: any[] = [];
    const normalizedSlug = categorySlug?.toLowerCase();

    // --- LOGIC FROM CategoryPage.tsx (patched version) ---

    if (categorySlug && normalizedSlug !== 'soldes') {
        try {
            let categoryFound = false;

            // My Patch: Check !subcategorySlug
            if (!subcategorySlug) {
                console.log("Strategy A/B check (Skipped if subcategory present)");
                // Strategy A: Try exact Label Match first
                const { data: labelData } = await supabase
                    .from('menu_items')
                    .select('label')
                    .ilike('label', categorySlug)
                    .limit(1);

                if (labelData && labelData.length > 0) {
                    categoryLabel = labelData[0].label;
                    targetSlug = undefined;
                    categoryFound = true;
                    console.log(`Strategy A Matched: "${categoryLabel}"`);
                }

                // Strategy B: Try Exact Path Match
                if (!categoryFound) {
                    const { data: pathData } = await supabase
                        .from('menu_items')
                        .select('label')
                        .eq('path', `/category/${categorySlug}`)
                        .limit(1);

                    if (pathData && pathData.length > 0) {
                        categoryLabel = pathData[0].label;
                        targetSlug = undefined;
                        categoryFound = true;
                        console.log(`Strategy B Matched: "${categoryLabel}"`);
                    }
                }
            } else {
                console.log("Skipping Strategy A/B because subcategory exists.");
            }

            // Strategy C: Fallback to Robust Path Search
            if (!categoryFound) {
                console.log("Attempting Strategy C...");
                let menuQuery = supabase.from('menu_items').select('label, path');

                if (subcategorySlug) {
                    // For subcategories, we need the broad match
                    menuQuery = menuQuery.ilike('path', `%${categorySlug}%${subcategorySlug}%`);
                } else {
                    menuQuery = menuQuery.or(`path.ilike.%/${categorySlug},path.ilike.%/${categorySlug}/`);
                }

                const { data: menuData } = await menuQuery.limit(1);

                if (menuData && menuData.length > 0) {
                    categoryLabel = menuData[0].label;
                    targetSlug = undefined; // If a menu item is found, no need for subcategory filtering
                    console.log(`Strategy C Matched: "${categoryLabel}" (Path: ${menuData[0].path})`);
                } else {
                    console.log("Strategy C Failed.");
                    // Final Fallback: Capitalize
                    categoryLabel = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);
                    console.log(`Fallback Label: "${categoryLabel}"`);
                }
            }
        } catch (err: any) {
            console.error("Error in logic: ", err);
        }
    }

    console.log(`Final Category Label: "${categoryLabel}"`);
    console.log(`Final Target Slug: "${targetSlug}"`);

    // Fetch Products
    let query = supabase.from('products').select('id, title, category, subcategory');
    if (categoryLabel) {
        query = query.or(`category.ilike.%${categoryLabel}%,subcategory.ilike.%${categoryLabel}%`);
    }

    const { data } = await query;
    if (data && data.length > 0) {
        let filtered = data;
        if (targetSlug) {
            console.log(`Applying Local Filtering for "${targetSlug}"...`);
            const normalize = (str: string) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, '-') : '';
            filtered = data.filter((p: any) => p.subcategory && normalize(p.subcategory).includes(targetSlug!));
        }
        products = filtered;
    }

    console.log(`\nFound ${products.length} products.`);
    if (products.length > 0) {
        console.log("First 3 products:");
        console.table(products.slice(0, 3));

        // Emulate title logic
        const title = (products.length > 0 && products[0].category
            ? `${products[0].category} ${targetSlug ? '- ' + products[0].subcategory : ''}`
            : "Notre Collection");
        console.log(`\nResulting Page Title: "${title}"`);
    } else {
        console.log("No products found.");
    }
}

// Run Simulation
simulateCategoryPage('personnalisation', 'sac');
