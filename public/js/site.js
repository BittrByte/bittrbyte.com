/* BittrByte — site.js */
(function () {
  'use strict';

  /* ---------- Nav dropdown (desktop) ---------- */
  (function () {
    var items = document.querySelectorAll('.nav__item.has-dropdown');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('.nav__link');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var wasOpen = item.classList.contains('is-open');
        items.forEach(function (i) { i.classList.remove('is-open'); });
        if (!wasOpen) item.classList.add('is-open');
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav__item.has-dropdown')) {
        items.forEach(function (i) { i.classList.remove('is-open'); });
      }
    });
  })();

  /* ---------- Mobile menu ---------- */
  (function () {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) return;
    var panel = nav.querySelector('.nav__mobile-panel');

    function setMenuOpen(open) {
      nav.classList.toggle('menu-open', open);
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-locked', open);
      if (!open && panel) {
        panel.querySelectorAll('.mobile-nav__group--accordion.is-open').forEach(function (g) {
          g.classList.remove('is-open');
          var btn = g.querySelector('.mobile-nav__trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
      }
    }

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      setMenuOpen(!nav.classList.contains('menu-open'));
    });

    if (panel) {
      panel.querySelectorAll('.mobile-nav__trigger').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var group = btn.closest('.mobile-nav__group--accordion');
          if (!group) return;
          var willOpen = !group.classList.contains('is-open');
          /* Close other accordions so only one section is open */
          panel.querySelectorAll('.mobile-nav__group--accordion.is-open').forEach(function (g) {
            if (g !== group) {
              g.classList.remove('is-open');
              var other = g.querySelector('.mobile-nav__trigger');
              if (other) other.setAttribute('aria-expanded', 'false');
            }
          });
          group.classList.toggle('is-open', willOpen);
          btn.setAttribute('aria-expanded', String(willOpen));
        });
      });

      panel.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          setMenuOpen(false);
        });
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('menu-open')) {
        setMenuOpen(false);
      }
    });
  })();

  /* ---------- Scroll reveal ---------- */
  (function () {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- YouTube embeds ---------- */
  (function () {
    document.querySelectorAll('[data-youtube]').forEach(function (frame) {
      var id = frame.getAttribute('data-youtube');
      if (!id) return;
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1';
      iframe.title = frame.getAttribute('data-title') || 'Video';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.loading = 'lazy';
      frame.innerHTML = '';
      frame.appendChild(iframe);
    });
  })();

  /* ---------- Phone frame scaling ---------- */
  (function () {
    function scaleFrames() {
      document.querySelectorAll('.phone-frame__screen').forEach(function (screen) {
        var iframe = screen.querySelector('iframe');
        if (!iframe) return;
        var w = screen.clientWidth;
        var scale = w / 375;
        iframe.style.transform = 'scale(' + scale + ')';
        screen.style.height = (812 * scale) + 'px';
      });
    }
    scaleFrames();
    window.addEventListener('resize', scaleFrames);
  })();

  /* ---------- Hero model: load 3D on desktop only; soft camera follow ---------- */
  (function () {
    var wrap = document.querySelector('.hero__model-wrap');
    var mv = document.getElementById('heroPhone');
    if (!wrap || !mv) return;

    var desktopMq = window.matchMedia('(min-width: 1021px)');
    function loadDesktopModel() {
      var src = mv.getAttribute('data-src');
      if (!src) return;
      if (desktopMq.matches) {
        if (mv.getAttribute('src') !== src) mv.setAttribute('src', src);
      } else if (mv.hasAttribute('src')) {
        mv.removeAttribute('src');
      }
    }
    loadDesktopModel();
    if (desktopMq.addEventListener) desktopMq.addEventListener('change', loadDesktopModel);
    else if (desktopMq.addListener) desktopMq.addListener(loadDesktopModel);

    var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || !desktopMq.matches) return;

    // Base framing from HTML — keep these in sync with index.html
    var baseAz = -18;
    var baseEl = 85;
    var baseDist = '0.8m';
    var maxAz = 6;   // degrees either side
    var maxEl = 3;   // degrees up/down
    var ease = 0.08; // lower = smoother / less twitchy

    var targetAz = baseAz;
    var targetEl = baseEl;
    var curAz = baseAz;
    var curEl = baseEl;
    var raf = 0;

    function setTarget(clientX, clientY) {
      var rect = wrap.getBoundingClientRect();
      var x = ((clientX - rect.left) / rect.width) * 2 - 1;  // -1 … 1
      var y = ((clientY - rect.top) / rect.height) * 2 - 1;
      x = Math.max(-1, Math.min(1, x));
      y = Math.max(-1, Math.min(1, y));
      targetAz = baseAz + x * maxAz;
      targetEl = baseEl + y * maxEl;
    }

    function tick() {
      curAz += (targetAz - curAz) * ease;
      curEl += (targetEl - curEl) * ease;
      mv.cameraOrbit = curAz.toFixed(2) + 'deg ' + curEl.toFixed(2) + 'deg ' + baseDist;

      var settled =
        Math.abs(targetAz - curAz) < 0.02 &&
        Math.abs(targetEl - curEl) < 0.02;

      if (settled && targetAz === baseAz && targetEl === baseEl) {
        curAz = baseAz;
        curEl = baseEl;
        mv.cameraOrbit = baseAz + 'deg ' + baseEl + 'deg ' + baseDist;
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function startLoop() {
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function reset() {
      wrap.classList.remove('is-active');
      targetAz = baseAz;
      targetEl = baseEl;
      startLoop();
    }

    wrap.addEventListener('mousemove', function (e) {
      wrap.classList.add('is-active');
      setTarget(e.clientX, e.clientY);
      startLoop();
    });
    wrap.addEventListener('mouseleave', reset);

    wrap.addEventListener('touchstart', function (e) {
      if (!e.touches[0]) return;
      wrap.classList.add('is-active');
      setTarget(e.touches[0].clientX, e.touches[0].clientY);
      startLoop();
    }, { passive: true });
    wrap.addEventListener('touchmove', function (e) {
      if (!e.touches[0]) return;
      setTarget(e.touches[0].clientX, e.touches[0].clientY);
      startLoop();
    }, { passive: true });
    wrap.addEventListener('touchend', reset);
    wrap.addEventListener('touchcancel', reset);
  })();

  /* ---------- Forms (Formspree AJAX) ---------- */
  (function () {
    document.querySelectorAll('[data-ajax]').forEach(function (form) {
      var statusEl = form.querySelector('.form__status');
      var submitBtn = form.querySelector('[type="submit"]');
      var defaultText = submitBtn ? submitBtn.textContent : 'Submit';

      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending\u2026'; }
        if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form__status'; }

        try {
          var res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
          });
          if (res.ok) {
            form.reset();
            if (statusEl) {
              statusEl.textContent = form.dataset.success || 'Submitted \u2014 we\u2019ll be in touch.';
              statusEl.classList.add('ok');
            }
          } else {
            throw new Error('Server error');
          }
        } catch (_) {
          if (statusEl) {
            statusEl.textContent = 'Something went wrong \u2014 please email admin@bittrbyte.com directly.';
            statusEl.classList.add('err');
          }
        } finally {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = defaultText; }
        }
      });
    });
  })();

  /* ---------- Card rail scroll ---------- */
  (function () {
    var wrap = document.querySelector('.card-rail-wrap');
    var rail = document.querySelector('.card-rail');
    if (!wrap || !rail) return;

    var prev = wrap.querySelector('.card-rail__btn--prev');
    var next = wrap.querySelector('.card-rail__btn--next');

    function scrollStep() {
      var card = rail.querySelector('.promo-card');
      if (!card) return rail.clientWidth * 0.85;
      return card.offsetWidth + 16;
    }

    function updateRail() {
      var atStart = rail.scrollLeft <= 4;
      var atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
      wrap.classList.toggle('is-at-start', atStart);
      wrap.classList.toggle('is-at-end', atEnd);
      if (prev) prev.hidden = atStart;
      if (next) next.hidden = atEnd;
    }

    function scrollByDir(dir) {
      rail.scrollBy({ left: dir * scrollStep(), behavior: 'smooth' });
    }

    if (prev) prev.addEventListener('click', function () { scrollByDir(-1); });
    if (next) next.addEventListener('click', function () { scrollByDir(1); });

    rail.addEventListener('scroll', updateRail, { passive: true });
    rail.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); scrollByDir(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); scrollByDir(-1); }
    });

    window.addEventListener('resize', updateRail);
    updateRail();
  })();

  /* ---------- Basket (localStorage) ---------- */
  (function () {
    var CART_KEY = 'bittrbyte_cart';
    var countEl = document.getElementById('basketCount');
    var listEl = document.getElementById('basketList');
    var emptyEl = document.getElementById('basketEmpty');
    var filledEl = document.getElementById('basketFilled');

    function getCart() {
      try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
      catch (_) { return []; }
    }

    function saveCart(cart) {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
      updateBadge();
      renderCart();
    }

    function updateBadge() {
      if (!countEl) return;
      var n = getCart().length;
      countEl.textContent = n;
      countEl.classList.toggle('has-items', n > 0);
    }

    function renderCart() {
      if (!listEl) return;
      var cart = getCart();
      if (emptyEl) emptyEl.style.display = cart.length ? 'none' : 'block';
      if (filledEl) filledEl.style.display = cart.length ? 'block' : 'none';
      listEl.innerHTML = cart.map(function (item, i) {
        return '<div class="basket-item">' +
          '<span class="basket-item__name">' + item.name + '</span>' +
          '<span class="basket-item__price">' + item.price + '</span>' +
          '<button type="button" class="btn btn--ghost" data-remove="' + i + '" style="padding:8px 14px;font-size:12px;">Remove</button>' +
          '</div>';
      }).join('');

      listEl.querySelectorAll('[data-remove]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(btn.getAttribute('data-remove'), 10);
          var c = getCart();
          c.splice(idx, 1);
          saveCart(c);
        });
      });
    }

    window.BittrByteCart = {
      add: function (item) { var c = getCart(); c.push(item); saveCart(c); },
      get: getCart,
      clear: function () { saveCart([]); }
    };

    updateBadge();
    renderCart();
  })();

  /* ---------- Hero enforcement quote (homepage only) ---------- */
  (function () {
    var quoteEl = document.getElementById('heroQuote');
    var hero = document.getElementById('hero');
    if (!quoteEl || !hero) return;

    var quotes = [
      'Hey SKYWALL, block explicit screen content and only let me change this at the library.',
      'Hey SKYWALL, block social media after 11pm and only let me change this at home.',
      'Hey SKYWALL, block distracting apps at work and only let me change this at my local cafe.'
    ];

    quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var ticking = false;
    function updateQuoteFade() {
      ticking = false;
      var heroTop = hero.offsetTop;
      var fadeDistance = Math.max(180, hero.offsetHeight * 0.35);
      var progress = Math.min(1, Math.max(0, (window.scrollY - heroTop) / fadeDistance));
      var opacity = 1 - progress;
      var shift = progress * 18;
      quoteEl.style.opacity = String(opacity);
      quoteEl.style.transform = 'translateY(' + (-shift) + 'px)';
      quoteEl.style.pointerEvents = opacity < 0.05 ? 'none' : '';
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateQuoteFade);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    updateQuoteFade();
  })();

})();
