/**
 * Album Preview Image Endpoint
 * Serves the first photo of an album from our domain
 * Used for og:image meta tag (social media previews)
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
        serviceAccount = JSON.parse(credentials);
      } catch (parseError) {
        credentials = credentials.trim().replace(/^["']|["']$/g, '');
        serviceAccount = JSON.parse(credentials);
      }

      if (Object.keys(serviceAccount).length > 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
        db = admin.firestore();
      }
    } else {
      db = admin.firestore();
    }
  } catch (error) {
    console.error('[Preview API] Firebase initialization error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  const { id, type } = req.query;

  if (!id || !type) {
    return res.status(400).json({ error: 'Missing id or type parameter' });
  }

  try {
    initializeFirebase();

    // Fetch album from Firestore
    const docRef = db.collection(type).doc(id);
    const docSnap = await docRef.get();

    const albumData = docSnap.data();
    if (!albumData) {
      console.log('[Preview API] Album not found:', id);
      return res.status(404).json({ error: 'Album not found' });
    }

    // Get first photo
    const photos = albumData.photos || [];
    if (photos.length === 0) {
      console.log('[Preview API] No photos in album:', id);
      return res.status(404).json({ error: 'No photos in album' });
    }

    const firstPhoto = photos[0];
    const photoUrl = firstPhoto.src;

    if (!photoUrl) {
      console.log('[Preview API] First photo has no src:', id);
      return res.status(404).json({ error: 'Photo URL not found' });
    }

    // Fetch the image from Firebase Storage
    const https = require('https');
    const http = require('http');

    return new Promise((resolve) => {
      const protocol = photoUrl.startsWith('https') ? https : http;

      protocol.get(photoUrl, (imageRes) => {
        if (imageRes.statusCode === 200) {
          // Set headers for image response
          res.setHeader('Content-Type', imageRes.headers['content-type'] || 'image/jpeg');
          res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
          res.setHeader('Access-Control-Allow-Origin', '*');

          // Pipe the image directly
          imageRes.pipe(res);

          imageRes.on('end', () => {
            resolve();
          });
        } else {
          console.error('[Preview API] Failed to fetch image:', imageRes.statusCode);
          res.status(500).json({ error: 'Failed to fetch image' });
          resolve();
        }
      }).on('error', (error) => {
        console.error('[Preview API] Error fetching image:', error);
        res.status(500).json({ error: 'Error fetching image' });
        resolve();
      });
    });
  } catch (error) {
    console.error('[Preview API] Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
