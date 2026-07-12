// =============================================
// FOCAL POINT PHOTOGRAPHY — MAIN JS
// =============================================

// ---- NAV SCROLL EFFECT ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ---- MOBILE MENU TOGGLE ----
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });
}

// ---- GALLERY FILTER ----
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');
const galleryEmpty = document.getElementById('galleryEmpty');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let visible = 0;

    galleryItems.forEach(item => {
      const cat = item.dataset.category;
      if (filter === 'all' || cat === filter) {
        item.classList.remove('hidden');
        visible++;
      } else {
        item.classList.add('hidden');
      }
    });

    if (galleryEmpty) {
      galleryEmpty.style.display = visible === 0 ? 'block' : 'none';
    }
  });
});

// ---- LIGHTBOX ----
const lightbox         = document.getElementById('lightbox');
const lightboxBackdrop = document.getElementById('lightboxBackdrop');
const lightboxImg      = document.getElementById('lightboxImg');
const lightboxTitle    = document.getElementById('lightboxTitle');
const lightboxCategory = document.getElementById('lightboxCategory');
const lightboxPrice    = document.getElementById('lightboxPrice');
const lightboxBadge    = document.getElementById('lightboxBadge');
const lightboxPurchase = document.getElementById('lightboxPurchase');
const lightboxClose    = document.getElementById('lightboxClose');
const lightboxPrev     = document.getElementById('lightboxPrev');
const lightboxNext     = document.getElementById('lightboxNext');

let currentIndex = 0;
let visibleItems = [];

function openLightbox(idx) {
  visibleItems = Array.from(galleryItems).filter(i => !i.classList.contains('hidden'));
  currentIndex = idx;
  showLightboxItem(currentIndex);
  lightbox.classList.add('open');
  lightboxBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function showLightboxItem(idx) {
  const item = visibleItems[idx];
  if (!item) return;
  const img   = item.querySelector('img');
  const title = item.dataset.title;
  const cat   = item.dataset.category;
  const price = item.dataset.price;
  const badge = item.dataset.badge;
  const purchase = item.dataset.purchase;

  lightboxImg.src  = img ? img.src : '';
  lightboxImg.alt  = title || '';
  lightboxTitle.textContent    = title    || '';
  lightboxCategory.textContent = cat      ? cat.charAt(0).toUpperCase() + cat.slice(1) : '';
  lightboxPrice.textContent    = price    || '';
  lightboxBadge.textContent    = badge    || '';
  lightboxBadge.style.display  = badge    ? 'inline-block' : 'none';

  if (lightboxPurchase) {
    if (purchase && purchase.length > 0) {
      lightboxPurchase.href = purchase;
      lightboxPurchase.style.display = 'inline-block';
    } else {
      lightboxPurchase.style.display = 'none';
    }
  }
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

galleryItems.forEach((item, rawIdx) => {
  item.addEventListener('click', () => {
    const vis = Array.from(galleryItems).filter(i => !i.classList.contains('hidden'));
    const idx = vis.indexOf(item);
    if (idx >= 0) openLightbox(idx);
  });
});

if (lightboxClose)    lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

if (lightboxPrev) lightboxPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
  showLightboxItem(currentIndex);
});

if (lightboxNext) lightboxNext.addEventListener('click', (e) => {
  e.stopPropagation();
  currentIndex = (currentIndex + 1) % visibleItems.length;
  showLightboxItem(currentIndex);
});

document.addEventListener('keydown', (e) => {
  if (!lightbox || !lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') { currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length; showLightboxItem(currentIndex); }
  if (e.key === 'ArrowRight') { currentIndex = (currentIndex + 1) % visibleItems.length; showLightboxItem(currentIndex); }
});

// ---- SCROLL REVEAL ----
const revealEls = document.querySelectorAll('.feature-section, .dual-card, .pillar, .policy-section, .gallery-item');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.7s ${i * 0.05}s cubic-bezier(0.4,0,0.2,1), transform 0.7s ${i * 0.05}s cubic-bezier(0.4,0,0.2,1)`;
  observer.observe(el);
});
