(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-nav-toggle]");
        if (toggle) {
            toggle.addEventListener("click", function () {
                document.body.classList.toggle("nav-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        var prev = document.querySelector("[data-hero-prev]");
        var next = document.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function restartHero() {
            if (timer) {
                window.clearInterval(timer);
            }
            if (slides.length > 1) {
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 6200);
            }
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                showSlide(idx);
                restartHero();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartHero();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartHero();
            });
        }

        showSlide(0);
        restartHero();

        var searchForm = document.querySelector("[data-search-form]");
        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = searchForm.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = searchForm.getAttribute("action") || "search.html";
                if (query) {
                    window.location.href = target + "?q=" + encodeURIComponent(query);
                } else {
                    window.location.href = target;
                }
            });
        }

        var panel = document.querySelector("[data-filter-panel]");
        if (panel) {
            var input = panel.querySelector("[data-filter-input]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var region = panel.querySelector("[data-filter-region]");
            var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .rank-item"));
            var empty = document.querySelector("[data-empty-result]");
            var params = new URLSearchParams(window.location.search);
            var initial = params.get("q") || "";

            if (input && initial) {
                input.value = initial;
            }

            function normalize(value) {
                return String(value || "").trim().toLowerCase();
            }

            function applyFilters() {
                var q = normalize(input ? input.value : "");
                var y = normalize(year ? year.value : "");
                var t = normalize(type ? type.value : "");
                var r = normalize(region ? region.value : "");
                var visible = 0;

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-category"),
                        card.getAttribute("data-tags")
                    ].join(" "));
                    var pass = true;

                    if (q && haystack.indexOf(q) === -1) {
                        pass = false;
                    }
                    if (y && normalize(card.getAttribute("data-year")) !== y) {
                        pass = false;
                    }
                    if (t && normalize(card.getAttribute("data-type")) !== t) {
                        pass = false;
                    }
                    if (r && normalize(card.getAttribute("data-region")) !== r) {
                        pass = false;
                    }

                    card.style.display = pass ? "" : "none";
                    if (pass) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            [input, year, type, region].forEach(function (element) {
                if (element) {
                    element.addEventListener("input", applyFilters);
                    element.addEventListener("change", applyFilters);
                }
            });

            applyFilters();
        }
    });
})();

function initMoviePlayer(source) {
    function setup() {
        var box = document.querySelector("[data-player-box]");
        var video = document.querySelector("[data-video]");
        var cover = document.querySelector("[data-player-cover]");
        var started = false;
        var hlsPlayer = null;

        if (!box || !video || !source) {
            return;
        }

        function begin() {
            if (!started) {
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                } else if (window.Hls && Hls.isSupported()) {
                    hlsPlayer = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsPlayer.loadSource(source);
                    hlsPlayer.attachMedia(video);
                } else {
                    video.src = source;
                }
            }

            if (cover) {
                cover.classList.add("hidden");
            }

            var playRequest = video.play();
            if (playRequest && typeof playRequest.catch === "function") {
                playRequest.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", begin);
        }

        box.addEventListener("click", function (event) {
            if (event.target === video && !started) {
                begin();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsPlayer) {
                hlsPlayer.destroy();
            }
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setup);
    } else {
        setup();
    }
}
