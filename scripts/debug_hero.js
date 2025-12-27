import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parsing
function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env');
        const envFile = fs.readFileSync(envPath, 'utf8');
        const envVars = {};
        envFile.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
        return envVars;
    } catch (error) {
        console.error("Could not load .env file", error);
        return {};
    }
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.VITE_SUPABASE_ANON_KEY; // Using anon key to test public access too

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugHero() {
    console.log('--- Debugging Hero Content ---');

    // 1. Fetch Request
    const { data, error } = await supabase
        .from('hero_content')
        .select('*');

    if (error) {
        console.error('Error fetching hero_content:', error);
    } else {
        console.log(`Found ${data.length} rows in hero_content:`);
        console.log(JSON.stringify(data, null, 2));
    }

    console.log('--- End Debug ---');
}

debugHero();
