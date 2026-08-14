'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAlbumsByType } from '@/lib/firebase/firestore';
import type { Album } from '@/lib/firebase/firestore';
import { fetchAlbumDetail, moveCoserGroup } from '@/lib/firebase/adminAlbums';
import type { AlbumDetail, AlbumType } from '@/lib/firebase/adminAlbums';

export default function AdminAlbumDetailPage() {
  const params = useParams();
  const type = params.type as AlbumType;
  const albumId = params.id as string;

  const [detail, setDetail] = useState<AlbumDetail | null>(null);
  const [otherAlbums, setOtherAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [targets, setTargets] = useState<Record<string, string>>({}); // coser -> destination album id
  const [movingCoser, setMovingCoser] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, albumId]);

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [albumDetail, albums] = await Promise.all([
        fetchAlbumDetail(type, albumId),
        getAlbumsByType(type),
      ]);
      if (!albumDetail) {
        setError('Album not found.');
        return;
      }
      setDetail(albumDetail);
      setOtherAlbums(albums.filter((a) => a.id !== albumId));
    } catch (err) {
      console.error(err);
      setError('Failed to load album.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMove(coser: string) {
    const destId = targets[coser];
    if (!destId) {
      alert('Choose a destination album first.');
      return;
    }
    setMovingCoser(coser);
    setMessage('');
    try {
      const count = await moveCoserGroup(type, albumId, destId, coser);
      const destName = otherAlbums.find((a) => a.id === destId)?.name || 'the album';
      setMessage(`✅ Moved ${count} photo${count !== 1 ? 's' : ''} for "${coser}" to ${destName}.`);
      await loadData();
    } catch (err) {
      console.error(err);
      setMessage(`❌ ${err instanceof Error ? err.message : 'Failed to move photos.'}`);
    } finally {
      setMovingCoser(null);
    }
  }

  if (loading) return <div className="admin-page"><p>Loading album...</p></div>;

  if (error || !detail) {
    return (
      <div className="admin-page">
        <p style={{ color: '#ff8888' }}>{error || 'Album not found.'}</p>
        <Link href={`/admin/${type}`} style={{ color: 'var(--accent)' }}>← Back</Link>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <Link href={`/admin/${type}`} style={{ color: 'var(--text-light)', fontSize: '0.85rem', textDecoration: 'none' }}>
        ← Back to {type}
      </Link>
      <h1 style={{ margin: '12px 0 4px 0' }}>{detail.name}</h1>
      <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '24px' }}>
        {detail.groups.reduce((sum, g) => sum + g.photos.length, 0)} photos · {detail.groups.length} coser{detail.groups.length !== 1 ? 's' : ''}
      </p>

      {message && (
        <div style={{ marginBottom: '20px', padding: '12px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '4px', fontSize: '0.85rem' }}>
          {message}
        </div>
      )}

      {detail.groups.length === 0 ? (
        <p style={{ color: 'var(--text-light)' }}>No photos in this album yet.</p>
      ) : (
        detail.groups.map((group) => (
          <div key={group.coser} style={{ marginBottom: '28px', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {group.coser} <span style={{ color: 'var(--text-light)', fontWeight: 400, fontSize: '0.85rem' }}>({group.photos.length})</span>
              </h3>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select
                  value={targets[group.coser] || ''}
                  onChange={(e) => setTargets((prev) => ({ ...prev, [group.coser]: e.target.value }))}
                  disabled={movingCoser === group.coser || otherAlbums.length === 0}
                  style={{
                    padding: '8px 10px', background: '#1a1a1a', border: '1px solid #333333',
                    borderRadius: '4px', color: 'var(--text)', fontSize: '0.85rem', fontFamily: 'inherit',
                  }}
                >
                  <option value="">Move to album…</option>
                  {otherAlbums.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleMove(group.coser)}
                  disabled={movingCoser === group.coser || !targets[group.coser]}
                  style={{
                    padding: '8px 14px', background: 'var(--accent)', color: '#000', border: 'none',
                    borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                    opacity: movingCoser === group.coser || !targets[group.coser] ? 0.5 : 1,
                  }}
                >
                  {movingCoser === group.coser ? 'Moving…' : 'Move'}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {group.photos.map((photo, i) => (
                <div
                  key={photo.id || `${group.coser}-${i}`}
                  style={{
                    flex: '0 0 auto', width: '110px', aspectRatio: '3/4', borderRadius: '4px',
                    overflow: 'hidden', background: '#1a1a1a', backgroundImage: `url(${photo.thumbUrl || photo.url})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                  }}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {otherAlbums.length === 0 && detail.groups.length > 0 && (
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem' }}>
          No other {type} albums to move photos to — create one first.
        </p>
      )}
    </div>
  );
}
