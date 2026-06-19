(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-thumb]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        show(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

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

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-tags') || '')).toLowerCase();
        card.classList.toggle('is-hidden', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function renderCard(item) {
    return [
      '<a class="movie-card" href="' + item.url + '" data-title="' + escapeHtml(item.title) + '" data-tags="' + escapeHtml(item.tags) + '">',
      '  <span class="poster-frame">',
      '    <img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.remove()">',
      '    <span class="poster-glow"></span>',
      '  </span>',
      '  <span class="movie-card-body">',
      '    <strong>' + escapeHtml(item.title) + '</strong>',
      '    <small>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.type) + '</small>',
      '    <em>' + escapeHtml(item.oneLine) + '</em>',
      '    <span class="tag-row">' + item.tagList.map(function (tag) { return '<span>' + escapeHtml(tag) + '</span>'; }).join('') + '</span>',
      '  </span>',
      '</a>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function initGlobalSearch() {
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var summary = document.querySelector('[data-search-summary]');
    if (!input || !results || !window.SITE_MOVIE_INDEX) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) {
      input.value = initial;
      search(initial);
    }

    input.addEventListener('input', function () {
      search(input.value);
    });

    function search(value) {
      var keyword = value.trim().toLowerCase();
      if (!keyword) {
        return;
      }
      var found = window.SITE_MOVIE_INDEX.filter(function (item) {
        return item.searchText.indexOf(keyword) !== -1;
      }).slice(0, 96);
      results.innerHTML = found.map(renderCard).join('');
      if (title) {
        title.textContent = '搜索结果';
      }
      if (summary) {
        summary.textContent = found.length ? '已匹配到相关影片，点击卡片进入详情页。' : '暂未匹配到相关影片，可尝试更换关键词。';
      }
    }
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var button = shell.querySelector('.play-overlay');
      var source = shell.getAttribute('data-video');
      if (!video || !source) {
        return;
      }

      function startVideo() {
        if (shell.getAttribute('data-loaded') !== 'yes') {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
          } else {
            video.src = source;
          }
          shell.setAttribute('data-loaded', 'yes');
        }
        shell.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      shell.addEventListener('click', function (event) {
        if (event.target === video && shell.getAttribute('data-loaded') === 'yes') {
          return;
        }
        startVideo();
      });

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          startVideo();
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initGlobalSearch();
    initPlayers();
  });
})();
