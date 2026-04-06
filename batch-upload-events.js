#!/usr/bin/env node
/**
 * BATCH UPLOAD SCRIPT - Automate Event Album Uploads
 *
 * Folder Structure:
 * #To Upload/
 * ├── Event Name 1/
 * │   ├── D1/ (optional)
 * │   ├── D2/ (optional)
 * │   └── D3/ (optional)
 * └── Event Name 2/
 *     └── (no day folders = single day event)
 *
 * Usage: node batch-upload-events.js [path-to-upload-folder]
 * Example: node batch-upload-events.js "./#To Upload"
 */

const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// ─ Firebase Setup ─
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: Firebase service account not found at:', serviceAccountPath);
  console.error('Please set FIREBASE_SERVICE_ACCOUNT env var or place firebase-service-account.json in project root');
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'jianshencosvisual-328dc.firebasestorage.app'
});

const db = admin.firestore();
const storage = admin.storage();

// ─ Configuration ─
const UPLOAD_FOLDER = process.argv[2] || './#To Upload';
const BATCH_SIZE = 5; // Upload this many photos in parallel
const DRY_RUN = process.argv.includes('--dry-run');

// ─ Helper Functions ─

/**
 * Extract cosplayer name from filename
 * Pattern: web_cosername_#-post-vfx-edr.jpg
 */
function extractCoserFromFilename(filename) {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const match = nameWithoutExt.match(/web_([^_]+)_/);

  if (match && match[1]) {
    return match[1].trim();
  }

  const parts = nameWithoutExt.split('_');
  if (parts.length > 1 && parts[1] !== '#') {
    return parts[1].trim();
  }

  return null;
}

/**
 * Check if folder is a day folder (D1, D2, D3, etc.)
 */
function isDayFolder(folderName) {
  return /^D\d+$/i.test(folderName);
}

/**
 * Convert D1, D2, D3 to "Day 1", "Day 2", "Day 3"
 */
function parseDayFolder(folderName) {
  const match = folderName.match(/^D(\d+)$/i);
  return match ? `Day ${match[1]}` : null;
}

/**
 * Validate event structure
 */
function validateEventFolder(eventPath, eventName) {
  const issues = [];

  if (!fs.existsSync(eventPath)) {
    issues.push(`Event folder does not exist: ${eventPath}`);
    return issues;
  }

  const items = fs.readdirSync(eventPath);

  if (items.length === 0) {
    issues.push(`Event folder is empty: ${eventName}`);
  }

  // Check if has day folders or photos directly
  const dayFolders = items.filter(item => isDayFolder(item) && fs.statSync(path.join(eventPath, item)).isDirectory());
  const photos = items.filter(item => /\.(jpg|jpeg|png|gif)$/i.test(item));

  if (dayFolders.length === 0 && photos.length === 0) {
    issues.push(`No day folders (D1, D2...) or photos found in: ${eventName}`);
  }

  // If has both day folders AND loose photos, warn
  if (dayFolders.length > 0 && photos.length > 0) {
    issues.push(`⚠️  WARNING: ${eventName} has both day folders AND loose photos (may cause confusion)`);
  }

  return issues;
}

/**
 * Get all photos from a folder (recursively or not)
 */
function getPhotosFromFolder(folderPath) {
  const items = fs.readdirSync(folderPath);
  const photos = [];

  for (const item of items) {
    const itemPath = path.join(folderPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isFile() && /\.(jpg|jpeg|png|gif)$/i.test(item)) {
      photos.push({
        path: itemPath,
        filename: item,
        coser: extractCoserFromFilename(item)
      });
    }
  }

  return photos;
}

/**
 * Get all events from #To Upload folder
 */
function scanEventFolders(uploadPath) {
  if (!fs.existsSync(uploadPath)) {
    console.error(`❌ Upload folder not found: ${uploadPath}`);
    process.exit(1);
  }

  const items = fs.readdirSync(uploadPath);
  const events = [];

  for (const item of items) {
    const itemPath = path.join(uploadPath, item);
    const stat = fs.statSync(itemPath);

    if (stat.isDirectory() && !item.startsWith('.')) {
      events.push({
        name: item,
        path: itemPath
      });
    }
  }

  return events.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Parse event structure into uploadable format
 */
function parseEventStructure(eventPath, eventName) {
  const items = fs.readdirSync(eventPath);
  const dayFolders = items.filter(item => isDayFolder(item) && fs.statSync(path.join(eventPath, item)).isDirectory());
  const loosePhotos = getPhotosFromFolder(eventPath);

  const batches = [];

  // Case 1: Has day folders (D1, D2, D3, etc.)
  if (dayFolders.length > 0) {
    for (const dayFolder of dayFolders.sort()) {
      const dayPath = path.join(eventPath, dayFolder);
      const dayName = parseDayFolder(dayFolder);
      const photos = getPhotosFromFolder(dayPath);

      if (photos.length > 0) {
        batches.push({
          day: dayName,
          photos: photos,
          count: photos.length
        });
      }
    }
  }
  // Case 2: Loose photos (single day event)
  else if (loosePhotos.length > 0) {
    batches.push({
      day: 'Day 1', // Default to single day
      photos: loosePhotos,
      count: loosePhotos.length
    });
  }

  return batches;
}

/**
 * Upload file to Firebase Storage
 */
async function uploadPhotoToStorage(filePath, filename, eventName, dayName) {
  const storagePath = `photos/events/${Date.now()}_${filename}`;
  const file = storage.bucket().file(storagePath);

  try {
    await file.save(fs.readFileSync(filePath), {
      metadata: {
        contentType: 'image/jpeg',
        metadata: {
          eventName: eventName,
          dayName: dayName
        }
      }
    });

    const url = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    return url[0];
  } catch (err) {
    throw new Error(`Failed to upload ${filename}: ${err.message}`);
  }
}

/**
 * Create or get event document
 */
async function getOrCreateEvent(eventName, eventDate = '', location = '') {
  try {
    const query = db.collection('events').where('name', '==', eventName);
    const snap = await query.get();

    if (!snap.empty) {
      return snap.docs[0].id; // Event exists
    }

    // Create new event
    const eventRef = await db.collection('events').add({
      name: eventName,
      date: eventDate,
      location: location,
      photos: [],
      albumLikes: 0,
      photoLikes: {},
      createdAt: new Date().toISOString()
    });

    return eventRef.id;
  } catch (err) {
    throw new Error(`Failed to get/create event: ${err.message}`);
  }
}

/**
 * Get existing photos (filename + size) in event
 */
async function getExistingPhotos(eventId) {
  try {
    const eventRef = await db.collection('events').doc(eventId).get();
    if (!eventRef.exists) return [];

    const photos = eventRef.data().photos || [];
    return photos.map(p => ({
      filename: p.filename,
      size: p.size || 0
    })).filter(p => p.filename);
  } catch (err) {
    console.error('Warning: Could not check existing files:', err.message);
    return [];
  }
}

/**
 * Upload batch of photos to event
 */
async function uploadPhotoBatch(eventId, photos, dayName, eventName) {
  const uploadedPhotos = [];
  let successCount = 0;
  let failCount = 0;
  let duplicateCount = 0;

  // Get existing photos to avoid duplicates
  const existingPhotos = await getExistingPhotos(eventId);

  // Filter out duplicates (by filename + size)
  const newPhotos = photos.filter(photo => {
    const isDuplicate = existingPhotos.some(existing =>
      existing.filename === photo.filename && existing.size === photo.size
    );

    if (isDuplicate) {
      console.log(`  ⊘ ${photo.filename}: Already exists (skipped)`);
      duplicateCount++;
      return false;
    }
    return true;
  });

  // Upload in parallel batches
  for (let i = 0; i < newPhotos.length; i += BATCH_SIZE) {
    const batch = newPhotos.slice(i, i + BATCH_SIZE);
    const uploads = batch.map(async (photo) => {
      try {
        const url = await uploadPhotoToStorage(photo.path, photo.filename, eventName, dayName);
        const fileSize = fs.statSync(photo.path).size;

        return {
          src: url,
          coser: photo.coser || 'Unknown',
          character: 'Unknown', // User can edit later
          series: 'Unknown',
          day: dayName,
          filename: photo.filename,
          size: fileSize, // Store file size for duplicate detection
          uploadedAt: new Date().toISOString()
        };
      } catch (err) {
        console.error(`  ❌ ${photo.filename}: ${err.message}`);
        failCount++;
        return null;
      }
    });

    const results = await Promise.all(uploads);
    uploadedPhotos.push(...results.filter(r => r !== null));
    successCount += results.filter(r => r !== null).length;
  }

  return { uploadedPhotos, successCount, failCount, duplicateCount };
}

/**
 * Main upload function
 */
async function main() {
  console.log('🚀 BATCH UPLOAD SCRIPT - Event Albums');
  console.log('=====================================\n');

  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Scan event folders
  const events = scanEventFolders(UPLOAD_FOLDER);
  console.log(`📁 Found ${events.length} event(s) to upload:\n`);

  if (events.length === 0) {
    console.log('No events found to upload.');
    process.exit(0);
  }

  // Validate all events first
  let hasIssues = false;
  for (const event of events) {
    const issues = validateEventFolder(event.path, event.name);

    if (issues.length > 0) {
      hasIssues = true;
      console.log(`⚠️  ${event.name}:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    } else {
      const structure = parseEventStructure(event.path, event.name);
      console.log(`✅ ${event.name}:`);
      structure.forEach(batch => {
        console.log(`   - ${batch.day}: ${batch.count} photos`);
      });
    }
  }

  if (hasIssues) {
    console.log('\n⚠️  Please fix issues above before uploading.\n');
    process.exit(1);
  }

  console.log('\n');

  if (DRY_RUN) {
    console.log('✓ Validation passed (dry run)');
    process.exit(0);
  }

  // Upload all events
  let totalUploaded = 0;

  for (const event of events) {
    console.log(`📤 Uploading: ${event.name}`);

    try {
      // Get or create event
      const eventId = await getOrCreateEvent(event.name);
      console.log(`   Event ID: ${eventId}`);

      // Get event structure
      const batches = parseEventStructure(event.path, event.name);

      // Upload each day's photos
      let eventPhotos = [];

      for (const batch of batches) {
        console.log(`   Uploading ${batch.day} (${batch.count} photos)...`);

        const { uploadedPhotos, successCount, failCount } = await uploadPhotoBatch(
          eventId,
          batch.photos,
          batch.day,
          event.name
        );

        eventPhotos.push(...uploadedPhotos);
        console.log(`   ✓ ${successCount} uploaded, ${failCount} failed`);
      }

      // Save all photos to Firestore
      if (eventPhotos.length > 0) {
        await db.collection('events').doc(eventId).update({
          photos: admin.firestore.FieldValue.arrayUnion(...eventPhotos)
        });

        console.log(`✅ ${event.name}: ${eventPhotos.length} photos uploaded\n`);
        totalUploaded += eventPhotos.length;
      }
    } catch (err) {
      console.error(`❌ ${event.name}: ${err.message}\n`);
    }
  }

  console.log('=====================================');
  console.log(`✅ Upload complete! ${totalUploaded} photos uploaded`);
  console.log('🌐 Changes are live on your website\n');

  process.exit(0);
}

// Run
main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
