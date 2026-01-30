
import { createClient } from '@supabase/supabase-js';

// Robustly get env vars from either process.env (Vite define) or import.meta.env (Vite native)
const getEnv = (key: string) => {
  let val = '';
  
  // 1. Try process.env
  try {
    if (typeof process !== 'undefined' && (process.env as any)[key]) {
      val = (process.env as any)[key];
    }
  } catch (e) {
    // Ignore error
  }

  // 2. Try import.meta.env if not found
  if (!val) {
    try {
      // @ts-ignore
      if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        val = import.meta.env[key];
      }
    } catch (e) {
      // Ignore error
    }
  }
  
  return val || '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const TABLE_NAME = 'council_portal_state';

/**
 * Checks if Supabase is configured in the environment.
 * Now specifically checks if the user has left the placeholder values.
 */
export const isSupabaseConfigured = (): boolean => {
  // 1. Check for missing keys
  if (!SUPABASE_URL || !SUPABASE_KEY) return false;
  
  // 2. Check for placeholder values left by user
  if (SUPABASE_URL.includes('your_supabase_project_url') || SUPABASE_KEY.includes('your_supabase_anon_key')) {
    console.warn('Supabase keys are placeholders. Please update .env with real credentials.');
    return false;
  }

  return true;
};

// Initialize Supabase Client
const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

/**
 * Test the connection to Supabase
 */
export const testConnection = async (): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured() || !supabase) {
        return { success: false, message: 'Configuration Invalid: Please update .env file with real keys.' };
    }

    try {
        // Perform a lightweight check (HEAD request)
        const { count, error } = await supabase
            .from(TABLE_NAME)
            .select('*', { count: 'exact', head: true });
            
        if (error) {
            // Check specifically for table not found error, which means connection is good but SQL script hasn't been run
            if (error.code === '42P01') {
                return { success: false, message: 'Connected, but table "council_portal_state" does not exist. Please run the SQL setup script.' };
            }
            return { success: false, message: `Connection Error: ${error.message}` };
        }
        return { success: true, message: 'Connection Successful! Supabase is ready.' };
    } catch (e: any) {
        return { success: false, message: `Network/Client Error: ${e.message}` };
    }
}

/**
 * Fetches the portal state from Supabase.
 */
export const fetchPortalState = async (councilName: string): Promise<any | null> => {
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('council_name', councilName)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') { // Ignore "Row not found" errors (just means new council)
        console.error('Supabase Fetch Error:', error.message);
      }
      return null;
    }

    return data?.data || null;
  } catch (error) {
    console.error('Supabase Service Exception:', error);
    return null;
  }
};

/**
 * Upserts the portal state into Supabase.
 */
export const savePortalState = async (councilName: string, data: any): Promise<boolean> => {
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        { 
          council_name: councilName, 
          data: data, 
          last_updated: new Date().toISOString() 
        },
        { onConflict: 'council_name' }
      );

    if (error) {
      console.error('Supabase Save Error:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase Service Exception:', error);
    return false;
  }
};
