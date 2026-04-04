/**
 * Open Graph Meta Tag Generator - Vercel Serverless Function
 * Generates proper og:image for album shares on social media
 */

let db = null;

function initializeFirebase() {
  if (db) return;

  try {
    const admin = require('firebase-admin');

    if (!admin.apps.length) {
      let credentials = process.env.FIREBASE_CREDENTIALS;

      if (!credentials) {
        throw new Error('FIREBASE_CREDENTIALS environment variable not set');
      }

      let serviceAccount;
      try {
        // Try parsing as JSON
        serviceAccount = JSON.parse(credentials);
      } catch (parseError) {
        console.error('Failed to parse FIREBASE_CREDENTIALS as JSON:', parseError.message);
        // If JSON parsing fails, try to clean up the credentials
        // Remove any leading/trailing whitespace or quotes
        credentials = credentials.trim().replace(/^["']|["']$/g, '');
        try {
          serviceAccount = JSON.parse(credentials);
        } catch (retryError) {
          console.error('Failed again:', retryError.message);
          console.error('Raw credentials:', credentials.substring(0, 100));
          throw new Error(`Invalid Firebase credentials JSON: ${parseError.message}`);
        }
      }

      if (Object.keys(serviceAccount).length > 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        db = admin.firestore();
      } else {
        throw new Error('Firebase credentials are empty');
      }
    } else {
      db = admin.firestore();
    }
  } catch (error) {
    console.error('Firebase initialization error:', error.message);
    throw error;
  }
}

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

    // Initialize Firebase if not already done
    try {
      initializeFirebase();
    } catch (initError) {
      console.error('[OG Service] Firebase initialization failed:', initError.message);
      return res.status(500).json({ error: 'Firebase initialization failed', detail: initError.message });
    }

    if (!db) {
      return res.status(500).json({ error: 'Firebase not initialized - missing credentials' });
    }

    console.log('[OG Service] Firebase initialized successfully');

    // Fetch album from Firestore
    console.log(`[OG Service] Querying Firestore: collection="${type}", doc="${id}"`);
    const docSnap = await db.collection(type).doc(id).get();

    // Check if document exists - handle different SDK versions
    const albumData = docSnap.data();
    if (!albumData) {
      console.log('[OG Service] Album not found');
      return res.status(404).json({ error: 'Album not found' });
    }

    console.log('[OG Service] Album found');

    const album = albumData;
    const albumUrl = `https://jasonisaddicted.github.io/cosplay-portfolio/album.html?id=${id}&type=${type}`;

    // Use preview endpoint on our domain for og:image (more reliable for all platforms)
    const previewImageUrl = `https://cosplay-portfolio.vercel.app/api/preview?id=${id}&type=${type}`;

    // Keep original photo URL as fallback
    const firstPhotoUrl = album.photos && album.photos.length > 0
      ? album.photos[0].src
      : 'https://jasonisaddicted.github.io/cosplay-portfolio/images/default-og.png';

    const title = album.name || 'Cosplay Album';
    const description = `Album featuring photos from ${album.name}. ${album.photos?.length || 0} photos.`;

    // Generate HTML with proper Open Graph meta tags
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Cosplay Portfolio</title>
  <meta name="description" content="${description}">

  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${albumUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${previewImageUrl}">
  <meta property="og:image:width" content="900">
  <meta property="og:image:height" content="1200">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${previewImageUrl}">

  <!-- Redirect to actual album page -->
  <meta http-equiv="refresh" content="0; url=${albumUrl}">
</head>
<body>
  <p>Redirecting to <a href="${albumUrl}">${title}</a>...</p>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};

