import { createClient } from "@supabase/supabase-js";

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

console.log("🔍 Backend Supabase Config Check:", {
  url: supabaseUrl ? "✅ Set" : "❌ Missing",
  anonKey: supabaseAnonKey ? "✅ Set" : "❌ Missing",
  serviceKey: supabaseServiceKey ? "✅ Set" : "❌ Missing",
  urlPreview: supabaseUrl?.substring(0, 30) + "..."
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ CRITICAL: Missing Supabase configuration!");
}

// Client for admin authentication (email/password)
export const supabaseClient = createClient(
  supabaseUrl, 
  supabaseAnonKey
);

// Admin client for full database access (bypasses RLS)
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // Fallback to anon if service key missing
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// ============================================
// ADMIN AUTHENTICATION (Email + Password)
// ============================================

export async function adminLogin(email: string, password: string) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error("[Admin Auth] Login error:", error.message);
      throw error;
    }
    
    console.log("✅ Admin logged in:", data.user?.email);
    return data;
  } catch (error: any) {
    console.error("[Admin Auth] Login failed:", error);
    throw new Error(error.message || 'Login failed');
  }
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabaseClient.auth.getSession();
    
    if (error) {
      if (error.message !== "Auth session missing!") {
        console.error("[Auth] Error getting session:", error.message);
      }
      return null;
    }

    return data.session?.user ?? null;
  } catch (err) {
    console.error("[Auth] Unexpected error:", err);
    return null;
  }
}

export async function adminLogout() {
  const { error } = await supabaseClient.auth.signOut();
  if (error) throw error;
  console.log("✅ Admin logged out");
}

// ============================================
// ADMIN DATABASE OPERATIONS
// ============================================

// Galleries
export async function getAllGalleries() {
  const { data, error } = await supabaseAdmin
    .from('galleries')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getGalleryById(id: string) {
  const { data, error } = await supabaseAdmin
    .from('galleries')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createGallery(galleryData: any) {
  const { data, error } = await supabaseAdmin
    .from('galleries')
    .insert(galleryData)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateGallery(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('galleries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteGallery(id: string) {
  const { error } = await supabaseAdmin
    .from('galleries')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

// Access Codes
export async function getAllAccessCodes() {
  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createAccessCode(accessCodeData: {
  code: string;
  email: string;
  customer_name?: string;
  gallery_id: string;
  expires_at?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .insert({
      ...accessCodeData,
      is_active: true
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAccessCode(id: string, updates: any) {
  const { data, error } = await supabaseAdmin
    .from('access_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function deleteAccessCode(id: string) {
  const { error } = await supabaseAdmin
    .from('access_codes')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}