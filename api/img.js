/**
 * Image proxy for social media OG thumbnails
 * Facebook/social crawlers can't always load Firebase Storage URLs directly.
 * This endpoint fetches the image from Firebase and serves it from our domain.
 *
 * Usage: /api/img?url=<encoded_firebase_url>
 * Only allows Firebase Storage URLs for security.
 */

const https = require('https');
const http = require('http');
const url = require('url');

const ALLOWED_HOSTS = [
  'firebasestorage.googleapis.com',
  'storage.googleapis.com',
];

module.exports = async function handler(req, res) {
  const { url: urlParam } = req.query;

  if (!urlParam) return res.status(400).send('Missing url');

  let decoded;
  try {
    decoded = decodeURIComponent(urlParam);
    const host = new URL(decoded).hostname;
    if (!ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h))) {
      return res.status(403).send('Forbidden');
    }
  } catch (_) {
    return res.status(400).send('Invalid url');
  }

  try {
    // Use Node.js https module for better performance
    const urlObj = new URL(decoded);
    const protocol = urlObj.protocol === 'https:' ? https : http;

    const fetchPromise = new Promise((resolve, reject) => {
      let req;
      const timeout = setTimeout(() => {
        req.destroy();
        reject(new Error('Fetch timeout'));
      }, 8000); // 8 second timeout

      try {
        req = protocol.get(
          {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            headers: {
              'User-Agent': 'facebookexternalhit/1.1',
            },
            timeout: 8000,
          },
          (upstream) => {
            clearTimeout(timeout);

            if (upstream.statusCode !== 200) {
              reject(new Error(`Status ${upstream.statusCode}`));
              return;
            }

            const contentType = upstream.headers['content-type'];
            if (!contentType || !contentType.includes('image')) {
              reject(new Error(`Invalid content-type: ${contentType}`));
              return;
            }

            const chunks = [];
            upstream.on('data', chunk => chunks.push(chunk));
            upstream.on('end', () => {
              const buffer = Buffer.concat(chunks);
              if (buffer.length === 0) {
                reject(new Error('Empty response'));
                return;
              }
              resolve({ contentType, buffer });
            });
            upstream.on('error', reject);
          }
        );
        req.on('error', (e) => {
          clearTimeout(timeout);
          reject(e);
        });
      } catch (setupError) {
        clearTimeout(timeout);
        reject(setupError);
      }
    });

    const { contentType, buffer } = await fetchPromise;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(buffer);
  } catch (e) {
    console.error('Proxy error:', e.message, 'URL:', decoded, 'Stack:', e.stack);
    res.status(500).send(`Image proxy failed: ${e.message}`);
  }
};
