/**
 * Load OG Image from Firestore and update meta tags
 * This script dynamically updates og:image based on admin selections
 */

async function loadOgImageFromFirestore() {
  try {
    // Determine which page we're on from body class
    const bodyClasses = document.body.className;
    let pageKey = null;

    if (bodyClasses.includes('page-events')) pageKey = 'events';
    else if (bodyClasses.includes('page-studio')) pageKey = 'studio';
    else if (bodyClasses.includes('page-outdoor')) pageKey = 'outdoor';
    else if (bodyClasses.includes('page-collabs')) pageKey = 'collabs';
    else if (bodyClasses.includes('page-home') || document.location.pathname === '/index.html') pageKey = 'home';

    if (!pageKey) return; // Not a page that needs dynamic OG images

    // Wait for Firebase to be ready
    if (!window.db) {
      console.log('Waiting for Firebase...');
      await new Promise(resolve => {
        const checkFirebase = setInterval(() => {
          if (window.db) {
            clearInterval(checkFirebase);
            resolve();
          }
        }, 100);
        setTimeout(() => clearInterval(checkFirebase), 5000); // Timeout after 5s
      });
    }

    if (!window.db) {
      console.warn('Firebase not available, using static og:image');
      return;
    }

    // Load from Firestore
    const { getDoc, doc } = window;
    const configDoc = await getDoc(doc(window.db, 'site', 'config'));

    if (configDoc.exists()) {
      const ogImages = configDoc.data().ogImages || {};
      const imageUrl = ogImages[pageKey];

      if (imageUrl) {
        console.log(`Loaded og:image for ${pageKey}:`, imageUrl);

        // Update og:image meta tag
        let ogImageMeta = document.querySelector('meta[property="og:image"]');
        if (ogImageMeta) {
          ogImageMeta.setAttribute('content', imageUrl);
        } else {
          // Create if doesn't exist
          ogImageMeta = document.createElement('meta');
          ogImageMeta.setAttribute('property', 'og:image');
          ogImageMeta.setAttribute('content', imageUrl);
          document.head.appendChild(ogImageMeta);
        }

        // Also update twitter:image
        let twitterImageMeta = document.querySelector('meta[name="twitter:image"]');
        if (twitterImageMeta) {
          twitterImageMeta.setAttribute('content', imageUrl);
        }

        console.log('✓ OG image meta tags updated from Firestore');
      }
    }
  } catch (err) {
    console.error('Error loading og:image from Firestore:', err);
    // Silently fail - use static og:image as fallback
  }
}

// Load OG image as soon as DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadOgImageFromFirestore);
} else {
  loadOgImageFromFirestore();
}
