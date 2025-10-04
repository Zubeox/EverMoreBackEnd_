// src/services/clientGalleryService.ts
// Handles admin and client gallery CRUD, analytics, and authentication flows.

import { supabaseAdmin } from '../lib/supabaseClient';
import {
  ClientGallery,
  ClientGalleryAnalytics,
  ClientGalleryDownload,
  ClientGalleryFavorite,
  ClientGalleryStats
} from '../types';

// ============================
// CRUD OPERATIONS
// ============================

export async function getClientGalleries(): Promise<ClientGallery[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('client_galleries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(gallery => ({
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
    const { data, error } = await supabaseAdmin
      .from('client_galleries')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching client gallery:', error);
    return null;
  }
}

export async function getClientGalleryBySlug(slug: string): Promise<ClientGallery | null> {
  try {
    const { data, error } = await supabaseAdmin
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
  console.log('📝 Gallery data received:', gallery);
  console.log('📝 access_password value:', gallery.access_password);
  
  // Ensure access_password exists
  const galleryData = {
    ...gallery,
    access_password: gallery.access_password || generateRandomPassword()
  };
  
  const { data, error } = await supabaseAdmin
    .from('client_galleries')
    .insert(galleryData)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function updateClientGallery(
  id: string,
  updates: Partial<ClientGallery>
): Promise<ClientGallery> {
  const { data, error } = await supabaseAdmin
    .from('client_galleries')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function deleteClientGallery(id: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('client_galleries')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============================
// UTILITY GENERATORS
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
    let query = supabaseAdmin
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

    await incrementGalleryViews(gallery.id);
    return { success: true, gallery };
  } catch (err: any) {
    console.error('Error authenticating client:', err);
    return { success: false, error: err.message || 'Authentication failed' };
  }
}

async function incrementGalleryViews(galleryId: string): Promise<void> {
  try {
    const { data: currentGallery, error: fetchError } = await supabaseAdmin
      .from('client_galleries')
      .select('view_count')
      .eq('id', galleryId)
      .single();

    if (fetchError) throw fetchError;

    if (currentGallery) {
      await supabaseAdmin
        .from('client_galleries')
        .update({
          view_count: (currentGallery.view_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', galleryId);
    }
  } catch (error) {
    console.error('Error incrementing gallery views:', error);
  }
}

// ============================
// ANALYTICS / STATS
// ============================

export async function getGalleryStats(galleryId: string): Promise<ClientGalleryStats> {
  try {
    const gallery = await getClientGalleryById(galleryId);
    if (!gallery) throw new Error("Gallery not found");

    const { count: uniqueVisitors } = await supabaseAdmin
      .from('client_gallery_analytics')
      .select('client_email', { count: 'exact', head: true })
      .eq('gallery_id', galleryId);

    const { count: totalDownloads } = await supabaseAdmin
      .from('client_gallery_downloads')
      .select('*', { count: 'exact', head: true })
      .eq('gallery_id', galleryId);

    const { count: totalFavorites } = await supabaseAdmin
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