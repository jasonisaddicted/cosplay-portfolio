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

    let ogImage = '';
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
          ogImage = firstPhoto.src?.stringValue || '';
        }

        // Fallback to coverImageUrl
        if (!ogImage && fields.coverImageUrl?.stringValue) {
          ogImage = fields.coverImageUrl.stringValue;
        }

        console.log('Firestore data loaded:', { title, photoCount: photos.length, hasImage: !!ogImage });
      } else {
        console.error('Firestore fetch failed:', response.status);
      }
    } catch (e) {
      console.error('Firestore fetch error:', e);
    }

    // Use image from query param if provided (override), otherwise use first photo from Firestore
    const queryImage = req.query.image || req.query.img;
    if (queryImage) {
      ogImage = decodeURIComponent(queryImage);
    }

    // Escape HTML
    const esc = (s) => {
      if (!s) return '';
      return s.replace(/[&<>"']/g, m => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      });
    };

    const albumUrl = `https://cosplay-portfolio.vercel.app/album.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
    const canonicalUrl = `https://cosplay-portfolio.vercel.app/api/album?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;

    // Generate clean HTML response
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonicalUrl)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1600">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImage)}">
<title>${esc(title)}</title>
</head>
<body>
<p>Redirecting to <a href="${esc(albumUrl)}">${esc(title)}</a>...</p>
<script>window.location.replace("${esc(albumUrl)}");</script>
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

