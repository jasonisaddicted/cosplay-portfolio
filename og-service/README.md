# Open Graph Meta Tag Generator Service

This service generates proper Open Graph meta tags for album sharing on social media, including the first photo as the preview thumbnail.

## How It Works

1. When you share an album, the share button creates a link to this service: `https://og-service.your-domain.com/album?id=ALBUM_ID&type=TYPE`
2. Social media bots (Twitter, Threads, Instagram, etc.) fetch this URL
3. The service reads the album ID, fetches the data from Firestore, and returns HTML with proper `og:image` meta tags
4. The bot sees the first photo and generates a preview
5. The HTML redirects to the actual album page (`album.html?id=...`)

## Setup on Railway (Recommended - Free)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub account
3. Link your GitHub repository

### Step 2: Deploy Service
1. Go to Railway Dashboard
2. Click "New Project" → "Deploy from GitHub Repo"
3. Select your cosplay-portfolio repo
4. In the "Start Command" field, enter: `cd og-service && npm start`
5. Click Deploy

### Step 3: Add Environment Variables
1. In Railway project settings, add:
   - `FIREBASE_CREDENTIALS`: Paste the entire Firebase service account JSON
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID (e.g., `jianshencosvisual-328dc`)
   - `NODE_ENV`: `production`

### Step 4: Get Service URL
1. Railway will assign a domain like: `cosplay-og-service.railway.app`
2. Copy this URL

## Update Share Links

In `js/app.js` and `js/album.js`, update the share functions to use the OG service URL:

```javascript
// Old: directly to album.html
const url = `https://jasonisaddicted.github.io/cosplay-portfolio/album.html?id=${albumId}&type=${albumType}`;

// New: through OG service
const ogServiceUrl = 'https://your-og-service.railway.app'; // Replace with your service URL
const url = `${ogServiceUrl}/album?id=${albumId}&type=${albumType}`;
```

## Setup on Fly.io (Alternative - Also Free)

1. Install Fly CLI: `curl https://fly.io/install.sh | sh`
2. Login: `fly auth login`
3. Deploy: `fly launch` (in og-service directory)
4. Add secrets: `fly secrets set FIREBASE_CREDENTIALS=<json>`
5. Get URL: `fly info` (shows your app's URL)

## Local Testing

```bash
cd og-service
npm install
export FIREBASE_CREDENTIALS='{"type":"service_account",...}'
npm start
```

Visit: `http://localhost:3000/health` to verify it's running

Test album: `http://localhost:3000/album?id=YOUR_ALBUM_ID&type=events`

## After Deployment

1. Update `shareToSocial()` in `js/app.js` to use your service URL
2. Update `shareAlbumTo()` in `js/album.js` to use your service URL
3. Test sharing on social media (link preview should now show the album photo)

## Important Notes

- The service requires Firebase credentials with read access to Firestore
- Use the same Firebase project as your portfolio
- The service is stateless and scales automatically on Railway
- Free tier of Railway includes enough resources for moderate traffic
