const fs = require('fs');
const path = require('path');

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

      let serviceAccount = JSON.parse(credentials);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }

    db = admin.firestore();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // Only intercept GET requests to root path
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    initializeFirebase();

    // Get the config from Firestore to find the og:image
    const configDoc = await db.collection('site').doc('config').get();
    let ogImageUrl = 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';

    if (configDoc.exists) {
      const config = configDoc.data();
      ogImageUrl = config.ogImages?.home || config.bannerPhoto?.src || ogImageUrl;
      console.log('Using og:image from Firestore:', ogImageUrl);
    }

    // Read the static HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Replace the og:image meta tag with the one from Firestore
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${ogImageUrl}"`
    );

    // Set proper cache headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    return res.status(200).send(html);

  } catch (error) {
    console.error('Error generating homepage:', error);
    // Fallback to static file on error
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return res.status(200).send(html);
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return res.status(500).json({ error: 'Failed to serve homepage' });
    }
  }
};
