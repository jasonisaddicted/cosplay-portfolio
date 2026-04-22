import Link from 'next/link';
import type { Album } from '@/lib/firebase/firestore';

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.id}`} className="album-card-link">
      <div className="album-card">
        <div
          className="album-card__cover"
          style={{
            backgroundImage: `url(${album.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="album-card__overlay">
          <h3 className="album-card__title">{album.name}</h3>
          {album.eventDate && <p className="album-card__date">{album.eventDate}</p>}
          {album.photoCount && <p className="album-card__count">{album.photoCount} photos</p>}
        </div>
      </div>
    </Link>
  );
}
