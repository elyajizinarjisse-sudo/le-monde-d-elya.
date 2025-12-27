import { createClient } from '@supabase/supabase-js';

// These environment variables will be provided by the user after creating the project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase credentials missing! The backend will not function correctly.');
}

// Helper to check if string is a valid URL
const isValidUrl = (urlString: string) => {
    try {
        return Boolean(new URL(urlString));
    } catch {
        return false;
    }
}

const url = supabaseUrl && isValidUrl(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient(url, key);
