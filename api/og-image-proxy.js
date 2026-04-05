/**
 * OG Image Proxy - serves Firebase Storage images with public cache headers
 * Usage: /api/og-image-proxy?url=<encoded-firebase-url>
 */

module.exports = async function handler(req, res) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const imageUrl = decodeURIComponent(url);

    // Fetch the image from Firebase Storage
    const imageRes = await fetch(imageUrl);

    if (!imageRes.ok) {
      return res.status(imageRes.status).json({ error: 'Image not found' });
    }

    const buffer = await imageRes.arrayBuffer();

    // Set public cache headers
    res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

    res.status(200).send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
};
