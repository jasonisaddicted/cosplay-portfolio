# Build Scripts

## update-og-images.js

This script reads og:image URLs from Firestore and automatically injects them into your HTML files.

**Why?** Social media bots (Facebook, Threads, etc.) don't execute JavaScript - they only read static HTML. This script ensures the correct og:image URLs are baked into the HTML files so bots can fetch the correct thumbnails.

### How to Use

#### 1. Set up Firebase Authentication

You need credentials to access Firestore. Choose one:

**Option A: Local Development (with service account key)**
```bash
# Download your Firebase service account key from Firebase Console
# Project Settings → Service Accounts → Generate new private key

export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
npm run update-og-images
```

**Option B: Vercel Deployment (automatic)**
The script uses Application Default Credentials, which work automatically on Vercel if you've connected your Firebase project.

#### 2. Run the Script

```bash
npm run update-og-images
```

The script will:
- Connect to Firestore
- Read `site/config` → `ogImages`
- Update og:image meta tags in HTML files:
  - `public/events.html`
  - `public/studio.html`
  - `public/outdoor.html`
  - `public/collabs.html`
  - `public/index.html`

#### 3. Commit and Deploy

```bash
git add public/*.html
git commit -m "Update og:image URLs from Firestore"
git push origin main
```

### Workflow

1. **Admin selects image** in admin panel meta-tags section
2. **Image URL saved** to Firestore (`site/config` → `ogImages.[page]`)
3. **Run build script** (`npm run update-og-images`)
4. **HTML files updated** with new og:image URLs
5. **Commit and deploy** to Vercel
6. **Social media bots** fetch the updated HTML with correct thumbnails

### What Gets Updated

The script updates the `content` attribute of the `og:image` meta tag:

**Before:**
```html
<meta property="og:image" content="https://old-image-url.jpg">
```

**After:**
```html
<meta property="og:image" content="https://firebasestorage.googleapis.com/v0/b/.../albums%2Famg-2025%2F...">
```

### Troubleshooting

**Error: "GOOGLE_APPLICATION_CREDENTIALS env var not set"**
- Download your Firebase service account key
- Set the environment variable pointing to it

**Error: "site/config document not found in Firestore"**
- Make sure you have a `site` collection with a `config` document in Firestore
- The document should have an `ogImages` field with keys like `events`, `studio`, etc.

**No changes detected**
- Check that og:image meta tags exist in the HTML files
- Verify the URLs in Firestore are valid

### Advanced: Automated Deployment

To run this automatically on deployment, you can add it to `vercel.json`:

```json
{
  "buildCommand": "npm run update-og-images && echo 'No build needed'",
  ...
}
```

This will run the script every time you deploy to Vercel.
