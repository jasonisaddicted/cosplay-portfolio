import { MetadataRoute } from 'next';
import { getAlbumsByType } from '@/lib/firebase/firestore';
import { SITE_URL } from '@/lib/utils/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL;
  const lastModified = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/events`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/studio`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/outdoor`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/collabs`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  // Dynamic album pages
  let albumPages: MetadataRoute.Sitemap = [];
  try {
    const types = ['events', 'studio', 'outdoor', 'collabs'] as const;

    for (const type of types) {
      const albums = await getAlbumsByType(type);
      const pages = albums.map((album) => ({
        url: `${baseUrl}/albums/${album.id}`,
        lastModified,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
      albumPages = [...albumPages, ...pages];
    }
  } catch (error) {
    console.error('Error fetching albums for sitemap:', error);
  }

  return [...staticPages, ...albumPages];
}
