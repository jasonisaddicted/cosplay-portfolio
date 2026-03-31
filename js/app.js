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

// ── Lightbox ─────────────────────────────────────────────────
// Fully CONFIG-driven. To add cosers/albums/photos: edit config.js only.
// handle in event photos (photo.coser) must match cosplayer handle in studio
// (cosplayer.handle) for cross-album discovery to work.
const Lightbox = (() => {
  let photos = [];
  let current = 0;
  let panelTimers = [];

  const lb = document.getElementById('lightbox');
  if (!lb) return {};

  const imgEl   = lb.querySelector('.lightbox__img');
  const capEl   = lb.querySelector('.lightbox__caption');
  const counter = lb.querySelector('.lightbox__counter');

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
        ${photo.character ? `<div class="info-panel__character">${photo.character}</div>` : ''}
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
    buildInfoPanel(p);
  }

  function hide() {
    lb.classList.remove('active', 'panel-open');
    document.body.style.overflow = '';
    imgEl.src = '';
    clearPanelTimers();
  }

  lb.querySelector('.lightbox__close').addEventListener('click', hide);
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
    open(index)      { show(index); }
  };
})();

// ── Page: Home ───────────────────────────────────────────────
function initHome() {
  if (!document.body.classList.contains('page-home')) return;

  const cfg = CONFIG;
  const [hero, ...picks] = cfg.featured;

  // Hero
  if (hero) {
    const heroSection = document.getElementById('hero');
    heroSection.querySelector('.hero__img').src     = hero.src;
    heroSection.querySelector('.hero__img').alt     = hero.character || '';
    heroSection.querySelector('.hero__character').textContent = hero.character || '';
    heroSection.querySelector('.hero__series').textContent   = hero.series    || '';
    if (hero.credit) {
      heroSection.querySelector('.hero__credit').textContent = hero.credit;
    }
    const heroLabel = document.querySelector('.hero-label-text');
    if (heroLabel) heroLabel.textContent = cfg.heroLabel || '';
    heroSection.addEventListener('click', () => Lightbox.open(0));
  }

  // Picks grid — show up to 9 picks (featured[1..9])
  const grid = document.getElementById('picks-grid');
  const allFeatured = cfg.featured;
  const maxPicks = 9;

  allFeatured.forEach((p, i) => {
    if (i === 0) return;  // hero is separate
    if (i > maxPicks) return;

    const el = document.createElement('div');
    el.className = 'pick-item';
    el.innerHTML = `
      <img src="${p.src}" alt="${p.character || ''}" loading="lazy">
      <div class="pick-item__info">
        ${p.credit    ? `<div class="pick-item__label">COSER</div><div class="pick-item__coser">${p.credit}</div>` : ''}
        ${p.character ? `<div class="pick-item__character">${p.character}</div>` : ''}
        ${p.series    ? `<div class="pick-item__series">${p.series}</div>` : ''}
      </div>
    `;
    el.addEventListener('click', () => Lightbox.open(i));
    grid.appendChild(el);
  });

  const pickCount = Math.min(picks.length, maxPicks);
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
        coser:     coser.name,
        character: coser.character,
        series:    coser.series || ''
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
        item.addEventListener('click', () => Lightbox.open(offset + pi));
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
      item.addEventListener('click', () => Lightbox.open(i));
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
        <h2 class="collab-entry__name">${c.name}</h2>
        <div class="collab-entry__handle">${c.handle}</div>
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

    entry.querySelectorAll('.collab-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        Lightbox.open(parseInt(thumb.dataset.index));
      });
    });

    list.appendChild(entry);
  });
}

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
