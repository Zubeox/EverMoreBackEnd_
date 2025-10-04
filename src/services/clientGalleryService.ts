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