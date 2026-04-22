import { Metadata } from 'next';
import { getAlbumsByType, getSiteConfig } from '@/lib/firebase/firestore';
import { generateMetadata as generateSEOMetadata, generateWebPageSchema, SITE_URL } from '@/lib/utils/seo';
import AlbumCard from '@/components/shared/AlbumCard';
import StructuredData from '@/components/shared/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return generateSEOMetadata({
    title: 'Studio',
    description: 'Professional studio cosplay photography sessions',
    image: config.ogImages?.studio,
    url: `${SITE_URL}/studio`,
    keywords: ['cosplay', 'studio photography', 'professional', 'indoor photography', 'costumes'],
  });
}

export default async function StudioPage() {
  const albums = await getAlbumsByType('studio');
  const pageSchema = generateWebPageSchema({
    name: 'Studio — Cosplay Portfolio',
    description: 'Professional studio cosplay photography sessions',
    url: `${SITE_URL}/studio`,
  });

  return (
    <>
      <StructuredData data={pageSchema} />
      <div className="page-studio">
      <div className="page-hero mt-nav">
        <div className="page-hero__bg"></div>
        <div className="page-hero__content">
          <div className="page-hero__label">Gallery</div>
          <h1 className="page-hero__title">Studio</h1>
          <p className="page-hero__sub">Professional studio sessions</p>
        </div>
      </div>

      <div className="section-header">
        <span className="section-header__label">Browse</span>
        <h2 className="section-header__title">All Studio Sessions</h2>
        <span className="section-header__count">{albums.length} albums</span>
      </div>

      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {albums.length === 0 && (
        <div className="empty-state">
          <p>No studio sessions found. Check back soon!</p>
        </div>
      )}
      </div>
    </>
  );
}
