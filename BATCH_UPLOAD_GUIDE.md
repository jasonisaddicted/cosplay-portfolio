# Batch Upload Script - Setup & Usage Guide

## Overview
This script automates uploading entire event folders to Firebase. It:
- ✅ Reads `#To Upload` folder structure
- ✅ Creates/updates events automatically
- ✅ Detects multi-day (D1, D2, D3) and single-day events
- ✅ Extracts cosplayer names from filenames
- ✅ Uploads all photos to Firebase Storage
- ✅ Saves metadata to Firestore

## Folder Structure

```
#To Upload/
├── Event Name 1/
│   ├── D1/
│   │   ├── web_cosername1_01-post-vfx-edr.jpg
│   │   ├── web_cosername2_01-post-vfx-edr.jpg
│   │   └── ...
│   ├── D2/
│   │   ├── web_cosername1_01-post-vfx-edr.jpg
│   │   └── ...
│   └── D3/
│       └── ...
│
├── Event Name 2/
│   ├── D1/
│   └── D2/
│
└── Single Day Event/
    ├── web_cosername_01-post-vfx-edr.jpg
    ├── web_cosername_02-post-vfx-edr.jpg
    └── ...  (no D1, D2, D3 folders = single day)
```

**Rules:**
- Folder name = Event name (appears on website)
- D1, D2, D3, etc. = Multi-day event
- No day folders = Single day event (defaults to "Day 1")
- Filenames should follow: `web_cosername_*-*-*.jpg`

## Setup (One-Time)

### Step 1: Install Dependencies
```bash
cd /Users/jianshen/cosplay-portfolio
npm install firebase-admin
```

### Step 2: Get Firebase Service Account
1. Go to Firebase Console → Project Settings
2. Click "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save as `firebase-service-account.json` in project root
5. ⚠️ **NEVER commit this file** (already in .gitignore)

### Step 3: Verify Setup
```bash
node batch-upload-events.js --dry-run
```

If it works, you'll see validation of your folder structure.

---

## Usage

### Basic Upload (Recommended: Always test first!)

**Step 1: Dry Run (Test without uploading)**
```bash
node batch-upload-events.js --dry-run
```

This checks folder structure and shows what WOULD be uploaded (no changes made).

**Step 2: Real Upload**
```bash
node batch-upload-events.js
```

**Step 3: Verify on Website**
- Open admin panel → Events
- Your new events should appear!
- Open your website → Events page
- Photos should be live

### Custom Upload Folder
```bash
node batch-upload-events.js "/path/to/custom/folder"
```

---

## What Gets Created

### For Each Event:
- ✅ New Firestore document in `events` collection
- ✅ Event name, date, location fields
- ✅ `albumLikes: 0` (for Like button)
- ✅ `photoLikes: {}` (for photo-level likes)

### For Each Photo:
- ✅ Uploaded to Firebase Storage
- ✅ Cosplayer name auto-extracted
- ✅ Character & Series set to "Unknown" (edit in admin panel)
- ✅ Day field set based on folder (D1 → "Day 1")
- ✅ Like count badge ready to go

---

## Example Walkthrough

```
Input folder:
#To Upload/
└── Cosmic 2025/
    ├── D1/
    │   ├── web_sakurahime_01-post-vfx-edr.jpg
    │   ├── web_sakurahime_02-post-vfx-edr.jpg
    │   └── web_serenity_01-post-vfx-edr.jpg
    └── D2/
        └── web_mika_01-post-vfx-edr.jpg

Command:
$ node batch-upload-events.js

Output:
🚀 BATCH UPLOAD SCRIPT - Event Albums
=====================================

📁 Found 1 event(s) to upload:

✅ Cosmic 2025:
   - Day 1: 3 photos
   - Day 2: 1 photo

📤 Uploading: Cosmic 2025
   Event ID: cosmic2025abc123
   Uploading Day 1 (3 photos)...
   ✓ 3 uploaded, 0 failed
   Uploading Day 2 (1 photos)...
   ✓ 1 uploaded, 0 failed
✅ Cosmic 2025: 4 photos uploaded

=====================================
✅ Upload complete! 4 photos uploaded
🌐 Changes are live on your website
```

**Result in Admin Panel:**
- New event: "Cosmic 2025"
- Photos auto-grouped:
  - Day 1: sakurahime (2 photos), serenity (1 photo)
  - Day 2: mika (1 photo)
- Cosplayer names auto-filled: @sakurahime, @serenity, @mika
- Character/Series set to "Unknown" (you can edit)
- Like counts ready to track

---

## Troubleshooting

### "Firebase service account not found"
- Make sure `firebase-service-account.json` exists in project root
- Set env var: `export FIREBASE_SERVICE_ACCOUNT="/path/to/file.json"`

### "No day folders (D1, D2...) or photos found"
- Check folder structure matches example above
- Make sure photos are .jpg, .jpeg, .png, or .gif
- Verify D1, D2 folder names are uppercase

### "Event folder is empty"
- Add photos to the event folder
- Create D1 subfolder if multi-day

### Photos not showing after upload
- Check admin panel → your event → photos
- If photos show but characters are blank, edit them (normal - auto-extraction only gets cosplayer name)
- Refresh browser if using cache

### Upload stuck or slow
- Script uploads in parallel batches (5 at a time)
- Large batches (100+ photos) may take several minutes
- Check internet connection

---

## Safety Features

✅ **Validation**: Script checks folder structure before uploading
✅ **Dry Run**: Test with `--dry-run` before real upload
✅ **Error Handling**: Continues if one photo fails, reports which ones
✅ **No Overwrites**: Only adds photos, doesn't delete
✅ **No Breaking Changes**: Separate script, doesn't modify website code

---

## Advanced

### Script Logic
1. Scans `#To Upload` folder
2. Validates each event folder
3. Detects day folders (D1, D2, D3)
4. Extracts cosplayer names from filenames
5. Uploads photos to Firebase Storage in batches
6. Creates/updates event documents in Firestore
7. Adds photos to event

### Filename Parsing
Pattern: `web_cosername_#-post-vfx-edr.jpg`
- Extracts: `cosername`
- Auto-fills: `@cosername` in admin panel

Fallback: If pattern doesn't match, tries to extract text between underscores.

---

## Frequently Asked Questions

**Q: Can I upload the same event twice?**
A: Yes! The script checks if event exists. If it does, it adds photos to that event.

**Q: What if filenames don't match the pattern?**
A: Script tries to extract text between underscores. If fails, cosplayer = "Unknown" (you can edit in admin).

**Q: Can I upload while the website is live?**
A: Yes! Changes are live immediately (no downtime needed).

**Q: What about character and series information?**
A: They default to "Unknown". Edit them in the admin panel after upload. (We only extract cosplayer names from filenames.)

**Q: Can I modify the script?**
A: Yes, but be careful! Test with `--dry-run` after changes.

---

## Need Help?

Check the script output for error messages. They'll tell you exactly what went wrong.
