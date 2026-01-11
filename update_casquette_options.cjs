
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function updateCasquetteOptions() {
    console.log("--- Updating 'Casquette Personnalisable' (ID 15) Options ---");

    const options = [
        {
            "id": "opt_text",
            "type": "text",
            "label": "Texte ou Prénom à broder",
            "required": true, // Assuming user wants at least one form of customization, but maybe not strict if image is provided? Let's make text required for now as per "comme pour le doudou"
            "options": []
        },
        {
            "id": "opt_font",
            "type": "select",
            "label": "Police d'écriture",
            "required": true,
            "options": ["Cursif (Elégant)", "Bâton (Moderne)", "Manuscrit"]
        },
        {
            "id": "opt_color",
            "type": "select",
            "label": "Couleur de la broderie",
            "required": true,
            "options": ["Blanc", "Noir", "Or", "Argent", "Rose", "Bleu"]
        },
        {
            "id": "opt_image",
            "type": "file", // This triggers the file upload logic we saw in ProductPage.tsx
            "label": "Votre Logo / Image (Optionnel)",
            "required": false,
            "options": []
        }
    ];

    const { data, error } = await supabase
        .from('products')
        .update({ customization_options: options })
        .eq('id', 15)
        .select();

    if (error) {
        console.error("Error updating product:", error);
    } else {
        console.log(`Successfully updated product [${data[0].id}] '${data[0].title}' with new options.`);
        console.log(JSON.stringify(data[0].customization_options, null, 2));
    }
}

updateCasquetteOptions();
