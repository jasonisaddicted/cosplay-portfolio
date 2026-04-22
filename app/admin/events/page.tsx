'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { getAlbumsByType } from '@/lib/firebase/firestore';
import type { Album } from '@/lib/firebase/firestore';

export default function AdminEventsPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        setLoading(true);
        const data = await getAlbumsByType('events');
        setAlbums(data);
      } catch (err) {
        setError('Failed to load albums');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
    return <div className="admin-page"><p>Loading albums...</p></div>;
  }

  return (
    <div className="admin-page">
      <h1 style={{ margin: '0 0 24px 0' }}>Manage Events</h1>

      {error && (
        <div style={{ color: '#ff8888', marginBottom: '20px', padding: '12px', background: '#3a1f1f', borderRadius: '4px' }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-light)' }}>
          Total Albums: <strong>{albums.length}</strong>
        </p>
      </div>

      {albums.length === 0 ? (
        <p style={{ color: 'var(--text-light)' }}>No event albums found. Create one to get started.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          {albums.map((album) => (
            <div
              key={album.id}
              style={{
                background: '#111111',
                border: '1px solid #2a2a2a',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              {album.coverImage && (
                <div
                  style={{
                    aspectRatio: '1',
                    backgroundImage: `url(${album.coverImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
              )}
              <div style={{ padding: '16px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem' }}>{album.name}</h3>
                {album.eventDate && (
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {album.eventDate}
                  </p>
                )}
                <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Order: {album.displayOrder ?? 'N/A'}
                </p>
                <button
                  style={{
                    marginTop: '12px',
                    padding: '8px 12px',
                    background: 'var(--accent)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                  onClick={() => alert(`Edit album: ${album.id}\n\nFull CRUD interface coming soon!`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '40px',
          padding: '20px',
          background: '#111111',
          border: '1px solid #2a2a2a',
          borderRadius: '4px',
          color: 'var(--text-light)',
        }}
      >
        <p>
          <strong>📝 Note:</strong> Full CRUD operations (Create, Edit, Delete, Reorder) coming in Phase 2 of admin
          development. This page shows your current albums and their order in Firestore.
        </p>
      </div>
    </div>
  );
}
