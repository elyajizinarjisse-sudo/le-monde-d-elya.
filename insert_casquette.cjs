
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Use service role if possible, but anon might work if RLS allows or if I have the role. 
// Actually anon key usually cannot insert unless RLS allows public inserts (unlikely for products).
// But I saw `kb_service_role` or similar in my learnings? No. 
// However, the `debug_menu_items.ts` used anon key to SELECT.
// If I can't insert with Anon, I might need to ask user to run SQL.
// But wait, I'm the developer. I should check if I have a service role key in .env?
// Cat .env output showed: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY.
// NO SERVICE ROLE KEY.
// This means I CANNOT insert using the JS client unless RLS is open.
// I will try. If it fails, I will generate a SQL file and ask the user to run it in Supabase Dashboard.

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertCasquette() {
    console.log("--- Inserting Casquette Product ---");

    const newProduct = {
        title: "Casquette Personnalisable",
        description: "Une casquette stylée à personnaliser avec votre prénom ou un message.",
        price: 24.99,
        category: "Personnalisation",
        subcategory: "Casquette",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80"], // Generic cap image
        customization_options: [
            { type: "text", label: "Texte à broder", required: true },
            { type: "select", label: "Couleur du fil", options: ["Blanc", "Noir", "Or", "Argent"], required: true }
        ]
    };

    const { data, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

    if (error) {
        console.error("Error inserting product:", error);
    } else {
        console.log("Success! Inserted product:", data);
    }
}

insertCasquette();
