/**
 * Album Page Logic
 * - Loads album data from Firestore based on query parameters (?id=&type=)
 * - Updates Open Graph meta tags for social media previews
 * - Renders photo grid and handles lightbox
 * - Implements Like and Share functionality
 */

let currentAlbumData = null;
let currentAlbumId = null;
let currentAlbumType = null;
let currentAlbumPhotos = [];

/**
 * Parse URL query parameters
 */
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Update Open Graph meta tags
 * Note: Social media bots don't execute JavaScript, so they won't see these updates.
 * The album link will still work when clicked, just without automatic preview images.
 */
function updateOpenGraphTags(title, description, imageUrl) {
  // Basic page title and description
  document.title = `${title} — Cosplay Portfolio`;
  document.querySelector('meta[name="description"]').setAttribute('content', description);

  // Open Graph tags (for browsers that do execute JS, or for reference)
  document.querySelector('meta[property="og:title"]').setAttribute('content', title);
  document.querySelector('meta[property="og:description"]').setAttribute('content', description);
  document.querySelector('meta[property="og:url"]').setAttribute('content', window.location.href);

  if (imageUrl) {
    document.querySelector('meta[property="og:image"]').setAttribute('content', imageUrl);
    document.querySelector('meta[name="twitter:image"]').setAttribute('content', imageUrl);
  }

  // Twitter Card
  document.querySelector('meta[name="twitter:title"]').setAttribute('content', title);
  document.querySelector('meta[name="twitter:description"]').setAttribute('content', description);
}

/**
 * Load album data from Firestore
 */
async function loadAlbumData() {
  if (typeof db === 'undefined') {
    console.error('Firebase not initialized yet');
    setTimeout(loadAlbumData, 500);
    return;
  }

  currentAlbumId = getQueryParam('id');
  currentAlbumType = getQueryParam('type') || 'events';

  if (!currentAlbumId) {
    console.error('No album ID provided');
    document.getElementById('album-title').textContent = 'Album not found';
    return;
  }

  try {
    const docRef = doc(db, currentAlbumType, currentAlbumId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('Album not found:', currentAlbumId);
      document.getElementById('album-title').textContent = 'Album not found';
      return;
    }

    currentAlbumData = docSnap.data();
    currentAlbumPhotos = currentAlbumData.photos || [];

    // Update page content
    renderAlbumHeader();
    renderAlbumPhotos();

    // Update Open Graph tags with first photo
    if (currentAlbumPhotos.length > 0) {
      const firstPhoto = currentAlbumPhotos[0];
      updateOpenGraphTags(
        currentAlbumData.name,
        `Album featuring photos from ${currentAlbumData.name}. ${currentAlbumPhotos.length} photos`,
        firstPhoto.src
      );
    } else {
      updateOpenGraphTags(
        currentAlbumData.name,
        `Album: ${currentAlbumData.name}`,
        ''
      );
    }

    // Load like count
    updateAlbumLikeCount();
  } catch (error) {
    console.error('Error loading album:', error);
    document.getElementById('album-title').textContent = 'Error loading album';
  }
}

/**
 * Render album header with title and metadata
 */
function renderAlbumHeader() {
  if (!currentAlbumData) return;

  document.getElementById('album-title').textContent = currentAlbumData.name;
  document.getElementById('album-title-crumb').textContent = currentAlbumData.name;

  // Breadcrumb
  const breadcrumbLink = document.getElementById('album-breadcrumb-link');
  const typeLabel = currentAlbumType === 'events' ? 'Events' :
                    currentAlbumType === 'outdoor' ? 'Outdoor' :
                    currentAlbumType === 'studio' ? 'Studio' :
                    currentAlbumType === 'collaborators' ? 'Collaborators' : 'Albums';
  breadcrumbLink.textContent = typeLabel;

  // Meta info
  const metaDiv = document.getElementById('album-meta');
  const metaParts = [];

  if (currentAlbumData.date) {
    metaParts.push(`📅 ${currentAlbumData.date}`);
  }
  if (currentAlbumData.location) {
    metaParts.push(`📍 ${currentAlbumData.location}`);
  }
  metaParts.push(`📸 ${currentAlbumPhotos.length} photos`);

  metaDiv.innerHTML = metaParts.map(part => `<span>${part}</span>`).join('');

  // Description
  const descDiv = document.getElementById('album-desc');
  if (currentAlbumData.description) {
    descDiv.textContent = currentAlbumData.description;
  } else {
    descDiv.textContent = `${currentAlbumData.name} event album`;
  }
}

/**
 * Render album photos grid
 */
function renderAlbumPhotos() {
  const grid = document.getElementById('photo-grid');
  if (!grid) return;

  grid.innerHTML = '';

  currentAlbumPhotos.forEach((photo, index) => {
    const photoDiv = document.createElement('div');
    photoDiv.style.cursor = 'pointer';
    photoDiv.style.position = 'relative';
    photoDiv.style.overflow = 'hidden';
    photoDiv.style.borderRadius = '4px';
    photoDiv.style.aspectRatio = '3/4';

    photoDiv.innerHTML = `
      <img src="${photo.src}" alt="${photo.character || 'Photo'}"
           style="width:100%; height:100%; object-fit:cover; transition:transform 0.22s ease;"
           onmouseover="this.style.transform='scale(1.05)'"
           onmouseout="this.style.transform='scale(1)'" />
      <div style="position:absolute; inset:0; background:rgba(0,0,0,0); transition:background 0.22s ease;"
           onmouseover="this.style.background='rgba(0,0,0,0.3)'"
           onmouseout="this.style.background='rgba(0,0,0,0)'"></div>
      <div style="position:absolute; bottom:0; left:0; right:0; background:linear-gradient(180deg,transparent,rgba(0,0,0,0.8)); padding:15px; color:#fff; font-size:0.85rem; line-height:1.4;">
        ${photo.character ? `<div style="font-weight:bold; color:#c8a46e; margin-bottom:3px;">${photo.character}</div>` : ''}
        ${photo.series ? `<div style="color:#ccc; font-size:0.8rem;">${photo.series}</div>` : ''}
      </div>
    `;

    photoDiv.addEventListener('click', () => openPhotoLightbox(index));
    grid.appendChild(photoDiv);
  });
}

/**
 * Open lightbox with specific photo
 */
window.currentLightboxIndex = 0;

function openPhotoLightbox(index) {
  window.currentLightboxIndex = index;
  const lightbox = document.getElementById('lightbox');
  const photo = currentAlbumPhotos[index];

  document.querySelector('.lightbox__img').src = photo.src;
  document.querySelector('.lightbox__caption').innerHTML = `
    ${photo.character ? `<strong>${photo.character}</strong> from ${photo.series || 'Unknown'}` : 'Photo'}
    ${photo.coser ? `<br><span style="color:#aaa; font-size:0.85rem;">by @${photo.coser}</span>` : ''}
  `;

  updateLightboxCounter();
  updateLightboxLikeCount(index);

  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Enable/disable nav buttons
  updateLightboxNavigation();
}

function updateLightboxCounter() {
  const total = currentAlbumPhotos.length;
  const current = window.currentLightboxIndex + 1;
  document.querySelector('.lightbox__counter').textContent = `${current}/${total}`;
}

function updateLightboxNavigation() {
  const prevBtn = document.querySelector('.lightbox__prev');
  const nextBtn = document.querySelector('.lightbox__next');
  const isFirst = window.currentLightboxIndex === 0;
  const isLast = window.currentLightboxIndex === currentAlbumPhotos.length - 1;

  prevBtn.style.opacity = isFirst ? '0.3' : '1';
  prevBtn.style.cursor = isFirst ? 'default' : 'pointer';
  nextBtn.style.opacity = isLast ? '0.3' : '1';
  nextBtn.style.cursor = isLast ? 'default' : 'pointer';
}

/**
 * Lightbox navigation handlers (attach to existing buttons)
 */
document.addEventListener('DOMContentLoaded', () => {
  const lightbox = document.getElementById('lightbox');
  const prevBtn = document.querySelector('.lightbox__prev');
  const nextBtn = document.querySelector('.lightbox__next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (window.currentLightboxIndex > 0) {
        openPhotoLightbox(window.currentLightboxIndex - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (window.currentLightboxIndex < currentAlbumPhotos.length - 1) {
        openPhotoLightbox(window.currentLightboxIndex + 1);
      }
    });
  }

  if (lightbox) {
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) {
        closeLightbox();
      }
    });

    // Close on background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }
});

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
}

/**
 * Like functionality
 */
function getDeviceId() {
  let deviceId = localStorage.getItem('portfolio_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('portfolio_device_id', deviceId);
  }
  return deviceId;
}

function hasUserLiked(likeKey) {
  const deviceId = getDeviceId();
  return !!localStorage.getItem(`like_${deviceId}_${likeKey}`);
}

function markAsLiked(likeKey) {
  const deviceId = getDeviceId();
  localStorage.setItem(`like_${deviceId}_${likeKey}`, Date.now());
}

/**
 * Like current album
 */
window.likeCurrentAlbum = async () => {
  if (!currentAlbumId || !currentAlbumType) return;

  const likeKey = `album_${currentAlbumId}`;

  if (hasUserLiked(likeKey)) {
    alert('You already liked this album!');
    return;
  }

  try {
    const docRef = doc(db, currentAlbumType, currentAlbumId);
    const newLikeCount = (currentAlbumData.albumLikes || 0) + 1;
    await updateDoc(docRef, { albumLikes: newLikeCount });

    markAsLiked(likeKey);
    currentAlbumData.albumLikes = newLikeCount;
    updateAlbumLikeCount();

    // Visual feedback
    const btn = document.getElementById('albumLikeBtn');
    if (btn) {
      btn.style.color = '#c8a46e';
      btn.style.borderColor = '#c8a46e';
      btn.querySelector('.like-icon').style.fill = '#c8a46e';
    }
  } catch (error) {
    console.error('Error liking album:', error);
    alert('Error: Could not like album');
  }
};

/**
 * Update album like count display
 */
function updateAlbumLikeCount() {
  const likeBtn = document.getElementById('albumLikeBtn');
  if (!likeBtn) return;

  const likeCount = currentAlbumData.albumLikes || 0;
  const likeCountSpan = likeBtn.querySelector('.album-like-count');
  if (likeCountSpan) {
    likeCountSpan.textContent = likeCount;
  }

  // Check if already liked and update button style
  const likeKey = `album_${currentAlbumId}`;
  if (hasUserLiked(likeKey)) {
    likeBtn.style.color = '#c8a46e';
    likeBtn.style.borderColor = '#c8a46e';
    likeBtn.querySelector('.like-icon').style.fill = '#c8a46e';
  }
}

/**
 * Like individual photo in lightbox
 */
window.likePhotoInLightbox = async () => {
  if (!currentAlbumId || !currentAlbumType) return;

  const photoIndex = window.currentLightboxIndex;
  const likeKey = `${currentAlbumType}photo_${currentAlbumId}_${photoIndex}`;

  if (hasUserLiked(likeKey)) {
    alert('You already liked this photo!');
    return;
  }

  try {
    const docRef = doc(db, currentAlbumType, currentAlbumId);
    const photoLikes = currentAlbumData.photoLikes || {};
    photoLikes[photoIndex] = (photoLikes[photoIndex] || 0) + 1;

    await updateDoc(docRef, { photoLikes });

    markAsLiked(likeKey);
    currentAlbumData.photoLikes = photoLikes;
    updateLightboxLikeCount(photoIndex);

    // Visual feedback
    const btn = document.getElementById('lightboxLikeBtn');
    if (btn) {
      btn.style.color = '#c8a46e';
      btn.style.borderColor = '#c8a46e';
      btn.querySelector('svg').style.fill = '#c8a46e';
    }
  } catch (error) {
    console.error('Error liking photo:', error);
    alert('Error: Could not like photo');
  }
};

/**
 * Update lightbox like count
 */
function updateLightboxLikeCount(photoIndex) {
  const likeBtn = document.getElementById('lightboxLikeBtn');
  if (!likeBtn) return;

  const photoLikes = currentAlbumData.photoLikes || {};
  const likeCount = photoLikes[photoIndex] || 0;
  const likeCountSpan = likeBtn.querySelector('.lightbox__like-count');
  if (likeCountSpan) {
    likeCountSpan.textContent = likeCount;
  }

  // Check if already liked
  const likeKey = `${currentAlbumType}photo_${currentAlbumId}_${photoIndex}`;
  if (hasUserLiked(likeKey)) {
    likeBtn.style.color = '#c8a46e';
    likeBtn.style.borderColor = '#c8a46e';
    likeBtn.querySelector('svg').style.fill = '#c8a46e';
  } else {
    likeBtn.style.color = '#e4e4e4';
    likeBtn.style.borderColor = '#e4e4e4';
    likeBtn.querySelector('svg').style.fill = 'none';
  }
}

/**
 * Share functionality
 */
window.toggleAlbumShareMenu = () => {
  const menu = document.getElementById('albumShareMenu');
  if (!menu) return;

  const isVisible = menu.style.display === 'block';
  menu.style.display = isVisible ? 'none' : 'block';

  if (!isVisible) {
    // Position menu relative to button
    const btn = document.getElementById('albumShareBtn');
    const rect = btn.getBoundingClientRect();
    menu.style.top = (rect.bottom + 10) + 'px';
    menu.style.left = (rect.left) + 'px';
  }
};

window.shareAlbumTo = (platform) => {
  if (!currentAlbumId || !currentAlbumType) return;

  // Use OG service URL for proper social media previews
  const ogServiceUrl = 'https://cosplay-portfolio.vercel.app';
  const albumUrl = `${ogServiceUrl}/api/album?id=${currentAlbumId}&type=${currentAlbumType}`;
  const albumName = currentAlbumData.name;
  const firstPhoto = currentAlbumPhotos.length > 0 ? currentAlbumPhotos[0].src : '';

  const shareText = `Check out this cosplay album: ${albumName}`;

  switch (platform) {
    case 'x':
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(albumUrl)}`, '_blank', 'width=550,height=420');
      break;

    case 'instagram':
      // Instagram Link Sticker workflow
      const igUrl = albumUrl;
      navigator.clipboard.writeText(igUrl).then(() => {
        window.open('https://instagram.com/', '_blank');
        alert(`✓ Album link copied to clipboard!\n\nTo share on Instagram Story:\n1. Create a Story (upload photo/video)\n2. Tap the Sticker icon (⭐)\n3. Select "Link Sticker"\n4. Paste the URL`);
      }).catch(() => {
        window.open('https://instagram.com/', '_blank');
        alert(`Album link copied!\n\nTo share on Instagram Story:\n1. Create a Story\n2. Tap Sticker (⭐)\n3. Select Link Sticker\n4. Paste: ${igUrl}`);
      });
      break;

    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(albumUrl)}`, '_blank', 'width=550,height=420');
      break;

    case 'threads':
      window.open(`https://www.threads.net/intent/compose?text=${encodeURIComponent(shareText + ' ' + albumUrl)}`, '_blank', 'width=550,height=420');
      break;

    case 'xhs':
      // XiaoHongShu doesn't support direct web sharing
      copyAlbumLink();
      alert('Album link copied to clipboard. Open XiaoHongShu and paste it in a new post.');
      break;

    case 'wechat':
      // WeChat doesn't support direct web sharing
      copyAlbumLink();
      alert('Album link copied to clipboard. Open WeChat and share it with your contacts.');
      break;
  }

  // Close menu
  const menu = document.getElementById('albumShareMenu');
  if (menu) menu.style.display = 'none';
};

window.copyAlbumLink = () => {
  const ogServiceUrl = 'https://cosplay-portfolio.vercel.app';
  const albumUrl = `${ogServiceUrl}/api/album?id=${currentAlbumId}&type=${currentAlbumType}`;
  navigator.clipboard.writeText(albumUrl).then(() => {
    alert('Album link copied to clipboard!');
  }).catch(() => {
    prompt('Copy this link:', albumUrl);
  });
};

// Close share menu on outside click
document.addEventListener('click', (e) => {
  const menu = document.getElementById('albumShareMenu');
  const btn = document.getElementById('albumShareBtn');
  if (menu && !e.target.closest('#albumShareMenu') && !e.target.closest('#albumShareBtn')) {
    menu.style.display = 'none';
  }
});

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
  // Attach like handler to lightbox button
  const lightboxLikeBtn = document.getElementById('lightboxLikeBtn');
  if (lightboxLikeBtn) {
    lightboxLikeBtn.onclick = window.likePhotoInLightbox;
  }

  // Load album data
  loadAlbumData();
});
