import { collection, getDocs, query, orderBy, limit, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from './config';

export interface Album {
  id: string;
  name: string;
  type: 'events' | 'studio' | 'outdoor' | 'collabs';
  coverImage: string;
  displayOrder?: number;
  description?: string;
  eventDate?: string;
  location?: string;
  photoCount?: number;
}

export interface Photo {
  id: string;
  url: string;
  thumbUrl?: string;
  cosplayer?: string;
  coser?: string;
  character?: string;
  event?: string;
  metadata?: Record<string, any>;
}

export interface SiteConfig {
  ogImages?: {
    events?: string;
    studio?: string;
    outdoor?: string;
    collabs?: string;
    home?: string;
  };
  brandName?: string;
  instagram?: string;
}

// Map real Firestore collection names (collabs→collaborators)
function realCollection(type: string): string {
  if (type === 'collabs') return 'collaborators';
  return type;
}

// Normalize a raw Firestore photo object → Photo interface
// Old data uses `src`, new uploads use `url`
function normalizePhoto(raw: any, index: number): Photo {
  return {
    id: raw.id || String(index),
    url: raw.url || raw.src || '',
    thumbUrl: raw.thumbUrl || raw.src || raw.url || '',
    cosplayer: raw.cosplayer || raw.coser || '',
    coser: raw.coser || raw.cosplayer || '',
    character: raw.character || '',
    event: raw.event || '',
  };
}

// Return empty string for broken/stale cover image URLs
function sanitizeCoverUrl(url: string | undefined): string {
  if (!url) return '';
  // Old cover images were stored as full URLs pointing to static files:
  // https://cosplay-portfolio.vercel.app/og/events-*.jpg — these no longer exist
  if (url.includes('/og/events-') || url.includes('/og/studio-') ||
      url.includes('/og/outdoor-') || url.includes('/og/collab')) return '';
  // Also strip paths and placeholder services
  if (url.startsWith('/og/')) return '';
  if (url.includes('placeholder.com') || url.includes('via.placeholder')) return '';
  return url;
}

// Get first usable photo URL from album data for use as cover
function firstPhotoFromData(data: any): string {
  const photos = data.photos || [];
  if (photos.length > 0) {
    return photos[0].src || photos[0].url || '';
  }
  const cosplayers = data.cosplayers || [];
  if (cosplayers.length > 0) {
    const cp = cosplayers[0];
    const cpPhotos = cp.photos || [];
    if (cpPhotos.length > 0) return cpPhotos[0].src || cpPhotos[0].url || '';
  }
  return '';
}

export async function getAlbumsByType(type: 'events' | 'studio' | 'outdoor' | 'collabs'): Promise<Album[]> {
  try {
    const col = realCollection(type);
    // Try with displayOrder first, fall back to no ordering if field missing
    let snapshot;
    try {
      const q = query(collection(db, col), orderBy('displayOrder', 'asc'), limit(100));
      snapshot = await getDocs(q);
    } catch {
      const q = query(collection(db, col), limit(100));
      snapshot = await getDocs(q);
    }

    return snapshot.docs.map((d) => {
      const data = d.data();
      const rawCover = sanitizeCoverUrl(data.coverImage || data.coverImageUrl);
      return {
        id: d.id,
        type,
        name: data.name || 'Untitled',
        coverImage: rawCover || firstPhotoFromData(data),
        displayOrder: data.displayOrder,
        description: data.description,
        eventDate: data.eventDate || data.date,
        location: data.location,
        photoCount: data.photoCount ?? (data.photos?.length || 0),
      } as Album;
    });
  } catch (error) {
    console.error(`Error fetching ${type} albums:`, error);
    return [];
  }
}

export async function getAlbum(type: string, id: string): Promise<Album | null> {
  try {
    const col = realCollection(type);
    const docRef = doc(db, col, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    const data = snapshot.data();
    const rawCover = sanitizeCoverUrl(data.coverImage || data.coverImageUrl);
    return {
      id: snapshot.id,
      type: type as any,
      name: data.name || 'Untitled',
      coverImage: rawCover || firstPhotoFromData(data),
      displayOrder: data.displayOrder,
      description: data.description,
      eventDate: data.eventDate || data.date,
      location: data.location,
      photoCount: data.photoCount ?? (data.photos?.length || 0),
    } as Album;
  } catch (error) {
    console.error(`Error fetching album ${id}:`, error);
    return null;
  }
}

export async function getFeatured(): Promise<Photo[]> {
  try {
    const docRef = doc(db, 'site', 'config');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.data();
    const raw = data.featured || [];
    return raw.map((p: any, i: number) => normalizePhoto(p, i));
  } catch (error) {
    console.error('Error fetching featured photos:', error);
    return [];
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const docRef = doc(db, 'site', 'config');
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return {};
    const data = snapshot.data() as SiteConfig;
    // Sanitize ogImages — they may point to old /og/ static files
    if (data.ogImages) {
      const og = data.ogImages;
      data.ogImages = {
        events:  sanitizeCoverUrl(og.events)  || undefined,
        studio:  sanitizeCoverUrl(og.studio)  || undefined,
        outdoor: sanitizeCoverUrl(og.outdoor) || undefined,
        collabs: sanitizeCoverUrl(og.collabs) || undefined,
        home:    sanitizeCoverUrl(og.home)    || undefined,
      };
    }
    return data;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return {};
  }
}

export async function getAlbumPhotos(type: string, albumId: string): Promise<Photo[]> {
  try {
    const col = realCollection(type);

    // First try the album document's photos array (original data structure)
    const albumRef = doc(db, col, albumId);
    const albumSnap = await getDoc(albumRef);
    if (albumSnap.exists()) {
      const data = albumSnap.data();

      // Events/outdoor format: photos array with {src, coser, character, ...}
      if (data.photos && Array.isArray(data.photos) && data.photos.length > 0) {
        return data.photos.map((p: any, i: number) => normalizePhoto(p, i));
      }

      // Studio format: cosplayers array, each with photos array
      if (data.cosplayers && Array.isArray(data.cosplayers)) {
        const allPhotos: Photo[] = [];
        data.cosplayers.forEach((coser: any) => {
          const coserPhotos = coser.photos || [];
          coserPhotos.forEach((p: any, i: number) => {
            allPhotos.push(normalizePhoto({ ...p, coser: coser.handle || coser.name }, i));
          });
        });
        if (allPhotos.length > 0) return allPhotos;
      }
    }

    // Fallback: subcollection (for newly uploaded photos via admin)
    try {
      const photosRef = collection(db, col, albumId, 'photos');
      const q = query(photosRef, orderBy('uploadedAt', 'desc'));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map((d, i) => normalizePhoto({ id: d.id, ...d.data() }, i));
      }
    } catch (_) {}

    return [];
  } catch (error) {
    console.error(`Error fetching photos for album ${albumId}:`, error);
    return [];
  }
}

export async function addPhotoToAlbum(
  type: 'events' | 'studio' | 'outdoor' | 'collabs',
  albumId: string,
  photo: Omit<Photo, 'id'>
): Promise<string> {
  try {
    const col = realCollection(type);
    const photosRef = collection(db, col, albumId, 'photos');
    const docRef = await addDoc(photosRef, {
      ...photo,
      order: Date.now(),
      uploadedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding photo to album:`, error);
    throw error;
  }
}
