import { useState, useEffect } from 'react';
import { supabaseClient as supabase } from './lib/supabaseClient';
import { LoginScreen } from './components/Auth/LoginScreen';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DropZone } from './components/ImageUpload/DropZone';
import { ImageGrid } from './components/ImageGallery/ImageGrid';
import { StatsCard } from './components/Dashboard/StatsCard';
import { GalleryList } from './components/Galleries/GalleryList';
import { GalleryForm } from './components/Galleries/GalleryForm';
import ClientGalleryManagement from './components/Admin/ClientGalleryManagement';
import PartnerManagement from './components/Admin/PartnerManagement';
import InquiryManagement from './components/Admin/InquiryManagement';
import ContactManagement from './components/Admin/ContactManagement';
import { SupabaseFunctionCaller } from './components/SupabaseFunctionCaller';
import { CloudinaryImage, Gallery } from './types';
import { getGalleries } from './services/galleryService';
import {
  Images,
  Upload,
  Clock,
  FileText,
  FolderOpen
} from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [images, setImages] = useState<CloudinaryImage[]>([]);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [showGalleryForm, setShowGalleryForm] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadGalleries();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    checkAuth();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const loadGalleries = async () => {
    try {
      const data = await getGalleries();
      setGalleries(data);
    } catch (error) {
      console.error('Failed to load galleries - check Supabase connection:', error);
      setGalleries([]);
    }
  };

  const handleUploadComplete = (newImages: CloudinaryImage[]) => {
    setImages(prev => [...newImages, ...prev]);
    setActiveSection('images');
  };

  const handleImageDelete = (publicId: string) => {
    setImages(prev => prev.filter(img => img.public_id !== publicId));
  };

  const handleCreateGallery = () => {
    setEditingGallery(null);
    setShowGalleryForm(true);
  };

  const handleEditGallery = (gallery: Gallery) => {
    setEditingGallery(gallery);
    setShowGalleryForm(true);
  };

  const handleSaveGallery = (gallery: Gallery) => {
    if (editingGallery) {
      setGalleries(prev => prev.map(g => g.id === gallery.id ? gallery : g));
    } else {
      setGalleries(prev => [gallery, ...prev]);
    }
    setShowGalleryForm(false);
    setEditingGallery(null);
  };

  const handleCancelGalleryForm = () => {
    setShowGalleryForm(false);
    setEditingGallery(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Общо изображения"
                value={images.length}
                icon={Images}
                trend={{ value: 12, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Портфолио галерии"
                value={galleries.length}
                icon={FolderOpen}
                trend={{ value: 5, isPositive: true }}
                color="purple"
              />
              <StatsCard
                title="Използвано място"
                value="2.4 GB"
                icon={FolderOpen}
                trend={{ value: 8, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Месечни прегледи"
                value="45.2K"
                icon={FolderOpen}
                trend={{ value: 15, isPositive: true }}
                color="yellow"
              />
            </div>

            {/* Recent Activity */}
            <div className="boho-card rounded-boho">
              <div className="p-6 border-b border-boho-brown border-opacity-20">
                <h3 className="text-xl font-semibold text-boho-brown flex items-center space-x-2 boho-heading">
                  <Clock className="w-5 h-5" />
                  <span>Последна активност</span>
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {images.slice(0, 5).map((image) => (
                    <div key={image.public_id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-boho-warm bg-opacity-30 rounded-boho overflow-hidden border border-boho-brown border-opacity-20">
                        <img
                          src={`https://res.cloudinary.com/demo/image/upload/w_48,h_48,c_fill/${image.public_id}`}
                          alt={image.public_id}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-boho-brown font-boho">
                          Качено ново изображение
                        </p>
                        <p className="text-xs text-boho-rust">
                          {image.public_id} • {new Date(image.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <FolderOpen className="w-4 h-4 text-boho-warm" />
                    </div>
                  ))}

                  {images.length === 0 && (
                    <div className="text-center py-8 text-boho-rust">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-boho-brown text-opacity-40" />
                      <p className="font-boho">Няма скорошна активност. Качете някои изображения, за да започнете!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Supabase Function Tester */}
            <SupabaseFunctionCaller />
          </div>
        );

      case 'portfolio-galleries': // This was named 'galleries' in your original file
        if (showGalleryForm) {
          return (
            <GalleryForm
              gallery={editingGallery || undefined}
              onSave={handleSaveGallery}
              onCancel={handleCancelGalleryForm}
              availableImages={images}
            />
          );
        }

        return (
          <GalleryList
            onCreateGallery={handleCreateGallery}
            onEditGallery={handleEditGallery}
          />
        );

      case 'client-galleries':
        return <ClientGalleryManagement />;

      case 'partners':
        return (
          <div className="boho-card rounded-boho p-6">
            <PartnerManagement />
          </div>
        );

      case 'inquiries':
        return (
          <div className="boho-card rounded-boho p-6">
            <InquiryManagement />
          </div>
        );

      case 'contacts':
        return (
          <div className="boho-card rounded-boho p-6">
            <ContactManagement />
          </div>
        );

      case 'upload':
        return (
          <div className="space-y-6">
            <div className="boho-card rounded-boho p-6">
              <div className="mb-6">
                <h3 className="text-2xl font-semibold text-boho-brown mb-3 boho-heading">
                  Качване на нови изображения
                </h3>
                <p className="text-boho-rust font-boho">
                  Добавете нови изображения към вашата галерия. Изображенията ще бъдат автоматично оптимизирани и съхранени в Cloudinary.
                </p>
              </div>
              <DropZone onUploadComplete={handleUploadComplete} />
            </div>
          </div>
        );

      case 'images':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-boho-rust font-boho">
                  {images.length} {images.length === 1 ? 'изображение' : 'изображения'} във вашата галерия
                </p>
              </div>
              <button
                onClick={() => setActiveSection('upload')}
                className="boho-button px-6 py-3 text-boho-cream rounded-boho flex items-center space-x-2 font-boho"
              >
                <Upload className="w-4 h-4" />
                <span>Качване на изображения</span>
              </button>
            </div>

            <div className="boho-card rounded-boho p-6">
              <ImageGrid 
                images={images} 
                onImageDelete={handleImageDelete}
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="boho-card rounded-boho p-8 text-center">
            <h3 className="text-2xl font-semibold text-boho-brown mb-3 boho-heading">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h3>
            <p className="text-boho-rust font-boho">
              Тази секция скоро ще бъде готова. Очаквайте повече функции!
            </p>
          </div>
        );
    }
  };
  
  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard':
        return { title: 'Табло', subtitle: 'Преглед на вашата система за управление на съдържанието' };
      case 'portfolio-galleries':
        return showGalleryForm
          ? { title: 'Управление на галерии', subtitle: editingGallery ? 'Редактиране на галерия' : 'Създаване на нова галерия' }
          : { title: 'Портфолио галерии', subtitle: 'Управлявайте вашите портфолио галерии' };
      case 'client-galleries':
        return { title: 'Клиентски Галерии', subtitle: 'Управлявайте вашите сватбени галерии за клиенти' };
      case 'partners':
        return { title: 'Партньори', subtitle: 'Управлявайте вашите партньори и доставци' };
      case 'inquiries':
        return { title: 'Запитвания за Партньорство', subtitle: 'Преглеждайте и управлявайте заявления за партньорство' };
      case 'contacts':
        return { title: 'Контактни Съобщения', subtitle: 'Преглеждайте съобщения от контактната форма' };
      case 'upload':
        return { title: 'Качване на изображения', subtitle: 'Добавете нови изображения към вашата галерия' };
      case 'images':
        return { title: 'Галерия с изображения', subtitle: 'Управлявайте и организирайте вашите изображения' };
      default:
        return {
          title: activeSection.charAt(0).toUpperCase() + activeSection.slice(1),
          subtitle: 'Управлявайте вашето съдържание'
        };
    }
  };

  const sectionInfo = getSectionTitle();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern flex items-center justify-center">
        <div className="text-boho-brown text-xl font-boho">Зареждане...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={user?.email}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={sectionInfo.title}
          subtitle={sectionInfo.subtitle}
          onLogout={handleLogout}
        />

        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;