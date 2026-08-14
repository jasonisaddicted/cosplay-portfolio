import {
  doc, getDoc, updateDoc, collection, getDocs, query, orderBy, writeBatch, increment,
} from 'firebase/firestore';
import { db } from './config';

export type AlbumType = 'events' | 'studio' | 'outdoor' | 'collabs';
export type AlbumFormat = 'photos-array' | 'cosplayers-array' | 'subcollection';

export interface GroupPhoto {
  id?: string;   // present only for subcollection-format photos
  url: string;
  thumbUrl?: string;
  character?: string;
}

export interface CoserGroup {
  coser: string;
  photos: GroupPhoto[];
}

export interface AlbumDetail {
  id: string;
  type: AlbumType;
  name: string;
  coverImage?: string;
  format: AlbumFormat;
  groups: CoserGroup[];
}

// Map real Firestore collection names (collabs→collaborators) — matches lib/firebase/firestore.ts
export function realCollection(type: AlbumType): string {
  return type === 'collabs' ? 'collaborators' : type;
}

function coserNameOf(p: { coser?: string; cosplayer?: string }): string {
  return p.coser || p.cosplayer || 'Unknown';
}

function toGroupPhoto(p: any): GroupPhoto {
  return {
    id: p.id,
    url: p.url || p.src || '',
    thumbUrl: p.thumbUrl || p.src || p.url || '',
    character: p.character || '',
  };
}

function groupByCoser(items: any[]): CoserGroup[] {
  const map = new Map<string, GroupPhoto[]>();
  for (const item of items) {
    const name = coserNameOf(item);
    const list = map.get(name) ?? [];
    list.push(toGroupPhoto(item));
    map.set(name, list);
  }
  return Array.from(map.entries()).map(([coser, photos]) => ({ coser, photos }));
}

// ─── Read ───────────────────────────────────────────────────────────────────

export async function fetchAlbumDetail(type: AlbumType, albumId: string): Promise<AlbumDetail | null> {
  const col = realCollection(type);
  const ref = doc(db, col, albumId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  const name = data.name || 'Untitled';
  const coverImage = data.coverImage || data.coverImageUrl || '';

  if (Array.isArray(data.photos) && data.photos.length > 0) {
    return { id: albumId, type, name, coverImage, format: 'photos-array', groups: groupByCoser(data.photos) };
  }

  if (Array.isArray(data.cosplayers) && data.cosplayers.length > 0) {
    const groups: CoserGroup[] = data.cosplayers.map((cp: any) => ({
      coser: cp.handle || cp.name || 'Unknown',
      photos: (cp.photos || []).map(toGroupPhoto),
    }));
    return { id: albumId, type, name, coverImage, format: 'cosplayers-array', groups };
  }

  const subSnap = await getDocs(query(collection(db, col, albumId, 'photos'), orderBy('uploadedAt', 'desc')));
  const subPhotos = subSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
  return { id: albumId, type, name, coverImage, format: 'subcollection', groups: groupByCoser(subPhotos) };
}

// ─── Write: move one coser's photos to another album of the same type ──────

export async function moveCoserGroup(
  type: AlbumType,
  sourceAlbumId: string,
  destAlbumId: string,
  coserName: string,
): Promise<number> {
  const col = realCollection(type);
  const sourceRef = doc(db, col, sourceAlbumId);
  const destRef = doc(db, col, destAlbumId);
  const [sourceSnap, destSnap] = await Promise.all([getDoc(sourceRef), getDoc(destRef)]);
  if (!sourceSnap.exists()) throw new Error('Source album not found');
  if (!destSnap.exists()) throw new Error('Destination album not found');

  const sourceData = sourceSnap.data() as any;
  const destData = destSnap.data() as any;

  const batch = writeBatch(db);
  let movedPhotos: any[] = [];

  // ── Pull the group out of the source album ──
  if (Array.isArray(sourceData.photos) && sourceData.photos.length > 0) {
    const matches = (p: any) => coserNameOf(p) === coserName;
    movedPhotos = sourceData.photos.filter(matches).map((p: any) => ({ ...p, coser: coserName, cosplayer: coserName }));
    const remaining = sourceData.photos.filter((p: any) => !matches(p));
    batch.update(sourceRef, { photos: remaining, photoCount: remaining.length });
  } else if (Array.isArray(sourceData.cosplayers) && sourceData.cosplayers.length > 0) {
    const idx = sourceData.cosplayers.findIndex((cp: any) => (cp.handle || cp.name || 'Unknown') === coserName);
    if (idx === -1) throw new Error('Coser group not found in source album');
    movedPhotos = (sourceData.cosplayers[idx].photos || []).map((p: any) => ({ ...p }));
    const remainingCosplayers = sourceData.cosplayers.filter((_: any, i: number) => i !== idx);
    const remainingCount = remainingCosplayers.reduce((sum: number, cp: any) => sum + (cp.photos?.length || 0), 0);
    batch.update(sourceRef, { cosplayers: remainingCosplayers, photoCount: remainingCount });
  } else {
    const subSnap = await getDocs(collection(db, col, sourceAlbumId, 'photos'));
    const matchingDocs = subSnap.docs.filter((d) => coserNameOf(d.data() as any) === coserName);
    if (matchingDocs.length === 0) throw new Error('Coser group not found in source album');
    movedPhotos = matchingDocs.map((d) => ({ ...(d.data() as any) }));
    matchingDocs.forEach((d) => batch.delete(doc(db, col, sourceAlbumId, 'photos', d.id)));
    batch.update(sourceRef, { photoCount: subSnap.size - matchingDocs.length });
  }

  if (movedPhotos.length === 0) throw new Error('No photos found for this coser group');

  // ── Apply them to the destination album, matching its existing format ──
  if (Array.isArray(destData.photos) && destData.photos.length > 0) {
    const merged = [...destData.photos, ...movedPhotos.map((p) => ({ ...p, coser: coserName, cosplayer: coserName }))];
    batch.update(destRef, { photos: merged, photoCount: merged.length });
  } else if (Array.isArray(destData.cosplayers) && destData.cosplayers.length > 0) {
    const idx = destData.cosplayers.findIndex((cp: any) => (cp.handle || cp.name || 'Unknown') === coserName);
    const newCosplayers = idx !== -1
      ? destData.cosplayers.map((cp: any, i: number) => (i === idx ? { ...cp, photos: [...(cp.photos || []), ...movedPhotos] } : cp))
      : [...destData.cosplayers, { handle: coserName, photos: movedPhotos }];
    const newCount = newCosplayers.reduce((sum: number, cp: any) => sum + (cp.photos?.length || 0), 0);
    batch.update(destRef, { cosplayers: newCosplayers, photoCount: newCount });
  } else {
    // Subcollection format — also the default landing spot for an empty destination album
    for (const p of movedPhotos) {
      const newDocRef = doc(collection(db, col, destAlbumId, 'photos'));
      batch.set(newDocRef, {
        url: p.url || p.src || '',
        thumbUrl: p.thumbUrl || p.src || p.url || '',
        cosplayer: coserName,
        character: p.character || '',
        uploadedAt: new Date().toISOString(),
      });
    }
    batch.update(destRef, { photoCount: increment(movedPhotos.length) });
  }

  await batch.commit();
  return movedPhotos.length;
}
