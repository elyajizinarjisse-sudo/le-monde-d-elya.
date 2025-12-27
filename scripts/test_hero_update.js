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

async function testUpdate() {
    console.log('--- Testing Hero Update ---');

    const testTitle = "Updated via Script " + Date.now();

    // Try to update row 1
    const { data, error, count } = await supabase
        .from('hero_content')
        .update({ title: testTitle })
        .eq('id', 1)
        .select();

    if (error) {
        console.error('Update Error:', error);
    } else {
        console.log('Update Success!');
        console.log('Returned Data:', data);
        // data will be empty array if RLS filtered it out even if no error
        if (data.length === 0) {
            console.warn("WARNING: Update succeeded but returned 0 rows. Likely RLS issue or ID not found.");
        } else {
            console.log("Row updated successfully.");
        }
    }
    console.log('--- End Test ---');
}

testUpdate();
