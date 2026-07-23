/* =========================================================
   RAJ SHAMANI HUB — INTERACTIONS
   ========================================================= */

(() => {
  'use strict';

  // ---------- THEME TOGGLE ----------
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('rsh-theme', theme); } catch (e) {}
  };

  const savedTheme = (() => {
    try { return localStorage.getItem('rsh-theme'); } catch (e) { return null; }
  })();

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  }

  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // ---------- NAVBAR SCROLL ----------
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 20) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- MOBILE MENU ----------
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger?.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMenu?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  });

  // ---------- ACTIVE NAV LINK ON SCROLL ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActiveLink = () => {
    const scrollY = window.scrollY + 120;
    let currentId = '';
    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop) currentId = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  };
  window.addEventListener('scroll', setActiveLink, { passive: true });

  // ---------- SEARCH ----------
  const searchToggle = document.getElementById('searchToggle');
  const searchWrap = document.getElementById('searchWrap');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  // Build search index
  const buildIndex = () => {
    const items = [];
    document.querySelectorAll('[data-search]').forEach(el => {
      const title = el.querySelector('h3')?.textContent.trim() || '';
      const type = el.classList.contains('podcast-card') ? 'Podcast' :
                   el.classList.contains('video-card') ? 'Video' :
                   el.classList.contains('topic-card') ? 'Topic' : 'Content';
      const href = el.tagName === 'A' ? el.getAttribute('href') :
                   el.closest('a')?.getAttribute('href') ||
                   '#' + (el.closest('section')?.id || '');
      items.push({
        title,
        type,
        keywords: (el.dataset.search + ' ' + title).toLowerCase(),
        href
      });
    });
    return items;
  };
  const searchIndex = buildIndex();

  searchToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    searchWrap.classList.toggle('open');
    if (searchWrap.classList.contains('open')) {
      setTimeout(() => searchInput?.focus(), 100);
    }
  });

  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) {
      searchWrap.classList.remove('open');
    }
  });

  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '';
      return;
    }
    const matches = searchIndex
      .filter(item => item.keywords.includes(q))
      .slice(0, 6);

    if (!matches.length) {
      searchResults.innerHTML = `<div class="search-empty">No results for "${escapeHtml(q)}"</div>`;
      return;
    }

    searchResults.innerHTML = matches.map(m => `
      <a href="${m.href}" class="search-result-item" data-nav>
        <span>${highlightMatch(m.title, q)}</span>
        <span class="sr-type">${m.type}</span>
      </a>
    `).join('');

    searchResults.querySelectorAll('[data-nav]').forEach(a => {
      a.addEventListener('click', () => {
        searchWrap.classList.remove('open');
        searchInput.value = '';
        searchResults.innerHTML = '';
      });
    });
  });

  const escapeHtml = (s) => s.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const highlightMatch = (text, q) => {
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return escapeHtml(text);
    return escapeHtml(text.slice(0, idx)) +
      `<strong style="color:var(--orange)">${escapeHtml(text.slice(idx, idx + q.length))}</strong>` +
      escapeHtml(text.slice(idx + q.length));
  };

  // Close search on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchWrap.classList.remove('open');
    }
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchWrap.classList.add('open');
      setTimeout(() => searchInput?.focus(), 100);
    }
  });

  // ---------- SCROLL REVEAL ----------
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---------- COUNTER ANIMATION ----------
  const counters = document.querySelectorAll('.stat-num');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => counterObserver.observe(c));

  const animateCounter = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  };

  // ---------- VIDEO FILTER ----------
  const filterBar = document.getElementById('filterBar');
  const videoGrid = document.getElementById('videoGrid');

  filterBar?.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    const cards = videoGrid.querySelectorAll('.video-card');

    cards.forEach((card, i) => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hide');
        card.style.animation = `fadeUp 0.4s ${i * 0.04}s both var(--ease)`;
      } else {
        card.classList.add('hide');
        card.style.animation = '';
      }
    });
  });

  // Topic cards → filter videos
  document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const topic = card.dataset.topic;
      if (!topic) return;
      const btn = filterBar?.querySelector(`[data-filter="${topic}"]`);
      if (btn) {
        btn.click();
        // Smooth scroll to videos section
        setTimeout(() => {
          document.getElementById('videos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });

  // ---------- TOAST ----------
  const toast = document.getElementById('toast');
  let toastTimer;
  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
  };

  // ---------- NEWSLETTER FORM ----------
  const newsletterForm = document.getElementById('newsletterForm');
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail');
    const value = email.value.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showToast('⚠️ Please enter a valid email');
      email.focus();
      return;
    }
    showToast('🎉 Welcome aboard! Check your inbox.');
    email.value = '';
  });

  // ---------- CONTACT FORM ----------
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !subject || !message) {
      showToast('⚠️ Please fill in all fields');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ Please enter a valid email');
      return;
    }
    showToast('✅ Message sent! I\'ll reply within 24 hours.');
    contactForm.reset();
  });

  // ---------- SMOOTH SCROLL (fallback for older browsers) ----------
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- KEYBOARD NAV FOR FILTER ----------
  filterBar?.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // ---------- PREFETCH / PERFORMANCE ----------
  // Mark page as loaded for any animations
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
  });

})();
