'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Album } from '@/lib/firebase/firestore';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasCover = album.coverImage && !imgError;

  return (
    <Link href={`/albums/${album.id}`} className="album-card-link">
      <div className="album-card">
        <div
          className="album-card__cover"
          style={{
            backgroundImage: hasCover ? `url(${album.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: hasCover ? undefined : 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
          }}
        >
          {/* Preload image to detect broken URLs */}
          {album.coverImage && !imgError && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={album.coverImage}
              alt=""
              style={{ display: 'none' }}
              onError={() => setImgError(true)}
            />
          )}
          {!hasCover && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', opacity: 0.3
            }}>
              📷
            </div>
          )}
        </div>
        <div className="album-card__overlay">
          <h3 className="album-card__title">{album.name}</h3>
          {album.eventDate && <p className="album-card__date">{album.eventDate}</p>}
          {album.photoCount != null && album.photoCount > 0 && (
            <p className="album-card__count">{album.photoCount} photos</p>
          )}
        </div>
      </div>
    </Link>
  );
}
