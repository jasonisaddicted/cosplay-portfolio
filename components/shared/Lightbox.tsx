'use client';

import { useEffect, useCallback } from 'react';
import type { Photo } from '@/lib/firebase/firestore';

interface LightboxProps {
  photos: Photo[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const currentPhoto = photos[currentIndex];

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !currentPhoto) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
          title="Close (Esc)"
        >
          <svg viewBox="0 0 24 24" width="32" height="32">
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>

        {/* Main Image */}
        <div className="lightbox-image-wrapper">
          <img src={currentPhoto.url} alt={currentPhoto.cosplayer || 'Photo'} />
        </div>

        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            <button
              className="lightbox-nav lightbox-nav--prev"
              onClick={onPrev}
              aria-label="Previous photo"
              title="Previous (← Arrow)"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="lightbox-nav lightbox-nav--next"
              onClick={onNext}
              aria-label="Next photo"
              title="Next (→ Arrow)"
            >
              <svg viewBox="0 0 24 24" width="24" height="24">
                <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            {/* Counter */}
            <div className="lightbox-counter">
              {currentIndex + 1} / {photos.length}
            </div>
          </>
        )}

        {/* Photo Info */}
        {currentPhoto.cosplayer && (
          <div className="lightbox-info">
            <p className="lightbox-cosplayer">{currentPhoto.cosplayer}</p>
          </div>
        )}
      </div>
    </div>
  );
}
