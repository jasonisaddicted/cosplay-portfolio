import { Metadata } from 'next';
import { getAlbumsByType, getSiteConfig } from '@/lib/firebase/firestore';
import { generateMetadata as generateSEOMetadata, generateWebPageSchema, SITE_URL } from '@/lib/utils/seo';
import AlbumCard from '@/components/shared/AlbumCard';
import StructuredData from '@/components/shared/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return generateSEOMetadata({
    title: 'Collabs',
    description: 'Collaboration and group cosplay photography projects',
    image: config.ogImages?.collabs,
    url: `${SITE_URL}/collabs`,
    keywords: ['cosplay', 'collaboration', 'group cosplay', 'team', 'photography', 'projects'],
  });
}

export default async function CollabsPage() {
  const albums = await getAlbumsByType('collabs');
  const pageSchema = generateWebPageSchema({
    name: 'Collabs — Cosplay Portfolio',
    description: 'Collaboration and group cosplay photography projects',
    url: `${SITE_URL}/collabs`,
  });

  return (
    <>
      <StructuredData data={pageSchema} />
      <div className="page-collabs">
      <div className="page-hero mt-nav">
        <div className="page-hero__bg"></div>
        <div className="page-hero__content">
          <div className="page-hero__label">Gallery</div>
          <h1 className="page-hero__title">Collabs</h1>
          <p className="page-hero__sub">Collaboration projects</p>
        </div>
      </div>

      <div className="section-header">
        <span className="section-header__label">Browse</span>
        <h2 className="section-header__title">All Collaborations</h2>
        <span className="section-header__count">{albums.length} albums</span>
      </div>

      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {albums.length === 0 && (
        <div className="empty-state">
          <p>No collaborations found. Check back soon!</p>
        </div>
      )}
      </div>
    </>
  );
}
