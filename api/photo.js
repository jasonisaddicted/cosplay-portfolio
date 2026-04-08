/**
 * Individual Photo Sharing Handler
 * Serves og:image metadata for a single photo, then redirects to the album
 * Usage: /api/photo?src=<photo_url>&albumId=<id>&type=<type>&character=<name>&series=<name>
 */

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { src, albumId, type, character, series, coser } = req.query;

  if (!src) {
    return res.status(400).json({ error: 'Missing src' });
  }

  const esc = (s) => {
    if (!s) return '';
    return s.replace(/[&<>"']/g, m => {
      const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
      return map[m];
    });
  };

  const photoUrl = decodeURIComponent(src);
  const charName  = character ? decodeURIComponent(character) : '';
  const seriesName = series  ? decodeURIComponent(series)    : '';
  const coserName  = coser   ? decodeURIComponent(coser)     : '';

  const title = charName
    ? `${charName}${seriesName ? ` · ${seriesName}` : ''}${coserName ? ` by ${coserName}` : ''}`
    : 'Cosplay Photo';

  const description = charName
    ? `${charName}${seriesName ? ` from ${seriesName}` : ''}${coserName ? `, cosplayed by ${coserName}` : ''}`
    : 'Professional cosplay photography';

  const base = 'https://cosplay-portfolio.vercel.app';
  const redirectUrl = albumId && type
    ? `${base}/album.html?id=${encodeURIComponent(albumId)}&type=${encodeURIComponent(type)}`
    : base;

  // og:url must point to this API endpoint, not album.html
  // Otherwise Facebook follows og:url and re-scrapes the static page
  const canonicalUrl = `${base}/photo?src=${encodeURIComponent(src)}${albumId ? `&albumId=${encodeURIComponent(albumId)}` : ''}${type ? `&type=${encodeURIComponent(type)}` : ''}`;

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(canonicalUrl)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(photoUrl)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="1600">
<meta property="og:image:type" content="image/jpeg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(photoUrl)}">
<title>${esc(title)}</title>
</head>
<body>
<p>Redirecting to <a href="${esc(redirectUrl)}">${esc(title)}</a>...</p>
<script>window.location.replace("${esc(redirectUrl)}");</script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.status(200).send(html);
};
