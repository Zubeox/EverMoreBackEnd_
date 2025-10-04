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
  name: string;
  category: string;
  logo_url: string;
  website: string;
  description?: string;
}

export interface ClientGallery {
  id: string;
  client_email: string;
  bride_name: string;
  groom_name: string;
  wedding_date: string;
  gallery_slug: string;
  access_code: string;
  cover_image: string;
  images: string[];
  expiration_date: string;
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

export interface ClientImage {
  id: string;
  gallery_id: string;
  image_url: string;
  thumbnail_url: string | null;
  title: string | null;
  order_index: number;
  created_at: string;
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