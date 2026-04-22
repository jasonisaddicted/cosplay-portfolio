'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getAlbum, getAlbumPhotos } from '@/lib/firebase/firestore';
import { generatePhotoSchema, SITE_URL } from '@/lib/utils/seo';
import PhotoGrid from '@/components/shared/PhotoGrid';
import Lightbox from '@/components/shared/Lightbox';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import StructuredData from '@/components/shared/StructuredData';
import type { Album, Photo } from '@/lib/firebase/firestore';

export default function AlbumDetailPage() {
  const params = useParams();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    const fetchAlbumData = async () => {
      try {
        setLoading(true);

        // We need to determine the album type - for now, search across types
        const types = ['events', 'studio', 'outdoor', 'collabs'] as const;
        let foundAlbum: Album | null = null;
        let foundPhotos: Photo[] = [];

        for (const type of types) {
          const albumData = await getAlbum(type, albumId);
          if (albumData) {
            foundAlbum = albumData;
            foundPhotos = await getAlbumPhotos(type, albumId);
            break;
          }
        }

        setAlbum(foundAlbum);
        setPhotos(foundPhotos);
      } catch (error) {
        console.error('Error fetching album data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (albumId) {
      fetchAlbumData();
    }
  }, [albumId]);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleNextPhoto = () => {
    setLightboxIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = () => {
    setLightboxIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  if (loading) {
    return (
      <div className="page-album">
        <div className="loading">Loading album...</div>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="page-album">
        <div className="page-hero mt-nav">
          <div className="page-hero__bg"></div>
          <div className="page-hero__content">
            <h1 className="page-hero__title">Album Not Found</h1>
          </div>
        </div>
        <div className="empty-state">
          <p>Sorry, this album could not be found.</p>
          <a href="/" className="button">Back to Home</a>
        </div>
      </div>
    );
  }

  const photoSchema = generatePhotoSchema({
    name: album.name,
    description: album.description || `Photos from ${album.name}`,
    image: album.coverImage,
    url: `${SITE_URL}/albums/${albumId}`,
    author: 'Cosplay Portfolio',
  });

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: album.type.charAt(0).toUpperCase() + album.type.slice(1), url: `/${album.type}` },
    { name: album.name, url: `/albums/${albumId}` },
  ];

  return (
    <>
      <StructuredData data={photoSchema} />
      <div className="page-album">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Hero Section */}
        <div className="page-hero mt-nav">
          <div
            className="page-hero__bg"
            style={{
              backgroundImage: `url(${album.coverImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
          <div className="page-hero__content">
            <div className="page-hero__label">{album.type.charAt(0).toUpperCase() + album.type.slice(1)}</div>
            <h1 className="page-hero__title">{album.name}</h1>
            {album.eventDate && <p className="page-hero__sub">{album.eventDate}</p>}
            {album.location && <p className="page-hero__sub">{album.location}</p>}
          </div>
        </div>

        {/* Album Info */}
        {album.description && (
          <div className="album-info">
            <p>{album.description}</p>
          </div>
        )}

        {/* Photos Count */}
        <div className="section-header">
          <span className="section-header__label">Gallery</span>
          <h2 className="section-header__title">{album.name}</h2>
          <span className="section-header__count">{photos.length} photos</span>
        </div>

        {/* Photo Grid */}
        <PhotoGrid photos={photos} onPhotoClick={handlePhotoClick} />

        {/* Lightbox */}
        <Lightbox
          photos={photos}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          onNext={handleNextPhoto}
          onPrev={handlePrevPhoto}
        />
      </div>
    </>
  );
}
