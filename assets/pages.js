/* Inner pages: Work filters and the Contact form. Loaded after site.js. */
(function () {
  'use strict';
  // Work: filter the grid by industry
  var filters = document.getElementById('filters'), grid = document.getElementById('grid');
  if (filters && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.wcard')), empty = document.getElementById('empty');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-f]'); if (!b) return;
      filters.querySelectorAll('[data-f]').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      var f = b.getAttribute('data-f'), shown = 0;
      cards.forEach(function (c) { var on = f === 'all' || c.getAttribute('data-ind') === f; c.classList.toggle('hide', !on); if (on) { shown++; c.style.opacity = 1; c.style.transform = 'none'; } });
      if (empty) empty.hidden = shown > 0;
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    });
  }
  // Contact: compose the message and open WhatsApp; there is no backend on this static host
  var form = document.getElementById('cform');
  if (form) {
    form.querySelectorAll('.filter-row label').forEach(function (l) {
      l.addEventListener('click', function () { form.querySelectorAll('.filter-row label').forEach(function (x) { x.classList.remove('on'); }); l.classList.add('on'); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = function (n) { var el = form.elements[n]; return el ? (el.value || '').trim() : ''; };
      if (!v('name') || !v('email') || !v('message')) { form.reportValidity(); return; }
      var budget = form.querySelector('input[name=budget]:checked');
      var text = 'Hi Adeel, this is ' + v('name') + ' (' + v('email') + ').' + (v('site') ? '\nSite: ' + v('site') : '') + '\n\n' + v('message') + (budget ? '\n\nBudget: ' + budget.value : '');
      window.open('https://wa.me/923054829714?text=' + encodeURIComponent(text), '_blank', 'noopener');
      form.querySelector('.thanks').hidden = false;
    });
  }
})();
