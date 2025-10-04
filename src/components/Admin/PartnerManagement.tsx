import { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Star } from 'lucide-react';
import { getAllPartners, deletePartner } from '../../services/partnerService';
import { Partner } from '../../types';

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    setLoading(true);
    const data = await getAllPartners();
    setPartners(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this partner?')) {
      try {
        await deletePartner(id);
        setPartners(partners.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting partner:', error);
        alert('Failed to delete partner');
      }
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-boho-brown boho-heading">Партньори</h2>
          <p className="text-boho-rust mt-1 font-boho">Управление на директорията с партньори</p>
        </div>
        <button className="flex items-center space-x-2 boho-button text-boho-cream px-6 py-3 rounded-boho hover:shadow-lg transition-all font-boho">
          <Plus className="w-5 h-5" />
          <span>Добави Партньор</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Търсене на партньори..."
          className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust font-boho"
        />
      </div>

      {loading ? (
        <div className="text-center py-12 text-boho-rust font-boho">Зареждане на партньори...</div>
      ) : filteredPartners.length === 0 ? (
        <div className="text-center py-12 text-boho-rust font-boho">Няма намерени партньори</div>
      ) : (
        <div className="grid gap-4">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-boho-cream bg-opacity-40 border-2 border-boho-brown border-opacity-20 rounded-boho p-6 hover:shadow-lg transition-all hover:border-opacity-40"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start space-x-4">
                  {partner.logo_url && (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-lg font-semibold text-boho-brown font-boho">{partner.name}</h3>
                      {partner.featured && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-sm text-boho-rust mb-2 font-boho">{partner.category}</p>
                    {partner.description && (
                      <p className="text-sm text-boho-brown font-boho">{partner.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-boho-rust font-boho">
                      {partner.website && <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-boho-sage">Уебсайт</a>}
                      {partner.email && <span>{partner.email}</span>}
                      {partner.phone && <span>{partner.phone}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-boho-sage hover:bg-boho-sage hover:bg-opacity-20 rounded-boho transition-all">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(partner.id)}
                    className="p-2 text-boho-terracotta hover:bg-boho-terracotta hover:bg-opacity-20 rounded-boho transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
