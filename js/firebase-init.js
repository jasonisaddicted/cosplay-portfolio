// ============================================================
//  FIREBASE INITIALIZATION & SETUP
//  This file initializes Firebase and handles all data fetching
//  from Firestore. The site is now fully CONFIG-driven from
//  Firestore instead of config.js.
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAxdGpFkLtnceC1foAXMQbHQ5xh2jgW4M",
  authDomain: "jianshencosvisual-328dc.firebaseapp.com",
  projectId: "jianshencosvisual-328dc",
  storageBucket: "jianshencosvisual-328dc.firebasestorage.app",
  messagingSenderId: "190010774007",
  appId: "1:190010774007:web:fe4e23c6170d5d458a1ef2",
  measurementId: "G-4VL8D04KQE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// ── Global CONFIG object (populated from Firestore) ──
window.CONFIG = {};
window.db = db;
window.auth = auth;
window.storage = storage;

// ── Load all data from Firestore on page load ──
async function loadFirebaseConfig() {
  try {
    // 1. Load site config (photographer, subtitle, etc.)
    const configDoc = await getDoc(doc(db, "site", "config"));
    if (configDoc.exists()) {
      Object.assign(window.CONFIG, configDoc.data());
    }

    // 2. Load featured picks
    const featuredSnap = await getDocs(collection(db, "featured"));
    window.CONFIG.featured = [];
    featuredSnap.forEach(doc => {
      window.CONFIG.featured.push({ id: doc.id, ...doc.data() });
    });
    window.CONFIG.featured.sort((a, b) => (a.order || 999) - (b.order || 999));

    // 3. Load events
    const eventsSnap = await getDocs(collection(db, "events"));
    window.CONFIG.events = [];
    eventsSnap.forEach(doc => {
      window.CONFIG.events.push({ id: doc.id, ...doc.data() });
    });

    // 4. Load studio albums
    const studioSnap = await getDocs(collection(db, "studio"));
    window.CONFIG.studio = [];
    studioSnap.forEach(doc => {
      window.CONFIG.studio.push({ id: doc.id, ...doc.data() });
    });

    // 5. Load collaborators
    const collabsSnap = await getDocs(collection(db, "collaborators"));
    window.CONFIG.collaborators = [];
    collabsSnap.forEach(doc => {
      window.CONFIG.collaborators.push({ id: doc.id, ...doc.data() });
    });

    console.log("✅ Firebase CONFIG loaded:", window.CONFIG);
    console.log("📸 Banner Photo:", window.CONFIG.bannerPhoto);

    if (window.CONFIG.bannerPhoto) {
      console.log("✓ Banner found:", {
        character: window.CONFIG.bannerPhoto.character,
        series: window.CONFIG.bannerPhoto.series,
        coser: window.CONFIG.bannerPhoto.coser,
        hasSrc: !!window.CONFIG.bannerPhoto.src
      });
    } else {
      console.warn("⚠ No banner photo in config");
    }

    // Dispatch custom event so pages can initialize
    window.dispatchEvent(new CustomEvent('firebase-config-loaded'));
  } catch (error) {
    console.error("❌ Failed to load Firebase CONFIG:", error);
  }
}

// Load config as soon as this script runs
loadFirebaseConfig();

export { db, auth, storage };
