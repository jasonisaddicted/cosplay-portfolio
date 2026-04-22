import { Metadata } from 'next';
import { getAlbumsByType, getSiteConfig } from '@/lib/firebase/firestore';
import { generateMetadata as generateSEOMetadata, generateWebPageSchema, SITE_URL } from '@/lib/utils/seo';
import AlbumCard from '@/components/shared/AlbumCard';
import StructuredData from '@/components/shared/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return generateSEOMetadata({
    title: 'Events',
    description: 'Cosplay photos from conventions, expos, and gatherings',
    image: config.ogImages?.events,
    url: `${SITE_URL}/events`,
    keywords: ['cosplay', 'conventions', 'expos', 'events', 'photography', 'costumes'],
  });
}

export default async function EventsPage() {
  const albums = await getAlbumsByType('events');
  const pageSchema = generateWebPageSchema({
    name: 'Events — Cosplay Portfolio',
    description: 'Cosplay photos from conventions, expos, and gatherings',
    url: `${SITE_URL}/events`,
  });

  return (
    <>
      <StructuredData data={pageSchema} />
      <div className="page-events">
      {/* Hero */}
      <div className="page-hero mt-nav">
        <div className="page-hero__bg"></div>
        <div className="page-hero__content">
          <div className="page-hero__label">Gallery</div>
          <h1 className="page-hero__title">Events</h1>
          <p className="page-hero__sub">Conventions, expos &amp; gatherings</p>
        </div>
      </div>

      {/* Section Header */}
      <div className="section-header">
        <span className="section-header__label">Browse</span>
        <h2 className="section-header__title">All Events</h2>
        <span className="section-header__count">{albums.length} albums</span>
      </div>

      {/* Albums Grid */}
      <div className="albums-grid">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>

      {albums.length === 0 && (
        <div className="empty-state">
          <p>No events found. Check back soon!</p>
        </div>
      )}
      </div>
    </>
  );
}
