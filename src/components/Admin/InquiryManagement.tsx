import { useState, useEffect } from 'react';
import { Mail, Phone, ExternalLink, Check, X } from 'lucide-react';
import { getAllInquiries, updateInquiryStatus } from '../../services/partnerService';
import { PartnershipInquiry } from '../../types';

export default function InquiryManagement() {
  const [inquiries, setInquiries] = useState<PartnershipInquiry[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    const data = await getAllInquiries();
    setInquiries(data);
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries(inquiries.map(inq => inq.id === id ? { ...inq, status } : inq));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    }
  };

  const filteredInquiries = filter === 'all'
    ? inquiries
    : inquiries.filter(inq => inq.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-boho-brown boho-heading">Запитвания за Партньорство</h2>
          <p className="text-boho-rust mt-1 font-boho">Преглед и управление на заявления за партньорство</p>
        </div>
      </div>

      <div className="flex space-x-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => {
          const labels = { all: 'Всички', pending: 'Чакащи', approved: 'Одобрени', rejected: 'Отхвърлени' };
          return (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-boho transition-all font-boho ${
                filter === status
                  ? 'bg-boho-sage bg-opacity-80 text-boho-cream shadow-lg'
                  : 'text-boho-rust hover:bg-boho-warm hover:bg-opacity-30'
              }`}
            >
              {labels[status]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="text-center py-12 text-boho-rust font-boho">Зареждане на запитвания...</div>
      ) : filteredInquiries.length === 0 ? (
        <div className="text-center py-12 text-boho-rust font-boho">Няма намерени запитвания</div>
      ) : (
        <div className="grid gap-4">
          {filteredInquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className="bg-boho-cream bg-opacity-40 border-2 border-boho-brown border-opacity-20 rounded-boho p-6 hover:shadow-lg transition-all hover:border-opacity-40"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-boho-brown font-boho">{inquiry.company_name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                      {inquiry.status}
                    </span>
                  </div>
                  <div className="text-sm text-boho-rust space-y-1 font-boho">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{inquiry.name}</span>
                      {inquiry.company_category && (
                        <span className="text-neutral-400">• {inquiry.company_category}</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${inquiry.email}`} className="hover:text-boho-sage">
                        {inquiry.email}
                      </a>
                    </div>
                    {inquiry.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{inquiry.phone}</span>
                      </div>
                    )}
                    {inquiry.website && (
                      <div className="flex items-center space-x-2">
                        <ExternalLink className="w-4 h-4" />
                        <a href={inquiry.website} target="_blank" rel="noopener noreferrer" className="hover:text-boho-sage">
                          {inquiry.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-boho-rust font-boho">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="bg-boho-warm bg-opacity-20 rounded-boho p-4 mb-4">
                <div className="text-sm font-medium text-boho-brown mb-1 font-boho">Съобщение:</div>
                <p className="text-sm text-boho-brown font-boho">{inquiry.message}</p>
              </div>

              {inquiry.notes && (
                <div className="bg-boho-sage bg-opacity-20 rounded-boho p-4 mb-4">
                  <div className="text-sm font-medium text-boho-brown mb-1 font-boho">Бележки:</div>
                  <p className="text-sm text-boho-brown font-boho">{inquiry.notes}</p>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, 'approved')}
                  className="flex items-center space-x-2 px-4 py-2 bg-boho-sage bg-opacity-30 text-boho-brown rounded-boho hover:bg-opacity-50 transition-all font-boho"
                >
                  <Check className="w-4 h-4" />
                  <span>Одобри</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, 'rejected')}
                  className="flex items-center space-x-2 px-4 py-2 bg-boho-terracotta bg-opacity-30 text-boho-brown rounded-boho hover:bg-opacity-50 transition-all font-boho"
                >
                  <X className="w-4 h-4" />
                  <span>Отхвърли</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(inquiry.id, 'pending')}
                  className="flex items-center space-x-2 px-4 py-2 bg-boho-warm bg-opacity-30 text-boho-brown rounded-boho hover:bg-opacity-50 transition-all font-boho"
                >
                  <span>Маркирай като чакащо</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
