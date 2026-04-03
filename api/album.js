/**
 * Open Graph Meta Tag Generator - Vercel Serverless Function
 * Generates proper og:image for album shares on social media
 */

const admin = require('firebase-admin');

// Initialize Firebase (use environment variables for credentials)
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS || '{}');

  if (Object.keys(serviceAccount).length > 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();

/**
 * Main handler: Generate meta tags for album
 * Usage: /api/album?id=DrKhPEqp00W2Ci09542j&type=events
 */
export default async function handler(req, res) {
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

    // Fetch album from Firestore
    const docSnap = await db.collection(type).doc(id).get();

    if (!docSnap.exists()) {
      return res.status(404).json({ error: 'Album not found' });
    }

    const album = docSnap.data();
    const albumUrl = `https://jasonisaddicted.github.io/cosplay-portfolio/album.html?id=${id}&type=${type}`;
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
  <meta property="og:image" content="${firstPhotoUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${firstPhotoUrl}">

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
}
