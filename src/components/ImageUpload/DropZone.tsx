import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, X, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import { CloudinaryService } from '../../services/cloudinaryService';
import { ImageProcessor, ProcessingResult } from '../../utils/imageProcessor';
import { CloudinaryImage } from '../../types';

interface DropZoneProps {
  onUploadComplete: (images: CloudinaryImage[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'processing' | 'uploading' | 'completed' | 'error';
  result?: CloudinaryImage;
  error?: string;
  processingResult?: ProcessingResult;
}

export const DropZone: React.FC<DropZoneProps> = ({ onUploadComplete }) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const cloudinaryService = CloudinaryService.getInstance();
  const imageProcessor = ImageProcessor.getInstance();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'processing' as const,
    }));

    setUploadingFiles(newFiles);

    const uploadPromises = newFiles.map(async (uploadingFile, index) => {
      try {
        // Step 1: Process the image
        setUploadingFiles(prev => prev.map((item, idx) => 
          idx === index 
            ? { ...item, status: 'processing', progress: 25 }
            : item
        ));

        const processingResult = await imageProcessor.processImage(uploadingFile.file, {
          maxSizeBytes: 10 * 1024 * 1024, // 10MB
          maxWidth: 4000,
          maxHeight: 4000,
          quality: 0.9,
          format: 'jpeg'
        });

        // Step 2: Update status to uploading
        setUploadingFiles(prev => prev.map((item, idx) => 
          idx === index 
            ? { 
                ...item, 
                status: 'uploading', 
                progress: 50,
                processingResult 
              }
            : item
        ));

        // Step 3: Upload to Cloudinary
        const result = await cloudinaryService.uploadImage(processingResult.file);
        
        setUploadingFiles(prev => prev.map((item, idx) => 
          idx === index 
            ? { 
                ...item, 
                progress: 100, 
                status: result.success ? 'completed' : 'error',
                result: result.data,
                error: result.error 
              }
            : item
        ));

        return result.data;
      } catch (error) {
        setUploadingFiles(prev => prev.map((item, idx) => 
          idx === index 
            ? { 
                ...item, 
                status: 'error', 
                error: 'Upload failed' 
              }
            : item
        ));
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(Boolean) as CloudinaryImage[];
    
    if (successfulUploads.length > 0) {
      onUploadComplete(successfulUploads);
    }

    // Clear completed uploads after 3 seconds
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);
  }, [cloudinaryService, imageProcessor, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB - increased to allow larger files for processing
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-3 border-dashed rounded-boho p-8 text-center cursor-pointer transition-all duration-300 boho-card ${
          isDragActive
            ? 'border-boho-sage bg-boho-sage bg-opacity-20 transform scale-105'
            : 'border-boho-brown border-opacity-40 hover:border-boho-sage hover:bg-boho-sage hover:bg-opacity-10'
        }`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-3 transition-all duration-300 ${
            isDragActive 
              ? 'bg-boho-sage border-boho-sage text-boho-cream' 
              : 'bg-boho-warm bg-opacity-30 border-boho-brown border-opacity-30 text-boho-brown'
          }`}>
            <Upload className="w-10 h-10" />
          </div>
          
          <div>
            <p className="text-xl font-semibold text-boho-brown boho-heading">
              {isDragActive ? 'Пуснете изображенията тук' : 'Качване на изображения'}
            </p>
            <p className="text-boho-rust mt-2 font-boho">
              Плъзнете и пуснете изображения тук или кликнете за избор на файлове
            </p>
            <p className="text-sm text-boho-brown text-opacity-70 mt-3 font-boho">
              Поддържа: JPEG, PNG, GIF, WebP (макс. 100MB всеки) - автоматично оптимизиране до 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-boho-brown boho-heading">Обработка и качване на файлове</h3>
          
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="boho-card rounded-boho p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`w-12 h-12 rounded-boho flex items-center justify-center border border-boho-brown border-opacity-20 ${
                    uploadingFile.status === 'processing' 
                      ? 'bg-boho-sage bg-opacity-30' 
                      : 'bg-boho-warm bg-opacity-30'
                  }`}>
                    {uploadingFile.status === 'processing' ? (
                      <Zap className="w-6 h-6 text-boho-sage animate-pulse" />
                    ) : (
                      <Image className="w-6 h-6 text-boho-brown" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-boho-brown truncate font-boho">
                      {uploadingFile.file.name}
                    </p>
                    <div className="text-xs text-boho-rust space-y-1">
                      <p>Оригинал: {ImageProcessor.formatFileSize(uploadingFile.file.size)}</p>
                      {uploadingFile.processingResult && (
                        <p className="text-boho-sage">
                          Оптимизиран: {ImageProcessor.formatFileSize(uploadingFile.processingResult.processedSize)} 
                          ({Math.round((1 - uploadingFile.processingResult.compressionRatio) * 100)}% намаление)
                        </p>
                      )}
                    </div>
                    
                    {(uploadingFile.status === 'processing' || uploadingFile.status === 'uploading') && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-boho-brown mb-1">
                          <span>
                            {uploadingFile.status === 'processing' ? 'Обработка...' : 'Качване...'}
                          </span>
                          <span>{uploadingFile.progress}%</span>
                        </div>
                        <div className="w-full bg-boho-warm bg-opacity-30 rounded-full h-3 border border-boho-brown border-opacity-20">
                          <div 
                            className={`h-3 rounded-full transition-all duration-300 ${
                              uploadingFile.status === 'processing'
                                ? 'bg-gradient-to-r from-boho-sage to-boho-dusty'
                                : 'bg-gradient-to-r from-boho-terracotta to-boho-rust'
                            }`}
                            style={{ width: `${uploadingFile.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    
                    {uploadingFile.status === 'error' && (
                      <p className="text-xs text-boho-terracotta mt-1 font-boho">
                        {uploadingFile.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'completed' && (
                    <CheckCircle className="w-5 h-5 text-boho-sage" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-boho-terracotta" />
                  )}
                  
                  <button
                    onClick={() => removeUploadingFile(index)}
                    className="p-1 text-boho-brown text-opacity-60 hover:text-boho-terracotta rounded-boho transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};