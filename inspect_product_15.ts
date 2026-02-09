
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parsing
const envPath = path.resolve(process.cwd(), '.env');
const envVars: any = {};
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const [key, val] = line.split('=');
        if (key && val) envVars[key.trim()] = val.trim();
    });
}

const supabaseUrl = envVars.VITE_SUPABASE_URL || 'https://dmrdmzjswllpcibmdwfy.supabase.co';
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Fetching Product 15...");
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', '15');

    if (error) {
        console.error(error);
        return;
    }

    if (data && data.length > 0) {
        const p = data[0];
        console.log("Images for Product 15:");
        const images = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;

        images.forEach((img: any, i: number) => {
            const url = typeof img === 'string' ? img : img.url;
            const alt = typeof img === 'string' ? 'N/A' : img.alt;
            console.log(`[${i}] URL: ${url}`);
            console.log(`    ALT: ${alt}`);
        });
    } else {
        console.log("Product not found");
    }
}

check();
