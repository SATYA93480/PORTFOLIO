  // ── Back to Top ──
  const topBtn = document.getElementById('topBtn');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      topBtn.style.display = 'flex';
    } else {
      topBtn.style.display = 'none';
    }
  });
  topBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ── Scroll Fade In ──
  const fadeEls = document.querySelectorAll('.fade-in');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  fadeEls.forEach(el => observer.observe(el));

  // ── Smooth scroll for all nav links ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Close mobile menu
        const navCollapse = document.getElementById('nav');
        if (navCollapse.classList.contains('show')) {
          new bootstrap.Collapse(navCollapse).hide();
        }
      }
    });
  });

  // ── Active nav link on scroll ──
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 100) current = s.id;
    });
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.remove('active');
      if (l.getAttribute('href') === '#' + current) l.classList.add('active');
    });
  });

  // ── Expertise cards: fade-in + bar animation ──
  const expCards = document.querySelectorAll('.exp-card, .exp-divider-card');
  if (expCards.length) {
    const expObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.dataset.delay || 0) * 1000;
          setTimeout(() => {
            el.classList.add('visible');
            setTimeout(() => el.classList.add('in-view'), 300);
          }, delay);
          expObserver.unobserve(el);
        }
      });
    }, { threshold: 0.15 });

    expCards.forEach(card => expObserver.observe(card));

    window.addEventListener('load', () => {
      expCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
          const delay = parseFloat(card.dataset.delay || 0) * 1000;
          setTimeout(() => {
            card.classList.add('visible');
            setTimeout(() => card.classList.add('in-view'), 300);
          }, delay);
        }
      });
    });
  }

  // ── Expertise bars: animate on view ──
  const expSkills = document.querySelectorAll('.exp-skill');
  if (expSkills.length) {
    const expSkillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          expSkillObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    expSkills.forEach(skill => expSkillObserver.observe(skill));
  }

  // ── Achievements carousel ──
  (() => {
    const track = document.getElementById('achTrack');
    if (!track) return;

    const prevBtn = document.getElementById('achPrev');
    const nextBtn = document.getElementById('achNext');
    const dotsWrap = document.getElementById('achDots');
    const hint = document.getElementById('achHint');

    const CARD_W = 280;
    const GAP = 28;
    const STEP = CARD_W + GAP;
    const originalCards = Array.from(track.querySelectorAll('.award-card'));
    const TOTAL = originalCards.length || 1;
    if (TOTAL > 1) {
      originalCards.forEach(card => track.appendChild(card.cloneNode(true)));
    }
    const SPEED = 0.6;
    const PAUSE_DRAG = 2000;

    let autoPos = 0;
    let currentDot = 0;
    let paused = false;
    let rafId = null;
    let isDragging = false;
    let dragStart = 0;
    let dragOrigin = 0;
    let pauseTimeout = null;

    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('button');
      d.className = 'ach-dot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', 'Go to award ' + (i + 1));
      d.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(d);
    }

    function updateDots(idx) {
      currentDot = ((idx % TOTAL) + TOTAL) % TOTAL;
      dotsWrap.querySelectorAll('.ach-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentDot);
      });
    }

    function goTo(idx) {
      const clamped = ((idx % TOTAL) + TOTAL) % TOTAL;
      autoPos = clamped * STEP;
      updateDots(clamped);
      applyTransform(autoPos);
    }

    function applyTransform(x) {
      track.style.transform = `translateX(${-x}px)`;
    }

    function normalizePos(x) {
      const maxScroll = TOTAL * STEP;
      return ((x % maxScroll) + maxScroll) % maxScroll;
    }

    function tick() {
      if (!paused && !isDragging) {
        autoPos += SPEED;
        const maxScroll = TOTAL * STEP;
        if (autoPos >= maxScroll) autoPos -= maxScroll;
        applyTransform(autoPos);
        const nearest = Math.round(autoPos / STEP) % TOTAL;
        if (nearest !== currentDot) updateDots(nearest);
      }
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    prevBtn?.addEventListener('click', () => {
      const target = ((currentDot - 1) + TOTAL) % TOTAL;
      goTo(target);
      pauseFor(PAUSE_DRAG);
    });

    nextBtn?.addEventListener('click', () => {
      const target = (currentDot + 1) % TOTAL;
      goTo(target);
      pauseFor(PAUSE_DRAG);
    });

    track.parentElement?.addEventListener('mouseenter', () => {
      paused = true;
      if (hint) hint.textContent = 'Paused · Drag to scroll';
    });
    track.parentElement?.addEventListener('mouseleave', () => {
      if (!isDragging) {
        paused = false;
        if (hint) hint.textContent = 'Hover to pause · Drag to scroll';
      }
    });

    track.addEventListener('mousedown', e => startDrag(e.clientX));
    window.addEventListener('mousemove', e => onDrag(e.clientX));
    window.addEventListener('mouseup', endDrag);
    track.addEventListener('touchstart', e => startDrag(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove', e => onDrag(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchend', endDrag);

    function startDrag(x) {
      isDragging = true;
      dragStart = x;
      dragOrigin = autoPos;
      track.classList.add('grabbing');
    }

    function onDrag(x) {
      if (!isDragging) return;
      const delta = dragStart - x;
      autoPos = dragOrigin + delta;
      applyTransform(autoPos);
    }

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;
      track.classList.remove('grabbing');
      autoPos = normalizePos(autoPos);
      const nearest = Math.round(autoPos / STEP);
      autoPos = nearest * STEP;
      updateDots(((nearest % TOTAL) + TOTAL) % TOTAL);
      applyTransform(autoPos);
      pauseFor(PAUSE_DRAG);
    }

    function pauseFor(ms) {
      paused = true;
      clearTimeout(pauseTimeout);
      pauseTimeout = setTimeout(() => { paused = false; }, ms);
    }

    track.style.transition = 'none';
    track.addEventListener('mousedown', () => { track.style.transition = 'none'; });
    prevBtn?.addEventListener('click', () => { track.style.transition = 'transform 0.55s cubic-bezier(.22,.61,.36,1)'; });
    nextBtn?.addEventListener('click', () => { track.style.transition = 'transform 0.55s cubic-bezier(.22,.61,.36,1)'; });
  })();
