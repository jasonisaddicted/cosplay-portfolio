'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

interface UploadedPhoto {
  id: string;
  url: string;
  cosplayer?: string;
  album?: string;
  uploadedAt: string;
}

interface Album {
  id: string;
  name: string;
  type: 'events' | 'studio' | 'outdoor' | 'collabs';
}

export default function AdminPhotosPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Record<string, UploadedPhoto[]>>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cosplayer, setCosplayer] = useState('');
  const [albumType, setAlbumType] = useState<'events' | 'studio' | 'outdoor' | 'collabs'>('events');
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [newAlbumName, setNewAlbumName] = useState('');

  // Load albums and photos on mount
  useEffect(() => {
    loadData();
  }, [albumType]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load albums for current type
      const albumsRef = collection(db, albumType);
      const albumsSnap = await getDocs(query(albumsRef, orderBy('displayOrder', 'asc')));
      const loadedAlbums: Album[] = albumsSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Untitled',
        type: albumType
      }));
      setAlbums(loadedAlbums);

      // Load photos for each album
      const photosByAlbum: Record<string, UploadedPhoto[]> = {};
      for (const album of loadedAlbums) {
        const photosRef = collection(db, albumType, album.id, 'photos');
        const photosSnap = await getDocs(query(photosRef, orderBy('uploadedAt', 'desc')));
        photosByAlbum[album.id] = photosSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UploadedPhoto[];
      }
      setPhotos(photosByAlbum);

      // Set first album as selected
      if (loadedAlbums.length > 0 && !selectedAlbumId) {
        setSelectedAlbumId(loadedAlbums[0].id);
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async () => {
    if (!newAlbumName.trim()) {
      alert('Please enter an album name');
      return;
    }

    try {
      const albumId = `${Date.now()}`;
      await setDoc(doc(db, albumType, albumId), {
        name: newAlbumName,
        type: albumType,
        displayOrder: (albums.length + 1) * 10,
        coverImage: '',
        photoCount: 0,
        createdAt: new Date().toISOString()
      });

      setNewAlbumName('');
      setSelectedAlbumId(albumId);
      await loadData();
      alert('✅ Album created');
    } catch (err) {
      console.error('Error creating album:', err);
      alert('❌ Failed to create album');
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;
    if (!selectedAlbumId) {
      alert('Please select or create an album first');
      return;
    }

    setUploading(true);
    try {
      const storage = getStorage();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const filename = `${albumType}/${selectedAlbumId}/${timestamp}_${file.name}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, `photos/${filename}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Save to album subcollection
        const photosRef = collection(db, albumType, selectedAlbumId, 'photos');
        await addDoc(photosRef, {
          url: downloadURL,
          cosplayer: cosplayer || 'Unknown',
          uploadedAt: new Date().toISOString(),
          filename: file.name,
          thumbUrl: downloadURL
        });
      }

      await loadData();
      setCosplayer('');
      alert(`✅ Successfully uploaded ${files.length} photo(s)`);
    } catch (err) {
      console.error('Upload error:', err);
      alert('❌ Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    if (!selectedAlbumId) return;

    try {
      await deleteDoc(doc(db, albumType, selectedAlbumId, 'photos', photoId));
      await loadData();
      alert('✅ Photo deleted');
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Delete failed');
    }
  };

  if (loading) {
    return <div className="admin-page"><p>Loading photos...</p></div>;
  }

  return (
    <div className="admin-page">
      <h1 style={{ margin: '0 0 24px 0' }}>Photo Management</h1>

      {/* Upload Section */}
      <div style={{ background: '#111111', border: '1px solid #2a2a2a', borderRadius: '4px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ marginTop: 0, fontSize: '1.2rem' }}>Upload Photos</h2>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Album Type</label>
          <select
            value={albumType}
            onChange={(e) => {
              setAlbumType(e.target.value as 'events' | 'studio' | 'outdoor' | 'collabs');
              setSelectedAlbumId('');
            }}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: 'var(--text)',
              fontFamily: 'inherit'
            }}
          >
            <option value="events">Events</option>
            <option value="studio">Studio</option>
            <option value="outdoor">Outdoor</option>
            <option value="collabs">Collabs</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Album</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={selectedAlbumId}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: 'var(--text)',
                fontFamily: 'inherit'
              }}
            >
              <option value="">Select an album...</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px', borderTop: '1px solid #333333', paddingTop: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Create New Album</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="e.g., Anime Expo 2024"
              onKeyPress={(e) => e.key === 'Enter' && createAlbum()}
              style={{
                flex: 1,
                padding: '10px 12px',
                background: '#1a1a1a',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: 'var(--text)',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={createAlbum}
              style={{
                padding: '10px 20px',
                background: '#666',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              ➕ Create
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Cosplayer Name</label>
          <input
            type="text"
            value={cosplayer}
            onChange={(e) => setCosplayer(e.target.value)}
            placeholder="e.g., Amazing Cosplayer"
            style={{
              width: '100%',
              padding: '10px 12px',
              background: '#1a1a1a',
              border: '1px solid #333333',
              borderRadius: '4px',
              color: 'var(--text)',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: '2px dashed #666',
            borderRadius: '4px',
            padding: '32px',
            textAlign: 'center',
            cursor: 'pointer',
            background: '#0a0a0a',
            marginBottom: '16px'
          }}
        >
          <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>📸 Click to select or drag photos here</p>
          <p style={{ margin: 0, color: 'var(--text-light)', fontSize: '0.9rem' }}>
            JPG, PNG - Multiple files supported
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            padding: '10px 20px',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
            opacity: uploading ? 0.6 : 1
          }}
        >
          {uploading ? '⏳ Uploading...' : '📤 Select Photos'}
        </button>
      </div>

      {/* Photos Grid */}
      <div>
        <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>Albums & Photos</h2>

        {albums.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No albums yet. Create one above to get started!</p>
        ) : (
          <>
            {albums.map((album) => (
              <div key={album.id} style={{ marginBottom: '32px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: 'var(--text)' }}>
                  {album.name} ({photos[album.id]?.length || 0} photos)
                </h3>
                {(!photos[album.id] || photos[album.id].length === 0) ? (
                  <p style={{ color: 'var(--text-light)', marginTop: 0 }}>No photos in this album yet</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {photos[album.id].map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          background: '#111111',
                          border: '1px solid #2a2a2a',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: '100%',
                            aspectRatio: '1',
                            backgroundImage: `url(${photo.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        <div style={{ padding: '12px' }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 600 }}>
                            {photo.cosplayer}
                          </p>
                          <p style={{ margin: '0 0 8px 0', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                            {new Date(photo.uploadedAt).toLocaleDateString()}
                          </p>
                          <button
                            onClick={() => handleDelete(photo.id)}
                            style={{
                              width: '100%',
                              padding: '8px',
                              background: '#ff4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.9rem',
                              fontWeight: 600
                            }}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
