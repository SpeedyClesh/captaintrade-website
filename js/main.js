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

/* ============================================================
   LIVE TICKER — Real market data
   Crypto  → CoinGecko public API  (no key, rate-limited)
   FX+Gold → exchangerate.host      (no key, free tier)
   Refresh → every 60 seconds
   Fallback→ last known values shown if fetch fails
   ============================================================ */

const TICKER_PAIRS = [
  { id: 'BTC',  label: 'BTC/USD',  type: 'crypto', cgId: 'bitcoin' },
  { id: 'ETH',  label: 'ETH/USD',  type: 'crypto', cgId: 'ethereum' },
  { id: 'SOL',  label: 'SOL/USD',  type: 'crypto', cgId: 'solana' },
  { id: 'BNB',  label: 'BNB/USD',  type: 'crypto', cgId: 'binancecoin' },
  { id: 'LINK', label: 'LINK/USD', type: 'crypto', cgId: 'chainlink' },
  { id: 'EUR',  label: 'EUR/USD',  type: 'fx',     fxSym: 'EUR' },
  { id: 'GBP',  label: 'GBP/USD',  type: 'fx',     fxSym: 'GBP' },
  { id: 'JPY',  label: 'USD/JPY',  type: 'fx',     fxSym: 'JPY', invert: true },
  { id: 'AUD',  label: 'AUD/USD',  type: 'fx',     fxSym: 'AUD' },
  { id: 'XAU',  label: 'XAU/USD',  type: 'fx',     fxSym: 'XAU' },
];

/* Last known prices — used as fallback if API fails */
const lastKnown = {};

function renderTick(pair, price, change24h) {
  const isUp  = change24h >= 0;
  const sign  = isUp ? '▲' : '▼';
  const pct   = Math.abs(change24h).toFixed(2);

  /* Format price sensibly */
  let priceStr;
  if (price >= 1000)       priceStr = price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  else if (price >= 1)     priceStr = price.toFixed(4);
  else                     priceStr = price.toFixed(5);

  const text  = `${pair.label} \u00A0${priceStr} \u00A0${sign} ${pct}%`;
  const cls   = `tick ${isUp ? 'up' : 'down'}`;

  const el  = document.getElementById(`t-${pair.id}`);
  const el2 = document.getElementById(`t-${pair.id}2`);
  if (el)  { el.textContent  = text; el.className  = cls; }
  if (el2) { el2.textContent = text; el2.className = cls; }

  lastKnown[pair.id] = { price, change24h };
}

async function fetchCrypto() {
  const cryptoPairs = TICKER_PAIRS.filter(p => p.type === 'crypto');
  const ids = cryptoPairs.map(p => p.cgId).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  const res  = await fetch(url);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();

  cryptoPairs.forEach(pair => {
    const d = data[pair.cgId];
    if (d) renderTick(pair, d.usd, d.usd_24h_change ?? 0);
  });
}

async function fetchFX() {
  /* exchangerate.host — free, no key, includes XAU (Gold) */
  const fxPairs  = TICKER_PAIRS.filter(p => p.type === 'fx');
  const symbols  = fxPairs.map(p => p.fxSym).join(',');
  const url      = `https://api.exchangerate.host/live?access_key=free&source=USD&currencies=${symbols}`;

  const res  = await fetch(url);
  if (!res.ok) throw new Error(`ExchangeRate ${res.status}`);
  const data = await res.json();
  const quotes = data.quotes || {};

  fxPairs.forEach(pair => {
    const key   = `USD${pair.fxSym}`;
    const raw   = quotes[key];
    if (!raw) return;

    let price = pair.invert ? raw : (1 / raw);

    /* For XAU: API gives oz per USD → invert to get USD per oz */
    if (pair.fxSym === 'XAU') price = 1 / raw;

    /* We don't get 24h change from this endpoint — use stored delta or 0 */
    const prev   = lastKnown[pair.id];
    const change = prev ? ((price - prev.price) / prev.price) * 100 : 0;
    renderTick(pair, price, change);
  });
}

async function refreshTicker() {
  try { await fetchCrypto(); } catch (e) { console.warn('Ticker crypto fetch failed:', e.message); }
  try { await fetchFX();     } catch (e) { console.warn('Ticker FX fetch failed:', e.message); }
}

/* Initial fetch on load, then every 60s */
refreshTicker();
setInterval(refreshTicker, 60000);

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

/* ---------- EMAIL LINK ASSEMBLY ---------- */
/* Split to prevent bot scraping */
const emailLink = document.getElementById('emailLink');
if (emailLink) {
  const u = 'captaintrade01';
  const d = 'gmail.com';
  emailLink.href = 'mailto:' + u + '@' + d;
}
