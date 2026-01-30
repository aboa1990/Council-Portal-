
import { createClient } from '@supabase/supabase-js';

// Safely access process.env properties via the Vite define replacement
const getEnv = (key: string) => {
  try {
    return (process.env as any)[key] || '';
  } catch (e) {
    return '';
  }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY');
const TABLE_NAME = 'council_portal_state';

/**
 * Checks if Supabase is configured in the environment.
 */
export const isSupabaseConfigured = (): boolean => {
  return !!(SUPABASE_URL && SUPABASE_KEY);
};

// Initialize Supabase Client
const supabase = isSupabaseConfigured() 
  ? createClient(SUPABASE_URL, SUPABASE_KEY) 
  : null;

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
      if (error.code !== 'PGRST116') { // Ignore "Row not found" errors
        console.error('Supabase Fetch Error:', error);
      }
      return null;
    }

    return data?.data || null;
  } catch (error) {
    console.error('Supabase Service Error:', error);
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
      console.error('Supabase Save Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Supabase Service Error:', error);
    return false;
  }
};
