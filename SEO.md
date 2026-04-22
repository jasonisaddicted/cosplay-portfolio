# SEO Implementation Guide

## Overview
The Cosplay Portfolio site has comprehensive SEO optimization implemented using Next.js best practices, structured data (Schema.org), and proper metadata management.

## Key SEO Features

### 1. Meta Tags
Every page includes:
- **Title Tags** - Unique, descriptive titles (under 60 characters)
- **Meta Descriptions** - Compelling descriptions (under 160 characters)
- **Keywords** - Relevant keywords per page
- **Canonical URLs** - Prevent duplicate content issues
- **Open Graph Tags** - Social media sharing optimization
- **Twitter Cards** - Twitter-specific previews

### 2. Structured Data (JSON-LD)
All pages include proper Schema.org structured data:
- **Organization Schema** - Identifies the brand/site
- **WebPage Schema** - Describes individual pages
- **CreativeWork Schema** - For photo/portfolio items
- **BreadcrumbList** - For navigation context (future implementation)

### 3. Sitemap
- **Dynamic `sitemap.xml`** - Generated from Firestore data
- Includes all public pages and album detail pages
- Proper changeFrequency and priority settings
- Located at: `https://cosplay-portfolio.vercel.app/sitemap.xml`

### 4. Robots.txt
- **`robots.txt`** - Controls crawler access
- Allows all crawlers on public pages
- Blocks crawlers from `/admin`, `/api/admin`, `/.next`
- Specifies sitemap location
- Located at: `https://cosplay-portfolio.vercel.app/robots.txt`

### 5. Performance Optimization
- **Image Optimization**
  - Next.js Image component ready (Firebase Storage CDN used)
  - 30-day cache for optimized images
  - Responsive image handling
- **Core Web Vitals**
  - Minimal JavaScript with server-side rendering
  - Efficient CSS loading
  - Static page generation where possible
- **Caching Headers**
  - Static assets: 1 year (immutable)
  - Images: 30 days with stale-while-revalidate
  - Styles: 7 days

### 6. Mobile Optimization
- Responsive CSS already in place
- Viewport meta tags configured
- Mobile-first design approach
- Hamburger menu for mobile navigation

### 7. URL Structure
- Clean, semantic URLs:
  - `/` - Home
  - `/events` - Event gallery
  - `/studio` - Studio gallery
  - `/outdoor` - Outdoor gallery
  - `/collabs` - Collaboration gallery
  - `/albums/[id]` - Album detail pages (coming)
  - `/admin` - Admin dashboard (coming)

## Files Contributing to SEO

### Core SEO Files
- **`lib/utils/seo.ts`** - Central SEO utilities and schema generators
- **`components/shared/StructuredData.tsx`** - JSON-LD renderer
- **`app/sitemap.ts`** - Dynamic sitemap generation
- **`app/robots.ts`** - Robots.txt configuration
- **`next.config.js`** - Performance and caching headers

### Updated Pages
All public pages updated with SEO metadata:
- `app/(public)/page.tsx` - Homepage
- `app/(public)/events/page.tsx` - Events
- `app/(public)/studio/page.tsx` - Studio
- `app/(public)/outdoor/page.tsx` - Outdoor
- `app/(public)/collabs/page.tsx` - Collabs

## Keywords by Page

### Homepage
- cosplay, photography, portfolio, costumes, characters, creative

### Events
- cosplay, conventions, expos, events, photography, costumes

### Studio
- cosplay, studio photography, professional, indoor photography, costumes

### Outdoor
- cosplay, outdoor photography, location shoots, nature, costumes, photography

### Collabs
- cosplay, collaboration, group cosplay, team, photography, projects

## Metadata Management

### SEO Utility Functions
Located in `lib/utils/seo.ts`:

```typescript
// Generate complete metadata for a page
generateMetadata({
  title: 'Page Title',
  description: 'Page description',
  image: 'og-image-url',
  url: 'page-url',
  keywords: ['keyword1', 'keyword2']
})

// Generate Organization schema
generateOrganizationSchema()

// Generate WebPage schema
generateWebPageSchema({ name, description, url, image })

// Generate Photo/CreativeWork schema
generatePhotoSchema({ name, description, image, url, author })
```

## Future SEO Enhancements

### Phase 3.5 (Album Detail Pages)
- [ ] Dynamic OG images for each album
- [ ] Album-specific metadata and keywords
- [ ] Photo-level schema markup
- [ ] BreadcrumbList navigation schema

### Phase 5+ (Admin & Advanced)
- [ ] Blog/News section with proper article schema
- [ ] Image alt text management in admin
- [ ] Schema markup for reviews/ratings
- [ ] Internal linking strategy
- [ ] Featured snippet optimization
- [ ] FAQ schema for common questions
- [ ] Video schema if video content added

## Testing SEO

### Tools to Verify
1. **Google Search Console**
   - Submit sitemap
   - Monitor indexing
   - Check for crawl errors
   - Review search performance

2. **Google PageSpeed Insights**
   - Check Core Web Vitals
   - Mobile and desktop scores
   - Performance recommendations

3. **Google Mobile-Friendly Test**
   - Verify mobile responsiveness
   - Test mobile usability

4. **Rich Results Test**
   - Verify structured data
   - Check for issues

5. **Facebook Sharing Debugger**
   - Test OG meta tags
   - Verify preview appearance

6. **Twitter Card Validator**
   - Test Twitter card appearance

### Manual Checks
```bash
# Test sitemap
curl https://cosplay-portfolio.vercel.app/sitemap.xml

# Test robots.txt
curl https://cosplay-portfolio.vercel.app/robots.txt

# Check meta tags
curl https://cosplay-portfolio.vercel.app | grep -E '<title|<meta|og:'
```

## Deployment Checklist

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Add site to Google My Business
- [ ] Set preferred domain (www vs non-www) in GSC
- [ ] Enable mobile-first indexing
- [ ] Monitor crawl stats
- [ ] Set up Search Analytics
- [ ] Create social media meta tags
- [ ] Test OG tags on Facebook/Twitter
- [ ] Monitor Core Web Vitals
- [ ] Set up monitoring alerts

## Resources

- [Next.js SEO Best Practices](https://nextjs.org/learn/seo/introduction-to-seo)
- [Schema.org Documentation](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Vercel Analytics & Monitoring](https://vercel.com/docs/analytics)
