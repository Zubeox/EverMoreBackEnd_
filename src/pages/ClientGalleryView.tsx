import { useState, useEffect } from 'react';
import { Download, Heart, LogOut, Calendar, Clock, Image as ImageIcon, Grid2x2 as Grid, List } from 'lucide-react';
import { getGalleryImages } from '../services/clientImageService';

interface ClientGalleryViewProps {
  gallery: any;
  onLogout: () => void;
}

export const ClientGalleryView: React.FC<ClientGalleryViewProps> = ({ gallery, onLogout }) => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadImages();
  }, [gallery.id]);

  const loadImages = async () => {
    setLoading(true);
    try {
      const data = await getGalleryImages(gallery.id);
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadAll = () => {
    alert('Функцията за изтегляне на всички снимки ще бъде активирана скоро!');
  };

  const handleImageClick = (image: any) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const daysUntilExpiration = Math.ceil(
    (new Date(gallery.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern">
      <header className="bg-gradient-to-r from-boho-brown to-boho-rust text-boho-cream border-b-2 border-boho-brown border-opacity-30 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold boho-heading flex items-center space-x-3">
                <Heart className="w-8 h-8 fill-current" />
                <span>{gallery.bride_name} & {gallery.groom_name}</span>
              </h1>
              <div className="flex items-center space-x-6 mt-3 text-boho-warm font-boho">
                {gallery.wedding_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(gallery.wedding_date).toLocaleDateString('bg-BG')}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{daysUntilExpiration > 0 ? `${daysUntilExpiration} дни до изтичане` : 'Изтекла'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>{images.length} снимки</span>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-boho-cream bg-opacity-20 hover:bg-opacity-30 rounded-boho transition-all font-boho"
            >
              <LogOut className="w-5 h-5" />
              <span>Изход</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {gallery.welcome_message && (
          <div className="boho-card rounded-boho p-6 mb-8 border-2 border-boho-brown border-opacity-20">
            <h2 className="text-xl font-semibold text-boho-brown mb-3 boho-heading">Послание от вашия фотограф</h2>
            <p className="text-boho-rust font-boho leading-relaxed">{gallery.welcome_message}</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-boho-brown boho-heading">Вашите Снимки</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-boho transition-all ${
                viewMode === 'grid'
                  ? 'bg-boho-sage bg-opacity-80 text-boho-cream shadow-lg'
                  : 'bg-boho-cream bg-opacity-50 text-boho-brown hover:bg-opacity-70'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-boho transition-all ${
                viewMode === 'list'
                  ? 'bg-boho-sage bg-opacity-80 text-boho-cream shadow-lg'
                  : 'bg-boho-cream bg-opacity-50 text-boho-brown hover:bg-opacity-70'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={handleDownloadAll}
              className="flex items-center space-x-2 boho-button text-boho-cream px-6 py-3 rounded-boho hover:shadow-lg transition-all font-boho"
            >
              <Download className="w-5 h-5" />
              <span>Изтегли всички</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-boho-rust font-boho text-xl">
            Зареждане на вашите спомени...
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-20 boho-card rounded-boho">
            <ImageIcon className="w-16 h-16 text-boho-rust mx-auto mb-4 opacity-50" />
            <p className="text-boho-rust font-boho text-lg">
              Все още няма качени снимки. Свържете се с вашия фотограф.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {images.map((image) => (
              <div
                key={image.id}
                onClick={() => handleImageClick(image)}
                className="boho-card rounded-boho overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-boho-brown border-opacity-20 hover:border-opacity-40"
              >
                <img
                  src={image.image_url}
                  alt={image.title || 'Wedding photo'}
                  className="w-full h-64 object-cover"
                />
                {image.title && (
                  <div className="p-4">
                    <p className="text-boho-brown font-boho font-medium">{image.title}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-boho-brown bg-opacity-90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={handleCloseModal}
        >
          <div className="max-w-6xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseModal}
              className="absolute -top-4 -right-4 w-12 h-12 bg-boho-cream rounded-full flex items-center justify-center text-boho-brown hover:bg-boho-sage hover:text-boho-cream transition-all shadow-lg z-10"
            >
              ✕
            </button>
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title || 'Wedding photo'}
              className="max-w-full max-h-[85vh] object-contain rounded-boho shadow-2xl"
            />
            {selectedImage.title && (
              <div className="mt-4 text-center">
                <p className="text-boho-cream font-boho text-lg">{selectedImage.title}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
