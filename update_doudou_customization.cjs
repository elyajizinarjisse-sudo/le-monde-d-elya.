
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '.env');
let SUPABASE_URL = '', SUPABASE_KEY = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key.trim() === 'VITE_SUPABASE_URL') SUPABASE_URL = value.trim();
        if (key.trim() === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = value.trim();
    });
} catch (e) { }

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function update() {
    console.log("Adding customization fields to Doudou (ID 10)...");

    const options = [
        {
            "id": "opt_name",
            "type": "text",
            "label": "Prénom à broder",
            "required": true,
            "options": []
        },
        {
            "id": "opt_color",
            "type": "select",
            "label": "Couleur de la broderie",
            "required": true,
            "options": ["Or", "Argent", "Bleu Marin", "Rose Pâle", "Chocolat"]
        },
        {
            "id": "opt_font",
            "type": "select",
            "label": "Police d'écriture",
            "required": true,
            "options": ["Cursif (Elégant)", "Bâton (Moderne)", "Manuscrit"]
        }
    ];

    const { data, error } = await supabase
        .from('products')
        .update({ customization_options: options })
        .eq('id', 10) // Making sure we update the specific "Doudou" product
        .ilike('title', '%doudou%') // Extra safety check
        .select();

    if (error) console.error("Error:", error);
    else console.log("Success! Updated product:", data[0].title);
}

update();
