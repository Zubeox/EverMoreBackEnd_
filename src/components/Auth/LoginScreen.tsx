import { useState } from 'react';
import { supabaseClient } from '../lib/supabaseClient';
import { Image, Lock, Mail, AlertCircle } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin(email, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || 'Невалидни данни за вход');
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
            <Image className="w-10 h-10 text-boho-cream" />
          </div>
          <h1 className="text-4xl font-bold text-boho-brown mb-3 boho-heading">Вход в Админ Панел</h1>
          <p className="text-boho-rust font-boho text-lg">Управление на съдържанието</p>
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
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Парола
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-boho-rust" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-boho-brown border-opacity-30 rounded-boho focus:ring-2 focus:ring-boho-sage focus:border-boho-sage bg-boho-cream bg-opacity-50 text-boho-brown placeholder-boho-rust placeholder-opacity-60 font-boho"
                  placeholder="Въведете вашата парола"
                />
              </div>
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

        <p className="text-center text-sm text-boho-rust mt-6 font-boho">
          Защитена админ зона. Само за оторизирани потребители.
        </p>
      </div>
    </div>
  );
};