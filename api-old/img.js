/**
 * Image proxy for social media OG thumbnails
 * Accepts Firebase Storage paths and generates fresh signed URLs for reliable access
 *
 * Usage: /api/img?path=<encoded_storage_path>
 * Example: /api/img?path=photos%2Fevents%2Fimage.jpg
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (reuse if already initialized)
if (!admin.apps.length) {
  // Use FIREBASE_CREDENTIALS env var set in Vercel
  const credentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);
  admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
}

// Use the Firebase Storage bucket
const bucket = admin.storage().bucket('jianshencosvisual-328dc.firebasestorage.app');

module.exports = async function handler(req, res) {
  // Support both 'path' (new) and 'url' (legacy) parameters
  let storagePath = req.query.path || req.query.url;

  if (!storagePath) {
    return res.status(400).send('Missing path or url parameter');
  }

  try {
    const decodedPath = decodeURIComponent(storagePath);

    // If it's a full URL, extract just the path
    let filename = decodedPath;
    if (decodedPath.includes('firebasestorage')) {
      // Extract path from Firebase URL
      const urlObj = new URL(decodedPath);
      const pathMatch = urlObj.pathname.match(/\/o\/(.*?)$/);
      if (pathMatch) {
        filename = decodeURIComponent(pathMatch[1]);
      }
    }

    console.log('Generating signed URL for:', filename);

    // Generate a fresh signed URL from the Admin SDK
    const [signedUrl] = await bucket.file(filename).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    // Now fetch the image using the signed URL
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(signedUrl, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) {
      throw new Error(`Invalid content-type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength === 0) {
      throw new Error('Empty response');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    console.error('Image proxy error:', e.message);
    res.status(500).send(`Image proxy failed: ${e.message}`);
  }
};
