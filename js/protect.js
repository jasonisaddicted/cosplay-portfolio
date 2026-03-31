// ============================================================
//  IMAGE PROTECTION
//  Blocks right-click, drag-save, long-press, and common
//  keyboard shortcuts used to save/inspect images.
//  Note: determined users with DevTools can still access URLs —
//  this prevents casual copying by regular visitors.
// ============================================================

(function () {

  // ── Block right-click context menu ───────────────────────
  document.addEventListener('contextmenu', function (e) {
    if (e.target.tagName === 'IMG' || e.target.closest('.photo-grid__item, .pick-item, .album-card, .lightbox__img-wrap, .collab-thumb, .hero, .collab-entry__cover')) {
      e.preventDefault();
      return false;
    }
  });

  // ── Block drag on all images ──────────────────────────────
  document.addEventListener('dragstart', function (e) {
    if (e.target.tagName === 'IMG') {
      e.preventDefault();
      return false;
    }
  });

  // ── Block common save/copy keyboard shortcuts ─────────────
  document.addEventListener('keydown', function (e) {
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey; // cmd on Mac, ctrl on Win

    // Ctrl/Cmd + S (Save page), Ctrl/Cmd + U (View source),
    // Ctrl/Cmd + Shift + I / J (DevTools), F12
    if (
      (ctrl && key === 's') ||
      (ctrl && key === 'u') ||
      (ctrl && e.shiftKey && (key === 'i' || key === 'j')) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
  });

  // ── Block long-press save on iOS / Android ────────────────
  // Prevent the callout menu (Save Image) on touch devices
  document.addEventListener('touchstart', function (e) {
    if (e.target.tagName === 'IMG') {
      e.target.style.webkitTouchCallout = 'none';
    }
  }, { passive: true });

  // ── CSS-level protection (applied via JS for reliability) ─
  const style = document.createElement('style');
  style.textContent = `
    img {
      -webkit-touch-callout: none !important;
      -webkit-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      pointer-events: none !important;
    }
    /* Transparent overlay on lightbox image area to block right-click */
    .lightbox__img-wrap::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 1;
      background: transparent;
    }
    /* Allow clicks on lightbox buttons but not on image itself */
    .lightbox__close,
    .lightbox__nav,
    .lightbox__counter {
      pointer-events: all !important;
    }
    /* Restore pointer events on all interactive containers */
    .pick-item,
    .photo-grid__item,
    .album-card,
    .collab-thumb,
    .hero,
    .collab-entry__cover {
      pointer-events: all !important;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

})();
