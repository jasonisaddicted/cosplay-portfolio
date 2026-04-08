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
  'firebasestorage.app', // Firebase Storage app domains (*.firebasestorage.app)
];

module.exports = async function handler(req, res) {
  const { url: urlParam } = req.query;

  if (!urlParam) return res.status(400).send('Missing url');

  let decoded;
  try {
    decoded = decodeURIComponent(urlParam);
    console.log('Image proxy request for:', decoded.substring(0, 100));
    const host = new URL(decoded).hostname;
    if (!ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h))) {
      return res.status(403).send('Forbidden');
    }
  } catch (_) {
    return res.status(400).send('Invalid url');
  }

  try {
    // Use Fetch API to retrieve image
    console.log('Fetching image from:', decoded);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(decoded, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    console.log('Response status:', response.status);
    console.log('Response headers:', JSON.stringify(Object.fromEntries(response.headers)));

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
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(Buffer.from(buffer));
  } catch (e) {
    console.error('Proxy error:', e.message, 'URL:', decoded);
    res.status(500).send(`Image proxy failed: ${e.message}`);
  }
};
