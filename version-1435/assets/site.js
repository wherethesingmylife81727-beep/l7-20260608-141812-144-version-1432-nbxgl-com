(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector("[data-mobile-menu-toggle]");
        var panel = document.querySelector("[data-mobile-menu]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var previous = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                start();
            });
        });

        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!panel || !grid) {
            return;
        }
        var searchInput = panel.querySelector("[data-filter-search]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
        var emptyState = document.querySelector("[data-empty-state]");

        function apply() {
            var keyword = normalize(searchInput && searchInput.value);
            var type = normalize(typeSelect && typeSelect.value);
            var region = normalize(regionSelect && regionSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
                var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
                var matchesYear = !year || normalize(card.getAttribute("data-year")) === year;
                var shouldShow = matchesKeyword && matchesType && matchesRegion && matchesYear;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        [searchInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (box) {
            var video = box.querySelector("video");
            var button = box.querySelector("[data-play-button]");
            var source = box.getAttribute("data-src");
            var initialized = false;

            function attach() {
                if (!video || !source || initialized) {
                    return;
                }
                initialized = true;
                video.controls = true;
                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true,
                        backBufferLength: 90
                    });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else {
                    video.src = source;
                    video.load();
                }
            }

            function play() {
                attach();
                box.classList.add("is-playing");
                if (video) {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            box.classList.remove("is-playing");
                        });
                    }
                }
            }

            if (button) {
                button.addEventListener("click", play);
            }
            box.addEventListener("click", function (event) {
                if (event.target === video) {
                    return;
                }
                if (!box.classList.contains("is-playing")) {
                    play();
                }
            });
            if (video) {
                video.addEventListener("play", function () {
                    box.classList.add("is-playing");
                });
                video.addEventListener("pause", function () {
                    box.classList.remove("is-playing");
                });
            }
        });
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            "<article class=\"movie-card\">",
            "<a href=\"" + escapeHtml(movie.url) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">",
            "<figure>",
            "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
            "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>",
            "</figure>",
            "<div class=\"movie-card-body\">",
            "<div class=\"movie-meta-line\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.region) + "</span></div>",
            "<h3>" + escapeHtml(movie.title) + "</h3>",
            "<p>" + escapeHtml(movie.summary) + "</p>",
            "<div class=\"movie-tags\">" + tags + "</div>",
            "</div>",
            "</a>",
            "</article>"
        ].join("");
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var empty = document.querySelector("[data-search-empty]");
        if (!results || !input || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render() {
            var keyword = normalize(input.value);
            if (!keyword) {
                results.innerHTML = "";
                if (empty) {
                    empty.hidden = false;
                    empty.textContent = "输入关键词发现影片";
                }
                return;
            }
            var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.summary,
                    (movie.tags || []).join(" ")
                ].join(" "));
                return haystack.indexOf(keyword) !== -1;
            }).slice(0, 120);

            results.innerHTML = matched.map(cardTemplate).join("");
            if (empty) {
                empty.hidden = matched.length !== 0;
                empty.textContent = "暂无匹配内容";
            }
        }

        input.addEventListener("input", render);
        render();
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        setupSearchPage();
    });
}());
