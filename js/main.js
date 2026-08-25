/* ==========================================================================
   Terminus — shared behaviour
   Theme toggle, mobile menu, smooth scroll, reveal animations, counters,
   FAQ accordion, pricing toggle, particle hero canvas, preloader, forms.
   ========================================================================== */

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- */
  /* Theme (dark / light)                                              */
  /* ---------------------------------------------------------------- */

  function initTheme() {
    var stored = localStorage.getItem('terminus-theme');
    var theme = stored || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcons(theme);

    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('terminus-theme', next);
        updateThemeIcons(next);
      });
    });
  }

  function updateThemeIcons(theme) {
    document.querySelectorAll('[data-icon="sun"]').forEach(function (el) {
      el.style.display = theme === 'light' ? 'none' : 'inline-flex';
    });
    document.querySelectorAll('[data-icon="moon"]').forEach(function (el) {
      el.style.display = theme === 'light' ? 'inline-flex' : 'none';
    });
  }

  /* ---------------------------------------------------------------- */
  /* Preloader                                                         */
  /* ---------------------------------------------------------------- */

  function initPreloader() {
    var pre = document.getElementById('preloader');
    if (!pre) return;
    var lines = pre.querySelectorAll('.preloader-line');
    var fill = pre.querySelector('.preloader-bar-fill');
    var delay = prefersReducedMotion ? 0 : 160;

    lines.forEach(function (line, i) {
      setTimeout(function () {
        line.classList.add('show');
        if (fill) fill.style.width = Math.round(((i + 1) / lines.length) * 100) + '%';
      }, i * delay);
    });

    var totalDelay = prefersReducedMotion ? 50 : lines.length * delay + 260;
    setTimeout(function () {
      pre.classList.add('preloader-hide');
      document.body.style.overflow = '';
      setTimeout(function () { pre.remove(); }, 550);
    }, totalDelay);

    document.body.style.overflow = 'hidden';
  }

  /* ---------------------------------------------------------------- */
  /* Mobile hamburger menu                                             */
  /* ---------------------------------------------------------------- */

  function initMobileMenu() {
    var btn = document.getElementById('hamburger-btn');
    var menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      btn.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Smooth scroll for in-page anchors (accounts for fixed nav)        */
  /* ---------------------------------------------------------------- */

  function initSmoothScroll() {
    var nav = document.getElementById('site-nav');
    var offset = nav ? nav.offsetHeight + 12 : 80;

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = link.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Scroll-triggered reveal animations (staggered)                    */
  /* ---------------------------------------------------------------- */

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('reveal-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* Animated statistic counters                                       */
  /* ---------------------------------------------------------------- */

  function initCounters() {
    var nums = document.querySelectorAll('[data-count-to]');
    if (!nums.length) return;

    function animate(el) {
      var target = parseFloat(el.getAttribute('data-count-to'));
      var decimals = el.getAttribute('data-decimals') ? parseInt(el.getAttribute('data-decimals'), 10) : 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = prefersReducedMotion ? 0 : 1600;
      var start = null;

      if (duration === 0) {
        el.textContent = target.toFixed(decimals) + suffix;
        return;
      }

      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) {
      nums.forEach(animate);
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    nums.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* FAQ accordion                                                     */
  /* ---------------------------------------------------------------- */

  function initFaq() {
    var items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(function (item) {
      var btn = item.querySelector('.faq-q');
      var panel = item.querySelector('.faq-a');
      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        items.forEach(function (other) {
          var otherBtn = other.querySelector('.faq-q');
          var otherPanel = other.querySelector('.faq-a');
          otherBtn.setAttribute('aria-expanded', 'false');
          otherPanel.style.maxHeight = null;
        });

        if (!isOpen) {
          btn.setAttribute('aria-expanded', 'true');
          panel.style.maxHeight = panel.scrollHeight + 'px';
        }
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Pricing monthly / yearly toggle                                   */
  /* ---------------------------------------------------------------- */

  function initPricingToggle() {
    var toggle = document.getElementById('billing-toggle');
    if (!toggle) return;
    var prices = document.querySelectorAll('[data-monthly]');
    var labelMonthly = document.getElementById('label-monthly');
    var labelYearly = document.getElementById('label-yearly');

    toggle.addEventListener('click', function () {
      var yearly = toggle.classList.toggle('on');
      toggle.setAttribute('aria-checked', yearly ? 'true' : 'false');
      if (labelMonthly && labelYearly) {
        labelMonthly.classList.toggle('text-[var(--text)]', !yearly);
        labelMonthly.classList.toggle('text-[var(--text-dim)]', yearly);
        labelYearly.classList.toggle('text-[var(--text)]', yearly);
        labelYearly.classList.toggle('text-[var(--text-dim)]', !yearly);
      }
      prices.forEach(function (el) {
        var val = yearly ? el.getAttribute('data-yearly') : el.getAttribute('data-monthly');
        el.textContent = val;
      });
      document.querySelectorAll('[data-period]').forEach(function (el) {
        el.textContent = yearly ? '/mo billed yearly' : '/month';
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Sticky bottom CTA — hide near footer / on scroll down, dismissible*/
  /* ---------------------------------------------------------------- */

  function initStickyCta() {
    var bar = document.getElementById('sticky-cta');
    if (!bar) return;

    var closeBtn = bar.querySelector('[data-cta-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        bar.classList.add('hidden-bar');
        sessionStorage.setItem('terminus-cta-dismissed', '1');
      });
    }
    if (sessionStorage.getItem('terminus-cta-dismissed') === '1') {
      bar.classList.add('hidden-bar');
    }

    var footer = document.querySelector('footer');
    if (!footer || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (sessionStorage.getItem('terminus-cta-dismissed') === '1') return;
        bar.classList.toggle('hidden-bar', entry.isIntersecting);
      });
    }, { threshold: 0.1 });
    io.observe(footer);
  }

  /* ---------------------------------------------------------------- */
  /* Newsletter + contact forms (client-side only demo)                */
  /* ---------------------------------------------------------------- */

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  function initNewsletterForms() {
    document.querySelectorAll('[data-newsletter-form]').forEach(function (form) {
      var input = form.querySelector('input[type="email"]');
      var msg = form.querySelector('[data-form-msg]');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!input.value || !validEmail(input.value)) {
          showMsg(msg, 'Enter a valid email address.', true);
          return;
        }
        showMsg(msg, '✓ Subscribed — check your inbox to confirm.', false);
        form.reset();
      });
    });
  }

  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;
    var msg = form.querySelector('[data-form-msg]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.querySelector('#cf-name');
      var email = form.querySelector('#cf-email');
      var message = form.querySelector('#cf-message');

      if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
        showMsg(msg, 'All fields are required.', true);
        return;
      }
      if (!validEmail(email.value)) {
        showMsg(msg, 'Enter a valid email address.', true);
        return;
      }
      showMsg(msg, '✓ Message sent — our team replies within one business day.', false);
      form.reset();
    });
  }

  function showMsg(el, text, isError) {
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? 'var(--danger)' : 'var(--accent)';
    el.classList.remove('opacity-0');
  }

  /* ---------------------------------------------------------------- */
  /* Hero terminal typing effect                                       */
  /* ---------------------------------------------------------------- */

  function initTermTyping() {
    var el = document.getElementById('term-typed-line');
    if (!el) return;
    var commands = [
      'terminus deploy --env=production',
      'terminus logs --tail --service=api',
      'terminus alerts --status',
      'terminus metrics p99 --last=1h'
    ];
    if (prefersReducedMotion) { el.textContent = commands[0]; return; }

    var ci = 0, pos = 0, deleting = false;

    function tick() {
      var full = commands[ci];
      pos += deleting ? -1 : 1;
      el.textContent = full.slice(0, pos);
      var speed = deleting ? 28 : 55;

      if (!deleting && pos === full.length) {
        speed = 1400;
        deleting = true;
      } else if (deleting && pos === 0) {
        deleting = false;
        ci = (ci + 1) % commands.length;
        speed = 400;
      }
      setTimeout(tick, speed);
    }
    tick();
  }

  /* ---------------------------------------------------------------- */
  /* Particle network canvas (hero background)                         */
  /* ---------------------------------------------------------------- */

  function initParticleCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var wrap = canvas.parentElement;
    var particles = [];
    var w, h, dpr;
    var mouse = { x: null, y: null, active: false };

    function accentColor() {
      var theme = document.documentElement.getAttribute('data-theme');
      return theme === 'light' ? '0, 148, 87' : '0, 255, 136';
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = wrap.clientWidth;
      h = wrap.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var count = Math.min(90, Math.round((w * h) / 14000));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.6
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      var rgb = accentColor();

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        if (mouse.active) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            var force = (110 - dist) / 110;
            p.x += (dx / dist) * force * 1.2;
            p.y += (dy / dist) * force * 1.2;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + rgb + ', 0.75)';
        ctx.fill();
      }

      for (var a = 0; a < particles.length; a++) {
        for (var b = a + 1; b < particles.length; b++) {
          var dx2 = particles[a].x - particles[b].x;
          var dy2 = particles[a].y - particles[b].y;
          var d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d < 118) {
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = 'rgba(' + rgb + ', ' + (0.16 * (1 - d / 118)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(step);
    }

    resize();
    window.addEventListener('resize', resize);
    wrap.addEventListener('mousemove', function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    });
    wrap.addEventListener('mouseleave', function () { mouse.active = false; });

    if (!prefersReducedMotion) {
      requestAnimationFrame(step);
    } else {
      step();
    }
  }

  /* ---------------------------------------------------------------- */
  /* Nav active-link + scrolled shadow state                           */
  /* ---------------------------------------------------------------- */

  function initNavState() {
    var nav = document.getElementById('site-nav');
    if (!nav) return;
    var page = document.body.getAttribute('data-page');
    document.querySelectorAll('.nav-link').forEach(function (link) {
      if (link.getAttribute('data-page-link') === page) {
        link.classList.add('active');
      }
    });
    window.addEventListener('scroll', function () {
      nav.classList.toggle('shadow-[0_4px_30px_rgba(0,0,0,0.35)]', window.scrollY > 8);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Init                                                               */
  /* ---------------------------------------------------------------- */

  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initPreloader();
    initMobileMenu();
    initSmoothScroll();
    initReveal();
    initCounters();
    initFaq();
    initPricingToggle();
    initStickyCta();
    initNewsletterForms();
    initContactForm();
    initTermTyping();
    initParticleCanvas();
    initNavState();
  });
})();
