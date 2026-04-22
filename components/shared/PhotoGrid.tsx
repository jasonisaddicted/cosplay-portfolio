'use client';

import { useState } from 'react';
import type { Photo } from '@/lib/firebase/firestore';

interface PhotoGridProps {
  photos: Photo[];
  onPhotoClick?: (photo: Photo, index: number) => void;
}

export default function PhotoGrid({ photos, onPhotoClick }: PhotoGridProps) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleImageLoad = (url: string) => {
    setLoadedImages((prev) => new Set([...prev, url]));
  };

  const handlePhotoClick = (photo: Photo, index: number) => {
    if (onPhotoClick) {
      onPhotoClick(photo, index);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="empty-state">
        <p>No photos in this album yet.</p>
      </div>
    );
  }

  return (
    <div className="photo-grid">
      {photos.map((photo, index) => (
        <div
          key={photo.id || index}
          className="photo-grid__item"
          onClick={() => handlePhotoClick(photo, index)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handlePhotoClick(photo, index);
            }
          }}
        >
          <div className="photo-grid__image-wrapper">
            <img
              src={photo.url}
              alt={photo.cosplayer || 'Photo'}
              className={`photo-grid__image ${
                loadedImages.has(photo.url) ? 'loaded' : 'loading'
              }`}
              onLoad={() => handleImageLoad(photo.url)}
              loading="lazy"
            />
            {photo.cosplayer && (
              <div className="photo-grid__overlay">
                <p className="photo-grid__cosplayer">{photo.cosplayer}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
