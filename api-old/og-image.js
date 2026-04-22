import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

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
  try {
    // Get the config from Firestore
    const configDoc = await getDoc(doc(db, 'site', 'config'));

    if (!configDoc.exists()) {
      return res.status(404).json({ error: 'Config not found' });
    }

    const config = configDoc.data();
    const homeOgImage = config.ogImages?.home || config.bannerPhoto?.src || 'https://cosplay-portfolio.vercel.app/og/events-oYgXpPvdrEnzQrTqypGY.jpg';

    // Return the og:image URL
    return res.json({
      ogImage: homeOgImage,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching og:image:', error);
    return res.status(500).json({ error: error.message });
  }
}
