/**
 * Album Sharing Handler - Serves og:image metadata for social media
 * This is a HEADLESS API that returns HTML with metadata only
 * Users get redirected to the actual album.html for viewing
 */

const PROJECT_ID = 'jianshencosvisual-328dc';

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { id, type } = req.query;
    if (!id || !type) {
      return res.status(400).json({ error: 'Missing id or type' });
    }

    // Fetch album from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${type}/${id}`;

    let ogImage = 'UNIQUE_FALLBACK_IMAGE_URL_NEW_API_V2_12345';
    let title = 'Cosplay Album';
    let description = 'Professional cosplay photography album';

    try {
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};

        title = fields.name?.stringValue || 'Cosplay Album';
        description = fields.description?.stringValue || `Album featuring ${title}`;

        // Get first photo
        const photos = fields.photos?.arrayValue?.values || [];
        if (photos.length > 0) {
          const firstPhoto = photos[0].mapValue?.fields || {};
          ogImage = firstPhoto.src?.stringValue || ogImage;
        }

        // Fallback to coverImageUrl
        if (fields.coverImageUrl?.stringValue) {
          ogImage = fields.coverImageUrl.stringValue;
        }
      }
    } catch (e) {
      console.error('Firestore fetch error:', e);
    }

    // Escape HTML
    const esc = (s) => {
      if (!s) return '';
      return s.replace(/[&<>"']/g, m => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      });
    };

    const url = `https://cosplay-portfolio.vercel.app/album.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;

    // Generate clean HTML response
    const html = `<!DOCTYPE html>
<html>
<head>
<!-- DEBUG: ogImage="${ogImage}" title="${title}" -->
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${ogImage}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${ogImage}">
<meta http-equiv="refresh" content="0; url=${url}">
<title>${esc(title)}</title>
</head>
<body>
<p>Redirecting to <a href="${url}">${esc(title)}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(html);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};

