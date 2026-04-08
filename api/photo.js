/**
 * Individual photo sharing handler
 * - Bots: returns OG meta tags with the photo as thumbnail
 * - Humans: redirects to album.html?id=X&type=Y&photo=N so the lightbox auto-opens
 *
 * Query params:
 *   src      — Firebase Storage URL of the photo (required)
 *   albumId  — Firestore album ID
 *   type     — album type (events / studio / outdoor / collab)
 *   index    — photo index within the album (for lightbox auto-open)
 *   character, series, coser — metadata for OG title/description
 */

const BOT_UA   = /facebookexternalhit|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Googlebot|bingbot|ia_archiver|curl|python-requests|PostmanRuntime/i;
const BASE_URL = 'https://cosplay-portfolio.vercel.app';

function proxyImage(url) {
  return url ? `${BASE_URL}/api/img?url=${encodeURIComponent(url)}` : '';
}

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, m =>
    ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'": '&#039;' }[m])
  );
}

/**
 * Extract albumId from Firebase Storage URL
 * Firebase paths look like: /o/albums%252Falbum-id%252F...
 * Decoded: /albums/album-id/...
 * Returns: album-id (or null if not found)
 */
function extractAlbumIdFromUrl(firebaseUrl) {
  try {
    const url = new URL(firebaseUrl);
    // Get the 'o' parameter which contains the path
    const oParam = url.pathname.split('/o/')[1];
    if (!oParam) return null;

    // Decode once (Firebase uses %2F for /, and URL params use %)
    const decoded = decodeURIComponent(oParam);

    // Match /albums/<id>/ or similar album structure
    const match = decoded.match(/^albums[/\\]([^/\\]+)/);
    return match ? match[1] : null;
  } catch (_) {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const { src, albumId, type, index, character, series, coser } = req.query;

  if (!src) return res.status(400).json({ error: 'Missing src' });

  const photoUrl   = decodeURIComponent(src);
  const charName   = character ? decodeURIComponent(character) : '';
  const seriesName = series    ? decodeURIComponent(series)    : '';
  const coserName  = coser     ? decodeURIComponent(coser)     : '';

  const title = charName
    ? `${charName}${seriesName ? ` · ${seriesName}` : ''}${coserName ? ` by ${coserName}` : ''}`
    : 'Cosplay Photo';

  const description = charName
    ? `${charName}${seriesName ? ` from ${seriesName}` : ''}${coserName ? `, cosplayed by ${coserName}` : ''} — cosplay photography`
    : 'Professional cosplay photography';

  // Build the album page URL with photo index so lightbox auto-opens
  // If albumId missing, try to extract it from the Firebase URL as fallback
  let resolvedAlbumId = albumId;
  if (!resolvedAlbumId) {
    resolvedAlbumId = extractAlbumIdFromUrl(photoUrl);
  }

  // If type missing, default to 'events' (album.js will auto-detect if wrong)
  let resolvedType = type || 'events';

  let albumPageUrl = BASE_URL;
  if (resolvedAlbumId) {
    albumPageUrl = `${BASE_URL}/album.html?id=${encodeURIComponent(resolvedAlbumId)}&type=${encodeURIComponent(resolvedType)}`;
    if (index !== undefined && index !== '') {
      albumPageUrl += `&photo=${encodeURIComponent(index)}`;
    }
  }

  const ua    = req.headers['user-agent'] || '';
  const isBot = BOT_UA.test(ua);

  // Humans: redirect straight to the album page (lightbox opens via ?photo=N)
  if (!isBot) {
    res.setHeader('Location', albumPageUrl);
    return res.status(302).end();
  }

  // Bots: OG page — og:url points to this same /photo URL so Facebook doesn't re-scrape
  const selfUrl = `${BASE_URL}/photo?src=${encodeURIComponent(src)}` +
    (resolvedAlbumId ? `&albumId=${encodeURIComponent(resolvedAlbumId)}` : '') +
    `&type=${encodeURIComponent(resolvedType)}` +
    (index !== undefined ? `&index=${encodeURIComponent(index)}`          : '');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(selfUrl)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(proxyImage(photoUrl))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1600">
<meta property="og:image:type" content="image/jpeg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(proxyImage(photoUrl))}">
<title>${esc(title)}</title>
</head>
<body>
<p><a href="${esc(albumPageUrl)}">${esc(title)}</a></p>
<script>window.location.replace("${esc(albumPageUrl)}");</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
};
