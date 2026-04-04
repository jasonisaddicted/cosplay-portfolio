/**
 * Populate Cover Images
 *
 * This script:
 * 1. Queries all albums from Firestore
 * 2. Downloads first photo from each album
 * 3. Saves to /public/og/ folder
 * 4. Updates Firestore with coverImageUrl field
 *
 * Usage:
 * node scripts/populate-cover-images.js
 */

const admin = require('firebase-admin');
const https = require('https');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_CREDENTIALS);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.FIREBASE_PROJECT_ID,
});

const db = admin.firestore();

/**
 * Download image from URL
 */
function downloadImage(imageUrl, savePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(savePath);
    https.get(imageUrl, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(savePath);
      });
    }).on('error', (err) => {
      fs.unlink(savePath, () => {});
      reject(err);
    });
  });
}

/**
 * Main function
 */
async function populateCoverImages() {
  const collections = ['events', 'studio', 'collaborators', 'outdoor'];
  const ogFolder = path.join(__dirname, '../public/og');

  // Create /public/og folder if it doesn't exist
  if (!fs.existsSync(ogFolder)) {
    fs.mkdirSync(ogFolder, { recursive: true });
    console.log('✓ Created /public/og folder');
  }

  for (const collectionName of collections) {
    console.log(`\n📸 Processing ${collectionName}...`);

    const snapshot = await db.collection(collectionName).get();

    for (const doc of snapshot.docs) {
      const album = doc.data();
      const albumId = doc.id;

      if (!album.photos || album.photos.length === 0) {
        console.log(`  ⊘ ${albumId}: No photos`);
        continue;
      }

      const firstPhoto = album.photos[0];
      const coverImageUrl = `https://cosplay-portfolio.vercel.app/og/${collectionName}-${albumId}.jpg`;
      const savePath = path.join(ogFolder, `${collectionName}-${albumId}.jpg`);

      try {
        // Download image
        console.log(`  ⬇️  Downloading ${albumId}...`);
        await downloadImage(firstPhoto.src, savePath);

        // Update Firestore
        await db.collection(collectionName).doc(albumId).update({ coverImageUrl });

        console.log(`  ✓ ${albumId}: Saved to /public/og/`);
      } catch (err) {
        console.error(`  ✗ ${albumId}: ${err.message}`);
      }
    }
  }

  console.log('\n✅ Done! All cover images populated.');
  console.log('📌 Next steps:');
  console.log('   1. Commit changes: git add public/og/');
  console.log('   2. Commit: git commit -m "Add cover images for all albums"');
  console.log('   3. Push: git push origin main');
  console.log('   4. Vercel will auto-deploy with new static files');

  process.exit(0);
}

// Run
populateCoverImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
