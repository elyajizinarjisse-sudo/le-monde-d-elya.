
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually read .env
const envPath = path.resolve(__dirname, '.env');
let SUPABASE_URL = '';
let SUPABASE_KEY = '';

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf8');
        envContent.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                if (key.trim() === 'VITE_SUPABASE_URL') SUPABASE_URL = value.trim();
                if (key.trim() === 'VITE_SUPABASE_ANON_KEY') SUPABASE_KEY = value.trim();
            }
        });
    }
} catch (e) {
    console.error("Could not read .env file");
}

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing ENV vars.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function updateProduct() {
    console.log("Updating Product 14 with customizations...");

    const customizationOptions = [
        {
            id: "c1",
            type: "text",
            label: "Prénom à inscrire",
            required: true,
            options: []
        },
        {
            id: "c2",
            type: "file",
            label: "Votre Photo",
            required: false,
            options: []
        },
        {
            id: "c3",
            type: "select",
            label: "Couleur du texte",
            required: true,
            options: ["Noir", "Bleu Marine", "Rose", "Doré"]
        }
    ];

    const { data, error } = await supabase
        .from('products')
        .update({ customization_options: customizationOptions })
        .eq('id', 14)
        .select();

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("SUCCESS! Product updated:");
        console.log(JSON.stringify(data[0].customization_options, null, 2));
    }
}

updateProduct();
