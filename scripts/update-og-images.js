#!/usr/bin/env node

/**
 * Build Script: Update OG Images in HTML files from Firestore
 *
 * Reads og:image URLs from Firestore (site/config) and injects them into HTML files
 * Run this before deploying to ensure social media previews use the latest selected images
 *
 * Usage:
 *   node scripts/update-og-images.js
 */

const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');

// Check if GOOGLE_APPLICATION_CREDENTIALS env var is set
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath && !process.env.FIREBASE_PROJECT_ID) {
  console.error('❌ Error: GOOGLE_APPLICATION_CREDENTIALS env var not set');
  console.error('   Set it to the path of your Firebase service account JSON key');
  process.exit(1);
}

try {
  if (credentialsPath && fs.existsSync(credentialsPath)) {
    admin.initializeApp({
      credential: admin.credential.cert(require(path.resolve(credentialsPath)))
    });
  } else {
    // Use Application Default Credentials (works on Vercel, Google Cloud, etc.)
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  }
} catch (err) {
  console.error('❌ Firebase initialization error:', err.message);
  process.exit(1);
}

const db = admin.firestore();

// Map of page keys to HTML files and meta tag patterns
const pageConfig = {
  events: {
    file: 'public/events.html',
    metaTag: 'og:image'
  },
  studio: {
    file: 'public/studio.html',
    metaTag: 'og:image'
  },
  outdoor: {
    file: 'public/outdoor.html',
    metaTag: 'og:image'
  },
  collabs: {
    file: 'public/collabs.html',
    metaTag: 'og:image'
  },
  home: {
    file: 'public/index.html',
    metaTag: 'og:image'
  }
};

async function updateOgImages() {
  try {
    console.log('📡 Fetching og:image URLs from Firestore...');

    // Read from Firestore
    const configDoc = await db.collection('site').doc('config').get();

    if (!configDoc.exists) {
      console.error('❌ site/config document not found in Firestore');
      process.exit(1);
    }

    const configData = configDoc.data();
    const ogImages = configData.ogImages || {};

    if (Object.keys(ogImages).length === 0) {
      console.warn('⚠️  No ogImages found in Firestore');
      process.exit(1);
    }

    console.log('✓ Retrieved og:image URLs:');
    Object.entries(ogImages).forEach(([page, url]) => {
      console.log(`  ${page}: ${url.substring(0, 80)}...`);
    });

    // Update HTML files
    console.log('\n🔄 Updating HTML files...');

    for (const [page, imageUrl] of Object.entries(ogImages)) {
      if (!pageConfig[page]) {
        console.warn(`⚠️  No HTML file configured for page: ${page}`);
        continue;
      }

      const { file, metaTag } = pageConfig[page];
      const filePath = path.join(process.cwd(), file);

      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️  File not found: ${file}`);
        continue;
      }

      let content = fs.readFileSync(filePath, 'utf8');

      // Find and replace the og:image meta tag
      // Pattern: <meta property="og:image" content="...">
      const pattern = new RegExp(
        `(<meta\\s+property="og:image"\\s+content=")([^"]*)(")`,
        'g'
      );

      const updated = content.replace(pattern, `$1${imageUrl}$3`);

      if (updated !== content) {
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log(`✓ Updated ${page} (${file})`);
      } else {
        console.warn(`⚠️  og:image meta tag not found in ${file}`);
      }
    }

    console.log('\n✅ OG image URLs updated successfully!');
    console.log('💡 Remember to commit and deploy these changes');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

// Run the script
updateOgImages();
