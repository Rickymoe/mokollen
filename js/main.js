document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadPartial('partials/header.html', 'site-header'),
    loadPartial('partials/footer.html', 'site-footer')
  ]);
  initNav();
  initReveal();
  initLightbox();
});

async function loadPartial(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  try {
    const res = await fetch(url);
    // outerHTML (not innerHTML) so the placeholder div doesn't wrap the
    // result -- a wrapper exactly the height of .nav leaves position:sticky
    // with no room to stick, so .nav must become a direct child of body.
    target.outerHTML = await res.text();
  } catch (err) {
    console.error('Kunne ikke laste ' + url, err);
  }
}

function initNav() {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('.nav a[data-page]').forEach(link => {
    if (link.dataset.page === currentPage) link.classList.add('active');
  });
  const hamburger = document.querySelector('.nav-hamburger');
  const links = document.querySelector('.nav-links');
  if (hamburger && links) {
    hamburger.addEventListener('click', () => {
      const isOpen = links.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }
}

function initReveal() {
  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

function initLightbox() {
  document.querySelectorAll('[data-lightbox-group]').forEach(group => {
    const imgs = Array.from(group.querySelectorAll('img'));
    if (!imgs.length) return;

    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    overlay.innerHTML =
      '<button class="lightbox-close" aria-label="Lukk">&times;</button>' +
      '<button class="lightbox-prev" aria-label="Forrige bilde">&#10094;</button>' +
      '<img class="lightbox-image" src="" alt="">' +
      '<button class="lightbox-next" aria-label="Neste bilde">&#10095;</button>';
    document.body.appendChild(overlay);

    const imageEl = overlay.querySelector('.lightbox-image');
    let current = 0;

    function show(index) {
      current = (index + imgs.length) % imgs.length;
      imageEl.src = imgs[current].src;
      imageEl.alt = imgs[current].alt;
    }
    function open(index) {
      show(index);
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    imgs.forEach((img, i) => {
      img.classList.add('lightbox-trigger');
      img.addEventListener('click', () => open(i));
    });

    overlay.querySelector('.lightbox-close').addEventListener('click', close);
    overlay.querySelector('.lightbox-prev').addEventListener('click', () => show(current - 1));
    overlay.querySelector('.lightbox-next').addEventListener('click', () => show(current + 1));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

    document.addEventListener('keydown', e => {
      if (!overlay.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  });
}
