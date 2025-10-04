import { useState, useEffect } from 'react';
import { ClientLogin } from './pages/ClientLogin';
import { ClientGalleryView } from './pages/ClientGalleryView';

const CLIENT_SESSION_KEY = 'client_gallery_session';
const SESSION_DURATION = 2 * 60 * 60 * 1000;

function ClientGalleryApp() {
  const [gallery, setGallery] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = () => {
    try {
      const sessionData = localStorage.getItem(CLIENT_SESSION_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const now = Date.now();

        if (session.timestamp && (now - session.timestamp < SESSION_DURATION)) {
          setGallery(session.gallery);
        } else {
          localStorage.removeItem(CLIENT_SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Session check failed:', error);
      localStorage.removeItem(CLIENT_SESSION_KEY);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = (galleryData: any) => {
    const session = {
      gallery: galleryData,
      timestamp: Date.now()
    };
    localStorage.setItem(CLIENT_SESSION_KEY, JSON.stringify(session));
    setGallery(galleryData);
  };

  const handleLogout = () => {
    localStorage.removeItem(CLIENT_SESSION_KEY);
    setGallery(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-boho-cream via-boho-sand to-boho-warm boho-pattern flex items-center justify-center">
        <div className="text-boho-brown text-xl font-boho">Зареждане...</div>
      </div>
    );
  }

  if (!gallery) {
    return <ClientLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <ClientGalleryView gallery={gallery} onLogout={handleLogout} />;
}

export default ClientGalleryApp;
