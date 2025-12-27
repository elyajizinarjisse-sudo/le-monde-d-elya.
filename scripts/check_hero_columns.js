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
const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function checkColumns() {
    console.log('--- Checking Hero Table Columns ---');

    // Fetch one row
    const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else if (data && data.length > 0) {
        const row = data[0];
        console.log('Existing Keys:', Object.keys(row));

        const hasOverlay = 'overlay_position' in row && 'show_overlay' in row;
        console.log('Has Overlay Columns:', hasOverlay);
    } else {
        console.log('Table exists but is empty.');
    }
    console.log('--- End Check ---');
}

checkColumns();
