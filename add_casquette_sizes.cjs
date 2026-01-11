
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function addSizesToCasquette() {
    console.log("--- Adding Sizes to Casquette (ID 15) ---");

    // 1. Fetch current product
    const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('id', 15)
        .single();

    if (fetchError || !product) {
        console.error("Error fetching product:", fetchError);
        return;
    }

    const currentVariants = product.variants || [];
    console.log("Current Variants:", currentVariants.length);

    // 2. Define Sizes
    const sizes = ["S/M", "L/XL"];
    const newVariants = [];

    // 3. Generate new variants (multiply existing by sizes)
    // If no variants exist, we create generic ones based on standard colors? 
    // But previously we saw "Aucune variante configurée" was fixed. Assuming there ARE variants now or we need to recreate them.
    // If the user fixed it via Admin, they exist. If not, I'll create generic ones.

    if (currentVariants.length === 0) {
        // Create defaults if empty
        const defaultColors = [
            { name: "Noir", image: "" },
            { name: "Blanc", image: "" },
            { name: "Rose", image: "" },
            { name: "Bleu Marine", image: "" }
        ];

        defaultColors.forEach(color => {
            sizes.forEach(size => {
                newVariants.push({
                    name: `${color.name} (${size})`,
                    price: product.price,
                    image: color.image // Keep empty or inherit
                });
            });
        });
    } else {
        // Explode existing
        currentVariants.forEach(variant => {
            // Check if it already has a size in the name to avoid double adding
            if (variant.name.includes("(")) {
                newVariants.push(variant); // Keep as is if already sized
            } else {
                sizes.forEach(size => {
                    newVariants.push({
                        ...variant,
                        name: `${variant.name} (${size})`,
                        // Keep same price and image
                    });
                });
            }
        });
    }

    console.log(`Generated ${newVariants.length} new variants.`);

    // 4. Update Product
    const { error: updateError } = await supabase
        .from('products')
        .update({ variants: newVariants })
        .eq('id', 15);

    if (updateError) console.error("Error updating variants:", updateError);
    else console.log("Success! Variants updated with sizes.");
}

addSizesToCasquette();
