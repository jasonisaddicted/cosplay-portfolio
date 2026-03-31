# Deploying to GitHub Pages (Free Hosting)

Your portfolio is a pure static site — no server, no build step needed.
GitHub Pages hosts it for free at `https://yourusername.github.io/your-repo-name/`.

---

## One-Time Setup

### 1. Install Git (if not already)
```
https://git-scm.com/download/mac
```

### 2. Create a GitHub account
```
https://github.com/signup
```

### 3. Create a new repository on GitHub
- Go to https://github.com/new
- Name it something like `cosplay-portfolio`
- Set it to **Public** (required for free GitHub Pages)
- Do NOT initialise with README
- Click **Create repository**

### 4. Push your site from Terminal
Open Terminal in `/Users/jianshen/cosplay-portfolio/` and run:

```bash
cd /Users/jianshen/cosplay-portfolio
git init
git add .
git commit -m "Initial portfolio deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cosplay-portfolio.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

### 5. Enable GitHub Pages
- Go to your repository on GitHub
- Click **Settings** → **Pages** (left sidebar)
- Under **Source**, select **Deploy from a branch**
- Branch: `main`, folder: `/ (root)`
- Click **Save**

Your site will be live in ~1 minute at:
```
https://YOUR_USERNAME.github.io/cosplay-portfolio/
```

---

## Updating Your Site

Whenever you edit `js/config.js` (add photos, new events, etc.):

```bash
cd /Users/jianshen/cosplay-portfolio
git add js/config.js
git commit -m "Update content"
git push
```

GitHub Pages will automatically redeploy within ~30 seconds.

---

## Using Your Own Domain (Optional)

If you own a custom domain (e.g. `jianshen.photography`):

1. In your domain registrar, add a CNAME record:
   - Name: `www`
   - Value: `YOUR_USERNAME.github.io`

2. In GitHub Pages settings, enter your custom domain.

3. Tick **Enforce HTTPS** (free SSL certificate).

---

## Important: Local Image Paths

Currently, photos use `https://picsum.photos/...` placeholder URLs.
When you replace them with your real photos:

- Put your images in `images/events/event-id/` or `images/studio/session-id/`
- In `config.js`, use paths like: `"images/events/fanimecon-2024/photo01.jpg"`
- Commit and push — GitHub Pages will serve them automatically.

---

## Quick Reference

| Action | Command |
|--------|---------|
| Check what changed | `git status` |
| Stage all changes | `git add .` |
| Save a commit | `git commit -m "your message"` |
| Push to live site | `git push` |
