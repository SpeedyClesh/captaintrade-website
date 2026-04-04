/* =============================================
   CAPTAINTRADE — post.js
   Individual post page interactions
   ============================================= */

/* ---------- READING PROGRESS BAR ---------- */
const progressBar = document.getElementById('readingProgress');
if (progressBar) {
  window.addEventListener('scroll', () => {
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled   = (window.scrollY / docHeight) * 100;
    progressBar.style.width = Math.min(scrolled, 100) + '%';
  });
}

/* ---------- TOC ACTIVE HIGHLIGHT ---------- */
const tocLinks   = document.querySelectorAll('.toc-list a');
const postHeadings = document.querySelectorAll('.post-body h2, .post-body h3');

if (tocLinks.length && postHeadings.length) {
  const tocObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(link => link.classList.remove('active'));
        const id     = entry.target.getAttribute('id');
        const active = document.querySelector(`.toc-list a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  postHeadings.forEach(h => tocObserver.observe(h));
}

/* ---------- SHARE BUTTONS ---------- */
const shareX    = document.getElementById('shareX');
const shareCopy = document.getElementById('shareCopy');

if (shareX) {
  shareX.addEventListener('click', () => {
    const text = encodeURIComponent(document.title + ' — by @0xcaptaintrade');
    const url  = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  });
}

if (shareCopy) {
  shareCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const orig = shareCopy.textContent;
      shareCopy.textContent = '✓ Copied!';
      shareCopy.style.color = 'var(--accent)';
      shareCopy.style.borderColor = 'var(--border-accent)';
      setTimeout(() => {
        shareCopy.textContent = orig;
        shareCopy.style.color = '';
        shareCopy.style.borderColor = '';
      }, 2000);
    });
  });
}

/* ---------- NAVBAR ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  navbar.classList.add('scrolled');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ---------- BURGER ---------- */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
if (burger && mobileMenu) {
  burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  document.querySelectorAll('.mob-link').forEach(l =>
    l.addEventListener('click', () => mobileMenu.classList.remove('open'))
  );
  document.addEventListener('click', e => {
    if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}
