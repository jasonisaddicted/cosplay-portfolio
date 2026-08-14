'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getAlbumsByType } from '@/lib/firebase/firestore';
import type { Album } from '@/lib/firebase/firestore';

export default function AdminOutdoorPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const data = await getAlbumsByType('outdoor');
        setAlbums(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) return <div className="admin-page"><p>Loading albums...</p></div>;

  return (
    <div className="admin-page">
      <h1 style={{ margin: '0 0 24px 0' }}>Manage Outdoor</h1>
      <p style={{ color: 'var(--text-light)' }}>Total Albums: <strong>{albums.length}</strong></p>

      {albums.length === 0 ? (
        <p style={{ color: 'var(--text-light)' }}>No outdoor albums found.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
          {albums.map((album) => (
            <div key={album.id} style={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: '4px', overflow: 'hidden' }}>
              {album.coverImage && (
                <div style={{ aspectRatio: '1', backgroundImage: `url(${album.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{album.name}</h3>
                <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-light)' }}>Order: {album.displayOrder ?? 'N/A'}</p>
                <button style={{ marginTop: '12px', padding: '8px 12px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%', fontWeight: 600, fontSize: '0.9rem' }}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
