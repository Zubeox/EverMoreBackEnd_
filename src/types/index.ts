export interface Gallery {
  id: string;
  title: string;
  subtitle: string | null;
  event_date: string | null;
  cover_image: string | null;
  images: string[];
  created_at: string;
}

export interface Contact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  created_at?: string;
}

export interface Partner {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  category: string;
  description?: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  featured?: boolean;
  display_order?: number;
  is_active?: boolean;
}

export interface PartnershipInquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone?: string;
  company_name: string;
  company_category: string;
  website?: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface ClientGallery {
  id: string;
  created_at: string;
  updated_at: string;
  client_email: string;
  client_name?: string;
  bride_name: string;
  groom_name: string;
  wedding_date?: string;
  gallery_slug: string;
  access_password: string;
  access_code: string;
  cover_image?: string;
  images: string[];
  expiration_date: string;
  status?: 'active' | 'expired' | 'archived' | 'draft';
  last_accessed_at?: string;
  view_count?: number;
  allow_downloads?: boolean;
  welcome_message?: string;
  admin_notes?: string;
}

export interface ClientImage {
  id: string;
  gallery_id: string;
  image_url: string;
  thumbnail_url: string | null;
  title: string | null;
  order_index: number;
  created_at: string;
}

export interface ClientGalleryAnalytics {
  id: string;
  gallery_id: string;
  client_email?: string;
  viewed_at: string;
  ip_address?: string;
  user_agent?: string;
  session_duration?: number;
}

export interface ClientGalleryDownload {
  id: string;
  gallery_id: string;
  image_public_id?: string;
  downloaded_at: string;
  download_type?: 'single' | 'zip_all' | 'zip_favorites';
  client_email?: string;
  image_count?: number;
}

export interface ClientGalleryFavorite {
  id: string;
  gallery_id: string;
  image_public_id: string;
  favorited_at: string;
  client_email?: string;
}

export interface GallerySession {
  gallery_id: string;
  gallery_slug?: string;
  client_email?: string;
  code: string;
  accessed_at: string;
  expires_at: string;
}

export interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  url: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at?: string;
}

export interface UploadResult {
  success: boolean;
  data?: CloudinaryImage;
  error?: string;
}

export interface ClientGalleryStats {
  totalViews: number;
  uniqueVisitors: number;
  totalDownloads: number;
  totalFavorites: number;
  lastAccessed: string | null;
  daysUntilExpiration: number;
}

export interface ProcessingResult {
  file: File;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
}
