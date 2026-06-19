(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function setupMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
      toggle.textContent = menu.classList.contains('is-open') ? '×' : '☰';
    });
  }

  function setupHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panel = qs('[data-filter-panel]');
    var list = qs('[data-card-list]');
    if (!panel || !list) {
      return;
    }
    var cards = qsa('[data-movie-card], .rank-item', list);
    var search = qs('[data-filter-search]', panel);
    var year = qs('[data-filter-year]', panel);
    var region = qs('[data-filter-region]', panel);
    var type = qs('[data-filter-type]', panel);
    var empty = qs('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (query && search) {
      search.value = query;
    }

    function textFor(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var q = normalize(search && search.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var t = normalize(type && type.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = textFor(card);
        var ok = true;
        if (q && text.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute('data-year')).indexOf(y) === -1) {
          ok = false;
        }
        if (r && normalize(card.getAttribute('data-region')).indexOf(r) === -1 && text.indexOf(r) === -1) {
          ok = false;
        }
        if (t && normalize(card.getAttribute('data-type')).indexOf(t) === -1 && text.indexOf(t) === -1) {
          ok = false;
        }
        card.classList.toggle('is-filter-hidden', !ok);
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, year, region, type].forEach(function (node) {
      if (node) {
        node.addEventListener('input', apply);
        node.addEventListener('change', apply);
      }
    });

    apply();
  }

  function setupSearchForms() {
    qsa('form[action$="search.html"]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var input = form.querySelector('input[name="q"]');
        if (input) {
          input.value = input.value.trim();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupSearchForms();
  });
})();
