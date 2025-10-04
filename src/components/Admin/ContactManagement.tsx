import { useState, useEffect } from 'react';
import { Mail, Phone, Trash2, Calendar } from 'lucide-react';
import { getAllContacts, deleteContact } from '../../services/contactService';
import { Contact } from '../../types';

export default function ContactManagement() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    setLoading(true);
    const data = await getAllContacts();
    setContacts(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this contact?')) {
      try {
        await deleteContact(id);
        setContacts(contacts.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting contact:', error);
        alert('Failed to delete contact');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-boho-brown boho-heading">Контактни Съобщения</h2>
        <p className="text-boho-rust mt-1 font-boho">Съобщения от контактната форма</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-boho-rust font-boho">Зареждане на контакти...</div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-12 text-boho-rust font-boho">Все още няма контактни заявки</div>
      ) : (
        <div className="grid gap-4">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-boho-cream bg-opacity-40 border-2 border-boho-brown border-opacity-20 rounded-boho p-6 hover:shadow-lg transition-all hover:border-opacity-40"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-boho-brown mb-2 font-boho">{contact.name}</h3>
                  <div className="text-sm text-boho-rust space-y-1 font-boho">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${contact.email}`} className="hover:text-boho-sage">
                        {contact.email}
                      </a>
                    </div>
                    {contact.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(contact.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="p-2 text-boho-terracotta hover:bg-boho-terracotta hover:bg-opacity-20 rounded-boho transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-boho-warm bg-opacity-20 rounded-boho p-4">
                <div className="text-sm font-medium text-boho-brown mb-1 font-boho">Съобщение:</div>
                <p className="text-sm text-boho-brown whitespace-pre-wrap font-boho">{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
