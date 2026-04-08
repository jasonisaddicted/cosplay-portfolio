/**
 * Generates a signed URL for Firebase Storage images
 * This allows images to be accessed from any IP address, including Vercel functions
 *
 * Usage: /api/signed-url?path=<encoded_path>
 * Returns: { url: "https://firebasestorage.googleapis.com/v0/b/..." }
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const keyPath = path.join(__dirname, '../jianshencosvisual-328dc-firebase-adminsdk-fbsvc-81e1445bc4.json');
  admin.initializeApp({
    credential: admin.credential.cert(require(keyPath)),
    storageBucket: 'jianshencosvisual-328dc.appspot.com',
  });
}

const bucket = admin.storage().bucket();

module.exports = async function handler(req, res) {
  const { path: storagePath } = req.query;

  if (!storagePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  try {
    const decodedPath = decodeURIComponent(storagePath);
    console.log('Generating signed URL for:', decodedPath);

    // Generate a signed URL valid for 1 hour
    const [url] = await bucket.file(decodedPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error('Signed URL error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};
