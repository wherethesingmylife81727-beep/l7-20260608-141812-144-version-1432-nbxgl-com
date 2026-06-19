(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          if (input) {
            input.focus();
          }
          return;
        }
        event.preventDefault();
        window.location.href = "search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("hero-slide-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function play() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        play();
      });
    }

    if (slides.length > 1) {
      play();
    }
  }

  function initLocalFilter() {
    var input = document.querySelector("[data-local-filter]");
    if (!input) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-text]"));
    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = card.getAttribute("data-filter-text") || "";
        card.hidden = keyword !== "" && text.indexOf(keyword) === -1;
      });
    });
  }

  function initSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var input = document.querySelector("[data-search-input]");
    var note = document.querySelector("[data-search-note]");
    if (input) {
      input.value = query;
    }
    if (!query) {
      results.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签，快速找到想看的内容。</div>';
      return;
    }
    var keyword = query.toLowerCase();
    var matches = window.SEARCH_INDEX.filter(function (item) {
      return item.text.indexOf(keyword) !== -1;
    }).slice(0, 120);
    if (note) {
      note.textContent = '“' + query + '”相关内容';
    }
    if (!matches.length) {
      results.innerHTML = '<div class="empty-state">没有找到相关影片，换个关键词再试。</div>';
      return;
    }
    results.innerHTML = matches.map(function (item) {
      return [
        '<article class="movie-card">',
        '<a class="poster" href="' + item.url + '">',
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
        '<span class="poster-badge">' + escapeHtml(item.year) + '</span>',
        '<span class="play-dot">▶</span>',
        '</a>',
        '<div class="movie-card-body">',
        '<div class="movie-meta-line"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span><span>' + escapeHtml(item.category) + '</span></div>',
        '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
        '<p>' + escapeHtml(item.desc) + '</p>',
        '<div class="tag-row"><span>' + escapeHtml(item.genre) + '</span></div>',
        '</div>',
        '</article>'
      ].join('');
    }).join('');
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initPlayers() {
    document.querySelectorAll(".stream-player").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-button");
      var poster = player.querySelector(".poster-layer");
      var message = player.querySelector(".player-message");
      var stream = player.getAttribute("data-stream");
      var attached = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function fail() {
        player.classList.add("player-error");
        if (message) {
          message.textContent = "播放暂时不可用";
        }
      }

      function markPlaying() {
        player.classList.add("is-playing");
      }

      function playVideo() {
        markPlaying();
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            markPlaying();
          });
        }
      }

      function attachAndPlay() {
        if (!attached) {
          if (typeof Hls !== "undefined" && Hls.isSupported()) {
            hls = new Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              playVideo();
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                fail();
              }
            });
            attached = true;
            return;
          }
          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            attached = true;
            video.addEventListener("loadedmetadata", playVideo, { once: true });
            video.load();
            return;
          }
          fail();
          return;
        }
        playVideo();
      }

      if (button) {
        button.addEventListener("click", function (event) {
          event.preventDefault();
          attachAndPlay();
        });
      }

      if (poster) {
        poster.addEventListener("click", function () {
          attachAndPlay();
        });
      }

      video.addEventListener("play", markPlaying);
      video.addEventListener("click", function () {
        if (!attached) {
          attachAndPlay();
        }
      });
      video.addEventListener("error", fail);

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
