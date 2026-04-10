// ============================================================
//  PORTFOLIO — SHARED APP LOGIC
//  Handles: nav scroll, lightbox, page init routing
// ============================================================

// ── Site Identity (runs after Firebase loads) ───────
function initSiteIdentity() {
  const navBrand = document.getElementById('nav-brand');
  if (navBrand && window.CONFIG) {
    navBrand.innerHTML =
      CONFIG.photographer +
      (CONFIG.subtitle ? `<span class="nav__brand-sub">${CONFIG.subtitle}</span>` : '');
  }
  const footerBrand = document.getElementById('footer-brand');
  if (footerBrand && window.CONFIG) {
    footerBrand.innerHTML =
      CONFIG.photographer +
      (CONFIG.subtitle ? ` <span class="footer__brand-sub">${CONFIG.subtitle}</span>` : '');
  }
  const footerCopy = document.getElementById('footer-copy');
  if (footerCopy) {
    footerCopy.textContent = `© ${new Date().getFullYear()} · All rights reserved`;
  }
}

// ── Nav scroll behavior ──────────────────────────────────────
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ── Active nav link ──────────────────────────────────────────
(function () {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === path) a.classList.add('active');
  });
})();

// ── Mobile hamburger menu ────────────────────────────────────
(function () {
  const hamburger = document.getElementById('nav-hamburger');
  const navLinks = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  function closeMenu() {
    hamburger.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('active');
  }

  function toggleMenu() {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isOpen);
    navLinks.classList.toggle('active');
  }

  // Toggle menu when hamburger is clicked
  hamburger.addEventListener('click', toggleMenu);

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close menu on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
      closeMenu();
    }
  });

  // Close menu when clicking outside (on backdrop)
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)) {
      closeMenu();
    }
  });
})();

// ── Global fade transition helper ────────────────────────────
// Used for slideshows across lightbox, album cards, and other carousel elements
// Overlapping fade-out and fade-in for smooth 2-second cross-fade
function fadeUpdateImage(imgElement, newSrc) {
  imgElement.classList.add('fade-out');
  // Force browser to register the fade-out transition before removing the class
  requestAnimationFrame(() => {
    imgElement.src = newSrc;
    imgElement.classList.remove('fade-out');
  });
  // Both fade out and fade in happen over 2s, creating a dissolve effect
}

// ── Like & Share: localStorage Anti-Spam Helpers ────────────────
// Generate or retrieve a unique device ID (persisted in localStorage)
window.getDeviceId = () => {
  let deviceId = localStorage.getItem('portfolio_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('portfolio_device_id', deviceId);
  }
  return deviceId;
};

// Check if user (device) has already liked a specific item
window.hasUserLiked = (likeKey) => {
  const deviceId = getDeviceId();
  const liked = localStorage.getItem(`like_${deviceId}_${likeKey}`);
  return !!liked;
};

// Mark an item as liked by this device
window.markAsLiked = (likeKey) => {
  const deviceId = getDeviceId();
  localStorage.setItem(`like_${deviceId}_${likeKey}`, Date.now());
};

// Global context for tracking current photo in lightbox
window.currentPhotoContext = null;

// ── Lightbox ─────────────────────────────────────────────────
// Fully CONFIG-driven. To add cosers/albums/photos: edit config.js only.
// handle in event photos (photo.coser) must match cosplayer handle in studio
// (cosplayer.handle) for cross-album discovery to work.
const Lightbox = (() => {
  let photos = [];
  let current = 0;
  let panelTimers = [];
  let backCallback    = null;
  let onPhotoChangeCb = null;
  let historyState = null;

  // Save/restore state for info panel browsing
  let savedPhotos = null;
  let savedCurrent = null;
  let inSubGridMode = false;  // Track if currently browsing sub-grid photos

  const lb = document.getElementById('lightbox');
  if (!lb) return {};

  const imgEl   = lb.querySelector('.lightbox__img');
  const capEl   = lb.querySelector('.lightbox__caption');
  const counter = lb.querySelector('.lightbox__counter');
  const backBtn = lb.querySelector('.lightbox__back');
  const likeBtn = lb.querySelector('.lightbox__like-btn');

  const infoPanel = document.createElement('div');
  infoPanel.className = 'lightbox__info-panel';
  lb.appendChild(infoPanel);


  function clearPanelTimers() {
    panelTimers.forEach(t => clearInterval(t));
    panelTimers = [];
  }

  // Auto-discovers all albums (events + studio + collab) featuring this handle.
  // Adding new albums in config.js automatically surfaces them in the panel.
  window.findCoserAlbums = function(handle) {
    const results = [];
    if (!handle || typeof CONFIG === 'undefined') return results;
    (CONFIG.events || []).forEach(album => {
      const cp = (album.photos || []).filter(p => p.coser === handle);
      if (cp.length) results.push({ id: album.id, type: 'events', name: album.name, photos: cp });
    });
    (CONFIG.studio || []).forEach(album => {
      const sec = (album.cosplayers || []).find(c => c.handle === handle || c.name === handle);
      if (sec && (sec.photos || []).length)
        results.push({ id: album.id, type: 'studio', name: album.name, photos: sec.photos });
    });
    (CONFIG.collaborators || []).forEach(collab => {
      if (collab.handle === handle && (collab.photos || []).length)
        results.push({
          id: collab.handle.replace('@', ''),
          type: 'collab',
          name: collab.name,
          photos: collab.photos
        });
    });
    return results;
  };

  // Auto-discovers all albums containing this collaborator (by handle)
  // Used for the collaborator albums modal
  window.findCollaboratorAlbums = function(handle) {
    const results = [];
    if (!handle || typeof CONFIG === 'undefined') return results;

    // Search events for photos with matching coser
    (CONFIG.events || []).forEach(album => {
      const photos = (album.photos || []).filter(p => p.coser === handle);
      if (photos.length) {
        results.push({
          id: album.id,
          type: 'events',
          name: album.name,
          date: album.date,
          location: album.location,
          photos: album.photos // Include all photos from album
        });
      }
    });

    // Search studio for cosplayers with matching handle
    (CONFIG.studio || []).forEach(album => {
      const cosplayer = (album.cosplayers || []).find(c => c.handle === handle || c.name === handle);
      if (cosplayer && (cosplayer.photos || []).length) {
        results.push({
          id: album.id,
          type: 'studio',
          name: album.name,
          photos: album.photos // Include all photos from album
        });
      }
    });

    // Include collaborator's own albums from collaborators collection
    (CONFIG.collaborators || []).forEach(collab => {
      if (collab.handle === handle) {
        results.push({
          id: collab.id || collab.handle.replace('@', ''),
          type: 'collab',
          name: collab.name,
          photos: collab.photos || []
        });
      }
    });

    return results;
  };

  // Auto-discovers all albums featuring this character
  function findCharacterAlbums(character) {
    const results = [];
    if (!character || typeof CONFIG === 'undefined') return results;
    (CONFIG.events || []).forEach(album => {
      const cp = (album.photos || []).filter(p => p.character === character);
      if (cp.length) results.push({ id: album.id, type: 'events', name: album.name, photos: cp });
    });
    (CONFIG.studio || []).forEach(album => {
      const allPhotos = [];
      (album.cosplayers || []).forEach(coser => {
        const cp = (coser.photos || []).filter(p => p.character === character);
        if (cp.length) allPhotos.push(...cp);
      });
      if (allPhotos.length) results.push({ id: album.id, type: 'studio', name: album.name, photos: allPhotos });
    });
    (CONFIG.collaborators || []).forEach(collab => {
      const cp = (collab.photos || []).filter(p => p.character === character);
      if (cp.length) results.push({
        id: collab.name.replace(/\s+/g, '-').toLowerCase(),
        type: 'collab',
        name: collab.name,
        photos: cp
      });
    });
    return results;
  }

  const igSVG = `<svg class="info-panel__ig-icon" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke-width="2.5"/>
  </svg>`;

  const chevronSVG = `<svg class="info-panel__accordion-chevron" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" stroke-width="2"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>`;

  // ── Build character panel (all photos of a character) ───
  function buildCharacterPanel(character) {
    clearPanelTimers();
    infoPanel.innerHTML = '';

    const characterAlbums = findCharacterAlbums(character);
    const isMobile = window.innerWidth <= 767;

    if (characterAlbums.length === 0) {
      infoPanel.innerHTML = `<div class="info-panel__scroll"><p style="color:#999;">No photos found</p></div>`;
      return;
    }

    // ── Character identity block ──────────────────────────────
    const characterHtml = `
      <div class="info-panel__section">
        <span class="info-panel__section-label">CHARACTER</span>
        <div class="info-panel__character" style="font-size:1.1rem; margin-bottom:4px;">${character}</div>
        <div class="info-panel__project-count" style="font-size:0.75rem; color:#999;">Appears in ${characterAlbums.length} project${characterAlbums.length !== 1 ? 's' : ''}</div>
      </div>`;

    // ── Projects block ─────────────────────────────────────────
    const hasEvents = characterAlbums.some(a => a.type === 'events');
    const hasStudio = characterAlbums.some(a => a.type === 'studio');
    const hasCollab = characterAlbums.some(a => a.type === 'collab');

    const tabsHtml = `
      <div class="info-panel__filter-tabs">
        <button class="info-panel__filter-tab active" data-filter="all">All</button>
        ${hasEvents ? '<button class="info-panel__filter-tab" data-filter="events">Events</button>' : ''}
        ${hasStudio ? '<button class="info-panel__filter-tab" data-filter="studio">Studio</button>' : ''}
        ${hasCollab ? '<button class="info-panel__filter-tab" data-filter="collab">Collab</button>' : ''}
      </div>`;

    let projectsHtml = '';
    if (isMobile) {
      const accordions = characterAlbums.map((a, i) => `
        <div class="info-panel__accordion" data-ai="${i}" data-type="${a.type}">
          <div class="info-panel__accordion-header">
            <div class="info-panel__accordion-thumb">
              <img src="${a.photos[0].src}" alt="${a.name}">
            </div>
            <div class="info-panel__accordion-meta">
              <div class="info-panel__album-name">${a.name}</div>
              <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''}</div>
            </div>
            ${chevronSVG}
          </div>
          <div class="info-panel__accordion-photos">
            ${a.photos.map((p, pi) =>
              `<div class="info-panel__acc-photo" data-ai="${i}" data-pi="${pi}">
                 <img src="${p.src}" alt="">
               </div>`
            ).join('')}
          </div>
        </div>`).join('');

      projectsHtml = `
        <div class="info-panel__section">
          <span class="info-panel__section-label">PROJECTS</span>
          ${tabsHtml}
          <div class="info-panel__album-list">${accordions}</div>
        </div>`;
    } else {
      const cards = characterAlbums.map((a, i) => `
        <div class="info-panel__album-card" data-ai="${i}" data-type="${a.type}">
          <div class="info-panel__album-cover">
            <img src="${a.photos[0].src}" alt="${a.name}">
          </div>
          <div class="info-panel__album-info">
            <div class="info-panel__album-name">${a.name}</div>
            <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''}</div>
          </div>
        </div>`).join('');

      projectsHtml = `
        <div class="info-panel__section">
          <span class="info-panel__section-label">PROJECTS</span>
          ${tabsHtml}
          <div class="info-panel__album-grid">${cards}</div>
        </div>`;
    }

    infoPanel.innerHTML = `
      <div class="info-panel__scroll">
        ${characterHtml}
        ${projectsHtml}
      </div>`;

    // ── Filter tabs ──
    infoPanel.querySelectorAll('.info-panel__filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        infoPanel.querySelectorAll('.info-panel__filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        infoPanel.querySelectorAll('.info-panel__accordion, .info-panel__album-card').forEach(item => {
          item.style.display = (filter === 'all' || item.dataset.type === filter) ? '' : 'none';
        });
      });
    });

    if (isMobile) {
      // ── Mobile accordion ──
      infoPanel.querySelectorAll('.info-panel__accordion').forEach((acc, i) => {
        const album = characterAlbums[i];
        const header = acc.querySelector('.info-panel__accordion-header');

        header.addEventListener('click', () => {
          const wasOpen = acc.classList.contains('open');
          infoPanel.querySelectorAll('.info-panel__accordion.open').forEach(a => a.classList.remove('open'));
          if (!wasOpen) acc.classList.add('open');
        });
      });

      // ── Photo tap ──
      infoPanel.querySelectorAll('.info-panel__acc-photo').forEach(div => {
        div.addEventListener('click', () => {
          const ai = parseInt(div.dataset.ai);
          const pi = parseInt(div.dataset.pi);
          const album = characterAlbums[ai];
          Lightbox.init(album.photos.map(p => ({
            src: p.src,
            coser: p.coser || '',
            character: p.character || '',
            series: p.series || '',
            albumId: album.id,
            albumType: album.type || 'events',
          })));
          Lightbox.setBack(() => Lightbox.close());
          Lightbox.open(pi);
        });
      });
    } else {
      // ── Desktop card click ──
      infoPanel.querySelectorAll('.info-panel__album-card').forEach((card, i) => {
        card.addEventListener('click', () => {
          const album = characterAlbums[i];
          Lightbox.init(album.photos.map(p => ({
            src: p.src,
            coser: p.coser || '',
            character: p.character || '',
            series: p.series || '',
            albumId: album.id,
            albumType: album.type || 'events',
          })));
          Lightbox.setBack(() => Lightbox.close());
          Lightbox.open(0);
        });
      });
    }
  }

  // ── Build & render the coser info + Work Together panel ───
  function buildInfoPanel(photo) {
    clearPanelTimers();
    infoPanel.innerHTML = '';

    const handle   = photo.coser || '';
    const igHandle = handle ? (handle.startsWith('@') ? handle : '@' + handle) : '';
    const igUrl    = igHandle ? `https://www.instagram.com/${igHandle.slice(1)}/` : '';

    if (!igHandle && !photo.character && !photo.series) {
      lb.classList.remove('panel-open');
      return;
    }

    const coserAlbums = findCoserAlbums(handle);
    const isMobile    = window.innerWidth <= 767;

    // ── Coser identity block ──────────────────────────────
    const coserHtml = `
      <div class="info-panel__section">
        <span class="info-panel__section-label">COSPLAYER</span>
        ${igUrl
          ? `<a class="info-panel__ig-row" href="${igUrl}" target="_blank" rel="noopener noreferrer">
               ${igSVG}<span class="info-panel__ig-handle">${igHandle}</span>
             </a>`
          : (igHandle
              ? `<div class="info-panel__ig-row">${igSVG}<span class="info-panel__ig-handle">${igHandle}</span></div>`
              : '')
        }
        ${photo.character ? `<div class="info-panel__character" style="cursor:pointer; color:#c8a46e; text-decoration:underline;" data-character="${photo.character}">${photo.character}</div>` : ''}
        ${photo.series    ? `<div class="info-panel__series">${photo.series}</div>`       : ''}
      </div>`;

    // ── Work Together block ───────────────────────────────
    let workHtml = '';
    if (coserAlbums.length > 0) {
      const hasEvents = coserAlbums.some(a => a.type === 'events');
      const hasStudio = coserAlbums.some(a => a.type === 'studio');
      const hasCollab = coserAlbums.some(a => a.type === 'collab');

      const tabsHtml = `
        <div class="info-panel__filter-tabs">
          <button class="info-panel__filter-tab active" data-filter="all">All</button>
          ${hasEvents ? '<button class="info-panel__filter-tab" data-filter="events">Events</button>' : ''}
          ${hasStudio ? '<button class="info-panel__filter-tab" data-filter="studio">Studio</button>' : ''}
          ${hasCollab ? '<button class="info-panel__filter-tab" data-filter="collab">Collab</button>'  : ''}
        </div>`;

      if (isMobile) {
        // Mobile: accordion list — no page navigation, inline photo expansion
        const accordions = coserAlbums.map((a, i) => `
          <div class="info-panel__accordion" data-ai="${i}" data-type="${a.type}">
            <div class="info-panel__accordion-header">
              <div class="info-panel__accordion-thumb">
                <img src="${a.photos[0].src}" alt="${a.name}">
              </div>
              <div class="info-panel__accordion-meta">
                <div class="info-panel__album-name">${a.name}</div>
                <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''} together</div>
              </div>
              ${chevronSVG}
            </div>
            <div class="info-panel__accordion-photos">
              ${a.photos.map((p, pi) =>
                `<div class="info-panel__acc-photo" data-ai="${i}" data-pi="${pi}">
                   <img src="${p.src}" alt="">
                 </div>`
              ).join('')}
            </div>
          </div>`).join('');

        workHtml = `
          <div class="info-panel__section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
              <div style="font-size:0.75rem; color:#999;">Appears in ${coserAlbums.length} project${coserAlbums.length !== 1 ? 's' : ''}</div>
            </div>
            ${tabsHtml}
            <div class="info-panel__album-list">${accordions}</div>
          </div>`;
      } else {
        // Desktop: portrait cards — click opens inline sub-panel (no page nav)
        const cards = coserAlbums.map((a, i) => `
          <div class="info-panel__album-card" data-ai="${i}" data-type="${a.type}">
            <div class="info-panel__album-img-wrap">
              <img class="info-panel__album-img" src="${a.photos[0].src}" alt="${a.name}">
            </div>
            <div class="info-panel__album-name">${a.name}</div>
            <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''} together</div>
          </div>`).join('');

        workHtml = `
          <div class="info-panel__section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
              <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
              <div style="font-size:0.75rem; color:#999;">Appears in ${coserAlbums.length} project${coserAlbums.length !== 1 ? 's' : ''}</div>
            </div>
            ${tabsHtml}
            <div class="info-panel__album-list">${cards}</div>
          </div>`;
      }
    }

    infoPanel.innerHTML = `
      <div class="info-panel__scroll">
        ${coserHtml}
        ${workHtml}
      </div>`;

    // ── Character click: show all photos of this character ──
    const characterEl = infoPanel.querySelector('[data-character]');
    if (characterEl) {
      characterEl.addEventListener('click', () => {
        const character = characterEl.dataset.character;
        buildCharacterPanel(character);
      });
    }

    // ── Filter tab logic (works for both desktop cards + mobile accordions) ──
    const itemSelector = isMobile ? '.info-panel__accordion' : '.info-panel__album-card';
    infoPanel.querySelectorAll('.info-panel__filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        infoPanel.querySelectorAll('.info-panel__filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        infoPanel.querySelectorAll(itemSelector).forEach(item => {
          item.style.display = (filter === 'all' || item.dataset.type === filter) ? '' : 'none';
        });
      });
    });

    if (isMobile) {
      // ── Mobile accordion: toggle expand, photo tap updates main image ──
      infoPanel.querySelectorAll('.info-panel__accordion').forEach((acc, i) => {
        const album  = coserAlbums[i];
        const header = acc.querySelector('.info-panel__accordion-header');
        const thumb  = acc.querySelector('.info-panel__accordion-thumb img');

        // Cycling slideshow on the thumbnail (3s display + 2s fade)
        if (album.photos.length > 1) {
          let idx = 0;
          let slideTimer = null;
          function scheduleNextThumbSlide() {
            slideTimer = setTimeout(() => {
              idx = (idx + 1) % album.photos.length;
              fadeUpdateImage(thumb, album.photos[idx].src);
              scheduleNextThumbSlide();
            }, 5000);
          }
          scheduleNextThumbSlide();
          panelTimers.push(slideTimer);
        }

        // Toggle open/close (only one open at a time)
        header.addEventListener('click', () => {
          const wasOpen = acc.classList.contains('open');
          infoPanel.querySelectorAll('.info-panel__accordion.open').forEach(a => a.classList.remove('open'));
          if (!wasOpen) acc.classList.add('open');
        });
      });

      // Photo tap → update main photo + nav array (description auto-follows)
      infoPanel.querySelectorAll('.info-panel__acc-photo').forEach(div => {
        div.addEventListener('click', () => {
          const ai    = parseInt(div.dataset.ai);
          const pi    = parseInt(div.dataset.pi);
          const album = coserAlbums[ai];
          console.log('📱 Mobile sub-grid photo clicked → album:', ai, 'photo index in sub-album:', pi, 'total:', album.photos.length);
          console.log('📱 → current URL:', window.location.href);
          // Save original state before switching to project browsing
          Lightbox.saveState();
          // Map to structured photo objects so prev/next navigation keeps coser info
          const albumObjs = album.photos.map(p => ({
            src: p.src, coser: handle,
            character: photo.character || '',
            series:    photo.series    || ''
          }));
          photos  = albumObjs;
          current = pi;
          // Keep URL at original album photo - don't update window.currentLightboxIndex
          // Sub-grid browsing is temporary; URL should stay valid for sharing
          // Update currentPhotoShare so Share button uses correct sub-grid photo data
          window.currentPhotoShare = {
            photoUrl:  album.photos[pi].src || '',
            character: album.photos[pi].character || '',
            series:    album.photos[pi].series || '',
            coser:     handle || '',
            index:     pi,
            albumId:   photo.albumId || window.currentPhotoShare?.albumId || null,
            albumType: photo.albumType || window.currentPhotoShare?.albumType || null
          };
          console.log('📱 → Updated currentPhotoShare:', { index: pi, photoUrl: album.photos[pi].src?.substring(0, 50) });
          console.log('📱 → photos array now:', albumObjs.length, 'photos');
          console.log('📱 → URL stays at original album photo (for valid sharing)');
          fadeUpdateImage(imgEl, album.photos[pi].src);
          if (counter) counter.textContent = `${pi + 1} / ${album.photos.length}`;
          infoPanel.querySelectorAll('.info-panel__acc-photo').forEach(d => d.classList.remove('selected'));
          div.classList.add('selected');
          div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });

    } else {
      // ── Desktop: card slideshow + click → inline sub-panel ─────────
      coserAlbums.forEach((album, i) => {
        const card = infoPanel.querySelector(`.info-panel__album-card[data-ai="${i}"]`);
        if (!card) return;
        const img = card.querySelector('.info-panel__album-img');

        if (album.photos.length > 1) {
          let idx = 0;
          let slideTimer = null;
          function scheduleNextCardSlide() {
            slideTimer = setTimeout(() => {
              idx = (idx + 1) % album.photos.length;
              fadeUpdateImage(img, album.photos[idx].src);
              scheduleNextCardSlide();
            }, 5000);
          }
          scheduleNextCardSlide();
          panelTimers.push(slideTimer);
        }

        // Click opens album photos inline — no navigation away from current photo
        card.addEventListener('click', () => openAlbumInPanel(album, igHandle, photo));
      });
    }

    lb.classList.add('panel-open');
  }

  // ── Desktop: show album photos inside the panel (no page navigation) ──
  // Clicking a photo updates the main image only. Back restores original state.
  function openAlbumInPanel(album, igHandle, originalPhoto) {
    clearPanelTimers();

    const savedPhotos  = photos;
    const savedCurrent = current;

    // Structured photo objects preserve coser/character/series for each photo
    const albumObjs = album.photos.map(p => ({
      src:       p.src,
      coser:     p.coser || originalPhoto.coser || '',
      character: p.character || originalPhoto.character || '',
      series:    p.series || originalPhoto.series || ''
    }));

    function renderSubPanel(selIdx) {
      const gridHtml = albumObjs.map((p, i) => `
        <div class="info-panel__subgrid-photo ${i === selIdx ? 'selected' : ''}" data-i="${i}">
          <img src="${p.src}" alt="">
        </div>`).join('');

      infoPanel.innerHTML = `
        <div class="info-panel__scroll">
          <button class="info-panel__back-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>
            BACK
          </button>
          <div class="info-panel__album-view-title">${album.name}</div>
          <div class="info-panel__album-view-subtitle">${igHandle} · ${album.photos.length} photo${album.photos.length !== 1 ? 's' : ''}</div>
          <div class="info-panel__subgrid">${gridHtml}</div>
        </div>`;

      // Back → restore original photo and panel view
      infoPanel.querySelector('.info-panel__back-btn').addEventListener('click', () => {
        photos  = savedPhotos;
        current = savedCurrent;
        fadeUpdateImage(imgEl, savedPhotos[savedCurrent].src);
        if (counter) counter.textContent = `${savedCurrent + 1} / ${savedPhotos.length}`;
        buildInfoPanel(savedPhotos[savedCurrent]);
      });

      // Photo click → update main image and info panel with that photo's metadata
      infoPanel.querySelectorAll('.info-panel__subgrid-photo').forEach(div => {
        div.addEventListener('click', () => {
          const i = parseInt(div.dataset.i);
          console.log('🖥️ Desktop sub-grid photo clicked → index in sub-album:', i, 'total:', albumObjs.length);
          console.log('🖥️ → current URL:', window.location.href);
          // Save original state before switching to project browsing
          Lightbox.saveState();
          photos  = albumObjs;
          current = i;
          // Keep URL at original album photo - don't update window.currentLightboxIndex
          // Sub-grid browsing is temporary; URL should stay valid for sharing
          // Update currentPhotoShare so Share button uses correct sub-grid photo data
          window.currentPhotoShare = {
            photoUrl:  album.photos[i].src || '',
            character: album.photos[i].character || '',
            series:    album.photos[i].series || '',
            coser:     originalPhoto.coser || '',
            index:     i,
            albumId:   originalPhoto.albumId || window.currentPhotoShare?.albumId || null,
            albumType: originalPhoto.albumType || window.currentPhotoShare?.albumType || null
          };
          console.log('🖥️ → Updated currentPhotoShare:', { index: i, photoUrl: album.photos[i].src?.substring(0, 50) });
          console.log('🖥️ → URL stays at original album photo (for valid sharing)');
          fadeUpdateImage(imgEl, albumObjs[i].src);
          if (counter) counter.textContent = `${i + 1} / ${albumObjs.length}`;
          buildInfoPanel(albumObjs[i]);
          renderSubPanel(i);
        });
      });
    }

    renderSubPanel(-1);
  }

  function show(index) {
    console.log('📷 Lightbox.show() called with index:', index, '| photos.length:', photos.length);
    current = (index + photos.length) % photos.length;
    window.currentLightboxIndex = current;  // Update global index for URL tracking
    const p = photos[current];
    console.log('📷 → Setting to current:', current, '| photo src:', p?.src?.substring(0, 50));
    fadeUpdateImage(imgEl, p.src);
    if (capEl) capEl.textContent = '';
    if (counter) counter.textContent = `${current + 1} / ${photos.length}`;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (backBtn && backCallback) backBtn.style.display = 'flex';
    buildInfoPanel(p);

    // Fire share-context callback so currentPhotoShare stays in sync on prev/next
    if (onPhotoChangeCb) onPhotoChangeCb(p, current);

    // Update like button for current photo
    if (likeBtn && window.db && p.eventId) {
      const likeKey = `photo_${p.eventId}_${current}`;
      const countEl = likeBtn.querySelector('.lightbox__like-count');

      // Load like count from Firestore
      window.getDoc(window.doc(window.db, 'events', p.eventId))
        .then(docSnap => {
          if (docSnap.exists()) {
            const event = docSnap.data();
            const photoLikes = event.photoLikes || {};
            const likeCount = photoLikes[current] || 0;

            if (countEl) countEl.textContent = likeCount;

            // Check if user already liked
            if (window.hasUserLiked(likeKey)) {
              likeBtn.style.borderColor = '#c8a46e';
              likeBtn.style.color = '#c8a46e';
              likeBtn.querySelector('.lightbox__like-icon').style.fill = '#c8a46e';
            } else {
              likeBtn.style.borderColor = '#e4e4e4';
              likeBtn.style.color = '#e4e4e4';
              likeBtn.querySelector('.lightbox__like-icon').style.fill = 'none';
            }
          }
        })
        .catch(err => console.error('Error loading like count:', err));
    }

    // Mark lightbox as open and push state with URL hash so back button works
    historyState = { lightbox: true };
    const urlWithHash = window.location.href.split('#')[0] + '#lightbox';
    window.history.pushState({ lightbox: true }, '', urlWithHash);
  }

  function hide(fromPopstate = false) {
    console.log('❌ Lightbox.hide() called');
    lb.classList.remove('active', 'panel-open');
    document.body.style.overflow = '';
    imgEl.src = '';
    if (backBtn) backBtn.style.display = 'none';
    backCallback = null;
    historyState = null;
    clearPanelTimers();
    // Restore original album state when closing lightbox
    // This ensures clean state if user goes back to album and clicks a new photo
    Lightbox.restoreState();
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      // Call global closeLightbox (set by album.js) which handles URL cleanup + lightbox close
      // Falls back to hide() if not available
      if (typeof window.closeLightbox === 'function') {
        window.closeLightbox();
      } else if (backCallback) {
        backCallback();
        backCallback = null;
        if (backBtn) backBtn.style.display = 'none';
      } else {
        hide();
      }
    });
  }

  // Like button for current photo
  if (likeBtn) {
    likeBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!window.db || photos.length === 0) return;

      const photo = photos[current];
      if (!photo || !photo.eventId) {
        console.log('Cannot like: missing event context');
        return;
      }

      const likeKey = `photo_${photo.eventId}_${current}`;

      if (window.hasUserLiked(likeKey)) {
        console.log('Already liked this photo');
        return;
      }

      try {
        const docRef = window.doc(window.db, 'events', photo.eventId);
        const docSnap = await window.getDoc(docRef);

        if (!docSnap.exists()) {
          console.error('Event not found');
          return;
        }

        const event = docSnap.data();
        const photoLikes = event.photoLikes || {};
        const photoIndex = current;

        photoLikes[photoIndex] = (photoLikes[photoIndex] || 0) + 1;

        await window.updateDoc(docRef, { photoLikes });

        window.markAsLiked(likeKey);

        // Update button
        const countEl = likeBtn.querySelector('.lightbox__like-count');
        if (countEl) {
          countEl.textContent = photoLikes[photoIndex];
        }

        likeBtn.style.borderColor = '#c8a46e';
        likeBtn.style.color = '#c8a46e';
        likeBtn.querySelector('.lightbox__like-icon').style.fill = '#c8a46e';

        console.log('✓ Photo liked');
      } catch (err) {
        console.error('Error liking photo:', err);
      }
    });
  }

  lb.querySelector('.lightbox__prev').addEventListener('click', () => show(current - 1));
  lb.querySelector('.lightbox__next').addEventListener('click', () => show(current + 1));

  lb.addEventListener('click', e => {
    if (e.target === lb || e.target === lb.querySelector('.lightbox__inner')) hide();
  });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    // ESC key handling moved to album.js closeLightbox() for URL cleanup
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });

  // Handle system back button closing lightbox
  window.addEventListener('popstate', (e) => {
    if (lb.classList.contains('active')) {
      // Close lightbox when back button is pressed (don't reload page)
      e.preventDefault();
      if (backCallback) {
        backCallback();
      } else {
        hide();
      }
      // The popstate already removed the #lightbox hash from the URL, so we're done
    }
  });

  let touchStartX = 0;
  let touchStartY = 0;
  lb.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
    // Only swipe horizontally (not vertical scrolling), ignore edge swipes
    if (Math.abs(dx) > 50 && dy < 50 && touchStartX > 30 && touchStartX < window.innerWidth - 30) {
      show(current + (dx < 0 ? 1 : -1));
    }
  });

  return {
    init(photoArray) { photos = photoArray; },
    open(index)      { show(index); },
    close()          { hide(); },
    setBack(callback) { backCallback = callback; },
    onPhotoChange(cb) { onPhotoChangeCb = cb; },
    openCharacter(character) { buildCharacterPanel(character); lb.style.display = 'flex'; },
    openCoser(handle) { buildCoserPanel(handle); lb.style.display = 'flex'; },
    // Save/restore state for info panel browsing mode
    saveState() {
      // Only save once when entering sub-grid mode, not on every sub-grid photo click
      if (inSubGridMode) {
        console.log('🟠 Lightbox.saveState() → Already in sub-grid mode, skipping');
        return;
      }
      savedPhotos = photos;
      savedCurrent = current;
      inSubGridMode = true;
      console.log('🔵 Lightbox.saveState() → Saved state:', {
        photosLength: photos.length,
        currentIndex: current,
        photoSrc: photos[current]?.src?.substring(0, 50)
      });
    },
    restoreState() {
      if (savedPhotos !== null) {
        console.log('🟢 Lightbox.restoreState() → Restoring to:', {
          photosLength: savedPhotos.length,
          currentIndex: savedCurrent,
          photoSrc: savedPhotos[savedCurrent]?.src?.substring(0, 50)
        });
        photos = savedPhotos;
        current = savedCurrent;
        savedPhotos = null;
        savedCurrent = null;
        inSubGridMode = false;  // Clear flag when exiting sub-grid mode
      } else {
        console.log('🟡 Lightbox.restoreState() → Nothing to restore (savedPhotos is null)');
      }
    }
  };
})();

// ── Cross-Album Discovery Helpers ────────────────────────────
// Called when clicking on cosplayer/character names in featured photos
window.openCosplayerModal = (handle) => {
  Lightbox.openCoser(handle);
};

window.openCharacterModal = (character) => {
  Lightbox.openCharacter(character);
};

// Open featured panel with photo details
// Open featured photo in fullscreen lightbox (index-based)
window.openFeaturedPhoto = (index) => {
  // Get all featured photos from config
  const featuredPhotos = (CONFIG.featured || []).map(p => ({
    src: p.src,
    coser: p.credit || p.coser || '',
    character: p.character || '',
    series: p.series || ''
  }));

  if (featuredPhotos.length === 0) return;

  Lightbox.init(featuredPhotos);
  Lightbox.setBack(() => Lightbox.close());
  Lightbox.open(Math.min(index, featuredPhotos.length - 1));
};

// Collaborators panel (Projects & Appearances)
window.openCollabPanel = (collab) => {
  const isMobile = window.innerWidth <= 768;
  const panelId = isMobile ? 'collab-panel-mobile' : 'collab-panel-desktop';
  const contentId = isMobile ? 'collab-panel-content-mobile' : 'collab-panel-content-desktop';

  const panel = document.getElementById(panelId);
  const contentEl = document.getElementById(contentId);

  if (!panel || !contentEl) return;

  // Helper: Find character albums
  const findCharacterAlbums = (character) => {
    const results = [];
    if (!character || typeof CONFIG === 'undefined') return results;
    (CONFIG.events || []).forEach(album => {
      const cp = (album.photos || []).filter(p => p.character === character);
      if (cp.length) results.push({ id: album.id, type: 'events', name: album.name, photos: cp });
    });
    (CONFIG.studio || []).forEach(album => {
      const allPhotos = [];
      (album.cosplayers || []).forEach(coser => {
        const cp = (coser.photos || []).filter(p => p.character === character);
        if (cp.length) allPhotos.push(...cp);
      });
      if (allPhotos.length) results.push({ id: album.id, type: 'studio', name: album.name, photos: allPhotos });
    });
    (CONFIG.collaborators || []).forEach(c => {
      const cp = (c.photos || []).filter(p => p.character === character);
      if (cp.length) results.push({
        id: c.name.replace(/\s+/g, '-').toLowerCase(),
        type: 'collab',
        name: c.name,
        photos: cp
      });
    });
    return results;
  };


  // Collect all photos from collab
  const allPhotos = collab.photos || [];

  // Filter photos by album
  const eventPhotos = [];
  const studioPhotos = [];

  (CONFIG.events || []).forEach(album => {
    (album.photos || []).forEach(p => {
      if (p.coser && p.coser.toLowerCase() === collab.handle.toLowerCase()) {
        eventPhotos.push({ ...p, album: album.name });
      }
    });
  });

  (CONFIG.studio || []).forEach(album => {
    (album.photos || []).forEach(p => {
      if (p.coser && p.coser.toLowerCase() === collab.handle.toLowerCase()) {
        studioPhotos.push({ ...p, album: album.name });
      }
    });
  });

  // Build photo grid HTML for a given set of photos
  const buildPhotoGrid = (photos) => {
    if (!photos.length) {
      return '<div style="padding: 24px; text-align: center; color: var(--text-muted);">No photos in this category.</div>';
    }
    return `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px; padding: 16px;">
        ${photos.map((p, idx) => `
          <div class="collab-photo-item" data-photo-index="${idx}" style="aspect-ratio: 3/4; overflow: hidden; background: var(--bg-card); cursor: pointer;" title="${p.character || 'Photo'}">
            <img src="${p.src}" alt="${p.character || ''}" style="width: 100%; height: 100%; object-fit: cover;">
          </div>
        `).join('')}
      </div>
    `;
  };

  // Show main collab panel
  const showMainPanel = () => {
    // Build panel content using unified info-panel structure
    const coverImage = collab.cover || allPhotos[0]?.src || '';
    const firstPhoto = allPhotos[0];
    const html = `
      <div class="info-panel__section">
        <span class="info-panel__section-label">Cosplayer</span>
        <div style="width: 100%; aspect-ratio: 3/4; overflow: hidden; background: var(--bg-card); margin-bottom: 16px;">
          <img src="${coverImage}" alt="${collab.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
        </div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 8px;">${collab.name}</div>
        ${collab.instagram ? `
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 12px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <circle cx="17.5" cy="6.5" r="1.5"></circle>
            </svg>
            <a href="https://instagram.com/${collab.instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; font-size: 0.85rem;">${collab.instagram}</a>
          </div>
        ` : ''}
        ${firstPhoto?.character ? `<div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; margin-top: 12px;">Character</div><div style="cursor: pointer; color: #c8a46e; text-decoration: underline; font-size: 0.95rem; margin-bottom: 8px;" class="collab-character-name" data-character="${firstPhoto.character}">${firstPhoto.character}</div>` : ''}
        ${firstPhoto?.series ? `<div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Series</div><div style="font-size: 0.95rem; color: var(--text); margin-bottom: 8px;">${firstPhoto.series}</div>` : ''}
        ${firstPhoto?.caption ? `<div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Caption</div><div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 8px;">${firstPhoto.caption}</div>` : ''}
        ${collab.bio ? `<div style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.5; margin-top: 12px;">${collab.bio}</div>` : ''}
      </div>

      <div class="info-panel__section">
        <span class="info-panel__section-label">Projects & Appearances</span>
        <div class="info-panel__filter-tabs" style="margin-bottom: 16px;">
          <button class="info-panel__filter-tab active" data-filter="all">All (${allPhotos.length})</button>
          <button class="info-panel__filter-tab" data-filter="events">Events (${eventPhotos.length})</button>
          <button class="info-panel__filter-tab" data-filter="studio">Studio (${studioPhotos.length})</button>
        </div>

        <div class="info-panel__album-list" data-filter="all" style="display: block;">
          ${buildPhotoGrid(allPhotos)}
        </div>
        <div class="info-panel__album-list" data-filter="events" style="display: none;">
          ${buildPhotoGrid(eventPhotos)}
        </div>
        <div class="info-panel__album-list" data-filter="studio" style="display: none;">
          ${buildPhotoGrid(studioPhotos)}
        </div>
      </div>
    `;

    contentEl.innerHTML = html;

    // Tab switching using filter system
    contentEl.querySelectorAll('.info-panel__filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Update active tab button
        contentEl.querySelectorAll('.info-panel__filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update visible album list
        contentEl.querySelectorAll('.info-panel__album-list').forEach(list => {
          list.style.display = list.dataset.filter === filter ? 'block' : 'none';
        });
      });
    });

    // Add click handlers to photo items
    attachPhotoHandlers();
  };

  // Photo detail modal handler
  const showCollabPhotoDetail = (photo) => {
    const existingModal = document.querySelector('.collab-photo-detail-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'collab-photo-detail-modal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8); z-index: 2000;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
    `;

    const gankUrl = collab.gankUrl ? `<a href="${collab.gankUrl}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 12px; padding: 8px 16px; background: #c8a46e; color: #000; text-decoration: none; font-weight: 600; border-radius: 3px;">Support on Gank</a>` : '';

    modal.innerHTML = `
      <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 4px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; padding: 20px;">
        <button onclick="this.closest('.collab-photo-detail-modal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer;">×</button>

        <div style="aspect-ratio: 3/4; overflow: hidden; background: var(--bg-card); margin-bottom: 20px; border-radius: 2px;">
          <img src="${photo.src}" alt="${photo.character || ''}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>

        <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Cosplayer</div>
        <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">
          ${collab.instagram ? `<a href="https://instagram.com/${collab.instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; cursor: pointer;">${collab.name}</a>` : collab.name}
        </div>
        <div style="font-size: 0.9rem; color: var(--accent); margin-bottom: 16px;">
          ${collab.instagram ? `<a href="https://instagram.com/${collab.instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: none; cursor: pointer;">@${collab.handle.replace('@', '')}</a>` : `@${collab.handle.replace('@', '')}`}
        </div>

        ${photo.character ? `
          <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Character</div>
          <div class="collab-character-name" data-character="${photo.character}" style="cursor: pointer; color: #c8a46e; text-decoration: underline; font-size: 0.95rem; margin-bottom: 16px;">${photo.character}</div>
        ` : ''}

        ${photo.series ? `
          <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Series</div>
          <div style="font-size: 0.95rem; color: var(--text); margin-bottom: 16px;">${photo.series}</div>
        ` : ''}

        ${photo.caption ? `
          <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Caption</div>
          <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 16px;">${photo.caption}</div>
        ` : ''}

        <div style="text-align: center;">
          ${gankUrl}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Make character name clickable
    const charNameEl = modal.querySelector('.collab-character-name');
    if (charNameEl) {
      charNameEl.addEventListener('click', () => {
        modal.remove();
        showCharacterDetail(charNameEl.dataset.character);
      });
    }

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Close on escape
    const closeOnEscape = (e) => {
      if (e.key === 'Escape') modal.remove();
    };
    document.addEventListener('keydown', closeOnEscape);
  };

  // Attach photo handlers
  const attachPhotoHandlers = () => {
    contentEl.querySelectorAll('.collab-photo-item').forEach((item, idx) => {
      const photoIndex = parseInt(item.dataset.photoIndex);
      const currentFilter = contentEl.querySelector('.info-panel__filter-tab.active')?.dataset.filter || 'all';

      let photo;
      if (currentFilter === 'all') photo = allPhotos[photoIndex];
      else if (currentFilter === 'events') photo = eventPhotos[photoIndex];
      else if (currentFilter === 'studio') photo = studioPhotos[photoIndex];

      if (photo) {
        item.addEventListener('click', () => showCollabPhotoDetail(photo));
      }
    });
  };

  // Define showCharacterDetail with back button and filter tabs
  const showCharacterDetail = (character) => {
    const characterAlbums = findCharacterAlbums(character);

    const charContent = `
      <div style="padding: 20px 0;">
        <button class="collab-back-btn" style="background: none; border: none; color: var(--accent); cursor: pointer; font-size: 0.75rem; font-weight: 700; margin-bottom: 16px; display: flex; align-items: center; gap: 6px;">
          <svg viewBox="0 0 24 24" style="width: 14px; height: 14px; stroke: currentColor; stroke-width: 2;" fill="none"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back
        </button>

        <div style="margin-bottom: 24px;">
          <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">CHARACTER</div>
          <div style="font-size: 1.2rem; font-weight: 700; color: var(--white); margin-bottom: 8px;">${character}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted);">Appears in ${characterAlbums.length} project${characterAlbums.length !== 1 ? 's' : ''}</div>
        </div>

        <div style="margin-bottom: 24px;">
          <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px;">PROJECTS & APPEARANCES</div>
          <div class="info-panel__filter-tabs" style="margin-bottom: 16px;">
            ${characterAlbums.length > 0 ? `
              <button class="info-panel__filter-tab active" data-filter="all">All (${characterAlbums.length})</button>
              ${characterAlbums.some(a => a.type === 'events') ? `<button class="info-panel__filter-tab" data-filter="events">Events</button>` : ''}
              ${characterAlbums.some(a => a.type === 'studio') ? `<button class="info-panel__filter-tab" data-filter="studio">Studio</button>` : ''}
              ${characterAlbums.some(a => a.type === 'collab') ? `<button class="info-panel__filter-tab" data-filter="collab">Collab</button>` : ''}
            ` : ''}
          </div>

          <div class="info-panel__album-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px;">
            ${characterAlbums.map(a => `
              <div class="info-panel__album-card" data-type="${a.type}" style="cursor: pointer; aspect-ratio: 3/4; overflow: hidden; background: var(--bg-card);">
                <img src="${a.photos[0].src}" alt="${a.name}" style="width: 100%; height: 100%; object-fit: cover;">
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); padding: 8px; color: white; font-size: 0.75rem;">
                  ${a.name}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    contentEl.innerHTML = charContent;

    // Back button click
    contentEl.querySelector('.collab-back-btn').addEventListener('click', () => {
      showMainPanel();
    });

    // Re-attach filter tab logic
    contentEl.querySelectorAll('.info-panel__filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        contentEl.querySelectorAll('.info-panel__filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        contentEl.querySelectorAll('.info-panel__album-card').forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.type === filter) ? '' : 'none';
        });
      });
    });
  };

  // Open panel and show main view
  panel.style.display = 'flex';
  showMainPanel();

  // Close button
  const closeBtn = panel.querySelector('.info-panel__close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  // Back button (mobile)
  const backBtn = panel.querySelector('.info-panel__back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      panel.style.display = 'none';
    });
  }

  // Close on escape
  const closeOnEscape = (e) => {
    if (e.key === 'Escape' && panel.style.display !== 'none') {
      panel.style.display = 'none';
    }
  };
  document.addEventListener('keydown', closeOnEscape);
};

// Featured photo modal (mobile grid and desktop clicks)
window.showFeaturedPhotoModal = (photo) => {
  // Close any existing modal
  const existing = document.querySelector('.featured-photo-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'featured-photo-modal';
  modal.style.cssText = `
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: var(--bg-card);
    border: 1px solid var(--border);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 0;
  `;

  content.innerHTML = `
    <div style="position: relative;">
      <img src="${photo.src}" alt="${photo.character || ''}" style="width:100%; height:auto; aspect-ratio:3/4; object-fit:cover; display:block;">
      <button class="featured-modal-close" style="position:absolute; top:12px; right:12px; width:32px; height:32px; background:rgba(0,0,0,0.6); border:none; color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;">
        <svg viewBox="0 0 24 24" style="width:20px; height:20px;"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
    </div>
    <div style="padding: 24px;">
      <h3 style="font-size:1.4rem; font-weight:700; color:var(--white); margin-bottom:16px;">${photo.character || 'Untitled'}</h3>
      <div style="display:flex; flex-direction:column; gap:12px;">
        ${photo.credit ? `
          <div>
            <div style="font-size:0.7rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin-bottom:4px;">Cosplayer</div>
            <div class="featured-modal-coser" style="font-size:0.95rem; color:var(--text); cursor:pointer; transition:color 0.2s ease;">${photo.credit}</div>
          </div>
        ` : ''}
        ${photo.series ? `
          <div>
            <div style="font-size:0.7rem; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent); margin-bottom:4px;">Series</div>
            <div class="featured-modal-series" style="font-size:0.95rem; color:var(--text); cursor:pointer; transition:color 0.2s ease; font-style:italic;">${photo.series}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close button
  content.querySelector('.featured-modal-close').addEventListener('click', () => modal.remove());

  // Cosplayer click
  const coserEl = content.querySelector('.featured-modal-coser');
  if (coserEl && photo.credit) {
    coserEl.addEventListener('click', () => {
      modal.remove();
      openCosplayerModal(photo.credit);
    });
    coserEl.style.color = 'var(--accent-light)';
    coserEl.style.textDecoration = 'underline';
  }

  // Series click
  const seriesEl = content.querySelector('.featured-modal-series');
  if (seriesEl && photo.series) {
    seriesEl.addEventListener('click', () => {
      modal.remove();
      openCharacterModal(photo.series);
    });
    seriesEl.style.color = 'var(--accent-light)';
    seriesEl.style.textDecoration = 'underline';
  }

  // Close on backdrop click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
};

// ── Page: Home ───────────────────────────────────────────────
function initHome() {
  console.log('🏠 initHome called');
  if (!document.body.classList.contains('page-home')) return;
  document.title = `${window.CONFIG.photographer || 'Cosplay'} · ${window.CONFIG.tagline || 'Portfolio'}`;
  console.log('🏠 page-home class found, initializing...');

  const cfg = CONFIG;

  // Banner Photo (from admin panel via Firestore site/config)
  const banner = cfg.bannerPhoto;
  if (banner && banner.src) {
    const bannerSection = document.getElementById('banner');
    if (!bannerSection) {
      console.warn('Banner section not found');
      return;
    }

    const bannerImg = bannerSection.querySelector('.banner__img');
    if (!bannerImg) {
      console.warn('Banner image element not found');
      return;
    }

    bannerImg.src = banner.src;
    bannerImg.alt = banner.character || '';

    // Update og:image meta tag to match banner (for social media previews)
    // First check if admin has set a custom og:image for home page
    console.log('DEBUG: cfg.ogImages =', cfg.ogImages);
    const customOgImage = cfg.ogImages && cfg.ogImages.home;
    const ogImageUrl = customOgImage || banner.src;

    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImageUrl);
      console.log('✓ Updated og:image to:', ogImageUrl, customOgImage ? '(from admin setting)' : '(from banner)');
    }

    // Image displays at 4:3 aspect ratio with object-fit: cover
    // (CSS handles aspect-ratio, image fits edge-to-edge with center crop)

    bannerSection.querySelector('.banner__character').textContent = banner.character || '';
    bannerSection.querySelector('.banner__series').textContent = banner.series || '';
    bannerSection.querySelector('.banner__credit').textContent = banner.coser ? `@${banner.coser}` : '';
    const bannerLabel = document.querySelector('.banner-label-text');
    if (bannerLabel) bannerLabel.textContent = 'THIS MONTH';

    // Click to open banner in fullscreen lightbox
    bannerSection.style.cursor = 'pointer';
    bannerSection.addEventListener('click', () => {
      console.log('Banner clicked, opening in lightbox');
      Lightbox.init([{
        src: banner.src,
        coser: banner.coser || '',
        character: banner.character || '',
        series: banner.series || ''
      }]);
      Lightbox.setBack(() => Lightbox.close());
      Lightbox.open(0);
    });
    console.log('✓ Banner loaded and click handler attached');
  } else {
    console.log('No banner photo found', { hasBanner: !!banner, hasSrc: banner?.src });
  }

  // Featured section — show all featured picks (not used for hero anymore)
  const allFeatured = cfg.featured || [];
  const featuredPhotos = allFeatured;

  // Featured Grid
  const gridContainer = document.getElementById('featured-grid');
  console.log('About to populate grid:', { gridContainer: !!gridContainer, photoCount: featuredPhotos.length });
  if (gridContainer && featuredPhotos.length > 0) {
    featuredPhotos.forEach((photo, idx) => {
      console.log('Creating grid item', idx, photo.character);
      const gridItem = document.createElement('div');
      gridItem.className = 'featured-grid-item';
      gridItem.innerHTML = `<img src="${photo.src}" alt="${photo.character || ''}" loading="lazy">`;

      gridItem.addEventListener('click', () => {
        openFeaturedPhoto(idx);
      });

      gridContainer.appendChild(gridItem);
      console.log('Appended item', idx, 'Grid now has', gridContainer.children.length, 'children');
    });
  }

  const pickCount = featuredPhotos.length;
  document.querySelector('.section-header__count').textContent =
    `${pickCount} photo${pickCount !== 1 ? 's' : ''}`;

  // Lightbox: map featured to structured photo objects
  Lightbox.init(allFeatured.map(p => ({
    src:       p.src,
    coser:     p.credit    || '',
    character: p.character || '',
    series:    p.series    || ''
  })));
}

// ── Banner Panel Functions ───────────────────────────────────
window.buildAlbumsSection = function(albums, coserHandle) {
  if (!albums || albums.length === 0) return '';

  const igHandle = coserHandle ? (coserHandle.startsWith('@') ? coserHandle : '@' + coserHandle) : '';
  const isMobile = window.innerWidth <= 767;

  const hasEvents = albums.some(a => a.type === 'events');
  const hasStudio = albums.some(a => a.type === 'studio');
  const hasCollab = albums.some(a => a.type === 'collab');

  const tabsHtml = `
    <div class="info-panel__filter-tabs">
      <button class="info-panel__filter-tab active" data-filter="all">All</button>
      ${hasEvents ? '<button class="info-panel__filter-tab" data-filter="events">Events</button>' : ''}
      ${hasStudio ? '<button class="info-panel__filter-tab" data-filter="studio">Studio</button>' : ''}
      ${hasCollab ? '<button class="info-panel__filter-tab" data-filter="collab">Collab</button>' : ''}
    </div>`;

  let albumsHtml = '';
  if (isMobile) {
    // Mobile: accordion list
    const accordions = albums.map((a, i) => `
      <div class="info-panel__accordion" data-ai="${i}" data-type="${a.type}">
        <div class="info-panel__accordion-header">
          <div class="info-panel__accordion-thumb">
            <img src="${a.photos[0].src}" alt="${a.name}">
          </div>
          <div class="info-panel__accordion-meta">
            <div class="info-panel__album-name">${a.name}</div>
            <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''} together</div>
          </div>
          <svg class="info-panel__accordion-chevron" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>
        </div>
        <div class="info-panel__accordion-photos">
          ${a.photos.map((p, pi) =>
            `<div class="info-panel__acc-photo" data-ai="${i}" data-pi="${pi}">
               <img src="${p.src}" alt="">
             </div>`
          ).join('')}
        </div>
      </div>`).join('');

    albumsHtml = `
      <div class="info-panel__section">
        <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
        <div style="font-size:0.8rem; color:#999; margin-bottom:12px;">See all of ${igHandle || 'this cosplayer'}'s work</div>
        ${tabsHtml}
        <div class="info-panel__album-list">${accordions}</div>
      </div>`;
  } else {
    // Desktop: portrait cards
    const cards = albums.map((a, i) => `
      <div class="info-panel__album-card" data-ai="${i}" data-type="${a.type}">
        <div class="info-panel__album-img-wrap">
          <img class="info-panel__album-img" src="${a.photos[0].src}" alt="${a.name}">
        </div>
        <div class="info-panel__album-name">${a.name}</div>
        <div class="info-panel__album-count">${a.photos.length} photo${a.photos.length !== 1 ? 's' : ''} together</div>
      </div>`).join('');

    albumsHtml = `
      <div class="info-panel__section">
        <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
        <div style="font-size:0.8rem; color:#999; margin-bottom:12px;">See all of ${igHandle || 'this cosplayer'}'s work</div>
        ${tabsHtml}
        <div class="info-panel__album-list">${cards}</div>
      </div>`;
  }

  // Add filter tab functionality
  const html = albumsHtml + `
    <script>
      const filterTabs = document.querySelectorAll('.info-panel__filter-tabs button');
      filterTabs.forEach(btn => {
        btn.addEventListener('click', function() {
          const filter = this.getAttribute('data-filter');
          filterTabs.forEach(b => b.classList.remove('active'));
          this.classList.add('active');

          const items = document.querySelectorAll('[data-type]');
          items.forEach(item => {
            if (filter === 'all' || item.getAttribute('data-type') === filter) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        });
      });
    </script>
  `;

  return albumsHtml;
};

function openBannerPanel(banner) {
  const panelDiv = document.getElementById('bannerPanel');
  if (!panelDiv) {
    console.error('Banner panel not found in DOM');
    return;
  }

  const contentDiv = document.getElementById('bannerPanelContent');
  if (!contentDiv) {
    console.error('Banner panel content not found in DOM');
    return;
  }

  // Build panel content
  const html = buildBannerPanelContent(banner);
  contentDiv.innerHTML = html;
  panelDiv.classList.add('active');

  // Close handlers
  const closeBtn = panelDiv.querySelector('.banner-panel__close');
  const overlay = panelDiv.querySelector('.banner-panel__overlay');

  const closePanel = () => {
    panelDiv.classList.remove('active');
  };

  closeBtn.addEventListener('click', closePanel);
  overlay.addEventListener('click', closePanel);

  // Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closePanel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

function buildBannerPanelContent(banner) {
  const coser = banner.coser;
  const albums = findCoserAlbums(coser);

  // Banner image at top
  let html = `
    <div style="width:100%; margin-bottom:20px;">
      <img src="${banner.src}" alt="${banner.character || 'Banner'}" style="width:100%; height:auto; aspect-ratio:16/9; object-fit:cover; display:block; border-radius:4px;">
    </div>
  `;

  // Cosplayer info section
  html += `
    <div class="info-panel__section">
      <span class="info-panel__section-label">COSPLAYER</span>
  `;

  // Instagram link
  if (coser) {
    html += `<a class="info-panel__ig-row" href="https://instagram.com/${coser}" target="_blank" style="margin-bottom:8px;">
      <svg class="info-panel__ig-icon" viewBox="0 0 24 24" style="width:16px; height:16px; margin-right:6px;">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
      </svg>
      <span class="info-panel__ig-handle">@${coser}</span>
    </a>`;
  }

  html += `
    <div class="info-panel__character">${banner.character}</div>
    <div class="info-panel__series">${banner.series}</div>
    <div class="info-panel__project-count">Appears in ${albums.length} project${albums.length !== 1 ? 's' : ''}</div>
    </div>
  `;

  // Description section
  if (banner.description) {
    html += `
      <div class="info-panel__section">
        <p style="color:#ccc; font-size:0.95rem; line-height:1.6;">${banner.description}</p>
      </div>
    `;
  }

  // Projects section with filter tabs
  if (albums.length > 0) {
    html += buildAlbumsSection(albums, coser);
  } else {
    // Show message if no projects found
    html += `
      <div class="info-panel__section">
        <p style="color:#888; font-size:0.9rem;">No projects found yet.</p>
      </div>
    `;
  }

  return html;
}

// ── Page: Events ─────────────────────────────────────────────
async function initEvents() {
  if (!document.body.classList.contains('page-events')) return;
  document.title = `Events · ${window.CONFIG.photographer || 'Cosplay Portfolio'}`;

  try {
    // Wait for Firebase to be ready
    await (window.firebaseReady || Promise.resolve());

    // Fetch Firestore albums (like Cosmic 2025) using modular SDK
    const snap = await getDocs(collection(db, 'events'));
    const firestoreAlbums = snap.docs.map(doc => ({
      id: doc.id,
      type: 'events',
      ...doc.data()
    })).sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

    // Use only Firestore albums (no duplicates from CONFIG.events)
    const allAlbums = firestoreAlbums;

    renderAlbumGrid(allAlbums, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${allAlbums.length} event${allAlbums.length !== 1 ? 's' : ''}`;
  } catch (err) {
    console.error('Error loading events:', err);
    // Fallback to CONFIG.events if Firebase fails
    renderAlbumGrid(CONFIG.events, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${CONFIG.events.length} event${CONFIG.events.length !== 1 ? 's' : ''}`;
  }
}

// ── Page: Studio ─────────────────────────────────────────────
async function initStudio() {
  if (!document.body.classList.contains('page-studio')) return;
  document.title = `Studio · ${window.CONFIG.photographer || 'Cosplay Portfolio'}`;

  try {
    // Load studio albums from Firebase with current order
    const snap = await getDocs(query(collection(db, 'studio'), orderBy('order', 'asc')));
    const studioAlbums = snap.docs.map(doc => ({
      id: doc.id,
      order: doc.data().order || 0,
      ...doc.data()
    }));

    renderAlbumGrid(studioAlbums, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${studioAlbums.length} session${studioAlbums.length !== 1 ? 's' : ''}`;
  } catch (err) {
    console.error('Error loading studio albums:', err);
    // Fallback to CONFIG.studio if Firebase fails
    renderAlbumGrid(CONFIG.studio, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${CONFIG.studio.length} session${CONFIG.studio.length !== 1 ? 's' : ''}`;
  }
}

// ── Page: Outdoor ────────────────────────────────────────────
async function initOutdoor() {
  if (!document.body.classList.contains('page-outdoor')) return;

  // Set page title
  document.title = `Outdoor · ${window.CONFIG.photographer || 'Cosplay Portfolio'}`;

  try {
    // Load outdoor albums from Firebase
    const snap = await getDocs(query(collection(db, 'outdoor'), orderBy('order', 'asc')));
    const outdoorAlbums = snap.docs.map(doc => ({
      id: doc.id,
      order: doc.data().order || 0,
      ...doc.data()
    }));

    renderAlbumGrid(outdoorAlbums, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${outdoorAlbums.length} session${outdoorAlbums.length !== 1 ? 's' : ''}`;
  } catch (err) {
    console.error('Error loading outdoor albums:', err);
    // Fallback to CONFIG.outdoor if Firebase fails
    renderAlbumGrid(CONFIG.outdoor, document.getElementById('albums-grid'));
    document.querySelector('.section-header__count').textContent =
      `${CONFIG.outdoor.length} session${CONFIG.outdoor.length !== 1 ? 's' : ''}`;
  }
}

// ── Helper: total photo count for an album ────────────────────
function albumPhotoCount(album) {
  if (album.photos)     return album.photos.length;
  if (album.cosplayers) return album.cosplayers.reduce((n, c) => n + c.photos.length, 0);
  return 0;
}

// ── Album Card Renderer ───────────────────────────────────────
function renderAlbumGrid(albums, container) {
  if (!container) return;
  if (!albums || albums.length === 0) {
    container.innerHTML = '<p class="empty">No albums yet.</p>';
    return;
  }

  const type = container.dataset.type;
  const isEvents = type === 'events';
  const isOutdoor = type === 'outdoor';
  const isStudio = type === 'studio';

  albums.forEach(album => {
    const card = document.createElement('a');
    card.href = `album.html?id=${album.id}&type=${type}`;
    card.className = 'album-card';
    const count = albumPhotoCount(album);

    // Coser overlay (events and outdoor)
    const coserOverlayHtml = (isEvents || isOutdoor) ? `
      <div class="album-card__coser-overlay">
        <div class="album-card__coser-label">COSER</div>
        <div class="album-card__coser-name"></div>
        <div class="album-card__coser-character"></div>
        <div class="album-card__coser-series"></div>
      </div>
    ` : '';

    // Use first photo as cover if available
    // For events/collabs: album.photos[0].src
    // For studio: album.cosplayers[0].photos[0].src
    // For outdoor: album.cosplayers[0].photos[0].src (same as studio)
    let coverSrc = null;
    if ((isStudio || isOutdoor) && album.cosplayers && album.cosplayers.length > 0 && album.cosplayers[0].photos && album.cosplayers[0].photos.length > 0) {
      coverSrc = album.cosplayers[0].photos[0].src;
    } else if (album.photos && album.photos.length > 0) {
      coverSrc = album.photos[0].src;
    }

    card.innerHTML = `
      ${coverSrc ? `<img src="${coverSrc}" alt="${album.name}" loading="lazy">` : '<div class="album-card__no-cover"></div>'}
      ${coserOverlayHtml}
      <div class="album-card__info">
        <div class="album-card__name">${album.name}</div>
        <div class="album-card__meta">
          <span>${album.date || ''}</span>
          ${album.location ? `<span class="dot">·</span><span>${album.location}</span>` : ''}
        </div>
        <div class="album-card__count">${count} photo${count !== 1 ? 's' : ''}</div>
        <div class="album-card__actions" data-album-id="${album.id}" data-album-name="${album.name.replace(/"/g, "&quot;")}" data-album-type="${type}" data-album-image="${coverSrc || ''}" style="position:relative; display:flex; gap:10px; margin-top:10px; padding-top:10px; border-top:1px solid #2e2e2e; justify-content:center;">
          <button class="like-btn" onclick="event.preventDefault(); event.stopPropagation(); likeAlbum('${album.id}', '${album.name}', '${type}'); return false;" style="display:flex; align-items:center; gap:8px; background:none; border:1px solid #2e2e2e; color:#e4e4e4; padding:8px 16px; cursor:pointer; transition:all 0.22s ease; border-radius:3px; flex:1; justify-content:center; font-size:0.85rem;">
            <svg class="like-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span class="album-like-count">0</span>
          </button>
          <button class="share-btn" onclick="event.preventDefault(); event.stopPropagation(); toggleAlbumShareMenu(event); return false;" style="display:flex; align-items:center; gap:8px; background:none; border:1px solid #2e2e2e; color:#e4e4e4; padding:8px 16px; cursor:pointer; transition:all 0.22s ease; border-radius:3px; flex:1; justify-content:center; font-size:0.85rem;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            <span>Share</span>
          </button>
          <div class="share-menu" style="display:none; position:fixed; background:#0d0d0d; border:1px solid #2e2e2e; border-radius:4px; padding:4px 0; z-index:10001; min-width:200px; box-shadow:0 4px 12px rgba(0,0,0,0.5); bottom:auto; top:auto; left:auto; right:auto;">
            <button class="share-facebook-btn" onclick="event.preventDefault(); event.stopPropagation(); handleAlbumShare('facebook'); return false;" style="width:100%; padding:10px 16px; background:none; border:none; color:#e4e4e4; cursor:pointer; font-size:0.9rem; transition:all 0.22s; text-align:left;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='none'">
              Facebook
            </button>
            <button class="share-threads-btn" onclick="event.preventDefault(); event.stopPropagation(); handleAlbumShare('threads'); return false;" style="width:100%; padding:10px 16px; background:none; border:none; color:#e4e4e4; cursor:pointer; font-size:0.9rem; transition:all 0.22s; text-align:left;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='none'">
              Threads
            </button>
            <button onclick="event.preventDefault(); event.stopPropagation(); copyShareLink('${album.id}', '${type}'); return false;" style="width:100%; padding:10px 16px; background:none; border:none; color:#e4e4e4; cursor:pointer; font-size:0.9rem; transition:all 0.22s; text-align:left; border-top:1px solid #2e2e2e;" onmouseover="this.style.background='#1a1a1a'" onmouseout="this.style.background='none'">
              Copy Link
            </button>
          </div>
        </div>
      </div>
      <div class="album-card__arrow">
        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7h10v10"/></svg>
      </div>
    `;

    container.appendChild(card);

    // Load like count from Firebase
    card.querySelectorAll('.like-btn').forEach(btn => {
      const albumId = btn.closest('[data-album-id]')?.dataset.albumId;
      if (albumId && window.db) {
        getDoc(doc(db, type, albumId)).then(docSnap => {
          if (docSnap.exists()) {
            const likeCount = docSnap.data().albumLikes || 0;
            const countEl = btn.querySelector('.album-like-count');
            if (countEl) countEl.textContent = likeCount;

            // Check if user already liked
            const likeKey = `album_${albumId}`;
            if (hasUserLiked(likeKey)) {
              btn.classList.add('liked');
            }
          }
        }).catch(err => console.error('Error loading like count:', err));
      }
    });
  });
}

// ── Page: Album ───────────────────────────────────────────────
async function initAlbum() {
  if (!document.body.classList.contains('page-album')) return;

  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  const type   = params.get('type');

  let album;

  // Load from Firebase for dynamic sections
  if (type === 'outdoor') {
    try {
      const docSnap = await getDoc(doc(db, 'outdoor', id));
      album = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err) {
      console.error('Error loading outdoor album:', err);
      album = CONFIG.outdoor?.find(a => a.id === id);
    }
  } else if (type === 'studio') {
    try {
      const docSnap = await getDoc(doc(db, 'studio', id));
      album = docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err) {
      console.error('Error loading studio album:', err);
      album = CONFIG.studio?.find(a => a.id === id);
    }
  } else if (type === 'collab') {
    album = CONFIG.collaborators?.find(a => a.id === id);
  } else if (type === 'events') {
    // Try Firebase first (for Cosmic 2025 and dynamic albums)
    try {
      const docSnap = await getDoc(doc(db, 'albums', id));
      if (docSnap.exists()) {
        album = { id: docSnap.id, ...docSnap.data() };
      } else {
        // Fallback to CONFIG.events
        album = CONFIG.events?.find(a => a.id === id);
      }
    } catch (err) {
      console.error('Error loading events album from Firebase:', err);
      // Fallback to CONFIG.events
      album = CONFIG.events?.find(a => a.id === id);
    }
  } else {
    album = CONFIG.events?.find(a => a.id === id);
  }

  const titleEl   = document.getElementById('album-title');
  const metaEl    = document.getElementById('album-meta');
  const descEl    = document.getElementById('album-desc');
  const breadEl   = document.getElementById('album-breadcrumb-link');
  const photoGrid = document.getElementById('photo-grid');

  if (!album) { titleEl.textContent = 'Album not found'; return; }

  // Note: Photos come from the album document itself (album.photos field)
  // NOT from a subcollection. This ensures consistent indexing with album.js
  // which loads photos from the same album.photos field.
  if (!album.photos) {
    album.photos = [];
  }

  // Clear previous content
  photoGrid.innerHTML = '';
  photoGrid.className = 'photo-grid';

  if (breadEl) {
    if (type === 'studio') {
      breadEl.href = 'studio.html';
      breadEl.textContent = 'Studio';
    } else if (type === 'outdoor') {
      breadEl.href = 'outdoor.html';
      breadEl.textContent = 'Outdoor';
    } else if (type === 'collab') {
      breadEl.href = 'collabs.html';
      breadEl.textContent = 'Collabs';
    } else {
      breadEl.href = 'events.html';
      breadEl.textContent = 'Events';
    }
  }

  titleEl.textContent = album.name;
  document.title = `${album.name} — ${CONFIG.photographer}`;

  const totalPhotos = albumPhotoCount(album);
  const parts = [album.date, album.location].filter(Boolean);
  metaEl.innerHTML = parts.map((p, i) =>
    i === 0 ? `<span>${p}</span>` : `<span class="dot">·</span><span>${p}</span>`
  ).join('') + `<span class="dot">·</span><span>${totalPhotos} photo${totalPhotos !== 1 ? 's' : ''}</span>`;

  if (album.description && descEl) descEl.textContent = album.description;

  // ── Studio: render by cosplayer sections ──────────────────
  if (type === 'studio' && album.cosplayers) {
    photoGrid.classList.add('photo-grid--studio');
    const allPhotos = [];

    album.cosplayers.forEach(coser => {
      const offset = allPhotos.length;
      coser.photos.forEach(p => allPhotos.push({
        src:       p.src,
        coser:     p.coser || coser.handle,
        character: p.character || coser.character,
        series:    p.series || coser.series || '',
        albumId:   id,        // Include album ID for photo sharing
        albumType: type       // Include album type (studio)
      }));

      const section = document.createElement('div');
      section.className = 'studio-coser-section';
      section.innerHTML = `
        <div class="studio-coser-header">
          <span class="studio-coser-header__name">${coser.name}</span>
          <span class="studio-coser-header__handle">${coser.handle}</span>
          <span class="studio-coser-header__sep">·</span>
          <span class="studio-coser-header__character">${coser.character}</span>
          ${coser.series ? `<span class="studio-coser-header__series">${coser.series}</span>` : ''}
          <span class="studio-coser-header__count">${coser.photos.length} photo${coser.photos.length !== 1 ? 's' : ''}</span>
        </div>
      `;

      const grid = document.createElement('div');
      grid.className = 'photo-grid';
      coser.photos.forEach((photo, pi) => {
        const item = document.createElement('div');
        item.className = 'photo-grid__item';
        item.innerHTML = `<img src="${photo.src}" alt="${coser.name}" loading="lazy">`;
        item.addEventListener('click', () => {
          Lightbox.setBack(() => Lightbox.close());
          Lightbox.open(offset + pi);
        });
        grid.appendChild(item);
      });

      section.appendChild(grid);
      photoGrid.appendChild(section);
    });

    Lightbox.init(allPhotos);

  // ── Events: render photos grouped by cosplayer ───
  // IMPORTANT: Keep original photo indices for lightbox and sharing
  // While grouping by cosplayer for visual organization
  } else if (album.photos) {
    // Convert photos to lightbox format (same as album.js does)
    // Include albumId and albumType so sharePhotoTo() can generate proper share links
    const allPhotos = album.photos.map((p, idx) => ({
      src:       p.src,
      coser:     (Array.isArray(p.coser) ? p.coser[0] : p.coser) || p.caption || '',
      character: p.character || '',
      series:    p.series || '',
      index:     idx,
      albumId:   id,              // Include album ID for photo sharing
      albumType: type || 'events' // Include album type for proper redirect
    }));

    // Group photos by cosplayer while maintaining original indices and order
    const cosplayerGroups = {};
    const cosplayerOrder = []; // Track order cosplayers appear in photos array
    album.photos.forEach((photo, idx) => {
      // Handle both single cosplayer (string) and multiple (array)
      let cosers = [];
      if (Array.isArray(photo.coser)) {
        cosers = photo.coser; // Multiple cosplayers
      } else if (photo.coser) {
        cosers = [photo.coser]; // Single cosplayer
      } else if (photo.caption) {
        cosers = [photo.caption]; // Fallback to caption
      } else {
        cosers = ['Unknown']; // Last resort
      }

      // Add photo to each cosplayer's group
      cosers.forEach(coserName => {
        if (!cosplayerGroups[coserName]) {
          cosplayerGroups[coserName] = [];
          cosplayerOrder.push(coserName); // Add to order only on first appearance
        }
        cosplayerGroups[coserName].push({ photo, originalIndex: idx });
      });
    });

    // Render photos grouped by cosplayer in the order they appear in the photos array
    const cosplayerNames = cosplayerOrder;

    cosplayerNames.forEach(coserName => {
      const coserPhotos = cosplayerGroups[coserName];

      // Create cosplayer section
      const section = document.createElement('div');
      section.className = 'cosplayer-section';
      section.innerHTML = `
        <div class="cosplayer-header">
          <span class="cosplayer-header__name">${coserName}</span>
          <span class="cosplayer-header__count">${coserPhotos.length} photo${coserPhotos.length !== 1 ? 's' : ''}</span>
        </div>
      `;

      // Create grid for this cosplayer's photos
      const grid = document.createElement('div');
      grid.className = 'photo-grid';

      coserPhotos.forEach(({ photo, originalIndex }) => {
        const item = document.createElement('div');
        item.className = 'photo-grid__item';
        item.innerHTML = `<img src="${photo.src}" alt="${photo.character || 'Photo'}" loading="lazy">`;
        item.addEventListener('click', () => {
          // Restore original album state in case user was browsing projects in info panel
          console.log('📸 Album photo clicked → index:', originalIndex);
          Lightbox.restoreState();
          Lightbox.setBack(() => Lightbox.close());
          Lightbox.open(originalIndex);  // Use original index, not offset
        });
        grid.appendChild(item);
      });

      section.appendChild(grid);
      photoGrid.appendChild(section);
    });

    // Pass photos in original order to lightbox
    Lightbox.init(allPhotos);
  }
}

// ── Collaborator Albums Modal ─────────────────────────────────
window.openCollaboratorAlbumsModal = function(collaborator) {
  const albums = window.findCollaboratorAlbums(collaborator.handle);

  if (!albums.length) {
    alert('No albums found for this collaborator.');
    return;
  }

  // Create modal HTML
  const modal = document.createElement('div');
  modal.className = 'collab-albums-modal active';
  modal.id = 'collabAlbumsModal';

  let albumsHtml = albums.map((album, idx) => {
    const coverSrc = album.photos?.[0]?.src || '';
    const photoCount = album.photos?.length || 0;
    return `
      <div class="collab-album-card" onclick="openCollaboratorAlbumLightbox('${album.id}', '${album.type}', ${photoCount}, event)">
        <div class="collab-album-card__cover">
          ${coverSrc ? `<img src="${coverSrc}" alt="${album.name}" loading="lazy">` : '<div style="width:100%; height:100%; background: var(--bg-card);"></div>'}
          <div class="collab-album-card__info">
            <div class="collab-album-card__name">${album.name}</div>
            <div class="collab-album-card__meta">${photoCount} photo${photoCount !== 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  modal.innerHTML = `
    <div class="collab-albums-modal__overlay" onclick="closeCollaboratorAlbumsModal()"></div>
    <div class="collab-albums-modal__content">
      <div class="collab-albums-modal__header">
        <h2>${collaborator.name}'s Albums & Projects</h2>
        <button class="collab-albums-modal__close" onclick="closeCollaboratorAlbumsModal()">✕</button>
      </div>
      <div class="collab-albums-modal__grid">
        ${albumsHtml}
      </div>
    </div>
  `;

  // Store albums data for lightbox integration
  modal._albums = albums;
  modal._collaborator = collaborator;

  document.body.appendChild(modal);
};

window.closeCollaboratorAlbumsModal = function() {
  const modal = document.getElementById('collabAlbumsModal');
  if (modal) {
    modal.remove();
  }
};

window.openCollaboratorAlbumLightbox = function(albumId, albumType, photoCount, evt) {
  evt.stopPropagation();

  const modal = document.getElementById('collabAlbumsModal');
  if (!modal || !modal._albums) return;

  const collaborator = modal._collaborator;
  const album = modal._albums.find(a => a.id === albumId && a.type === albumType);

  if (!album || !album.photos) return;

  // Map photos for lightbox with collaborator context
  const photos = album.photos.map(p => ({
    src: p.src,
    coser: collaborator.name,
    character: p.character || '',
    series: p.series || '',
    caption: p.caption || '',
    albumId: albumId,
    albumType: albumType || 'collab',
  }));

  // Initialize and open lightbox
  Lightbox.init(photos);
  Lightbox.setBack(() => {
    // Show modal again when back button is clicked
    modal.style.display = 'flex';
  });

  // Hide modal and open lightbox
  modal.style.display = 'none';
  Lightbox.open(0);
};

// ── Page: Collabs ─────────────────────────────────────────────
function initCollabs() {
  if (!document.body.classList.contains('page-collabs')) return;
  document.title = `Collaborators · ${window.CONFIG.photographer || 'Cosplay Portfolio'}`;

  const list = document.getElementById('collab-list');
  let collabs = CONFIG.collaborators || [];

  if (!collabs.length) {
    list.innerHTML = '<p class="empty">No collaborators added yet.</p>';
    return;
  }

  // Convert old flat photo structure to new album structure (backward compatibility)
  collabs = collabs.map(coser => {
    if (!coser.albums && coser.photos) {
      // Old structure: convert photos[] to albums[]
      return {
        ...coser,
        albums: [{
          name: 'All Photos',
          order: 1,
          photos: coser.photos
        }],
        order: coser.order || 999
      };
    }
    return {
      ...coser,
      order: coser.order || 999,
      albums: coser.albums || []
    };
  });

  // Sort by order field
  collabs.sort((a, b) => (a.order || 999) - (b.order || 999));

  // Collect all photos from all albums for global lightbox
  const allPhotos = [];
  collabs.forEach(coser => {
    if (!coser.albums) return;
    coser.albums.forEach(album => {
      if (!album.photos) return;
      album.photos.forEach(photo => {
        allPhotos.push({
          src: photo.src,
          coser: coser.handle || coser.name,
          character: photo.character || '',
          series: photo.series || '',
          caption: photo.caption || '',
          albumId: album.id || null,
          albumType: album.type || 'collab',
        });
      });
    });
  });

  Lightbox.init(allPhotos);

  // Render cosplayer cards (2-column layout)
  list.innerHTML = '';
  collabs.forEach(coser => {
    const entry = document.createElement('div');
    entry.className = 'collab-entry';
    entry.id = coser.id;

    // Get cover image from first photo of first album
    let coverSrc = coser.cover || '';
    if (!coverSrc && coser.albums && coser.albums[0] && coser.albums[0].photos && coser.albums[0].photos[0]) {
      coverSrc = coser.albums[0].photos[0].src;
    }

    // Collect all photos from all albums
    const allCoserPhotos = [];
    (coser.albums || []).forEach(album => {
      (album.photos || []).forEach((photo, idx) => {
        allCoserPhotos.push({
          ...photo,
          src: photo.src,
          character: photo.character || '',
          series: photo.series || '',
          caption: photo.caption || ''
        });
      });
    });

    // Build thumbnail grid HTML
    const thumbsHtml = allCoserPhotos.length ? `
      <div class="collab-entry__projects-label">PROJECT</div>
      <div class="collab-entry__thumbs">
        ${allCoserPhotos.map((photo, idx) => `
          <div class="collab-thumb" data-index="${allPhotos.findIndex(p => p.src === photo.src && p.coser === coser.handle)}" style="cursor: pointer;">
            <img src="${photo.src}" alt="${photo.character || coser.name}" loading="lazy">
          </div>
        `).join('')}
      </div>
    ` : '';

    // Build Gank button HTML
    const gankIcon = `<svg class="gank-btn__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M16 10a4 4 0 01-8 0" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    const gankButtonHtml = coser.gankUrl ? `
      <a class="gank-btn" href="${coser.gankUrl}" target="_blank" rel="noopener noreferrer">
        ${gankIcon}
        Support on Gank
      </a>
    ` : '';

    entry.innerHTML = `
      <div class="collab-entry__cover" style="cursor: pointer;" data-cover-index="${allPhotos.findIndex(p => p.src === coverSrc)}">
        <img src="${coverSrc}" alt="${coser.name}" loading="lazy" style="cursor: pointer;">
      </div>
      <div class="collab-entry__body">
        <div class="collab-entry__label">COSPLAYER</div>
        <h2 class="collab-entry__name">${coser.name}</h2>
        ${coser.instagram ? `
          <div class="collab-entry__instagram">
            <svg class="collab-entry__instagram-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <circle cx="17.5" cy="6.5" r="1.5"></circle>
            </svg>
            <a href="https://instagram.com/${coser.instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="collab-entry__instagram-link">${coser.instagram}</a>
          </div>
        ` : ''}
        ${coser.bio ? `<p class="collab-entry__bio">${coser.bio}</p>` : ''}
        ${thumbsHtml}
        ${allCoserPhotos.length ? '<div class="collab-entry__divider"></div>' : ''}
        ${gankButtonHtml}
      </div>
    `;

    // Attach cover image click handler (opens albums modal)
    const coverEl = entry.querySelector('.collab-entry__cover');
    if (coverEl) {
      coverEl.addEventListener('click', () => {
        openCollaboratorAlbumsModal(coser);
      });
    }

    // Attach thumbnail click handlers (for lightbox)
    entry.querySelectorAll('.collab-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = parseInt(thumb.dataset.index);
        Lightbox.setBack(() => Lightbox.close());
        Lightbox.open(idx);
      });
    });

    list.appendChild(entry);
  });
}

// ── Like & Share Event Handlers ───────────────────────────────
// Like an album by eventId
window.likeAlbum = async (eventId, eventName, type = 'events') => {
  const likeKey = `album_${eventId}`;

  if (hasUserLiked(likeKey)) {
    console.log('Already liked this album');
    return;
  }

  try {
    const docRef = doc(db, type, eventId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Album not found');
      return;
    }

    const newLikeCount = (docSnap.data().albumLikes || 0) + 1;
    await updateDoc(docRef, { albumLikes: newLikeCount });

    markAsLiked(likeKey);

    // Visual feedback - find and update the button
    const likeBtns = document.querySelectorAll(`[data-album-id="${eventId}"] .like-btn`);
    likeBtns.forEach(btn => {
      const countEl = btn.querySelector('.album-like-count');
      if (countEl) {
        countEl.textContent = newLikeCount;
        btn.classList.add('liked');
      }
    });

    console.log('Album liked successfully');
  } catch (err) {
    console.error('Error liking album:', err);
  }
};

// Handle album share from event cards
window.handleAlbumShare = (platform) => {
  // Find the closest album-card__actions element to get data attributes
  const btn = event.target.closest('.share-menu').parentElement;
  const albumData = btn.dataset;

  shareToSocial(platform, albumData.albumName, albumData.albumId, albumData.albumType, albumData.albumImage);
};

// Share to multiple social media platforms
window.shareToSocial = (platform, albumName, albumId, albumType, imageUrl) => {
  // Construct album URL using OG service if album ID is provided
  let url;
  if (albumId && albumType) {
    const ogServiceUrl = 'https://cosplay-portfolio.vercel.app';
    url = `${ogServiceUrl}/api/album?id=${albumId}&type=${albumType}`;
    // Add image URL if available
    if (imageUrl) {
      url += `&image=${encodeURIComponent(imageUrl)}`;
    }
  } else {
    url = window.location.href;
  }
  const shareText = `Check out: ${albumName}`;

  switch(platform) {
    case 'facebook':
      // Open Facebook with the URL - thumbnail will load from OG tags
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`;
      window.open(facebookShareUrl, '_blank', 'width=600,height=400');
      break;

    case 'threads':
      // Copy full share text with link to clipboard and open Threads
      const threadsFullText = `${shareText}\n\n${url}`;
      navigator.clipboard.writeText(threadsFullText).then(() => {
        window.open('https://www.threads.net', '_blank', 'width=600,height=400');
        alert('Link copied! Paste in Threads');
      }).catch(err => {
        window.open('https://www.threads.net', '_blank', 'width=600,height=400');
      });
      break;
  }

  // Close menu
  const menu = document.querySelector('.share-menu');
  if (menu) menu.style.display = 'none';
};

// Copy share link to clipboard
window.copyShareLink = (albumId, albumType) => {
  let url;
  if (albumId && albumType) {
    // Use /api/album endpoint which has proper og:image meta tags for social media bots
    url = `https://cosplay-portfolio.vercel.app/api/album?id=${albumId}&type=${albumType}`;
  } else {
    url = window.location.href;
  }
  navigator.clipboard.writeText(url).then(() => {
    console.log('Link copied to clipboard');
    alert('Album link copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy link:', err);
    prompt('Copy this link:', url);
  });
};

// Toggle album share menu
window.toggleAlbumShareMenu = (event) => {
  event.stopPropagation();

  // Find the closest parent with album-actions or album-card
  const actionContainer = event.target.closest('.album-actions') || event.target.closest('.album-card');
  if (!actionContainer) return;

  const menu = actionContainer.querySelector('.share-menu');
  if (!menu) return;

  // Close all other menus
  const allMenus = document.querySelectorAll('.share-menu');
  allMenus.forEach(m => {
    if (m !== menu) m.style.display = 'none';
  });

  // Toggle this menu
  if (menu.style.display === 'none') {
    menu.style.display = 'block';

    // Position menu relative to button
    const shareBtn = event.target.closest('.share-btn');
    if (shareBtn) {
      const rect = shareBtn.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();

      // Position above button, centered
      let top = rect.top - menuRect.height - 10;
      let left = rect.left + rect.width / 2 - menuRect.width / 2;

      // Check if menu goes off screen
      if (top < 0) {
        // Position below button instead
        top = rect.bottom + 10;
      }
      if (left + menuRect.width > window.innerWidth) {
        left = window.innerWidth - menuRect.width - 10;
      }
      if (left < 0) {
        left = 10;
      }

      menu.style.top = top + 'px';
      menu.style.left = left + 'px';
    }
  } else {
    menu.style.display = 'none';
  }
};

// Close share menus when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.share-btn') && !e.target.closest('.share-menu')) {
    document.querySelectorAll('.share-menu').forEach(m => {
      m.style.display = 'none';
    });
  }
});

// ── Responsive Crop Adjustment ─────────────────────────────────
// Re-apply crop when window is resized (for responsive desktop/mobile switch)

// ── Init ─────────────────────────────────────────────────────
// Wait for Firebase to load, then initialize
window.addEventListener('firebase-config-loaded', () => {
  initSiteIdentity();
  initHome();
  initEvents();
  initOutdoor();
  // ── Lightbox Photo Sharing Setup (BEFORE any album/photo initialization) ───
  // Store current photo context when opening lightbox
  window.currentPhotoShare = null;

  // Register onPhotoChange callback FIRST - BEFORE albums are initialized
  // This ensures currentPhotoShare is set for all photos, including the initial one
  if (Lightbox && Lightbox.onPhotoChange) {
    console.log('📝 Registering Lightbox.onPhotoChange callback...');
    Lightbox.onPhotoChange((photo, index) => {
      console.log('📣 Lightbox.onPhotoChange fired:', {
        index,
        photoSrc: photo.src?.substring(0, 50),
        albumId: photo.albumId,
        albumType: photo.albumType
      });
      // Only set if album.js hasn't already set a richer context for this photo
      if (!window.currentPhotoShare || window.currentPhotoShare.index !== index) {
        window.currentPhotoShare = {
          photoUrl:  photo.src       || '',
          character: photo.character || '',
          series:    photo.series    || '',
          coser:     photo.coser     || photo.credit || '',
          index:     index,
          albumId:   photo.albumId   || window.currentPhotoShare?.albumId   || null,
          albumType: photo.albumType || window.currentPhotoShare?.albumType || null,
        };
      }
    });
  }

  initStudio();
  initAlbum();
  initCollabs();

  // Setup lightbox share button
  const shareBtn = document.getElementById('lightboxShareBtn');
  const shareMenu = document.getElementById('lightboxShareMenu');
  if (shareBtn && shareMenu) {
    console.log('✅ Share button setup: Found elements', { shareBtn, shareMenu });
    shareBtn.addEventListener('click', (e) => {
      console.log('🖱️ Share button clicked!', { display: shareMenu.style.display });
      e.stopPropagation();
      shareMenu.style.display = shareMenu.style.display === 'none' ? 'block' : 'none';
      console.log('📂 Menu toggled to:', shareMenu.style.display);
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.lightbox__share-btn') && !e.target.closest('.lightbox__share-menu')) {
        shareMenu.style.display = 'none';
      }
    });

    // Close menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shareMenu.style.display === 'block') {
        shareMenu.style.display = 'none';
      }
    });

    // Share button is now anchored directly to lightbox__image-container
    // No dynamic repositioning needed - CSS positioning handles it perfectly
    console.log('✅ Share button anchored to image container');
  }

  // Build a /photo share URL with OG metadata + deep-link index
  function buildPhotoShareUrl(photoShare) {
    const { photoUrl, albumId, albumType, character, series, coser, index } = photoShare;
    console.log('🔗 buildPhotoShareUrl called:', { index, albumId, albumType, photoUrl: photoUrl?.substring(0, 50) });
    const base   = 'https://cosplay-portfolio.vercel.app/photo';
    const params = new URLSearchParams({ src: photoUrl });
    if (albumId)              params.set('albumId', albumId);
    if (albumType)            params.set('type', albumType);
    if (character)            params.set('character', character);
    if (series)               params.set('series', series);
    if (coser)                params.set('coser', coser);
    if (index !== undefined)  params.set('index', index);
    const url = `${base}?${params.toString()}`;
    console.log('🔗 Generated URL:', url);
    return url;
  }

  // Share to Facebook / Threads
  window.sharePhotoTo = function(platform) {
    console.log('🔄 sharePhotoTo called:', { platform, currentPhotoShare: window.currentPhotoShare });
    if (!window.currentPhotoShare) {
      console.error('❌ No currentPhotoShare set!');
      return;
    }
    const { character, series, coser } = window.currentPhotoShare;
    const shareUrl  = buildPhotoShareUrl(window.currentPhotoShare);
    const shareText = `Check out this${character ? ` ${character}` : ''} cosplay${series ? ` from ${series}` : ''}${coser ? ` by ${coser}` : ''}`;

    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank', 'width=600,height=400');
    } else if (platform === 'threads') {
      const fullText = `${shareText}\n\n${shareUrl}`;
      // Copy to clipboard
      navigator.clipboard.writeText(fullText).then(() => {
        // Open Threads web - content is in clipboard ready to paste
        window.open('https://www.threads.net/create', '_blank', 'width=600,height=400');
      }).catch(() => {
        // Fallback if clipboard fails
        window.open('https://www.threads.net/create', '_blank', 'width=600,height=400');
        prompt('Copy this text to Threads:', fullText);
      });
    }

    const shareMenu = document.getElementById('lightboxShareMenu');
    if (shareMenu) shareMenu.style.display = 'none';
  };

  // Copy photo link to clipboard
  window.copyPhotoLink = function() {
    console.log('📋 copyPhotoLink called:', { currentPhotoShare: window.currentPhotoShare });
    if (!window.currentPhotoShare) {
      console.error('❌ No currentPhotoShare set!');
      return;
    }
    const shareUrl = buildPhotoShareUrl(window.currentPhotoShare);
    navigator.clipboard.writeText(shareUrl).then(() => {
      const shareBtn = document.getElementById('lightboxShareBtn');
      if (shareBtn) {
        const span = shareBtn.querySelector('span');
        const orig = span.textContent;
        span.textContent = '✓ Copied!';
        setTimeout(() => { span.textContent = orig; }, 2000);
      }
    }).catch(err => {
      prompt('Copy this link:', shareUrl);
    });

    const shareMenu = document.getElementById('lightboxShareMenu');
    if (shareMenu) shareMenu.style.display = 'none';
  };

});
