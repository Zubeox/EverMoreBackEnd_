import { supabaseClient } from '../lib/supabaseClient';
import { ClientImage } from '../types';

export async function getGalleryImages(galleryId: string): Promise<ClientImage[]> {
  try {
    const { data, error } = await supabaseClient
      .from('client_images')
      .select('*')
      .eq('gallery_id', galleryId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

export async function createImage(image: Omit<ClientImage, 'id' | 'created_at'>): Promise<ClientImage> {
  const { data, error } = await supabaseClient
    .from('client_images')
    .insert(image)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateImage(id: string, updates: Partial<ClientImage>): Promise<ClientImage> {
  const { data, error } = await supabaseClient
    .from('client_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteImage(id: string): Promise<void> {
  const { error } = await supabaseClient
    .from('client_images')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function reorderImages(imageIds: string[]): Promise<void> {
  try {
    const updates = imageIds.map((id, index) => ({
      id,
      order_index: index
    }));

    for (const update of updates) {
      await supabaseClient
        .from('client_images')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
  } catch (error) {
    console.error('Error reordering images:', error);
    throw error;
  }
}

export async function getNextOrderIndex(galleryId: string): Promise<number> {
  try {
    const { data, error } = await supabaseClient
      .from('client_images')
      .select('order_index')
      .eq('gallery_id', galleryId)
      .order('order_index', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data ? data.order_index + 1 : 0;
  } catch (error) {
    console.error('Error getting next order index:', error);
    return 0;
  }
}