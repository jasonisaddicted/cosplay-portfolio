import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata, SITE_URL } from '@/lib/utils/seo';

export async function generateMetadata(): Promise<Metadata> {
  // Default metadata for album pages - will be overridden by page component
  return generateSEOMetadata({
    title: 'Album',
    description: 'View cosplay photos from this album',
    url: `${SITE_URL}/albums`,
    keywords: ['cosplay', 'album', 'photography', 'gallery'],
  });
}

export default function AlbumLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
