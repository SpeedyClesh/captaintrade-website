/* =============================================
   CAPTAINTRADE — projects.js
   Renders project cards dynamically from projects.json
   Screenshots via Microlink API (free, no key needed)
   Admin-panel ready: just update projects.json to add projects
   ============================================= */

(function () {

  const GRID = document.getElementById('projectsGrid');
  if (!GRID) return;

  /* ── Skeleton shimmer while loading ── */
  function showSkeletons() {
    GRID.innerHTML = Array(4).fill(`
      <div class="project-card project-skeleton-card">
        <div class="proj-img-wrap skeleton-img shimmer"></div>
        <div class="project-content">
          <div class="skeleton-line shimmer" style="width:60%;height:12px;margin-bottom:8px"></div>
          <div class="skeleton-line shimmer" style="width:90%;height:16px;margin-bottom:6px"></div>
          <div class="skeleton-line shimmer" style="width:80%;height:16px;margin-bottom:14px"></div>
          <div class="skeleton-line shimmer" style="width:70%;height:12px"></div>
        </div>
      </div>`).join('');
  }

  /* ── Build one project card ── */
  function buildCard(p) {
    const isFeatured = p.featured;
    const linkClass  = isFeatured ? 'proj-link accent' : 'proj-link';
    const typeClass  = p.typeClass ? ` ${p.typeClass}` : '';
    const tags       = p.tags.map(t => `<span>${t}</span>`).join('');

    return `
      <div class="project-card reveal${isFeatured ? ' featured-proj' : ''}" data-project-id="${p.id}">
        <div class="project-top">
          <span class="project-type${typeClass}">${p.type}</span>
          <span class="project-year">${p.year}</span>
        </div>
        <div class="proj-img-wrap">
          <img
            class="proj-screenshot"
            src="${p.screenshot}"
            alt="${p.title} screenshot"
            loading="lazy"
            onerror="this.parentElement.classList.add('img-error'); this.style.display='none'; this.parentElement.innerHTML += '<div class=\\'proj-img-fallback\\'>${getFallbackIcon(p.id)}</div>'"
          />
          <a href="${p.liveUrl}" target="_blank" rel="noopener" class="proj-img-overlay">
            <span>View Live ↗</span>
          </a>
        </div>
        <div class="project-content">
          <h3 class="project-title">${p.title}</h3>
          <p class="project-desc">${p.description}</p>
          <div class="project-tags">${tags}</div>
          <div class="project-links">
            <a href="${p.liveUrl}" target="_blank" rel="noopener" class="${linkClass}">Live Demo →</a>
            <a href="${p.githubUrl}" target="_blank" rel="noopener" class="proj-link-ghost">GitHub</a>
          </div>
        </div>
      </div>`;
  }

  function getFallbackIcon(id) {
    const icons = {
      solanasnipe: '◎',
      mayfair:     '◈',
      silverwrit:  '⚖',
      csw:         '✦',
    };
    return `<div class="proj-icon">${icons[id] || '{ }'}</div>`;
  }

  /* ── Load and render ── */
  async function loadProjects() {
    showSkeletons();

    try {
      const res  = await fetch('/js/projects.json');
      const data = await res.json();
      const projects = data.projects || [];

      if (!projects.length) {
        GRID.innerHTML = '<p style="color:var(--text-dim);font-family:var(--font-mono);font-size:0.85rem">No projects found.</p>';
        return;
      }

      GRID.innerHTML = projects.map(buildCard).join('');

      /* Re-trigger scroll reveal on new elements */
      const newCards = GRID.querySelectorAll('.reveal');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.1 });
      newCards.forEach(el => observer.observe(el));

    } catch (err) {
      console.warn('Projects load error:', err);
      /* Fallback — render without screenshots */
      GRID.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:2rem;font-family:var(--font-mono);font-size:0.82rem">Could not load projects. Please refresh.</p>';
    }
  }

  loadProjects();

})();
