'use client';

export const dynamic = 'force-dynamic';

import { useState, useRef } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';

interface UploadedPhoto {
  id: string;
  url: string;
  cosplayer?: string;
  album?: string;
  uploadedAt: string;
}

export default function AdminPhotosPage() {
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cosplayer, setCosplayer] = useState('');
  const [albumType, setAlbumType] = useState('events');

  // Load photos on mount
  useState(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      const db = getFirestore();
      const photosRef = collection(db, 'photos');
      const q = query(photosRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      const loadedPhotos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UploadedPhoto[];
      setPhotos(loadedPhotos);
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const storage = getStorage();
      const db = getFirestore();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const filename = `${albumType}/${timestamp}_${file.name}`;

        // Upload to Firebase Storage
        const storageRef = ref(storage, `photos/${filename}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);

        // Save metadata to Firestore
        const photosRef = collection(db, 'photos');
        await addDoc(photosRef, {
          url: downloadURL,
          cosplayer: cosplayer || 'Unknown',
          album: albumType,
          uploadedAt: new Date().toISOString(),
          filename: file.name
        });
      }

      // Reload photos
      await loadPhotos();
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

    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'photos', photoId));
      await loadPhotos();
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
            onChange={(e) => setAlbumType(e.target.value)}
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
        <h2 style={{ marginTop: '24px', marginBottom: '16px' }}>All Photos ({photos.length})</h2>

        {photos.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>No photos uploaded yet</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {photos.map((photo) => (
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
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Album: {photo.album}
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
    </div>
  );
}
