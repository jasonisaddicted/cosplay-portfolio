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

    let previewImageUrl = 'https://via.placeholder.com/1200x630?text=LOADING_FROM_FIRESTORE';
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

    console.log('[Album] previewImageUrl before replacements:', previewImageUrl);

    // Replace meta tags with actual album data
    // First, find what og:image currently has
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]*)"/);
    console.log('[Album] Current og:image in HTML:', ogImageMatch ? ogImageMatch[1] : 'NOT FOUND');

    // Use simple string replacements for reliability
    html = html.replace('<meta property="og:url" content="">', '<meta property="og:url" content="' + userUrl + '">');
    html = html.replace('<meta property="og:title" content="Cosplay Portfolio Album">', '<meta property="og:title" content="' + escape(title) + ' — Cosplay Portfolio">');
    html = html.replace('<meta property="og:description" content="">', '<meta property="og:description" content="' + escape(description) + '">');
    const beforeOgReplace = html.match(/<meta property="og:image" content="([^"]*)"/)[1];
    html = html.replace('<meta property="og:image" content="">', '<meta property="og:image" content="' + previewImageUrl + '">');
    const afterOgReplace = html.match(/<meta property="og:image" content="([^"]*)"/)[1];
    console.log('[Album] og:image before replace:', beforeOgReplace);
    console.log('[Album] og:image after replace:', afterOgReplace);
    console.log('[Album] og:image expected:', previewImageUrl);

    html = html.replace(/<meta property="og:image:width" content="[^"]*">/g, '');
    html = html.replace(/<meta property="og:image:height" content="[^"]*">/g, '');
    html = html.replace(/<meta property="og:image:type" content="[^"]*">/g, '');
    html = html.replace('<meta name="twitter:title" content="Album Title">', '<meta name="twitter:title" content="' + escape(title) + '">');
    html = html.replace('<meta name="twitter:description" content="">', '<meta name="twitter:description" content="' + escape(description) + '">');
    html = html.replace('<meta name="twitter:image" content="">', '<meta name="twitter:image" content="' + previewImageUrl + '">');
    html = html.replace(/<title>Album — Cosplay Portfolio<\/title>/, '<title>' + escape(title) + ' — Cosplay Portfolio</title>');

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

