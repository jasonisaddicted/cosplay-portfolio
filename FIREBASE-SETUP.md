# Firebase Migration Guide

## Overview
This document outlines the complete Firebase integration for the cosplay portfolio site, enabling live editing without code changes.

## What's Included
- ✅ Firebase initialization script (`firebase-init.js`)
- ✅ Admin panel UI (`admin.html`)
- 🔧 Firestore data structure
- 🔧 Firebase Authentication setup
- 🔧 Firebase Storage integration
- 🔧 App migration to fetch from Firebase

## Setup Steps

### 1. Create Firebase Authentication User
```
Email: jianshen.image.visual@gmail.com
Password: Metro2033_Bf3_new
```

In Firebase Console:
- Go to **Authentication** > **Users** tab
- Click **Create user**
- Enter email & password above
- Click **Create**

### 2. Set Up Firestore Collections & Data

The following collections need to be created with this structure:

#### `site/config` (Document)
```json
{
  "photographer": "jianshen.cos.visual",
  "subtitle": "建伸",
  "tagline": "Cosplay Photography",
  "heroLabel": "March 2025 — Featured Shots"
}
```

#### `featured` (Collection)
Documents with fields:
```json
{
  "src": "https://...",
  "character": "Character Name",
  "series": "Series Name",
  "credit": "@cosplayer_handle",
  "order": 1
}
```

#### `events` (Collection)
Documents (one per event album):
```json
{
  "id": "fanimecon-2024",
  "name": "FanimeCon 2024",
  "date": "May 2024",
  "location": "San Jose, CA",
  "cover": "https://...",
  "description": "Annual anime convention...",
  "type": "events",
  "photos": [
    {
      "src": "https://...",
      "coser": "@sakurahime_cos",
      "character": "Hu Tao",
      "series": "Genshin Impact"
    }
  ]
}
```

#### `studio` (Collection)
Documents (one per studio session):
```json
{
  "id": "genshin-jan-2025",
  "name": "Genshin Impact Session",
  "date": "January 2025",
  "location": "Studio",
  "cover": "https://...",
  "description": "Intimate studio shoot...",
  "type": "studio",
  "cosplayers": [
    {
      "name": "Sakura Hime",
      "handle": "@sakurahime_cos",
      "character": "Hu Tao",
      "series": "Genshin Impact",
      "photos": [
        { "src": "https://..." }
      ]
    }
  ]
}
```

#### `collaborators` (Collection)
Documents (one per collaborator):
```json
{
  "name": "Jane Cosplayer",
  "handle": "@jane_cos",
  "cover": "https://...",
  "bio": "Professional cosplayer...",
  "gankUrl": "https://gank.io/...",
  "type": "collab",
  "photos": [
    { "src": "https://..." }
  ]
}
```

### 3. Set Up Firebase Storage
- Storage bucket is already created: `jianshencosvisual-328dc.firebasestorage.app`
- Photos uploaded to storage will get public URLs like:
  ```
  https://firebasestorage.googleapis.com/v0/b/jianshencosvisual-328dc.firebasestorage.app/o/photos%2Fphoto-id.jpg
  ```

### 4. Update Firestore Security Rules

Go to **Firestore > Rules** and set:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated admin can write
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth.uid != null && request.auth.token.email == 'jianshen.image.visual@gmail.com';
    }
  }
}
```

### 5. Migrate Existing Data

The current data in `config.js` needs to be migrated to Firestore:

**Option A: Manual (via Firebase Console)**
1. Go to Firestore > Data
2. Create each collection manually
3. Copy data from `config.js` into Firestore documents

**Option B: Script (Recommended)**
A migration script will be provided to automate this.

### 6. Update HTML Files

Add this script tag to ALL HTML files (index.html, events.html, etc.) BEFORE `app.js`:

```html
<script type="module" src="js/firebase-init.js?v=6"></script>
```

Remove the old `<script src="js/config.js?v=6"></script>` line.

### 7. Update app.js

Modify the app initialization to wait for Firebase data:

```javascript
window.addEventListener('firebase-config-loaded', () => {
  initHome();
  initEvents();
  initStudio();
  initAlbum();
  initCollabs();
});
```

## Admin Panel Usage

Once set up, visit: `yoursite.com/admin`

**Login with:**
- Email: `jianshen.image.visual@gmail.com`
- Password: `Metro2033_Bf3_new`

**Upload photos:**
1. Go to **Events / Studio / Collabs** tab
2. Click **+ Add**
3. Upload photo (goes to Firebase Storage)
4. Fill in details (coser, character, series, etc.)
5. Click **Save**
6. Changes appear INSTANTLY on live site (no refresh needed!)

## Next Steps

1. ✅ Create admin user in Firebase Authentication
2. ✅ Create Firestore collections (use structure above)
3. ✅ Migrate data from config.js → Firestore
4. ✅ Update security rules
5. ✅ Add firebase-init.js to HTML files
6. ✅ Update app.js to use firebase-config-loaded event
7. ✅ Test admin panel at /admin

## Questions?

Refer to:
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Storage Docs](https://firebase.google.com/docs/storage)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
