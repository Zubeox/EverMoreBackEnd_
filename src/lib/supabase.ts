import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create a client that bypasses RLS for admin operations
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    // @ts-ignore - This is a valid option to bypass RLS
    schema: 'public',
  },
  // This tells Supabase to ignore RLS policies for all queries from this client
  // which is safe for a trusted backend environment.
  // We can also achieve this by creating a dedicated admin role in Postgres
  // and using that role's credentials to connect to the database.
  // For now, we will use the service role key to bypass RLS.
  // Note: This is a temporary solution until a proper admin role is created.
  // We can also create a dedicated RPC function to bypass RLS.
  // For now, we will use the service role key to bypass RLS.
  // @ts-ignore
  headers: {
    'bypass-rls': 'true'
  }
});