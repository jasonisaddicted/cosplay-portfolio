# Cover Images Setup

## Architecture

Each album's **first photo** is automatically its **cover image** for social media previews.

- **Static files:** `/public/og/{collection}-{albumId}.jpg`
- **Firestore field:** `coverImageUrl` in each album document
- **OG meta:** Points directly to static file (instant load for Threads ✅)

## How It Works

```
Album uploaded
    ↓
First photo = cover
    ↓
Saved to /public/og/events-DrKhPEqp00W2Ci09542j.jpg
    ↓
Firestore: { coverImageUrl: "https://domain.com/og/events-..." }
    ↓
og:image meta tag → static file (instant, Threads happy)
```

## Setup Steps

### 1. Populate Existing Albums

Run the script to download cover images for all existing albums:

```bash
# Set environment variables first
export FIREBASE_CREDENTIALS='{"type":"service_account",...}'
export FIREBASE_PROJECT_ID='your-project-id'

# Run script
node scripts/populate-cover-images.js
```

This will:
- Download first photo from each album
- Save to `/public/og/`
- Update Firestore with `coverImageUrl`

### 2. Commit & Deploy

```bash
git add public/og/
git add api/album.js
git commit -m "Add static cover images for all albums"
git push origin main
```

Vercel will auto-deploy static files.

### 3. Test

The og:image meta tag will now point directly to static file:
```html
<meta property="og:image" content="https://cosplay-portfolio.vercel.app/og/events-DrKhPEqp00W2Ci09542j.jpg">
```

Threads crawler will load instantly ✅

## For Future Albums

When uploading new album photos through admin panel:

1. First photo is automatically selected as cover
2. Call `/api/save-cover-image?albumId=X&type=events` to save it
3. Or manually run the populate script again

## File Sizes

- Each cover image: ~100-300KB (optimized JPG)
- All albums: typically under 100MB total
- Vercel static files are instantly cached globally ⚡

## Troubleshooting

**Grey box still showing?**
- Clear browser cache again
- Verify `coverImageUrl` is in Firestore
- Check `/public/og/` folder exists and has files
- Run populate script again

**Script fails to download?**
- Check Firebase credentials are valid
- Verify first photo URL is accessible
- Check network connection

## References

- Static files: `/public/og/`
- Firestore field: `coverImageUrl`
- API: `/api/album.js` (uses coverImageUrl if available)
- Script: `/scripts/populate-cover-images.js`
