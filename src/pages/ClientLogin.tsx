import { useState } from 'react';
import { Heart, Lock, Mail, AlertCircle, Camera } from 'lucide-react';
import { authenticateClient } from '../services/clientGalleryService';

interface ClientLoginProps {
  onLoginSuccess: (gallery: any) => void;
}

export const ClientLogin: React.FC<ClientLoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authenticateClient({
        email: email.trim(),
        code: accessCode.trim()
      });

      if (!result.success || !result.gallery) {
        throw new Error(result.error || 'Невалиден имейл или код за достъп');
      }

      onLoginSuccess(result.gallery);
    } catch (err: any) {
      setError(err.message || 'Невалиден имейл или код за достъп');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern flex items-center justify-center px-4">
      <div className="absolute top-10 right-20 w-12 h-12 border-2 border-boho-rust rounded-full opacity-20"></div>
      <div className="absolute bottom-20 left-16 w-8 h-8 bg-boho-sage rounded-full opacity-30"></div>
      <div className="absolute top-1/3 left-10 w-6 h-6 border border-boho-dusty rotate-45 opacity-25"></div>

      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-boho-sage to-boho-dusty rounded-full mb-6 border-4 border-boho-warm border-opacity-30 shadow-lg">
            <Camera className="w-10 h-10 text-boho-cream" />
          </div>
          <h1 className="text-4xl font-bold text-boho-brown mb-3 boho-heading">Вашата Сватбена Галерия</h1>
          <p className="text-boho-rust font-boho text-lg flex items-center justify-center space-x-2">
            <Heart className="w-5 h-5 fill-current" />
            <span>Влезте, за да видите вашите спомени</span>
          </p>
        </div>

        <div className="boho-card rounded-boho p-8 shadow-xl border-2 border-boho-brown border-opacity-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-boho p-4 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-boho">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Имейл Адрес
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust placeholder-opacity-60 font-boho"
                  placeholder="вашият@имейл.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Код за Достъп
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
                <input
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust placeholder-opacity-60 font-boho uppercase tracking-wider"
                  placeholder="ВАШИЯТ КОД"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-boho-rust mt-2 font-boho">
                Кодът за достъп е изпратен на вашия имейл
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full boho-button py-3 rounded-boho text-boho-cream font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-xl font-boho text-lg"
            >
              {loading ? 'Влизане...' : 'Вход'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-boho-rust font-boho">
            Нямате код за достъп? Свържете се с вашия фотограф.
          </p>
        </div>
      </div>
    </div>
  );
};
