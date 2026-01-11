
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixTeeShirt() {
    console.log("--- Fixing 'Tee-shirt' Menu and Product ---");

    // 1. Fix Menu Item Path
    // It was pointing to /categorie/sérigraphie/personnalisation (incorrect)
    const newPath = '/categorie/personnalisation/tee-shirt';
    const { data: menuUpdate, error: menuError } = await supabase
        .from('menu_items')
        .update({ path: newPath })
        .eq('id', 75) // Confirmed ID from previous step
        .select();

    if (menuError) console.error("Error updating menu:", menuError);
    else console.log(`Updated Menu Item [${menuUpdate[0].id}] path to: '${menuUpdate[0].path}'`);

    // 2. Update Product Customization Options
    // Adding standard customization + Image upload
    const customizationOptions = [
        {
            "id": "opt_text",
            "type": "text",
            "label": "Texte ou Prénom à imprimer",
            "required": true,
            "options": []
        },
        {
            "id": "opt_font",
            "type": "select",
            "label": "Police d'écriture",
            "required": true,
            "options": ["Modern Sans", "Classic Serif", "Handwritten", "Bold Impact"]
        },
        // For T-shirt printing, colors might be text color, not embroidery color.
        // Let's call it "Couleur du texte"
        {
            "id": "opt_color",
            "type": "select",
            "label": "Couleur du texte / motif",
            "required": true,
            "options": ["Noir", "Blanc", "Rouge", "Bleu Marine", "Or", "Argent"]
        },
        {
            "id": "opt_image",
            "type": "file",
            "label": "Votre Design / Logo (Optionnel)",
            "required": false,
            "options": []
        }
    ];

    const { data: productUpdate, error: productError } = await supabase
        .from('products')
        .update({ customization_options: customizationOptions })
        .eq('id', 11) // Confirmed ID from previous step
        .select();

    if (productError) console.error("Error updating product:", productError);
    else console.log(`Updated Product [${productUpdate[0].id}] '${productUpdate[0].title}' options.`);

}

fixTeeShirt();
