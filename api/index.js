import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const firebaseConfig = {
  apiKey: "AIzaSyBAxdGpFkLtnceC1foAXMQbHQ5xh2jgW4M",
  authDomain: "jianshencosvisual-328dc.firebaseapp.com",
  projectId: "jianshencosvisual-328dc",
  storageBucket: "jianshencosvisual-328dc.firebasestorage.app",
  messagingSenderId: "190010774007",
  appId: "1:190010774007:web:fe4e23c6170d5d458a1ef2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  // Only intercept GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the config from Firestore to find the og:image
    const configDoc = await getDoc(doc(db, 'site', 'config'));
    let ogImageUrl = 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';

    if (configDoc.exists()) {
      const config = configDoc.data();
      ogImageUrl = config.ogImages?.home || config.bannerPhoto?.src || ogImageUrl;
    }

    // Read the static HTML file
    const htmlPath = path.join(process.cwd(), 'public', 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // Replace the og:image meta tag with the one from Firestore
    html = html.replace(
      /<meta property="og:image" content="[^"]*"/,
      `<meta property="og:image" content="${ogImageUrl}"`
    );

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
      return res.status(500).json({ error: 'Failed to serve homepage' });
    }
  }
}
