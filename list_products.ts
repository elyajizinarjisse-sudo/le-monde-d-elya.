
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envConfig = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf-8');
const env: Record<string, string> = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function listProducts() {
    const { data, error } = await supabase.from('products').select('id, title, image');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Products:', data);
}

listProducts();
