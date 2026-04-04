/**
 * Open Graph Meta Tag Generator - Vercel Serverless Function
 * Generates proper og:image for album shares on social media
 * Uses Firestore REST API (no credentials needed)
 */

const PROJECT_ID = 'jianshencosvisual-328dc';

/**
 * Main handler: Generate meta tags for album
 * Usage: /api/album?id=DrKhPEqp00W2Ci09542j&type=events
 */
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id, type } = req.query;

    if (!id || !type) {
      return res.status(400).json({ error: 'Missing id or type parameter' });
    }

    console.log(`[OG Service] Fetching album - id: ${id}, type: ${type}`);

    // Fetch album from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${type}/${id}`;

    let albumData = null;
    let previewImageUrl = 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';
    let title = 'Cosplay Album';
    let description = 'Professional cosplay photography album';

    try {
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};

        console.log('[OG Service] Album found in Firestore');

        // Extract album data from Firestore REST format
        title = fields.name?.stringValue || fields.title?.stringValue || 'Cosplay Album';
        description = fields.description?.stringValue || `Album featuring photos from ${title}`;

        // Get first photo from photos array
        const photosArray = fields.photos?.arrayValue?.values || [];
        if (photosArray.length > 0) {
          const firstPhoto = photosArray[0].mapValue?.fields || {};
          const photoSrc = firstPhoto.src?.stringValue;
          if (photoSrc) {
            previewImageUrl = photoSrc;
          }
        }

        // Fallback to coverImageUrl if available
        if (fields.coverImageUrl?.stringValue) {
          previewImageUrl = fields.coverImageUrl.stringValue;
        }
      } else {
        console.log('[OG Service] Album not found - using defaults');
      }
    } catch (fetchError) {
      console.error('[OG Service] Error fetching from Firestore:', fetchError.message);
      // Continue with defaults
    }

    // API endpoint serves HTML with proper meta tags for crawlers
    // Redirect users to album.html for actual viewing experience
    const apiUrl = `https://cosplay-portfolio.vercel.app/api/album?id=${id}&type=${type}`;
    const userUrl = `https://cosplay-portfolio.vercel.app/album.html?id=${id}&type=${type}`;

    // Escape HTML special characters
    const escape = (str) => {
      if (!str) return '';
      return str.replace(/[&<>"']/g, (m) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      });
    };

    // Generate HTML with proper Open Graph meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escape(title)} — Cosplay Portfolio</title>
  <meta name="description" content="${escape(description)}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${apiUrl}">
  <meta property="og:title" content="${escape(title)}">
  <meta property="og:description" content="${escape(description)}">
  <meta property="og:image" content="${previewImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="1600">
  <meta property="og:image:type" content="image/jpeg">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escape(title)}">
  <meta name="twitter:description" content="${escape(description)}">
  <meta name="twitter:image" content="${previewImageUrl}">

  <!-- Redirect to actual album page for users -->
  <meta http-equiv="refresh" content="0; url=${userUrl}">
</head>
<body>
  <p>Redirecting to <a href="${userUrl}">${escape(title)}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

