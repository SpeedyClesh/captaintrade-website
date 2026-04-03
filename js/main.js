/* =============================================
   CAPTAINTRADE — main.js
   ============================================= */

/* ---------- NAVBAR SCROLL BEHAVIOR ---------- */
const navbar = document.getElementById('navbar');
const ticker = document.querySelector('.ticker-wrapper');

window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

/* ---------- BURGER MENU ---------- */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');
const mobLinks = document.querySelectorAll('.mob-link');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

mobLinks.forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

/* Close mobile menu on outside click */
document.addEventListener('click', (e) => {
  if (!mobileMenu.contains(e.target) && !burger.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

/* ---------- SCROLL REVEAL ANIMATION ---------- */
const revealEls = document.querySelectorAll('.reveal, .reveal-right, .reveal-delay');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -40px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* ---------- COUNTER ANIMATION ---------- */
function animateCounter(el, target, duration = 1800) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

const statNums = document.querySelectorAll('.stat-num');
let countersStarted = false;

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !countersStarted) {
      countersStarted = true;
      statNums.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10);
        animateCounter(el, target);
      });
    }
  });
}, { threshold: 0.5 });

const statRow = document.querySelector('.hero-stat-row');
if (statRow) counterObserver.observe(statRow);

/* ---------- TYPED TERMINAL EFFECT ---------- */
function typeLine(el, text, speed = 35, delay = 0) {
  return new Promise(resolve => {
    setTimeout(() => {
      let i = 0;
      const timer = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    }, delay);
  });
}

/* Observe terminal and animate on first view */
const terminalBody = document.querySelector('.terminal-body');
let terminalAnimated = false;

if (terminalBody) {
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(async entry => {
      if (entry.isIntersecting && !terminalAnimated) {
        terminalAnimated = true;
        const lines = terminalBody.querySelectorAll('.t-out');
        lines.forEach((line, i) => {
          const originalText = line.innerHTML;
          line.innerHTML = '';
          setTimeout(() => {
            line.innerHTML = originalText;
            line.style.opacity = '0';
            line.style.transition = 'opacity 0.3s ease';
            requestAnimationFrame(() => {
              line.style.opacity = '1';
            });
          }, i * 80 + 200);
        });
      }
    });
  }, { threshold: 0.3 });

  termObserver.observe(terminalBody);
}

/* ---------- CONTACT FORM — Formspree ---------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('form-success');
const formError   = document.getElementById('form-error');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;

    btn.textContent = 'Sending...';
    btn.style.opacity = '0.7';
    btn.disabled = true;
    formSuccess.classList.add('hidden');
    formError.classList.add('hidden');

    try {
      const data = new FormData(contactForm);
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        formSuccess.classList.remove('hidden');
        contactForm.reset();
        setTimeout(() => formSuccess.classList.add('hidden'), 6000);
      } else {
        const json = await response.json();
        if (json.errors) {
          formError.textContent = '✕ ' + json.errors.map(e => e.message).join(', ');
        }
        formError.classList.remove('hidden');
      }
    } catch (err) {
      formError.classList.remove('hidden');
    } finally {
      btn.textContent = originalText;
      btn.style.opacity = '1';
      btn.disabled = false;
    }
  });
}

/* ---------- SMOOTH ACTIVE NAV LINK ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinksList = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinksList.forEach(link => {
    link.style.color = '';
    if (link.getAttribute('href') === `#${current}`) {
      link.style.color = 'var(--accent)';
    }
  });
});

/* ---------- TICKER LIVE UPDATE (Demo) ---------- */
/* Randomize ticker values slightly every 10 seconds for a "live" feel */
function updateTicker() {
  const ticks = document.querySelectorAll('.tick');
  const pairs = [
    { label: 'BTC/USD', base: 67000, vol: 2000 },
    { label: 'ETH/USD', base: 3200, vol: 200 },
    { label: 'EUR/USD', base: 1.085, vol: 0.005, small: true },
    { label: 'GBP/USD', base: 1.265, vol: 0.005, small: true },
    { label: 'SOL/USD', base: 160, vol: 10 },
    { label: 'XAU/USD', base: 2350, vol: 30 },
    { label: 'USD/JPY', base: 151, vol: 1, small: true },
    { label: 'BNB/USD', base: 580, vol: 20 },
    { label: 'AUD/USD', base: 0.648, vol: 0.005, small: true },
    { label: 'LINK/USD', base: 14.5, vol: 1 },
  ];

  const halfLen = Math.floor(ticks.length / 2);
  for (let i = 0; i < halfLen && i < pairs.length; i++) {
    const p = pairs[i];
    const change = ((Math.random() - 0.5) * 2 * p.vol / p.base * 100).toFixed(2);
    const isUp = parseFloat(change) >= 0;
    const sign = isUp ? '▲' : '▼';
    const absChange = Math.abs(change);

    ticks[i].textContent = `${p.label} \u00A0${sign} ${absChange}%`;
    ticks[i].className = `tick ${isUp ? 'up' : 'down'}`;

    /* Mirror the duplicate */
    if (ticks[i + halfLen]) {
      ticks[i + halfLen].textContent = ticks[i].textContent;
      ticks[i + halfLen].className = ticks[i].className;
    }
  }
}

setInterval(updateTicker, 10000);

/* ---------- CURSOR GLOW (Optional Premium Touch) ---------- */
const glow = document.querySelector('.hero-glow');
if (glow && window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    glow.style.transform = `translate(${(x - 50) * 0.3}px, ${(y - 50) * 0.3}px)`;
  });
}

console.log('%c CaptainTrade 🚀 ', 'background:#00E5CC;color:#090C10;font-size:14px;font-weight:bold;padding:6px 12px;border-radius:4px;');
console.log('%c Developer · AI Engineer · Crypto & FX Trader', 'color:#888899;font-size:11px;');
