import { ClientGallery } from '../types';

export interface SendCredentialsEmailParams {
  gallery: ClientGallery;
  galleryUrl: string;
}

export async function sendCredentialsEmail({
  gallery,
  galleryUrl
}: SendCredentialsEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/email/send-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gallery,
        galleryUrl,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Email service unavailable' }));
      throw new Error(errorData.error || 'Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending credentials email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email service unavailable'
    };
  }
}

export async function sendExpirationWarningEmail(
  gallery: ClientGallery,
  daysRemaining: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    const response = await fetch(`${backendUrl}/api/email/send-expiration-warning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        gallery,
        daysRemaining,
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Email service unavailable' }));
      throw new Error(errorData.error || 'Failed to send expiration warning');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending expiration warning email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email service unavailable'
    };
  }
}

interface CredentialsEmailData {
  brideName: string;
  groomName: string;
  galleryUrl: string;
  accessCode: string;
  expirationDate: string;
  welcomeMessage: string | null;
  imageCount: number;
}

interface ExpirationWarningData {
  brideName: string;
  groomName: string;
  daysRemaining: number;
  expirationDate: string;
}
