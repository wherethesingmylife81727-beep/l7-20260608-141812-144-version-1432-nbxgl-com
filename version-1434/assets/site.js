(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-site-nav]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('open');
        menuButton.classList.toggle('open');
      });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('active', dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
      });

      if (slides.length > 1) {
        window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('.filter-input');
      var count = scope.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search-item]'));
      var filters = { type: '', region: '' };

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function update() {
        var query = normalize(input ? input.value : '');
        var visible = 0;

        cards.forEach(function (card) {
          var search = normalize(card.getAttribute('data-search'));
          var type = card.getAttribute('data-type') || '';
          var region = card.getAttribute('data-region') || '';
          var matchQuery = !query || search.indexOf(query) !== -1;
          var matchType = !filters.type || type === filters.type;
          var matchRegion = !filters.region || region === filters.region;
          var shouldShow = matchQuery && matchType && matchRegion;

          card.classList.toggle('is-hidden', !shouldShow);
          if (shouldShow) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = visible + ' 部';
        }
      }

      scope.querySelectorAll('.filter-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          var type = chip.getAttribute('data-filter-type');
          var value = chip.getAttribute('data-filter-value') || '';
          if (!type) {
            return;
          }
          filters[type] = value;
          scope.querySelectorAll('.filter-chip[data-filter-type="' + type + '"]').forEach(function (button) {
            button.classList.toggle('active', button === chip);
          });
          update();
        });
      });

      if (input) {
        input.addEventListener('input', update);
        if (scope.hasAttribute('data-global-search')) {
          var params = new URLSearchParams(window.location.search);
          var value = params.get('q');
          if (value) {
            input.value = value;
          }
        }
      }

      update();
    });

    document.querySelectorAll('.player-shell').forEach(function (shell) {
      var video = shell.querySelector('video');
      var startButton = shell.querySelector('.player-start');
      var source = shell.getAttribute('data-src') || (video && video.getAttribute('data-src'));
      var attached = false;
      var hlsInstance = null;

      function attachSource() {
        if (!video || !source || attached) {
          return;
        }
        attached = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      function playVideo() {
        if (!video) {
          return;
        }
        attachSource();
        var playPromise = video.play();
        shell.classList.add('is-ready');
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.then(function () {
            shell.classList.add('is-playing');
          }).catch(function () {
            shell.classList.add('is-ready');
          });
        } else {
          shell.classList.add('is-playing');
        }
      }

      if (startButton) {
        startButton.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (video.paused) {
            playVideo();
          }
        });
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
        });
        video.addEventListener('pause', function () {
          shell.classList.remove('is-playing');
        });
        video.addEventListener('ended', function () {
          shell.classList.remove('is-playing');
        });
      }

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
