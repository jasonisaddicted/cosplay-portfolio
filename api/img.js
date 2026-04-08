/**
 * Image proxy for social media OG thumbnails
 * Facebook/social crawlers can't always load Firebase Storage URLs directly.
 * This endpoint fetches the image from Firebase and serves it from our domain.
 *
 * Usage: /api/img?url=<encoded_firebase_url>
 * Only allows Firebase Storage URLs for security.
 */

const ALLOWED_HOSTS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
];

module.exports = async function handler(req, res) {
  const { url } = req.query;

  if (!url) return res.status(400).send('Missing url');

  let decoded;
  try {
    decoded = decodeURIComponent(url);
    const host = new URL(decoded).hostname;
    if (!ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h))) {
      return res.status(403).send('Forbidden');
    }
  } catch (_) {
    return res.status(400).send('Invalid url');
  }

  try {
    // Add timeout to prevent hanging on slow Firebase responses
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const upstream = await fetch(decoded, {
      headers: { 'User-Agent': 'cosplay-portfolio-og-proxy/1.0' },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!upstream.ok) {
      console.error('Upstream error:', upstream.status, decoded);
      return res.status(upstream.status).send('Image not found');
    }

    const contentType = upstream.headers.get('content-type');
    if (!contentType || !contentType.includes('image')) {
      console.error('Invalid content type:', contentType, 'for', decoded);
      return res.status(400).send('Invalid image');
    }

    const buffer = await upstream.arrayBuffer();
    if (buffer.byteLength === 0) {
      return res.status(400).send('Empty image');
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    console.error('Proxy error:', e.message, 'URL:', decoded);
    res.status(500).send('Image proxy failed');
  }
};
