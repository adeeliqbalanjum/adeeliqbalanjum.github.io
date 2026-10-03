/* Motion for Portfolio / Home, built from the Figma "Motion spec" notes: Lenis smooth scroll + GSAP ScrollTrigger. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
  var nav = document.getElementById('nav');
  if (reduce) document.documentElement.classList.add('reduce');

  /* ---------- behaviour that must work with or without motion ---------- */

  // mobile menu
  var menu = document.getElementById('menu');
  if (menu) {
    menu.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.textContent = open ? 'Close' : 'Menu';
    });
    nav.querySelectorAll('.links a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); menu.textContent = 'Menu'; menu.setAttribute('aria-expanded', 'false'); });
    });
  }

  // FAQ accordion (height animation, rotating plus)
  document.querySelectorAll('#acc .item').forEach(function (item) {
    var btn = item.querySelector('button'), panel = item.querySelector('.panel');
    btn.addEventListener('click', function () {
      var open = item.classList.contains('open');
      if (open) {
        panel.style.height = panel.scrollHeight + 'px';
        requestAnimationFrame(function () { panel.style.height = '0px'; });
        item.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
        panel.style.height = panel.scrollHeight + 'px';
        panel.addEventListener('transitionend', function done() { if (item.classList.contains('open')) panel.style.height = 'auto'; panel.removeEventListener('transitionend', done); });
      }
    });
  });

  // client video: play on click, pause when it leaves the viewport
  var player = document.getElementById('player'), video = document.getElementById('clientVideo');
  if (player && video) {
    var toggle = function () {
      if (video.paused) { video.play(); player.classList.add('playing'); video.setAttribute('controls', ''); }
      else { video.pause(); }
    };
    player.addEventListener('click', function (e) { if (e.target === video && player.classList.contains('playing')) return; toggle(); });
    player.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    video.addEventListener('ended', function () { player.classList.remove('playing'); video.removeAttribute('controls'); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (en) { if (!en.isIntersecting && !video.paused) video.pause(); }); }).observe(player);
  }

  // intro paragraph: wrap words so the two-tone reveal can run; without motion, split at "load" like the Figma
  var intro = document.getElementById('introText');
  var words = [];
  if (intro) {
    var text = intro.textContent.trim();
    intro.innerHTML = text.split(' ').map(function (w) { return '<span class="w">' + w + '</span>'; }).join(' ');
    words = Array.prototype.slice.call(intro.querySelectorAll('.w'));
    var at = text.indexOf(intro.getAttribute('data-split') || '');
    var before = at > 0 ? text.slice(0, at).trim().split(' ').length : words.length;
    words.forEach(function (w, i) { w.classList.toggle('on', i < before); });
  }

  // nav hides on scroll down, returns on scroll up
  var last = 0;
  window.addEventListener('scroll', function () {
    var y = window.pageYOffset;
    nav.classList.toggle('hide', y > last && y > 120 && !nav.classList.contains('open'));
    last = y;
  }, { passive: true });

  if (reduce || !hasGsap) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    document.querySelectorAll('.chip').forEach(function (c) { c.style.transform = 'rotate(' + (c.style.getPropertyValue('--rot') || '0deg') + ')'; });
    document.querySelectorAll('.card').forEach(function (c) { c.style.transform = 'rotate(' + c.dataset.rot + 'deg)'; });
    return;
  }

  /* ---------- motion ---------- */
  gsap.registerPlugin(ScrollTrigger);

  // smooth scroll
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var target = document.querySelector(id); if (!target) return;
        e.preventDefault(); lenis.scrollTo(target, { offset: -40 });
      });
    });
  }

  // hero
  gsap.from('.hero h1 .word', { y: 28, opacity: 0, duration: .8, ease: 'expo.out', stagger: .05, delay: .15 });
  gsap.from('.hero .imgpill', { scale: .6, duration: .9, ease: 'back.out(1.6)', stagger: .12, delay: .45 });
  gsap.to('.hero .reveal', { opacity: 1, y: 0, duration: .8, ease: 'power3.out', stagger: .12, delay: .6 });
  gsap.from('#nav > *', { opacity: 0, y: -8, duration: .4, stagger: .06, delay: .1 });

  // generic reveals
  gsap.utils.toArray('.reveal').forEach(function (el) {
    if (el.closest('.hero')) return;
    gsap.to(el, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // work strip: scale in, columns parallax, sticker rotation
  gsap.from('#strip', { scale: .96, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#strip', start: 'top 85%' } });
  if (window.innerWidth > 820) {
    gsap.utils.toArray('#strip .col').forEach(function (c) {
      gsap.to(c, { y: +c.dataset.speed, ease: 'none', scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  }
  gsap.fromTo('#sticker', { rotate: -14 }, { rotate: -8, ease: 'none', scrollTrigger: { trigger: '#strip', start: 'top bottom', end: 'bottom top', scrub: true } });

  // intro: words switch from grey to ink as the paragraph crosses the viewport
  if (words.length) {
    words.forEach(function (w) { w.classList.remove('on'); });
    ScrollTrigger.create({ trigger: intro, start: 'top 80%', end: 'bottom 45%', scrub: true, onUpdate: function (s) {
      var n = Math.round(s.progress * words.length);
      words.forEach(function (w, i) { w.classList.toggle('on', i < n); });
    } });
  }

  // chips: settle to their rotation, then float
  gsap.utils.toArray('.chip').forEach(function (c, i) {
    var rot = parseFloat(c.style.getPropertyValue('--rot')) || 0;
    gsap.set(c, { rotate: rot });
    gsap.from(c, { opacity: 0, y: 20, duration: .8, delay: i * .08, ease: 'power3.out', scrollTrigger: { trigger: '#services', start: 'top 75%' } });
    gsap.to(c, { y: 3, rotate: rot + 1, duration: 3 + i * .4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
    c.addEventListener('mouseenter', function () { gsap.to(c, { y: -6, duration: .3, overwrite: 'auto' }); });
    c.addEventListener('mouseleave', function () { gsap.to(c, { y: 3, duration: .6, overwrite: 'auto' }); });
  });

  // process cards: enter from below, settle to their tilt; numerals count up
  gsap.utils.toArray('.card').forEach(function (c, i) {
    var n = c.querySelector('.n'), target = +n.textContent, counter = { v: 0 };
    gsap.set(c, { rotate: 0 });
    gsap.from(c, { y: 40, opacity: 0, duration: .9, ease: 'power3.out', delay: i * .15, scrollTrigger: { trigger: '#cards', start: 'top 80%' },
      onComplete: function () { gsap.to(c, { rotate: +c.dataset.rot, duration: .6, ease: 'power2.out' }); } });
    gsap.to(counter, { v: target, duration: .8, delay: .3 + i * .15, ease: 'power1.out', scrollTrigger: { trigger: '#cards', start: 'top 80%' }, onUpdate: function () { n.textContent = Math.round(counter.v); } });
  });

  // testimonials: divider grows from the top
  gsap.from('#divider', { scaleY: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '#clients', start: 'top 75%' } });

  // case studies: shot rises and lands
  gsap.utils.toArray('.case .shot').forEach(function (s) {
    gsap.from(s, { y: 30, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 90%' } });
  });

  // about: portrait settles from -5deg to -2deg; FAQ card the same
  ['#portrait', '#faqcard'].forEach(function (sel) {
    gsap.fromTo(sel, { rotate: -5, opacity: 0, y: 20 }, { rotate: -2, opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: sel, start: 'top 85%' } });
  });

  // magnetic buttons
  if (window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.magnetic').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * .18, y: (e.clientY - r.top - r.height / 2) * .18, duration: .3 });
      });
      b.addEventListener('mouseleave', function () { gsap.to(b, { x: 0, y: 0, duration: .5, ease: 'elastic.out(1,.4)' }); });
    });
  }

  // footer: light sweep drifts across the block; headline reveals
  gsap.to('#sweep', { x: 200, duration: 12, yoyo: true, repeat: -1, ease: 'sine.inOut' });
  gsap.from('.darkblock h2', { x: -24, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.darkblock', start: 'top 75%' } });
})();
