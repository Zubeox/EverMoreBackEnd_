// src/services/partnerService.ts
import { supabaseClient } from '../lib/supabaseClient';
import { Partner, PartnershipInquiry } from '../types';

export async function getAllPartners(): Promise<Partner[]> {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching partners:', error);
    return [];
  }
}

export async function getFeaturedPartners(): Promise<Partner[]> {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .eq('featured', true)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured partners:', error);
    return [];
  }
}

export async function getPartnersByCategory(category: string): Promise<Partner[]> {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .eq('category', category)
      .order('display_order', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching partners by category:', error);
    return [];
  }
}

export async function getPartner(id: string): Promise<Partner | null> {
  try {
    const { data, error } = await supabaseClient
      .from('partners')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching partner:', error);
    return null;
  }
}

export async function createPartner(partner: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
  const { data, error } = await supabaseClient
    .from('partners')
    .insert(partner)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  const { data, error } = await supabaseClient
    .from('partners')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deletePartner(id: string): Promise<void> {
  const { error } = await supabaseClient
    .from('partners')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function submitPartnershipInquiry(
  inquiry: Omit<PartnershipInquiry, 'id' | 'created_at' | 'status' | 'notes'>
): Promise<PartnershipInquiry> {
  const { data, error } = await supabaseClient
    .from('partnership_inquiries')
    .insert(inquiry)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAllInquiries(): Promise<PartnershipInquiry[]> {
  try {
    const { data, error } = await supabaseClient
      .from('partnership_inquiries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return [];
  }
}

export async function updateInquiryStatus(
  id: string,
  status: 'pending' | 'approved' | 'rejected',
  notes?: string
): Promise<PartnershipInquiry> {
  const { data, error } = await supabaseClient
    .from('partnership_inquiries')
    .update({ status, notes })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}