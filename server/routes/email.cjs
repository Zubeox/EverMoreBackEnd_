const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

// Check if API key exists before initializing
const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.warn('⚠️  Warning: RESEND_API_KEY not set. Email functionality will be disabled.');
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

router.post('/send-credentials', async (req, res) => {
  try {
    // Check if Resend is configured
    if (!resend) {
      return res.status(503).json({ 
        error: 'Email service not configured. Please set RESEND_API_KEY in environment variables.' 
      });
    }

    const { gallery, galleryUrl } = req.body;
    
    if (!gallery || !galleryUrl) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expirationDate = new Date(gallery.expiration_date).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const { data, error } = await resend.emails.send({
      from: 'Wedding Gallery <onboarding@resend.dev>', // Use resend's test email or your verified domain
      to: gallery.client_email,
      subject: `Вашата сватбена галерия - ${gallery.bride_name} & ${gallery.groom_name}`,
      html: generateCredentialsEmailTemplate({
        brideName: gallery.bride_name,
        groomName: gallery.groom_name,
        galleryUrl,
        accessCode: gallery.access_code,
        expirationDate,
        welcomeMessage: gallery.welcome_message,
        imageCount: gallery.images?.length || 0
      })
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      error: error.message || 'Internal server error'
    });
  }
});

function generateCredentialsEmailTemplate(data) {
  return `<!DOCTYPE html>
<html lang="bg">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Вашата Сватбена Галерия</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 10px 10px 0 0;
      }
      .content {
        background: #f9f9f9;
        padding: 30px;
        border-radius: 0 0 10px 10px;
      }
      .code-box {
        background: white;
        border: 2px dashed #667eea;
        padding: 15px;
        text-align: center;
        font-size: 24px;
        font-weight: bold;
        color: #667eea;
        margin: 20px 0;
        border-radius: 5px;
      }
      .button {
        display: inline-block;
        background: #667eea;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>${data.brideName} & ${data.groomName}</h1>
    </div>
    <div class="content">
      <p>Здравейте,</p>
      <p>Радваме се да споделим с вас специалните моменти от вашата сватба! Вашата персонална галерия е готова за разглеждане.</p>
      
      <p><strong>Код за достъп:</strong></p>
      <div class="code-box">${data.accessCode}</div>
      
      <p style="text-align: center;">
        <a href="${data.galleryUrl}" class="button">Вижте Вашата Галерия</a>
      </p>
      
      ${data.welcomeMessage ? `<p><em>${data.welcomeMessage}</em></p>` : ''}
      
      <p><strong>Детайли:</strong></p>
      <ul>
        <li>Брой снимки: ${data.imageCount}</li>
        <li>Галерията е валидна до: ${data.expirationDate}</li>
      </ul>
      
      <p>Можете да прегледате, изтеглите и маркирате любимите си снимки.</p>
    </div>
    <div class="footer">
      <p>Ако имате въпроси, моля свържете се с нас.</p>
    </div>
  </body>
</html>`;
}

module.exports = router;