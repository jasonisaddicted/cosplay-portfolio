import { Metadata } from 'next';
import { getAlbumsByType, getSiteConfig } from '@/lib/firebase/firestore';
import { generateMetadata as generateSEOMetadata, generateWebPageSchema, SITE_URL } from '@/lib/utils/seo';
import AlbumCard from '@/components/shared/AlbumCard';
import StructuredData from '@/components/shared/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return generateSEOMetadata({
    title: 'Outdoor',
    description: 'Outdoor and location cosplay photography shoots',
    image: config.ogImages?.outdoor,
    url: `${SITE_URL}/outdoor`,
    keywords: ['cosplay', 'outdoor photography', 'location shoots', 'nature', 'costumes', 'photography'],
  });
}

export default async function OutdoorPage() {
  const albums = await getAlbumsByType('outdoor');
  const pageSchema = generateWebPageSchema({
    name: 'Outdoor — Cosplay Portfolio',
    description: 'Outdoor and location cosplay photography shoots',
    url: `${SITE_URL}/outdoor`,
  });

  return (
    <>
      <StructuredData data={pageSchema} />
      <div className="page-outdoor">
      <div className="page-hero mt-nav">
        <div className="page-hero__bg"></div>
        <div className="page-hero__content">
          <div className="page-hero__label">Gallery</div>
          <h1 className="page-hero__title">Outdoor</h1>
          <p className="page-hero__sub">Location and outdoor shoots</p>
        </div>
      </div>

      <div className="section-header">
        <span className="section-header__label">Browse</span>
        <h2 className="section-header__title">All Outdoor Shoots</h2>
        <span className="section-header__count">{albums.length} albums</span>
      </div>

      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {albums.length === 0 && (
        <div className="empty-state">
          <p>No outdoor shoots found. Check back soon!</p>
        </div>
      )}
      </div>
    </>
  );
}
