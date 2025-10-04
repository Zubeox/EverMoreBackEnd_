import { useState } from 'react';
import { supabaseClient as supabase } from '../../lib/supabaseClient'; // Adjust path if needed

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@evermoreweddings.eu'); // Pre-fill as in screenshot
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        onLogin(); // Triggers auth check in App.tsx
      }
    } catch (err: any) {
      setError(err.message || 'Възникна грешка при влизане. Опитайте отново.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern flex items-center justify-center p-4">
      <div className="boho-card max-w-md w-full rounded-boho shadow-lg bg-boho-cream bg-opacity-90 backdrop-blur-sm border border-boho-brown border-opacity-20">
        <div className="p-8">
          {/* Logo/Icon */}
          <div className="w-16 h-16 mx-auto mb-6 bg-boho-warm bg-opacity-30 rounded-full flex items-center justify-center border border-boho-brown border-opacity-20">
            {/* Replace with your actual icon, e.g., <img src="logo.png" alt="Logo" className="w-10 h-10" /> */}
            <span className="text-2xl">📸</span> {/* Placeholder icon */}
          </div>

          {/* Title */}
          <h2 className="text-3xl font-semibold text-boho-brown text-center mb-2 boho-heading">
            Вход в Админ Панел
          </h2>

          {/* Subtitle */}
          <p className="text-boho-rust text-center mb-8 font-boho">
            Управление на сватбено съдържание
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-boho relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Име/Адрес
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-boho-cream border border-boho-brown border-opacity-20 rounded-boho focus:outline-none focus:ring-2 focus:ring-boho-warm text-boho-brown placeholder-boho-rust font-boho"
                placeholder="admin@evermoreweddings.eu"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-boho-brown mb-2 font-boho">
                Парола
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-boho-cream border border-boho-brown border-opacity-20 rounded-boho focus:outline-none focus:ring-2 focus:ring-boho-warm text-boho-brown placeholder-boho-rust font-boho"
                placeholder="********"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-boho-warm text-boho-cream px-6 py-3 rounded-boho font-semibold hover:bg-opacity-90 transition-colors disabled:opacity-50 font-boho"
            >
              {loading ? 'Зареждане...' : 'Вход'}
            </button>
          </form>

          {/* Bottom Note */}
          <p className="mt-6 text-center text-sm text-boho-rust font-boho">
            Защита на админ зона. Само за оторизирани потребители.
          </p>
        </div>
      </div>
    </div>
  );
};