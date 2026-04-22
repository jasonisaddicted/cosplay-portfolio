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

export async function getAlbumsByType(type: 'events' | 'studio' | 'outdoor' | 'collabs'): Promise<Album[]> {
  try {
    const q = query(
      collection(db, type),
      orderBy('displayOrder', 'asc'),
      limit(100)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      type,
      ...doc.data(),
    })) as Album[];
  } catch (error) {
    console.error(`Error fetching ${type} albums:`, error);
    return [];
  }
}

export async function getAlbum(type: string, id: string): Promise<Album | null> {
  try {
    const docRef = doc(db, type, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return {
      id: snapshot.id,
      type: type as any,
      ...snapshot.data(),
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
    return data.featured || [];
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
    return snapshot.data() as SiteConfig;
  } catch (error) {
    console.error('Error fetching site config:', error);
    return {};
  }
}

export async function getAlbumPhotos(type: string, albumId: string): Promise<Photo[]> {
  try {
    // Try to fetch from album subcollection first
    const photosRef = collection(db, type, albumId, 'photos');
    const q = query(photosRef, orderBy('order', 'asc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      // Fallback: try to fetch photos array from album document
      const albumRef = doc(db, type, albumId);
      const albumSnap = await getDoc(albumRef);
      if (albumSnap.exists()) {
        const data = albumSnap.data();
        return data.photos || [];
      }
      return [];
    }

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Photo[];
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
    const photosRef = collection(db, type, albumId, 'photos');
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
