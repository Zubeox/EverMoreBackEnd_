// In LoginScreen.tsx (or your auth handler component/file)
import { useState } from 'react';
import { supabaseClient as supabase } from '../../lib/supabaseClient'; // Adjust path as needed
// ... other imports ...

export const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error; // This will be caught below
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
    // Your form JSX here, e.g.:
    <form onSubmit={handleSubmit}>
      {/* Email input */}
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@evermoreweddings.eu"
      />
      {/* Password input */}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="********"
      />
      {error && <div className="error-message">{error}</div>} {/* This displays errors like in your screenshot */}
      <button type="submit" disabled={loading}>
        {loading ? 'Зареждане...' : 'Вход'}
      </button>
    </form>
  );
};