/* =============================================
   CAPTAINTRADE — projects.js
   Renders project cards dynamically from projects.json
   Screenshots via Microlink API (free, no key needed)
   Admin-panel ready: update projects.json to add projects
   ============================================= */

(function () {

  const GRID = document.getElementById('projectsGrid');
  if (!GRID) return;

  /* Fallback icons per project ID */
  const FALLBACK_ICONS = {
    solanasnipe: '◎',
    mayfair:     '◈',
    silverwrit:  '⚖',
    csw:         '✦',
  };

  /* Skeleton shimmer while loading */
  function showSkeletons() {
    GRID.innerHTML = Array(4).fill(`
      <div class="project-card project-skeleton-card">
        <div class="proj-img-wrap skeleton-img shimmer"></div>
        <div class="project-content">
          <div class="skeleton-line shimmer" style="width:60%;height:11px;border-radius:4px;margin-bottom:10px"></div>
          <div class="skeleton-line shimmer" style="width:90%;height:15px;border-radius:4px;margin-bottom:6px"></div>
          <div class="skeleton-line shimmer" style="width:75%;height:15px;border-radius:4px;margin-bottom:14px"></div>
          <div class="skeleton-line shimmer" style="width:55%;height:11px;border-radius:4px"></div>
        </div>
      </div>`).join('');
  }

  /* Build one project card — NO inline onerror to avoid tag leaks */
  function buildCard(p) {
    const isFeatured = p.featured;
    const linkClass  = isFeatured ? 'proj-link accent' : 'proj-link';
    const typeClass  = p.typeClass ? ' ' + p.typeClass : '';
    const tags       = p.tags.map(function(t) { return '<span>' + t + '</span>'; }).join('');

    return [
      '<div class="project-card reveal' + (isFeatured ? ' featured-proj' : '') + '" data-project-id="' + p.id + '">',
        '<div class="proj-img-wrap" id="wrap-' + p.id + '">',
          '<img class="proj-screenshot" src="' + p.screenshot + '" alt="' + p.title + ' screenshot" loading="lazy" id="img-' + p.id + '" />',
          '<a href="' + p.liveUrl + '" target="_blank" rel="noopener" class="proj-img-overlay"><span>View Live ↗</span></a>',
        '</div>',
        '<div class="project-content">',
          '<div class="project-top">',
            '<span class="project-type' + typeClass + '">' + p.type + '</span>',
            '<span class="project-year">' + p.year + '</span>',
          '</div>',
          '<h3 class="project-title">' + p.title + '</h3>',
          '<p class="project-desc">' + p.description + '</p>',
          '<div class="project-tags">' + tags + '</div>',
          '<div class="project-links">',
            '<a href="' + p.liveUrl + '" target="_blank" rel="noopener" class="' + linkClass + '">Live Demo →</a>',
            '<a href="' + p.githubUrl + '" target="_blank" rel="noopener" class="proj-link-ghost">GitHub</a>',
          '</div>',
        '</div>',
      '</div>'
    ].join('');
  }

  /* Wire image error fallbacks AFTER DOM render — avoids inline onerror issues */
  function wireImageFallbacks(projects) {
    projects.forEach(function(p) {
      var img  = document.getElementById('img-' + p.id);
      var wrap = document.getElementById('wrap-' + p.id);
      if (!img || !wrap) return;

      img.addEventListener('error', function() {
        img.style.display = 'none';
        var fb = document.createElement('div');
        fb.className = 'proj-img-fallback';
        fb.innerHTML = '<div class="proj-icon">' + (FALLBACK_ICONS[p.id] || '{}') + '</div>';
        wrap.insertBefore(fb, wrap.firstChild);
      });
    });
  }

  /* Load projects.json and render */
  async function loadProjects() {
    showSkeletons();
    try {
      var res      = await fetch('/js/projects.json');
      var data     = await res.json();
      var projects = data.projects || [];

      if (!projects.length) {
        GRID.innerHTML = '<p style="color:var(--text-dim);font-family:var(--font-mono);font-size:0.85rem;padding:2rem">No projects found.</p>';
        return;
      }

      GRID.innerHTML = projects.map(buildCard).join('');
      wireImageFallbacks(projects);

      /* Re-trigger scroll reveal on newly rendered cards */
      var newCards = GRID.querySelectorAll('.reveal');
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) entry.target.classList.add('visible');
        });
      }, { threshold: 0.1 });
      newCards.forEach(function(el) { observer.observe(el); });

    } catch (err) {
      console.warn('Projects load error:', err);
      GRID.innerHTML = '<p style="color:var(--text-dim);text-align:center;padding:2rem;font-family:var(--font-mono);font-size:0.82rem">Could not load projects. Please refresh.</p>';
    }
  }

  loadProjects();

})();
