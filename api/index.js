const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'jianshencosvisual-328dc';

module.exports = async (req, res) => {
  // Only intercept GET requests to root path
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch config from Firestore REST API
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/site/config`;

    let ogImageUrl = 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';

    try {
      const response = await fetch(firestoreUrl);
      if (response.ok) {
        const data = await response.json();
        const fields = data.fields || {};

        // Extract ogImages.home or bannerPhoto.src
        const ogImages = fields.ogImages?.mapValue?.fields || {};
        const homeImage = ogImages.home?.stringValue;

        if (homeImage) {
          ogImageUrl = homeImage;
          console.log('Using og:image from Firestore:', ogImageUrl);
        } else {
          const bannerPhoto = fields.bannerPhoto?.mapValue?.fields || {};
          const bannerSrc = bannerPhoto.src?.stringValue;
          if (bannerSrc) {
            ogImageUrl = bannerSrc;
            console.log('Using og:image from bannerPhoto:', ogImageUrl);
          }
        }
      }
    } catch (fetchError) {
      console.error('Error fetching from Firestore:', fetchError);
      // Continue with default if fetch fails
    }

    // Read the static HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Replace the og:image meta tag with the one from Firestore
    // Remove hardcoded dimensions so Facebook auto-detects actual image aspect ratio
    html = html
      .replace(/<meta property="og:image" content="[^"]*"/, `<meta property="og:image" content="${ogImageUrl}"`)
      .replace(/<meta property="og:image:width" content="[^"]*">/g, '')
      .replace(/<meta property="og:image:height" content="[^"]*">/g, '')
      .replace(/<meta property="og:image:type" content="[^"]*">/g, '');

    // Set proper cache headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    return res.status(200).send(html);

  } catch (error) {
    console.error('Error generating homepage:', error);
    // Fallback to static file on error
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'index.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return res.status(200).send(html);
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return res.status(500).json({ error: 'Failed to serve homepage' });
    }
  }
};
