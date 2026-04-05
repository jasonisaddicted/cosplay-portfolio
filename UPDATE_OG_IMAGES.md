# Automated OG Image Updates

## Quick Workflow (What You Do)

1. **Select image in admin panel** (Meta Tags section)
   - Image URL is saved to Firestore

2. **Run the build script** (one command)
   ```bash
   npm run update-og-images
   ```

3. **Push to GitHub**
   ```bash
   git push
   ```

4. **Vercel auto-deploys** with updated thumbnails ✓

That's it! Social media bots will see the correct thumbnails.

---

## Optional: Full Automation with GitHub Action

If you want to skip step 2 (run the script automatically), you can set up a GitHub Action:

1. Go to your GitHub repo
2. Create folder: `.github/workflows/`
3. Create file: `.github/workflows/update-og-images.yml`
4. Copy this content:

```yaml
name: Update OG Images from Firestore

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  update-og-images:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Update OG images from Firestore
        env:
          FIREBASE_PROJECT_ID: jianshencosvisual-328dc
        run: npm run update-og-images
        continue-on-error: true

      - name: Check for changes
        id: verify-changed-files
        run: |
          if git diff --quiet public/*.html; then
            echo "changed=false" >> $GITHUB_OUTPUT
          else
            echo "changed=true" >> $GITHUB_OUTPUT
          fi

      - name: Commit changes
        if: steps.verify-changed-files.outputs.changed == 'true'
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/*.html
          git commit -m "chore: update og:image URLs from Firestore [skip ci]"

      - name: Push changes
        if: steps.verify-changed-files.outputs.changed == 'true'
        uses: ad-m/github-push-action@master
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          branch: main
```

Then:
- Every push to main → GitHub Action runs → HTML files updated → auto-deployed ✓
- Or trigger manually from GitHub Actions tab anytime

---

## Summary

**Easiest way:** Just run `npm run update-og-images` before pushing. 1 command!

**Fully automated:** Set up GitHub Action (optional, more complex setup).

Either way works!
