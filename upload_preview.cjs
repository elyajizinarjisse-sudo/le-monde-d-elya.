
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadTemplate() {
    console.log("--- Uploading Preview Template ---");

    const fileContent = fs.readFileSync('preview_template.png');
    const fileName = 'casquette_preview_template.png';

    // 1. Upload
    const { data, error } = await supabase.storage
        .from('product-images')
        .upload(`public/${fileName}`, fileContent, {
            contentType: 'image/png',
            upsert: true
        });

    if (error) {
        console.error("Upload Error:", error);
        return;
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(`public/${fileName}`);

    console.log("Template URL:", publicUrl);
}

uploadTemplate();
