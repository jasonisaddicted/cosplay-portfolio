/**
 * Open Graph Meta Tag Generator - Vercel Serverless Function
 * Generates proper og:image for album shares on social media
 * Uses Firestore REST API (no credentials needed)
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'jianshencosvisual-328dc';

/**
 * Main handler: Serve album page with injected og:image meta tags
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

    console.log(`[Album] Fetching album - id: ${id}, type: ${type}`);

    // Fetch album from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${type}/${id}`;

    let previewImageUrl = 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';
    let title = 'Cosplay Album';
    let description = 'Professional cosplay photography album';

    try {
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};

        console.log('[Album] Album found in Firestore');

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
        console.log('[Album] Album not found - using defaults');
      }
    } catch (fetchError) {
      console.error('[Album] Error fetching from Firestore:', fetchError.message);
      // Continue with defaults
    }

    // Read the album.html template
    const htmlPath = path.join(process.cwd(), 'public', 'album.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Build the album URL for users (without /api/ path)
    const userUrl = `https://cosplay-portfolio.vercel.app/album.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;

    // Escape HTML special characters
    const escape = (str) => {
      if (!str) return '';
      return str.replace(/[&<>"']/g, (m) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      });
    };

    // Replace meta tags with actual album data using explicit replacements
    html = html.replace(/(<meta property="og:url" content=")[^"]*(">)/, '$1' + userUrl + '$2');
    html = html.replace(/(<meta property="og:title" content=")[^"]*(">)/, '$1' + escape(title) + ' — Cosplay Portfolio$2');
    html = html.replace(/(<meta property="og:description" content=")[^"]*(">)/, '$1' + escape(description) + '$2');
    html = html.replace(/(<meta property="og:image" content=")[^"]*(">)/g, '$1' + previewImageUrl + '$2');
    html = html.replace(/<meta property="og:image:width" content="[^"]*">/g, '');
    html = html.replace(/<meta property="og:image:height" content="[^"]*">/g, '');
    html = html.replace(/<meta property="og:image:type" content="[^"]*">/g, '');
    html = html.replace(/(<meta name="twitter:title" content=")[^"]*(">)/, '$1' + escape(title) + '$2');
    html = html.replace(/(<meta name="twitter:description" content=")[^"]*(">)/, '$1' + escape(description) + '$2');
    html = html.replace(/(<meta name="twitter:image" content=")[^"]*(">)/, '$1' + previewImageUrl + '$2');
    html = html.replace(/(<title>)[^<]*(< \/title>)/, '$1' + escape(title) + ' — Cosplay Portfolio$2');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error:', error);
    // Fallback to static album.html on error
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'album.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(200).send(html);
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return res.status(500).json({ error: error.message });
    }
  }
};

