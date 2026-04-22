import { Metadata } from 'next';
import { getFeatured, getSiteConfig } from '@/lib/firebase/firestore';
import { generateMetadata as generateSEOMetadata, generateOrganizationSchema, generateWebPageSchema, SITE_URL, SITE_DESCRIPTION } from '@/lib/utils/seo';
import StructuredData from '@/components/shared/StructuredData';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSiteConfig();
  return generateSEOMetadata({
    title: 'Cosplay Portfolio',
    description: SITE_DESCRIPTION,
    image: config.ogImages?.home,
    url: `${SITE_URL}/`,
    keywords: ['cosplay', 'photography', 'portfolio', 'costumes', 'characters', 'creative'],
  });
}

export default async function HomePage() {
  const featured = await getFeatured();
  const orgSchema = generateOrganizationSchema();
  const pageSchema = generateWebPageSchema({
    name: 'Cosplay Portfolio - Home',
    description: SITE_DESCRIPTION,
    url: `${SITE_URL}/`,
  });

  return (
    <>
      <StructuredData data={orgSchema} />
      <StructuredData data={pageSchema} />
      <div className="page-home">
      {/* Hero Section */}
      <div className="page-hero mt-nav">
        <div className="page-hero__bg"></div>
        <div className="page-hero__content">
          <div className="page-hero__label">Welcome</div>
          <h1 className="page-hero__title">Cosplay Portfolio</h1>
          <p className="page-hero__sub">Professional photography and cosplay showcase</p>
        </div>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section className="featured-section">
          <div className="section-header">
            <span className="section-header__label">Featured</span>
            <h2 className="section-header__title">Latest Highlights</h2>
          </div>
          <div className="featured-carousel">
            {featured.slice(0, 5).map((photo, idx) => (
              <div
                key={idx}
                className="featured-carousel__item"
                style={{
                  backgroundImage: `url(${photo.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {photo.cosplayer && (
                  <div className="featured-carousel__overlay">
                    <p className="featured-carousel__name">{photo.cosplayer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="cta-section">
        <h2>Explore Collections</h2>
        <p>Browse our galleries by category</p>
        <div className="cta-grid">
          <a href="/events" className="cta-card">
            <h3>Events</h3>
            <p>Convention & expo photos</p>
          </a>
          <a href="/studio" className="cta-card">
            <h3>Studio</h3>
            <p>Professional studio sessions</p>
          </a>
          <a href="/outdoor" className="cta-card">
            <h3>Outdoor</h3>
            <p>Location and outdoor shoots</p>
          </a>
          <a href="/collabs" className="cta-card">
            <h3>Collabs</h3>
            <p>Collaboration projects</p>
          </a>
        </div>
      </section>
      </div>
    </>
  );
}
