import { CLOUDINARY_CONFIG, CLOUDINARY_API_BASE } from '../config/cloudinary';
import { CloudinaryImage, UploadResult } from '../types';

export class CloudinaryService {
  private static instance: CloudinaryService;

  static getInstance(): CloudinaryService {
    if (!CloudinaryService.instance) {
      CloudinaryService.instance = new CloudinaryService();
    }
    return CloudinaryService.instance;
  }

  async uploadImage(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
      formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);

      const response = await fetch(`${CLOUDINARY_API_BASE}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data: CloudinaryImage = await response.json();
      
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async getImages(maxResults: number = 20): Promise<CloudinaryImage[]> {
    try {
      // For demo purposes, we'll return mock data
      // In production, you'd use Cloudinary's Admin API
      return [];
    } catch (error) {
      console.error('Failed to fetch images:', error);
      return [];
    }
  }

  getOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  } = {}): string {
    const { width, height, crop = 'fill', quality = 'auto' } = options;
    
    let transformation = `q_${quality}`;
    if (width && height) {
      transformation += `,w_${width},h_${height},c_${crop}`;
    } else if (width) {
      transformation += `,w_${width}`;
    } else if (height) {
      transformation += `,h_${height}`;
    }

    return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformation}/${publicId}`;
  }
}