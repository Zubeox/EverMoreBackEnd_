import { Resend } from 'resend';
import { ClientGallery } from '../types';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

if (!import.meta.env.VITE_RESEND_API_KEY) {
  console.error('⚠️ Warning: VITE_RESEND_API_KEY is not set');
}

export interface SendCredentialsEmailParams {
  gallery: ClientGallery;
  galleryUrl: string;
}

export async function sendCredentialsEmail({
  gallery,
  galleryUrl
}: SendCredentialsEmailParams): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('http://localhost:5175/api/email/send-credentials', {
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
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending credentials email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendExpirationWarningEmail(
  gallery: ClientGallery,
  daysRemaining: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!import.meta.env.VITE_RESEND_API_KEY) {
      throw new Error('VITE_RESEND_API_KEY is not configured');
    }

    const expirationDate = new Date(gallery.expiration_date).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailHtml = generateExpirationWarningTemplate({
      brideName: gallery.bride_name,
      groomName: gallery.groom_name,
      daysRemaining,
      expirationDate
    });

    const { error } = await resend.emails.send({
      from: 'Wedding Gallery <vbperoto@gmail.com>',
      to: gallery.client_email,
      subject: `Вашата галерия изтича след ${daysRemaining} дни`,
      html: emailHtml
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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

function generateCredentialsEmailTemplate(data: CredentialsEmailData): string {
  // NOTE: This email template still uses the word "password" in the body.
  // The patch only changed the variable name, not the user-facing text.
  // I am keeping the template text as-is to match the patch's intent,
  // but you may want to update the text to say "Access Code".
  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Вашата Сватбена Галерия</title>
  <style>
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #f5f1eb 0%, #ede4d3 50%, #e8dcc6 100%);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: rgba(255, 248, 240, 0.95);
      border: 2px solid rgba(139, 69, 19, 0.2);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 8px 32px rgba(139, 69, 19, 0.15);
    }
    .header {
      background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
      color: #FFF8F0;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-family: 'Dancing Script', cursive;
      font-size: 32px;
      font-weight: 400;
    }
    .content {
      padding: 40px 30px;
      color: #5D4037;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      line-height: 1.6;
    }
    .credentials-box {
      background: rgba(139, 69, 19, 0.05);
      border: 2px solid rgba(139, 69, 19, 0.2);
      border-radius: 8px;
      padding: 25px;
      margin: 25px 0;
    }
    .credential-item {
      margin: 15px 0;
    }
    .credential-label {
      font-weight: bold;
      color: #8B4513;
      display: block;
      margin-bottom: 5px;
    }
    .credential-value {
      font-size: 18px;
      color: #5D4037;
      background: white;
      padding: 10px 15px;
      border-radius: 6px;
      border: 1px solid rgba(139, 69, 19, 0.2);
      display: inline-block;
      font-family: monospace;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #d2691e 0%, #cd853f 100%);
      color: #FFF8F0;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 8px;
      border: 2px solid rgba(139, 69, 19, 0.3);
      font-size: 16px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 15px rgba(139, 69, 19, 0.2);
    }
    .info-box {
      background: rgba(210, 105, 30, 0.1);
      border-left: 4px solid #D2691E;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background: rgba(139, 69, 19, 0.05);
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #8B4513;
      border-top: 1px solid rgba(139, 69, 19, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🤍 ${data.brideName} & ${data.groomName} 🤍</h1>
      <p style="margin: 10px 0 0 0; font-size: 16px;">Вашата Сватбена Галерия</p>
    </div>

    <div class="content">
      <div class="greeting">
        <p>Здравейте, скъпи ${data.brideName} и ${data.groomName}!</p>
        ${data.welcomeMessage
          ? `<p>${data.welcomeMessage}</p>`
          : `<p>С удоволствие споделяме с вас специалната ви сватбена галерия! Вашите ${data.imageCount} снимки са готови за преглед и изтегляне.</p>`
        }
      </div>

      <div class="credentials-box">
        <div class="credential-item">
          <span class="credential-label">🔗 Адрес на галерията:</span>
          <br>
          <a href="${data.galleryUrl}" class="credential-value" style="color: #5D4037;">${data.galleryUrl}</a>
        </div>

        <div class="credential-item">
          <span class="credential-label">🔑 Вашият код за достъп:</span>
          <br>
          <span class="credential-value">${data.accessCode}</span>
        </div>
      </div>

      <center>
        <a href="${data.galleryUrl}" class="button">
          Отвори Галерията
        </a>
      </center>

      <div class="info-box">
        <strong>⏰ Важно:</strong> Галерията ще бъде достъпна до <strong>${data.expirationDate}</strong>.
        Ще получите напомняне 7 дни преди изтичане на срока.
      </div>

      <p style="margin-top: 30px; line-height: 1.6;">
        <strong>Функции на галерията:</strong><br>
        ✨ Преглед на всички снимки в пълна резолюция<br>
        💕 Маркиране на любими снимки<br>
        📥 Изтегляне на отделни снимки или всички наведнъж<br>
        📱 Оптимизирана за мобилни устройства
      </p>

      <p style="margin-top: 30px; color: #8B4513;">
        Поздрави и благодарим ви, че споделихте този специален ден с нас!
      </p>
    </div>

    <div class="footer">
      <p>Ако имате въпроси или проблеми с достъпа, моля свържете се с нас.</p>
      <p style="margin: 5px 0;">© ${new Date().getFullYear()} Wedding Photography Studio</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

interface ExpirationWarningData {
  brideName: string;
  groomName: string;
  daysRemaining: number;
  expirationDate: string;
}

function generateExpirationWarningTemplate(data: ExpirationWarningData): string {
  return `
<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Georgia', serif;
      background: linear-gradient(135deg, #f5f1eb 0%, #ede4d3 50%, #e8dcc6 100%);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: rgba(255, 248, 240, 0.95);
      border: 2px solid rgba(139, 69, 19, 0.2);
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #D2691E 0%, #CD853F 100%);
      color: #FFF8F0;
      padding: 40px 20px;
      text-align: center;
    }
    .content {
      padding: 40px 30px;
      color: #5D4037;
    }
    .warning-box {
      background: rgba(255, 152, 0, 0.1);
      border: 2px solid #FF9800;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      background: rgba(139, 69, 19, 0.05);
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #8B4513;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Напомняне за Вашата Галерия</h1>
    </div>

    <div class="content">
      <p>Здравейте, ${data.brideName} и ${data.groomName}!</p>

      <div class="warning-box">
        <h2 style="margin: 0 0 10px 0; color: #FF9800;">Вашата галерия изтича след ${data.daysRemaining} дни</h2>
        <p style="margin: 0; font-size: 18px;">Краен срок: <strong>${data.expirationDate}</strong></p>
      </div>

      <p>
        Това е приятелско напомняне, че вашата сватбена галерия скоро няма да бъде достъпна.
        Ако все още не сте изтеглили снимките си, моля направете го възможно най-скоро.
      </p>

      <p style="margin-top: 20px;">
        След изтичане на срока галерията ще бъде архивирана и няма да можете да получите достъп до снимките.
      </p>

      <p style="margin-top: 30px; color: #8B4513;">
        Благодарим ви!
      </p>
    </div>

    <div class="footer">
      <p>Ако имате нужда от удължаване на срока, моля свържете се с нас.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}