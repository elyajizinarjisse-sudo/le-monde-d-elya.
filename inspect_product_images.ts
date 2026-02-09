import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env['VITE_SUPABASE_URL'] || '';
const supabaseKey = env['VITE_SUPABASE_ANON_KEY'] || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', 15)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    console.log(`Product: ${product.title}`);
    console.log('Main Image:', product.image);
    console.log('Gallery Images:', product.images);
}

inspect();
