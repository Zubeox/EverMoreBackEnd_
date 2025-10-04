export interface ProcessingOptions {
  maxSizeBytes?: number;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface ProcessingResult {
  file: File;
  originalSize: number;
  processedSize: number;
  compressionRatio: number;
}

export class ImageProcessor {
  private static instance: ImageProcessor;

  static getInstance(): ImageProcessor {
    if (!ImageProcessor.instance) {
      ImageProcessor.instance = new ImageProcessor();
    }
    return ImageProcessor.instance;
  }

  async processImage(
    file: File, 
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const {
      maxSizeBytes = 10 * 1024 * 1024, // 10MB default
      maxWidth = 4000,
      maxHeight = 4000,
      quality = 0.9,
      format = 'jpeg'
    } = options;

    const originalSize = file.size;

    // If file is already smaller than target, return as-is
    if (originalSize <= maxSizeBytes) {
      return {
        file,
        originalSize,
        processedSize: originalSize,
        compressionRatio: 1
      };
    }

    try {
      // Load image
      const image = await this.loadImage(file);
      
      // Calculate optimal dimensions
      const { width, height } = this.calculateOptimalDimensions(
        image.width, 
        image.height, 
        maxWidth, 
        maxHeight
      );

      // Process with iterative compression to hit target size
      const processedFile = await this.compressToTargetSize(
        image,
        width,
        height,
        maxSizeBytes,
        format,
        quality,
        file.name
      );

      return {
        file: processedFile,
        originalSize,
        processedSize: processedFile.size,
        compressionRatio: processedFile.size / originalSize
      };
    } catch (error) {
      console.error('Image processing failed:', error);
      // Return original file if processing fails
      return {
        file,
        originalSize,
        processedSize: originalSize,
        compressionRatio: 1
      };
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  private calculateOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let width = originalWidth;
    let height = originalHeight;
    
    // Scale down if too large
    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }
    
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }
    
    return { width: Math.round(width), height: Math.round(height) };
  }

  private async compressToTargetSize(
    image: HTMLImageElement,
    width: number,
    height: number,
    targetSizeBytes: number,
    format: string,
    initialQuality: number,
    originalName: string
  ): Promise<File> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    canvas.width = width;
    canvas.height = height;
    
    // Draw image with high quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, width, height);

    const mimeType = `image/${format}`;
    let quality = initialQuality;
    let attempts = 0;
    const maxAttempts = 10;

    // Iteratively compress until we hit target size or max attempts
    while (attempts < maxAttempts) {
      const blob = await this.canvasToBlob(canvas, mimeType, quality);
      
      if (blob.size <= targetSizeBytes || quality <= 0.1) {
        // Success or minimum quality reached
        const extension = format === 'jpeg' ? 'jpg' : format;
        const fileName = this.generateFileName(originalName, extension);
        return new File([blob], fileName, { type: mimeType });
      }
      
      // Reduce quality for next attempt
      quality *= 0.8;
      attempts++;
    }

    // If we couldn't hit target size, return the last attempt
    const finalBlob = await this.canvasToBlob(canvas, mimeType, 0.1);
    const extension = format === 'jpeg' ? 'jpg' : format;
    const fileName = this.generateFileName(originalName, extension);
    return new File([finalBlob], fileName, { type: mimeType });
  }

  private canvasToBlob(
    canvas: HTMLCanvasElement, 
    mimeType: string, 
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  private generateFileName(originalName: string, extension: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const timestamp = Date.now();
    return `${nameWithoutExt}_optimized_${timestamp}.${extension}`;
  }

  // Utility method to get file size in human readable format
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}