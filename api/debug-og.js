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
  try {
    initializeFirebase();

    const configDoc = await db.collection('site').doc('config').get();

    if (!configDoc.exists) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const config = configDoc.data();
    const ogImages = config.ogImages || {};
    const bannerPhoto = config.bannerPhoto || {};

    return res.json({
      "ogImages.home": ogImages.home || 'NOT SET',
      "ogImages.events": ogImages.events || 'NOT SET',
      "ogImages.featured": ogImages.featured || 'NOT SET',
      "ogImages.outdoor": ogImages.outdoor || 'NOT SET',
      "ogImages.studio": ogImages.studio || 'NOT SET',
      "ogImages.collabs": ogImages.collabs || 'NOT SET',
      "bannerPhoto.src": bannerPhoto.src || 'NOT SET',
      "ALL_ogImages": ogImages
    });

  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
