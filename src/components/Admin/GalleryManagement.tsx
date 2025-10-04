import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Trash2, Calendar, Mail, Clock } from 'lucide-react';
import { getClientGalleries, deleteClientGallery } from '../../services/clientGalleryService';
import { ClientGallery } from '../../types';
import CreateGalleryModal from './CreateGalleryModal';
import GalleryDetailsModal from './GalleryDetailsModal';

export default function GalleryManagement() {
  const [galleries, setGalleries] = useState<ClientGallery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState<ClientGallery | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleries();
  }, []);

  const loadGalleries = async () => {
    setLoading(true);
    const data = await getClientGalleries();
    setGalleries(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
      try {
        await deleteClientGallery(id);
        setGalleries(galleries.filter(g => g.id !== id));
      } catch (error) {
        console.error('Error deleting gallery:', error);
        alert('Failed to delete gallery');
      }
    }
  };

  const filteredGalleries = galleries.filter(gallery =>
    gallery.client_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.bride_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.groom_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    gallery.gallery_slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDaysUntilExpiration = (expirationDate: string) => {
    const days = Math.ceil((new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-boho-brown boho-heading">Клиентски Галерии</h2>
          <p className="text-boho-rust mt-1 font-boho">Управлявайте сватбените галерии за вашите клиенти</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 boho-button text-boho-cream px-6 py-3 rounded-boho hover:shadow-lg transition-all font-boho"
        >
          <Plus className="w-5 h-5" />
          <span>Създай Галерия</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Търсене по имейл, имена или код..."
          className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust font-boho"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-boho-rust font-boho">Зареждане на галерии...</div>
      ) : filteredGalleries.length === 0 ? (
        <div className="text-center py-12 text-boho-rust font-boho">
          {searchTerm ? 'Няма галерии, съответстващи на вашето търсене' : 'Все още няма галерии. Създайте първата си!'}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredGalleries.map((gallery) => {
            const daysLeft = getDaysUntilExpiration(gallery.expiration_date);
            return (
              <div
                key={gallery.id}
                className="bg-boho-cream bg-opacity-40 border-2 border-boho-brown border-opacity-20 rounded-boho p-6 hover:shadow-lg transition-all hover:border-opacity-40"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-boho-brown font-boho">
                        {gallery.bride_name} & {gallery.groom_name}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(gallery.status)}`}>
                        {gallery.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm text-boho-rust font-boho">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4" />
                        <span>{gallery.client_email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(gallery.wedding_date || '').toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4" />
                        <span>{gallery.view_count} views</span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-boho-rust font-boho">
                      Код: <code className="bg-boho-warm bg-opacity-30 px-2 py-1 rounded-boho text-boho-brown">{gallery.gallery_slug}</code>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedGallery(gallery)}
                      className="p-2 text-boho-sage hover:bg-boho-sage hover:bg-opacity-20 rounded-boho transition-all"
                      title="Преглед на детайли"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(gallery.id)}
                      className="p-2 text-boho-terracotta hover:bg-boho-terracotta hover:bg-opacity-20 rounded-boho transition-all"
                      title="Изтриване на галерия"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateGalleryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadGalleries}
        />
      )}

      {selectedGallery && (
        <GalleryDetailsModal
          gallery={selectedGallery}
          onClose={() => setSelectedGallery(null)}
          onUpdate={loadGalleries}
        />
      )}
    </div>
  );
}
