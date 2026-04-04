const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'jianshencosvisual-328dc';

module.exports = async (req, res) => {
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
        const ogImages = fields.ogImages?.mapValue?.fields || {};

        // Outdoor doesn't have its own og:image, use events image as fallback
        const outdoorImage = ogImages.outdoor?.stringValue || ogImages.events?.stringValue;

        if (outdoorImage) {
          ogImageUrl = outdoorImage;
          console.log('Using og:image from Firestore (outdoor):', ogImageUrl);
        }
      }
    } catch (fetchError) {
      console.error('Error fetching from Firestore:', fetchError);
    }

    // Read the static HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'outdoor.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Replace the og:image meta tag
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${ogImageUrl}"`
    );

    // Set proper cache headers
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');

    return res.status(200).send(html);

  } catch (error) {
    console.error('Error generating outdoor page:', error);
    try {
      const htmlPath = path.join(process.cwd(), 'public', 'outdoor.html');
      const html = fs.readFileSync(htmlPath, 'utf-8');
      return res.status(200).send(html);
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
      return res.status(500).json({ error: 'Failed to serve outdoor page' });
    }
  }
};
