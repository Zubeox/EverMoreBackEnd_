const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/send-credentials', async (req, res) => {
  try {
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
      from: 'Wedding Gallery <info@resend.dev>',
      to: gallery.client_email,
      subject: `Вашата сватбена галерия - ${gallery.bride_name} & ${gallery.groom_name}`,
      html: generateCredentialsEmailTemplate({
        brideName: gallery.bride_name,
        groomName: gallery.groom_name,
        galleryUrl,
        accessCode: gallery.access_code,
        expirationDate,
        welcomeMessage: gallery.welcome_message,
        imageCount: gallery.images.length
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
        <title>Вашата Сватбена Галерия</title>
      </head>
      <body>
        <h1>${data.brideName} & ${data.groomName}</h1>
        <p>Вашият код за достъп: ${data.accessCode}</p>
        <p>Линк към галерията: <a href="${data.galleryUrl}">${data.galleryUrl}</a></p>
        <p>Изтича на: ${data.expirationDate}</p>
      </body>
    </html>`;
}

module.exports = router;