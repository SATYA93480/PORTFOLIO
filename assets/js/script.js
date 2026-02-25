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

  // ── Projects: staggered reveal ──
  const projRows = document.querySelectorAll('.proj-row');
  if (projRows.length) {
    const projObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          projObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    projRows.forEach((row, i) => {
      row.style.transitionDelay = `${i * 0.12}s`;
      projObserver.observe(row);
    });
  }

  // ── About cards: auto cycle (clickable) ──
  (() => {
    const wrap = document.querySelector('.about-home-cards-cycle');
    if (!wrap) return;
    const cards = Array.from(wrap.querySelectorAll('.about-home-card'));
    if (!cards.length) return;

    let idx = 0;
    const INTERVAL = 4000;

    function show(i) {
      cards.forEach((card, cIdx) => {
        card.classList.toggle('is-active', cIdx === i);
      });
    }

    show(idx);
    setInterval(() => {
      idx = (idx + 1) % cards.length;
      show(idx);
    }, INTERVAL);
  })();

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

  // Impact / Activities scroll
  const actTrack = document.getElementById('actTrack');
  if (actTrack) {
    const actPrev = document.getElementById('actPrev');
    const actNext = document.getElementById('actNext');
    const ACT_SCROLL = 280;

    actNext?.addEventListener('click', () => actTrack.scrollBy({ left: ACT_SCROLL, behavior: 'smooth' }));
    actPrev?.addEventListener('click', () => actTrack.scrollBy({ left: -ACT_SCROLL, behavior: 'smooth' }));

    let actIsDown = false;
    let actStartX = 0;
    let actScrollLeft = 0;

    actTrack.addEventListener('mousedown', e => {
      actIsDown = true;
      actTrack.classList.add('grabbing');
      actStartX = e.pageX - actTrack.offsetLeft;
      actScrollLeft = actTrack.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      actIsDown = false;
      actTrack.classList.remove('grabbing');
    });

    actTrack.addEventListener('mousemove', e => {
      if (!actIsDown) return;
      e.preventDefault();
      const x = e.pageX - actTrack.offsetLeft;
      const walk = (x - actStartX) * 1.5;
      actTrack.scrollLeft = actScrollLeft - walk;
    });

    actTrack.addEventListener('touchstart', e => {
      actIsDown = true;
      actTrack.classList.add('grabbing');
      actStartX = e.touches[0].pageX - actTrack.offsetLeft;
      actScrollLeft = actTrack.scrollLeft;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      actIsDown = false;
      actTrack.classList.remove('grabbing');
    }, { passive: true });

    actTrack.addEventListener('touchmove', e => {
      if (!actIsDown) return;
      const x = e.touches[0].pageX - actTrack.offsetLeft;
      const walk = (x - actStartX) * 1.5;
      actTrack.scrollLeft = actScrollLeft - walk;
    }, { passive: true });
  }

  function initAutoSlider(trackId) {
    const track = document.getElementById(trackId);
    if (!track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let paused = false;
    let rafId = null;

    function autoScroll() {
      if (!paused && !isDown) {
        track.scrollLeft += 0.6;
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
          track.scrollLeft = 0;
        }
      }
      rafId = requestAnimationFrame(autoScroll);
    }

    rafId = requestAnimationFrame(autoScroll);

    track.addEventListener('mouseenter', () => { paused = true; });
    track.addEventListener('mouseleave', () => { paused = false; });

    track.addEventListener('mousedown', e => {
      isDown = true;
      track.classList.add('grabbing');
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener('mouseup', () => {
      isDown = false;
      track.classList.remove('grabbing');
    });

    track.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    });

    track.addEventListener('touchstart', e => {
      isDown = true;
      track.classList.add('grabbing');
      startX = e.touches[0].pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDown = false;
      track.classList.remove('grabbing');
    }, { passive: true });

    track.addEventListener('touchmove', e => {
      if (!isDown) return;
      const x = e.touches[0].pageX - track.offsetLeft;
      const walk = (x - startX) * 1.5;
      track.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  // Impact slider (home page)
  initAutoSlider('impactTrack');

  // Blog slider (home page)
  initAutoSlider('blogTrack');

  // Awards fade rotator (home page)
  (() => {
    const wrap = document.getElementById('awardsFade');
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll('.awards-fade-item'));
    if (!items.length) return;

    let index = 0;
    let paused = false;
    const INTERVAL = 3500;
    const TRANSITION = 1000;
    let transitionTimeout = null;
    let isAnimating = false;

    function show(idx) {
      items.forEach((item, i) => {
        item.classList.toggle('is-active', i === idx);
        item.classList.remove('is-prep-left', 'is-prep-right', 'is-exit-left', 'is-exit-right');
      });
    }

    function go(toIndex, direction) {
      if (isAnimating || toIndex === index) return;
      const current = items[index];
      const nextItem = items[toIndex];
      isAnimating = true;

      current.classList.remove('is-prep-left', 'is-prep-right');
      nextItem.classList.remove('is-exit-left', 'is-exit-right');

      if (direction === 'prev') {
        nextItem.classList.add('is-prep-left');
        nextItem.classList.add('is-active');
        requestAnimationFrame(() => {
          nextItem.classList.remove('is-prep-left');
          current.classList.add('is-exit-right');
        });
      } else {
        nextItem.classList.add('is-prep-right');
        nextItem.classList.add('is-active');
        requestAnimationFrame(() => {
          nextItem.classList.remove('is-prep-right');
          current.classList.add('is-exit-left');
        });
      }

      if (transitionTimeout) clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
        current.classList.remove('is-active', 'is-exit-left', 'is-exit-right');
        nextItem.classList.remove('is-prep-left', 'is-prep-right');
        index = toIndex;
        isAnimating = false;
      }, TRANSITION);
    }

    function next() {
      if (paused) return;
      go((index + 1) % items.length, 'next');
    }

    function prev() {
      if (paused) return;
      go((index - 1 + items.length) % items.length, 'prev');
    }

    show(index);
    const timer = setInterval(next, INTERVAL);

    const prevBtn = wrap.querySelector('.awards-nav-prev');
    const nextBtn = wrap.querySelector('.awards-nav-next');
    if (prevBtn) prevBtn.addEventListener('click', () => go((index - 1 + items.length) % items.length, 'prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => go((index + 1) % items.length, 'next'));

    window.addEventListener('beforeunload', () => {
      clearInterval(timer);
      if (transitionTimeout) clearTimeout(transitionTimeout);
    });
  })();
