(function () {
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── scroll: nav state + progress bar ──
  var nav = document.getElementById('nav');
  var bar = document.getElementById('progress-bar');
  var applyScroll = function () {
    var y = window.scrollY;
    var scrolled = y > 60;
    if (nav) nav.classList.toggle('scrolled', scrolled);
    if (bar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, y / h) : 0) + ')';
    }
  };
  window.addEventListener('scroll', applyScroll, { passive: true });
  window.addEventListener('resize', applyScroll);
  applyScroll();

  // ── scroll reveals ──
  var reveals = document.querySelectorAll('.reveal');
  if (!prefersReduced) {
    reveals.forEach(function (el) {
      var d = el.getAttribute('data-reveal-delay') || '0';
      el.style.transitionDelay = d + 'ms';
    });
    var show = function (el) { el.classList.add('in-view'); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });

    // reveal anything already in the viewport at load (IO can miss these)
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.95 && r.bottom > 0) { show(el); io.unobserve(el); }
      });
    });
    // safety net: never leave content hidden
    setTimeout(function () { reveals.forEach(show); }, 1600);
  } else {
    reveals.forEach(show_immediate);
  }
  function show_immediate(el) { el.classList.add('in-view'); }

  // ── count-up stats ──
  var counters = document.querySelectorAll('[data-count]');
  var parse = function (str) {
    var m = str.match(/^([^\d]*)([\d.]+)(.*)$/);
    return m ? { p: m[1], n: parseFloat(m[2]), s: m[3], dec: m[2].indexOf('.') >= 0 ? 1 : 0 } : null;
  };
  var runCount = function (el) {
    var info = parse(el.getAttribute('data-count'));
    if (!info) return;
    if (prefersReduced) { el.textContent = el.getAttribute('data-count'); return; }
    var dur = 1500, t0 = performance.now();
    var step = function (t) {
      var k = Math.min(1, (t - t0) / dur);
      k = 1 - Math.pow(1 - k, 3);
      var v = info.n * k;
      el.textContent = info.p + (info.dec ? v.toFixed(1) : Math.round(v)) + info.s;
      if (k < 1) requestAnimationFrame(step);
      else el.textContent = el.getAttribute('data-count');
    };
    requestAnimationFrame(step);
  };
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { runCount(entry.target); cio.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { cio.observe(el); });

  // ── hero mouse parallax ──
  if (!prefersReduced) {
    var hero = document.getElementById('hero');
    var mp = document.querySelectorAll('[data-mplx]');
    if (hero) {
      hero.addEventListener('mousemove', function (e) {
        var r = hero.getBoundingClientRect();
        var cx = (e.clientX - r.left) / r.width - 0.5;
        var cy = (e.clientY - r.top) / r.height - 0.5;
        mp.forEach(function (el) {
          var f = parseFloat(el.getAttribute('data-mplx')) || 0;
          var base = el.getAttribute('data-mplx-base') || '';
          el.style.transform = base + ' translate(' + (cx * f) + 'px,' + (cy * f) + 'px)';
        });
      });
    }
  }
})();
