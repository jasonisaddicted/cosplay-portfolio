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
    const upstream = await fetch(decoded, {
      headers: { 'User-Agent': 'cosplay-portfolio-og-proxy/1.0' },
    });

    if (!upstream.ok) {
      return res.status(upstream.status).send('Upstream error');
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = await upstream.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24h cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    console.error('Proxy error:', e.message);
    res.status(500).send('Proxy error');
  }
};
