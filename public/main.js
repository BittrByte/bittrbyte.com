/* ============================================================
   BittrByte — main.js
   ============================================================ */

/* ---------- Sticky nav ---------- */
(function () {
  const nav = document.getElementById('nav');
  if (!nav) return;
  function tick() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  tick();
  window.addEventListener('scroll', tick, { passive: true });
})();

/* ---------- Mobile menu ---------- */
(function () {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('menu-open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  /* Close on any nav-link click */
  document.querySelectorAll('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('menu-open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ---------- Scroll-reveal ---------- */
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  items.forEach(function (el) { io.observe(el); });
})();

/* ---------- YouTube embeds ---------- */
(function () {
  document.querySelectorAll('[data-youtube]').forEach(function (frame) {
    const id = frame.getAttribute('data-youtube');
    if (!id) return;
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1';
    iframe.title = frame.getAttribute('data-title') || 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.loading = 'lazy';
    /* Remove placeholder */
    const ph = frame.querySelector('.video-placeholder');
    if (ph) ph.remove();
    frame.appendChild(iframe);
  });
})();

/* ---------- More about SKYWALL carousels (desktop) ---------- */
(function () {
  var section = document.getElementById('more-about-skywall');
  if (!section) return;

  var DESKTOP_MIN = 1021;
  var controllers = {};

  function isDesktop() {
    return window.matchMedia('(min-width: ' + DESKTOP_MIN + 'px)').matches;
  }

  function initCarousel(root) {
    var track = root.querySelector('.carousel__track');
    var slides = root.querySelectorAll('.carousel__slide');
    var dots = root.querySelectorAll('.carousel__dot');
    var prev = root.querySelector('[data-carousel-prev]');
    var next = root.querySelector('[data-carousel-next]');
    var index = 0;
    var count = slides.length;
    if (!track || !count) return null;

    function go(nextIndex) {
      index = (nextIndex + count) % count;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      dots.forEach(function (dot, i) {
        var on = i === index;
        dot.classList.toggle('is-active', on);
        if (on) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    if (prev) prev.addEventListener('click', function () { go(index - 1); });
    if (next) next.addEventListener('click', function () { go(index + 1); });
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i); });
    });

    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); }
    });

    go(0);
    return { go: go, reset: function () { go(0); } };
  }

  if (!isDesktop()) return;

  section.querySelectorAll('[data-carousel]').forEach(function (root) {
    var deck = root.getAttribute('data-deck-panel');
    var ctrl = initCarousel(root);
    if (deck && ctrl) controllers[deck] = ctrl;
  });

  var tabs = section.querySelectorAll('[data-deck]');
  var panels = section.querySelectorAll('[data-deck-panel]');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var deck = tab.getAttribute('data-deck');
      if (!deck) return;

      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      panels.forEach(function (panel) {
        var on = panel.getAttribute('data-deck-panel') === deck;
        panel.classList.toggle('is-hidden', !on);
        if (on) panel.removeAttribute('hidden');
        else panel.setAttribute('hidden', '');
      });

      if (controllers[deck]) controllers[deck].reset();
    });
  });
})();

/* ---------- Forms (Formspree, AJAX) ---------- */
(function () {
  document.querySelectorAll('#partnerForm, [data-ajax]').forEach(function (form) {
    const statusEl = form.querySelector('.form__status');

    const successMsg = form.id === 'communityForm'
      ? 'You\u2019re on the list \u2014 thank you.'
      : 'Enquiry sent \u2014 we\u2019ll be in touch.';

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submit = form.querySelector('[type="submit"]');
      if (submit) { submit.disabled = true; submit.textContent = 'Sending\u2026'; }
      if (statusEl) { statusEl.textContent = ''; statusEl.className = 'form__status'; }

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (statusEl) { statusEl.textContent = successMsg; statusEl.classList.add('ok'); }
        } else {
          throw new Error('Server error');
        }
      } catch (_) {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong — please email admin@bittrbyte.com directly.';
          statusEl.classList.add('err');
        }
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = form.id === 'communityForm' ? 'Join' : 'Send enquiry'; }
      }
    });
  });
})();
