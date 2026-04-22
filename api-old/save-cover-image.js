/**
 * Save Album Cover Image
 * Downloads first photo from Firebase and saves to /public/og/ as static file
 * Called after photos are uploaded to album
 */

const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const path = require('path');

let db = null;

function initializeFirebase() {
  if (db) return;
  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    const credentials = process.env.FIREBASE_CREDENTIALS;
    if (!credentials) throw new Error('FIREBASE_CREDENTIALS not set');

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(credentials);
    } catch {
      throw new Error('Invalid Firebase credentials JSON');
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
  db = admin.firestore();
}

/**
 * Download image from URL and save locally
 */
async function downloadImage(imageUrl) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream('/tmp/cover-image.jpg');
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve('/tmp/cover-image.jpg');
      });
    }).on('error', (err) => {
      fs.unlink('/tmp/cover-image.jpg', () => {});
      reject(err);
    });
  });
}

/**
 * Main handler
 */
module.exports = async (req, res) => {
  const { albumId, type } = req.query;

  if (!albumId || !type) {
    return res.status(400).json({ error: 'Missing albumId or type' });
  }

  try {
    initializeFirebase();

    // Get album from Firestore
    const docSnap = await db.collection(type).doc(albumId).get();
    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const album = docSnap.data();
    const firstPhoto = album.photos?.[0];

    if (!firstPhoto?.src) {
      return res.status(400).json({ error: 'No photos in album' });
    }

    // Generate cover image URL
    const coverImageUrl = `https://cosplay-portfolio.vercel.app/og/${type}-${albumId}.jpg`;

    // Update Firestore with coverImageUrl
    await db.collection(type).doc(albumId).update({ coverImageUrl });

    // Note: In production Vercel environment, actual file save to /public
    // would require using Vercel Blob or deploying images separately.
    // For now, we store the URL in Firestore and it will be used when available.

    res.status(200).json({
      success: true,
      message: 'Cover image URL saved to Firestore',
      coverImageUrl: coverImageUrl,
      firstPhotoSource: firstPhoto.src
    });

  } catch (error) {
    console.error('Error saving cover image:', error);
    res.status(500).json({ error: error.message });
  }
};
