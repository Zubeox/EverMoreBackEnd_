import React, { useState } from 'react';
import { CloudinaryImage } from '../../types';
import { CloudinaryService } from '../../services/cloudinaryService';
import { Eye, Download, Trash2, CreditCard as Edit, Calendar, HardDrive } from 'lucide-react';

interface ImageGridProps {
  images: CloudinaryImage[];
  onImageDelete?: (publicId: string) => void;
  onImageEdit?: (image: CloudinaryImage) => void;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ 
  images, 
  onImageDelete, 
  onImageEdit 
}) => {
  const [selectedImage, setSelectedImage] = useState<CloudinaryImage | null>(null);
  const cloudinaryService = CloudinaryService.getInstance();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownload = async (image: CloudinaryImage) => {
    const link = document.createElement('a');
    link.href = image.secure_url;
    link.download = `${image.public_id}.${image.format}`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-32 h-32 mx-auto bg-boho-warm bg-opacity-30 rounded-full flex items-center justify-center mb-6 border-3 border-boho-brown border-opacity-20">
          <Eye className="w-16 h-16 text-boho-brown text-opacity-60" />
        </div>
        <h3 className="text-2xl font-semibold text-boho-brown mb-3 boho-heading">Все още няма изображения</h3>
        <p className="text-boho-rust font-boho">Качете някои изображения, за да започнете с вашата галерия.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <div key={image.public_id} className="boho-card rounded-boho overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Image Preview */}
            <div className="aspect-square bg-boho-warm bg-opacity-20 relative overflow-hidden">
              <img
                src={cloudinaryService.getOptimizedUrl(image.public_id, { 
                  width: 300, 
                  height: 300,
                  crop: 'fill',
                  quality: 'auto'
                })}
                alt={image.public_id}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                onClick={() => setSelectedImage(image)}
              />
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-boho-brown bg-opacity-0 hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedImage(image)}
                    className="p-3 bg-boho-cream rounded-boho text-boho-brown hover:bg-boho-warm transition-all duration-200 hover:scale-110"
                    title="Преглед в пълен размер"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(image)}
                    className="p-3 bg-boho-cream rounded-boho text-boho-brown hover:bg-boho-warm transition-all duration-200 hover:scale-110"
                    title="Изтегляне"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {onImageEdit && (
                    <button
                      onClick={() => onImageEdit(image)}
                      className="p-3 bg-boho-sage rounded-boho text-boho-cream hover:bg-boho-dusty transition-all duration-200 hover:scale-110"
                      title="Редактиране"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  {onImageDelete && (
                    <button
                      onClick={() => onImageDelete(image.public_id)}
                      className="p-3 bg-boho-terracotta rounded-boho text-boho-cream hover:bg-red-600 transition-all duration-200 hover:scale-110"
                      title="Изтриване"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Image Details */}
            <div className="p-4">
              <h3 className="font-semibold text-boho-brown truncate mb-3 font-boho">
                {image.public_id.split('/').pop()}
              </h3>
              
              <div className="space-y-2 text-sm text-boho-rust">
                <div className="flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <HardDrive className="w-3 h-3" />
                    <span>{formatFileSize(image.bytes)}</span>
                  </span>
                  <span className="text-xs bg-boho-warm bg-opacity-30 px-3 py-1 rounded-full uppercase font-boho border border-boho-brown border-opacity-20">
                    {image.format}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>{image.width} × {image.height}</span>
                  <span className="flex items-center space-x-1 text-xs">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(image.created_at)}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Size Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-boho-brown bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-full relative">
            <img
              src={selectedImage.secure_url}
              alt={selectedImage.public_id}
              className="max-w-full max-h-full object-contain rounded-boho border-4 border-boho-cream"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-3 bg-boho-cream rounded-boho text-boho-brown hover:bg-boho-warm transition-all duration-200 hover:scale-110"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};