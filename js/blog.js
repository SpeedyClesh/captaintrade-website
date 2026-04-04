/* =============================================
   CAPTAINTRADE — blog.js
   Blog filter + interactions
   ============================================= */

/* ---------- CATEGORY FILTER ---------- */
const filterBtns  = document.querySelectorAll('.btag');
const postCards   = document.querySelectorAll('.post-card');
const featuredCard = document.querySelector('.featured-post-card');
const blogEmpty   = document.getElementById('blogEmpty');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.getAttribute('data-filter');

    /* Update active button */
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    /* Filter post cards */
    let visibleCount = 0;

    postCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.classList.remove('hidden-post');
        visibleCount++;
      } else {
        card.classList.add('hidden-post');
      }
    });

    /* Handle featured post visibility */
    if (featuredCard) {
      const featCat = featuredCard.getAttribute('data-category');
      if (filter === 'all' || featCat === filter) {
        featuredCard.classList.remove('hidden-post');
      } else {
        featuredCard.classList.add('hidden-post');
      }
    }

    /* Show/hide empty state */
    if (blogEmpty) {
      blogEmpty.classList.toggle('hidden', visibleCount > 0);
    }
  });
});

/* ---------- NAVBAR SCROLL (blog page always starts scrolled) ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  navbar.classList.add('scrolled');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    }
  });
}

/* ---------- BURGER MENU ---------- */
const burger     = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobLinks   = document.querySelectorAll('.mob-link');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobLinks.forEach(link => link.addEventListener('click', () => mobileMenu.classList.remove('open')));
  document.addEventListener('click', (e) => {
    if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });
}

/* ---------- POST CARD HOVER ANIMATE ---------- */
postCards.forEach(card => {
  card.addEventListener('mouseenter', () => {
    card.style.transition = 'border-color 0.3s ease, transform 0.3s ease';
  });
});
