import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/utils/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/admin',
          '/.next',
          '/api/auth',
        ],
      },
      {
        userAgent: 'GPTBot',
        disallow: '/admin',
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
