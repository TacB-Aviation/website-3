/* =====================================================
   IMAGES ARRAY
   ===================================================== */
const images = [
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/f3634eee-babf-4ec2-db7e-e00beae18300/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/de362723-65cc-4bad-7028-27d92f3f7800/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/7c89d26a-95b7-4539-34c5-a23a51f33700/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/932921f5-83fb-4491-d608-dd98a8ef8800/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/cf986115-ffa8-40f7-069a-e918fca58d00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/b6be4bbf-6268-4c48-7534-1a907f877c00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/7710845c-1000-4175-8c0c-42a9569f6d00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/9e4a83c3-3bbb-44d1-bc4e-4c747dcb1000/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/ff599074-b80f-49aa-15af-1a1e451cb800/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/68851d65-da0a-4822-0fc0-b0408c810f00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/70d61bdd-5139-45d5-69d2-5776f4662f00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/808fb857-cb4e-4c28-bc99-95770f091a00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/591f9a16-7dcd-411c-b1a3-98ad0211ad00/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/0f61d1ef-7bbb-475c-aa0c-fbe53ea38200/public",
  "https://imagedelivery.net/Ri0CdgD70saZ-g2rJhfH1Q/c08bb129-b118-49b8-609b-7ef140170200/public",
];

/* =====================================================
   BUILD GALLERY
   ===================================================== */
const gallery = document.getElementById('gallery');

images.forEach((src, i) => {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  const img = document.createElement('img');
  img.src = src;
  img.alt = '';
  img.loading = 'lazy';
  item.appendChild(img);
  item.addEventListener('click', () => openLightbox(i));
  gallery.appendChild(item);
});

/* =====================================================
   LIGHTBOX LOGIC
   ===================================================== */
let current = 0;

const backdrop  = document.getElementById('backdrop');
const lightbox  = document.getElementById('lightbox');
const lbImg     = document.getElementById('lightboxImg');
const lbClose   = document.getElementById('lbClose');
const lbPrev    = document.getElementById('lbPrev');
const lbNext    = document.getElementById('lbNext');
const lbCounter = document.getElementById('lbCounter');

function openLightbox(index) {
  current = index;
  showImage();
  backdrop.classList.add('open');
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  backdrop.classList.remove('open');
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showImage() {
  lbImg.src = images[current];
  lbCounter.textContent = (current + 1) + ' / ' + images.length;
}

function prev() {
  current = (current - 1 + images.length) % images.length;
  showImage();
}

function next() {
  current = (current + 1) % images.length;
  showImage();
}

lbClose.addEventListener('click', closeLightbox);
backdrop.addEventListener('click', closeLightbox);
lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  prev();
  if (e.key === 'ArrowRight') next();
  if (e.key === 'Escape')     closeLightbox();
});

// Swipe support for mobile
let touchStartX = 0;
lightbox.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; });
lightbox.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
});
