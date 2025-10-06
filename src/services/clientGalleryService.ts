// src/services/clientGalleryService.ts
import { supabaseClient } from '../lib/supabaseClient'; // Use regular client, not admin
import {
  ClientGallery,
  ClientGalleryStats
} from '../types';

// Get the Edge Function URL
const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/client-galleries`;

// Helper to make authenticated requests to Edge Function
async function callEdgeFunction(path: string = '', options: RequestInit = {}) {
  const { data: { session } } = await supabaseClient.auth.getSession();
  
  const url = path ? `${EDGE_FUNCTION_URL}${path}` : EDGE_FUNCTION_URL;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================
// CRUD OPERATIONS
// ============================

export async function getClientGalleries(): Promise<ClientGallery[]> {
  try {
    const data = await callEdgeFunction();
    return (data || []).map((gallery: any) => ({
      ...gallery,
      images: gallery.images || []
    }));
  } catch (error) {
    console.error('Error fetching client galleries:', error);
    return [];
  }
}

export async function getClientGalleryById(id: string): Promise<ClientGallery | null> {
  try {
    return await callEdgeFunction(`?id=${id}`);
  } catch (error) {
    console.error('Error fetching client gallery:', error);
    return null;
  }
}

export async function getClientGalleryBySlug(slug: string): Promise<ClientGallery | null> {
  try {
    // This one stays with direct Supabase call since it's public data
    const { data, error } = await supabaseClient
      .from('client_galleries')
      .select('*')
      .eq('gallery_slug', slug)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching client gallery by slug:', error);
    return null;
  }
}

export async function createClientGallery(
  gallery: Omit<ClientGallery, 'id' | 'created_at' | 'updated_at' | 'access_code'>
): Promise<ClientGallery> {
  return callEdgeFunction('', {
    method: 'POST',
    body: JSON.stringify(gallery),
  });
}

export async function updateClientGallery(
  id: string,
  updates: Partial<ClientGallery>
): Promise<ClientGallery> {
  return callEdgeFunction(`?id=${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteClientGallery(id: string): Promise<void> {
  await callEdgeFunction(`?id=${id}`, {
    method: 'DELETE',
  });
}

// ============================
// UTILITY GENERATORS (Keep these local)
// ============================

export async function generateUniqueSlug(brideName: string, groomName: string): Promise<string> {
  const baseSlug = `${brideName}-${groomName}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await getClientGalleryBySlug(slug);
    if (!existing) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export function generateRandomPassword(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function generateAccessCode(length: number = 8): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generateClientName(brideName: string, groomName: string): string {
  return `${brideName} & ${groomName}`;
}
// ============================
// CLIENT AUTHENTICATION
// ============================

export async function authenticateClient({
  email,
  slug,
  code,
}: {
  email?: string;
  slug?: string;
  code: string;
}): Promise<{ success: boolean; gallery?: ClientGallery; error?: string }> {
  try {
    let query = supabaseClient
      .from('client_galleries')
      .select('*')
      .eq('status', 'active')
      .gt('expiration_date', new Date().toISOString());

    if (email) {
      query = query.eq('client_email', email.toLowerCase().trim());
    }
    if (slug) {
      query = query.eq('gallery_slug', slug);
    }

    query = query.eq('access_code', code.toUpperCase().trim());

    const { data: gallery, error } = await query.maybeSingle();

    if (error || !gallery) {
      return { success: false, error: 'Invalid credentials or gallery expired' };
    }

    return { success: true, gallery };
  } catch (err: any) {
    console.error('Error authenticating client:', err);
    return { success: false, error: err.message || 'Authentication failed' };
  }
}

// ============================
// ANALYTICS / STATS
// ============================

export async function getGalleryStats(galleryId: string): Promise<ClientGalleryStats> {
  try {
    const gallery = await getClientGalleryById(galleryId);
    if (!gallery) throw new Error("Gallery not found");

    const { count: uniqueVisitors } = await supabaseClient
      .from('client_gallery_analytics')
      .select('client_email', { count: 'exact', head: true })
      .eq('gallery_id', galleryId);

    const { count: totalDownloads } = await supabaseClient
      .from('client_gallery_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId);

    const { count: totalFavorites } = await supabaseClient
      .from('client_gallery_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId);

    const expirationDate = new Date(gallery.expiration_date);
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    return {
      totalViews: gallery.view_count || 0,
      uniqueVisitors: uniqueVisitors || 0,
      totalDownloads: totalDownloads || 0,
      totalFavorites: totalFavorites || 0,
      lastAccessed: gallery.last_accessed_at || null,
      daysUntilExpiration: Math.max(0, daysUntilExpiration)
    };
  } catch (error) {
    console.error('Error fetching gallery stats:', error);
    return {
      totalViews: 0,
      uniqueVisitors: 0,
      totalDownloads: 0,
      totalFavorites: 0,
      lastAccessed: null,
      daysUntilExpiration: 0
    };
  }
}

// ============================
// EXTEND EXPIRATION
// ============================

export async function extendExpiration(galleryId: string, days: number): Promise<ClientGallery> {
  const gallery = await getClientGalleryById(galleryId);
  if (!gallery) throw new Error('Gallery not found');

  const currentExpiration = new Date(gallery.expiration_date);
  const newExpiration = new Date(currentExpiration.getTime() + days * 24 * 60 * 60 * 1000);

  return updateClientGallery(galleryId, {
    expiration_date: newExpiration.toISOString()
  });
}