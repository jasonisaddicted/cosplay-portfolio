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

// ── Lightbox ─────────────────────────────────────────────────
// Fully CONFIG-driven. To add cosers/albums/photos: edit config.js only.
// handle in event photos (photo.coser) must match cosplayer handle in studio
// (cosplayer.handle) for cross-album discovery to work.
const Lightbox = (() => {
  let photos = [];
  let current = 0;
  let panelTimers = [];
  let backCallback = null;

  const lb = document.getElementById('lightbox');
  if (!lb) return {};

  const imgEl   = lb.querySelector('.lightbox__img');
  const capEl   = lb.querySelector('.lightbox__caption');
  const counter = lb.querySelector('.lightbox__counter');
  const backBtn = lb.querySelector('.lightbox__back');

  const infoPanel = document.createElement('div');
  infoPanel.className = 'lightbox__info-panel';
  lb.appendChild(infoPanel);

  function clearPanelTimers() {
    panelTimers.forEach(t => clearInterval(t));
    panelTimers = [];
  }

  // Auto-discovers all albums (events + studio + collab) featuring this handle.
  // Adding new albums in config.js automatically surfaces them in the panel.
  function findCoserAlbums(handle) {
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
  }

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
            series: p.series || ''
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
            series: p.series || ''
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
        ${coserAlbums.length > 0 ? `<div class="info-panel__project-count" style="font-size:0.75rem; color:#999; margin-top:8px;">Appears in ${coserAlbums.length} project${coserAlbums.length !== 1 ? 's' : ''}</div>` : ''}
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
            <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
            <div style="font-size:0.8rem; color:#999; margin-bottom:12px;">See all of ${igHandle || 'this cosplayer'}'s work in different events, studio sessions, and collaborations</div>
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
            <span class="info-panel__section-label">PROJECTS & APPEARANCES</span>
            <div style="font-size:0.8rem; color:#999; margin-bottom:12px;">See all of ${igHandle || 'this cosplayer'}'s work in different events, studio sessions, and collaborations</div>
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

        // Cycling slideshow on the thumbnail
        if (album.photos.length > 1) {
          let idx = 0;
          const t = setInterval(() => {
            idx = (idx + 1) % album.photos.length;
            thumb.src = album.photos[idx].src;
          }, 2500);
          panelTimers.push(t);
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
          // Map to structured photo objects so prev/next navigation keeps coser info
          const albumObjs = album.photos.map(p => ({
            src: p.src, coser: handle,
            character: photo.character || '',
            series:    photo.series    || ''
          }));
          photos  = albumObjs;
          current = pi;
          imgEl.src = album.photos[pi].src;
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
          const t = setInterval(() => {
            idx = (idx + 1) % album.photos.length;
            img.src = album.photos[idx].src;
          }, 2500);
          panelTimers.push(t);
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
        imgEl.src = savedPhotos[savedCurrent].src;
        if (counter) counter.textContent = `${savedCurrent + 1} / ${savedPhotos.length}`;
        buildInfoPanel(savedPhotos[savedCurrent]);
      });

      // Photo click → update main image and info panel with that photo's metadata
      infoPanel.querySelectorAll('.info-panel__subgrid-photo').forEach(div => {
        div.addEventListener('click', () => {
          const i = parseInt(div.dataset.i);
          photos  = albumObjs;
          current = i;
          imgEl.src = albumObjs[i].src;
          if (counter) counter.textContent = `${i + 1} / ${albumObjs.length}`;
          buildInfoPanel(albumObjs[i]);
          renderSubPanel(i);
        });
      });
    }

    renderSubPanel(-1);
  }

  function show(index) {
    current = (index + photos.length) % photos.length;
    const p = photos[current];
    imgEl.src = p.src;
    if (capEl) capEl.textContent = '';
    if (counter) counter.textContent = `${current + 1} / ${photos.length}`;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (backBtn && backCallback) backBtn.style.display = 'flex';
    buildInfoPanel(p);
  }

  function hide() {
    lb.classList.remove('active', 'panel-open');
    document.body.style.overflow = '';
    imgEl.src = '';
    if (backBtn) backBtn.style.display = 'none';
    backCallback = null;
    clearPanelTimers();
  }

  lb.querySelector('.lightbox__close').addEventListener('click', hide);
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      if (backCallback) {
        backCallback();
        backCallback = null;
        if (backBtn) backBtn.style.display = 'none';
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
    if (e.key === 'Escape')      hide();
    if (e.key === 'ArrowLeft')   show(current - 1);
    if (e.key === 'ArrowRight')  show(current + 1);
  });

  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  return {
    init(photoArray) { photos = photoArray; },
    open(index)      { show(index); },
    close()          { hide(); },
    setBack(callback) { backCallback = callback; },
    openCharacter(character) { buildCharacterPanel(character); lb.style.display = 'flex'; },
    openCoser(handle) { buildCoserPanel(handle); lb.style.display = 'flex'; }
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
window.openFeaturedPanel = (photo) => {
  // Show detailed modal instead of side panel
  const existingModal = document.querySelector('.featured-photo-detail-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.className = 'featured-photo-detail-modal';
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8); z-index: 2000;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div style="background: var(--bg); border: 1px solid var(--border); border-radius: 4px; max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; padding: 20px;">
      <button onclick="this.closest('.featured-photo-detail-modal').remove()" style="position: absolute; top: 10px; right: 10px; background: none; border: none; color: var(--text); font-size: 24px; cursor: pointer;">×</button>

      <div style="aspect-ratio: 3/4; overflow: hidden; background: var(--bg-card); margin-bottom: 20px; border-radius: 2px;">
        <img src="${photo.src}" alt="${photo.character || ''}" style="width: 100%; height: 100%; object-fit: cover;">
      </div>

      ${photo.character ? `
        <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Character</div>
        <div style="font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 16px;">${photo.character}</div>
      ` : ''}

      ${photo.series ? `
        <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Series</div>
        <div style="font-size: 0.95rem; color: var(--text); margin-bottom: 16px;">${photo.series}</div>
      ` : ''}

      ${photo.credit ? `
        <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Cosplayer</div>
        <div style="font-size: 0.95rem; color: var(--text); margin-bottom: 16px;">${photo.credit}</div>
      ` : ''}

      ${photo.caption ? `
        <div style="color: var(--accent); font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Caption</div>
        <div style="font-size: 0.9rem; color: var(--text-muted);">${photo.caption}</div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(modal);

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
        <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">${collab.handle}</div>
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
  console.log('🏠 page-home class found, initializing...');

  const cfg = CONFIG;

  // Banner Photo (new system - separate from featured)
  const banner = cfg.bannerPhoto;
  if (banner && banner.src) {
    const heroSection = document.getElementById('hero');
    const heroImg = heroSection.querySelector('.hero__img');
    heroImg.src = banner.src;
    heroImg.alt = banner.character || '';

    // Image displays at 16:9 desktop / 3:4 mobile aspect ratio with object-fit: cover
    // (CSS handles aspect-ratio, image fits edge-to-edge with center crop)

    heroSection.querySelector('.hero__character').textContent = banner.character || '';
    heroSection.querySelector('.hero__series').textContent = banner.series || '';
    heroSection.querySelector('.hero__credit').textContent = banner.coser ? `@${banner.coser}` : '';
    const heroLabel = document.querySelector('.hero-label-text');
    if (heroLabel) heroLabel.textContent = 'THIS MONTH';

    // Click to open banner panel
    heroSection.addEventListener('click', () => {
      openBannerPanel(banner);
    });
  }

  // Featured section — show all featured picks (not used for hero anymore)
  const allFeatured = cfg.featured || [];
  const maxPicks = 9;
  const featuredPhotos = allFeatured.slice(0, maxPicks);

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
        openFeaturedPanel(photo);
      });

      gridContainer.appendChild(gridItem);
      console.log('Appended item', idx, 'Grid now has', gridContainer.children.length, 'children');
    });
  }

  const pickCount = Math.min(featuredPhotos.length, maxPicks);
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
function buildAlbumsSection(albums, coserHandle) {
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
}

function openBannerPanel(banner) {
  if (!banner.coser) return; // Can't show panel without cosplayer handle

  const panelDiv = document.getElementById('bannerPanel');
  const contentDiv = document.getElementById('bannerPanelContent');

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

  let html = `
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
  }

  return html;
}

// ── Page: Events ─────────────────────────────────────────────
function initEvents() {
  if (!document.body.classList.contains('page-events')) return;
  renderAlbumGrid(CONFIG.events, document.getElementById('albums-grid'));
  document.querySelector('.section-header__count').textContent =
    `${CONFIG.events.length} event${CONFIG.events.length !== 1 ? 's' : ''}`;
}

// ── Page: Studio ─────────────────────────────────────────────
function initStudio() {
  if (!document.body.classList.contains('page-studio')) return;
  renderAlbumGrid(CONFIG.studio, document.getElementById('albums-grid'));
  document.querySelector('.section-header__count').textContent =
    `${CONFIG.studio.length} session${CONFIG.studio.length !== 1 ? 's' : ''}`;
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

  albums.forEach(album => {
    const card = document.createElement('a');
    card.href = `album.html?id=${album.id}&type=${type}`;
    card.className = 'album-card';
    const count = albumPhotoCount(album);

    // Coser overlay (events only)
    const coserOverlayHtml = isEvents ? `
      <div class="album-card__coser-overlay">
        <div class="album-card__coser-label">COSER</div>
        <div class="album-card__coser-name"></div>
        <div class="album-card__coser-character"></div>
        <div class="album-card__coser-series"></div>
      </div>
    ` : '';

    card.innerHTML = `
      <img src="${album.cover}" alt="${album.name}" loading="lazy">
      ${coserOverlayHtml}
      <div class="album-card__info">
        <div class="album-card__name">${album.name}</div>
        <div class="album-card__meta">
          <span>${album.date || ''}</span>
          ${album.location ? `<span class="dot">·</span><span>${album.location}</span>` : ''}
        </div>
        <div class="album-card__count">${count} photo${count !== 1 ? 's' : ''}</div>
      </div>
      <div class="album-card__arrow">
        <svg viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M7 7h10v10"/></svg>
      </div>
    `;

    // ── Event card: slideshow + hover coser overlay ──────────
    if (isEvents && album.photos && album.photos.length > 0) {
      const imgEl      = card.querySelector('img');
      const elName     = card.querySelector('.album-card__coser-name');
      const elChar     = card.querySelector('.album-card__coser-character');
      const elSeries   = card.querySelector('.album-card__coser-series');

      // Shuffle photos for random slideshow order
      const pool = [...album.photos].sort(() => Math.random() - 0.5);
      let idx = 0;

      function updateSlide() {
        const p = pool[idx];
        imgEl.src = p.src;
        if (elName)   elName.textContent   = p.coser     || '';
        if (elChar)   elChar.textContent   = p.character || '';
        if (elSeries) elSeries.textContent = p.series    || '';
      }

      updateSlide(); // show first photo immediately

      const timer = setInterval(() => {
        idx = (idx + 1) % pool.length;
        updateSlide();
      }, 3000);

      // Stop timer when navigating away
      card.addEventListener('click', () => clearInterval(timer), { once: true });
    }

    container.appendChild(card);
  });
}

// ── Page: Album ───────────────────────────────────────────────
function initAlbum() {
  if (!document.body.classList.contains('page-album')) return;

  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');
  const type   = params.get('type');

  const collection = type === 'studio' ? CONFIG.studio : CONFIG.events;
  const album = collection.find(a => a.id === id);

  const titleEl   = document.getElementById('album-title');
  const metaEl    = document.getElementById('album-meta');
  const descEl    = document.getElementById('album-desc');
  const breadEl   = document.getElementById('album-breadcrumb-link');
  const photoGrid = document.getElementById('photo-grid');

  if (!album) { titleEl.textContent = 'Album not found'; return; }

  // Clear previous content
  photoGrid.innerHTML = '';
  photoGrid.className = 'photo-grid';

  if (breadEl) {
    breadEl.href        = type === 'studio' ? 'studio.html' : 'events.html';
    breadEl.textContent = type === 'studio' ? 'Studio' : 'Events';
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
        series:    p.series || coser.series || ''
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

  // ── Events: flat photo grid with coser overlay on hover ───
  } else if (album.photos) {
    album.photos.forEach((photo, i) => {
      const item = document.createElement('div');
      item.className = 'photo-grid__item';

      // Build overlay HTML if coser data exists
      const hasCoser = photo.coser || photo.caption;
      const overlayHtml = hasCoser ? `
        <div class="photo-overlay">
          <span class="photo-overlay__label">COSER</span>
          <span class="photo-overlay__coser">${photo.coser || photo.caption || ''}</span>
          ${photo.character ? `<span class="photo-overlay__character">${photo.character}</span>` : ''}
          ${photo.series    ? `<span class="photo-overlay__series">${photo.series}</span>`    : ''}
        </div>
      ` : '';

      item.innerHTML = `
        <img src="${photo.src}" alt="${photo.character || album.name}" loading="lazy">
        ${overlayHtml}
      `;
      item.addEventListener('click', () => {
        Lightbox.setBack(() => Lightbox.close());
        Lightbox.open(i);
      });
      photoGrid.appendChild(item);
    });

    // Pass structured photo data to lightbox
    Lightbox.init(album.photos.map(p => ({
      src:       p.src,
      coser:     p.coser     || p.caption || '',
      character: p.character || '',
      series:    p.series    || ''
    })));
  }
}

// ── Page: Collabs ─────────────────────────────────────────────
function initCollabs() {
  if (!document.body.classList.contains('page-collabs')) return;

  const list = document.getElementById('collab-list');
  const collabs = CONFIG.collaborators || [];

  if (!collabs.length) {
    list.innerHTML = '<p class="empty">No collaborators added yet.</p>';
    return;
  }

  // Collect all photos for global lightbox
  const allPhotos = [];
  const photoOffsets = [];
  collabs.forEach(c => {
    photoOffsets.push(allPhotos.length);
    c.photos.forEach(p => allPhotos.push({
      src:     p.src,
      caption: p.caption || ''
    }));
  });
  Lightbox.init(allPhotos);

  collabs.forEach((c, ci) => {
    const entry = document.createElement('div');
    entry.className = 'collab-entry';
    entry.id = c.id;

    const gankIcon = `<svg class="gank-btn__icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="2" fill="none"/>
      <path d="M16 10a4 4 0 01-8 0" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    const thumbsHtml = c.photos.map((p, pi) =>
      `<div class="collab-thumb" data-index="${photoOffsets[ci] + pi}">
        <img src="${p.src}" alt="${p.caption || c.name}" loading="lazy">
      </div>`
    ).join('');

    entry.innerHTML = `
      <div class="collab-entry__cover">
        <img src="${c.cover}" alt="${c.name}">
      </div>
      <div class="collab-entry__body">
        <div class="collab-entry__label">Collaborator</div>
        <h2 class="collab-entry__name collab-entry__name--clickable">${c.name}</h2>
        <div class="collab-entry__handle">${c.handle}</div>
        ${c.instagram ? `
          <div class="collab-entry__instagram">
            <svg class="collab-entry__instagram-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <circle cx="17.5" cy="6.5" r="1.5"></circle>
            </svg>
            <a href="https://instagram.com/${c.instagram.replace('@', '')}" target="_blank" rel="noopener noreferrer" class="collab-entry__instagram-link">${c.instagram}</a>
          </div>
        ` : ''}
        <p class="collab-entry__bio">${c.bio}</p>
        <div class="collab-entry__divider"></div>
        <div class="collab-entry__projects-label">Our Work Together</div>
        <div class="collab-entry__thumbs">${thumbsHtml}</div>
        <a class="gank-btn" href="${c.gankUrl}" target="_blank" rel="noopener noreferrer">
          ${gankIcon}
          Support on Gank
        </a>
      </div>
    `;

    // Make coser name clickable to open panel
    const nameEl = entry.querySelector('.collab-entry__name');
    nameEl.addEventListener('click', () => {
      openCollabPanel(c);
    });

    entry.querySelectorAll('.collab-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        Lightbox.setBack(() => Lightbox.close());
        Lightbox.open(parseInt(thumb.dataset.index));
      });
    });

    list.appendChild(entry);
  });
}

// ── Responsive Crop Adjustment ─────────────────────────────────
// Re-apply crop when window is resized (for responsive desktop/mobile switch)

// ── Init ─────────────────────────────────────────────────────
// Wait for Firebase to load, then initialize
window.addEventListener('firebase-config-loaded', () => {
  initSiteIdentity();
  initHome();
  initEvents();
  initStudio();
  initAlbum();
  initCollabs();
});
