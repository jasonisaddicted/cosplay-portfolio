/**
 * Album page handler
 * - Bots (Facebook, Twitter, etc.): returns OG meta tags with real photo thumbnail
 * - Humans: serves album.html directly so Firebase JS loads normally
 *
 * Firestore collection map:
 *   type=events  → tries 'albums' then 'events'
 *   type=studio  → 'studio'
 *   type=outdoor → 'outdoor'
 *   type=collab  → 'collaborators' (CONFIG-only, no Firestore — uses query image)
 */

const fs   = require('fs');
const path = require('path');

const PROJECT_ID = 'jianshencosvisual-328dc';
const BASE_URL   = 'https://cosplay-portfolio.vercel.app';

const BOT_UA = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|ia_archiver|curl|python-requests|PostmanRuntime/i;

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#039;' }[m])
  );
}

function collectionsFor(type) {
  if (type === 'events')  return ['albums', 'events'];
  if (type === 'studio')  return ['studio'];
  if (type === 'outdoor') return ['outdoor'];
  return [type, 'albums'];
}

async function fetchAlbum(id, type) {
  for (const col of collectionsFor(type)) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${col}/${id}`;
      const res  = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data.fields) return data.fields;
    } catch (_) {}
  }
  return null;
}

function firstPhotoSrc(fields) {
  // Standard photos array
  const photos = fields.photos?.arrayValue?.values || [];
  if (photos.length > 0) {
    const src = photos[0].mapValue?.fields?.src?.stringValue;
    if (src) return src;
  }
  // Studio format: cosplayers[0].photos[0].src
  const cosplayers = fields.cosplayers?.arrayValue?.values || [];
  if (cosplayers.length > 0) {
    const coserPhotos = cosplayers[0].mapValue?.fields?.photos?.arrayValue?.values || [];
    if (coserPhotos.length > 0) {
      const src = coserPhotos[0].mapValue?.fields?.src?.stringValue;
      if (src) return src;
    }
  }
  // Explicit cover
  return fields.coverImageUrl?.stringValue || '';
}

function extractStoragePath(firebaseUrl) {
  // Extract path from Firebase Storage URL
  // Input: https://firebasestorage.googleapis.com/v0/b/bucket.firebasestorage.app/o/photos%2Fevents%2Fimage.jpg?alt=media&token=...
  // Output: photos/events/image.jpg
  if (!firebaseUrl) return '';
  try {
    const url = new URL(firebaseUrl);
    const pathMatch = url.pathname.match(/\/o\/(.*?)$/);
    if (pathMatch) {
      return decodeURIComponent(pathMatch[1]);
    }
  } catch (_) {}
  return '';
}

function serveAlbumHtml(res) {
  try {
    // Inject <base href="/"> so relative CSS/JS paths resolve correctly
    // when served from /api/album instead of /album.html
    const html = fs.readFileSync(path.join(__dirname, '../public/album.html'), 'utf8')
      .replace('<head>', '<head><base href="/">');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    return res.status(200).send(html);
  } catch (e) {
    return res.status(500).send('Error loading page');
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { id, type } = req.query;
  const ua = req.headers['user-agent'] || '';
  const isBot = BOT_UA.test(ua);

  // Humans always get the real album.html
  if (!isBot) return serveAlbumHtml(res);

  // No album params — still serve the page (bot hit root album.html)
  if (!id || !type) return serveAlbumHtml(res);

  // --- Bot: build OG response ---
  let title       = 'Cosplay Album';
  let description = 'Professional cosplay photography album';
  let ogImage     = req.query.image ? decodeURIComponent(req.query.image) : '';

  try {
    const fields = await fetchAlbum(id, type);
    if (fields) {
      title       = fields.name?.stringValue        || title;
      description = fields.description?.stringValue || `${title} — cosplay photography`;
      if (!ogImage) ogImage = firstPhotoSrc(fields);
    }
  } catch (e) {
    console.error('Firestore error:', e.message);
  }

  const pageUrl  = `${BASE_URL}/album.html?id=${encodeURIComponent(id)}&type=${encodeURIComponent(type)}`;
  // Route og:image through our proxy so Facebook can always load it
  // Extract storage path and pass to proxy for reliable access
  const storagePath = extractStoragePath(ogImage);
  const ogImageProxied = storagePath
    ? `${BASE_URL}/api/img?path=${encodeURIComponent(storagePath)}`
    : '';

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(ogImageProxied)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1600">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(ogImageProxied)}">
<title>${esc(title)}</title>
</head>
<body>
<p><a href="${esc(pageUrl)}">${esc(title)}</a></p>
<script>window.location.replace("${esc(pageUrl)}");</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
};
