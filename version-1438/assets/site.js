(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".menu-toggle");
        if (header && toggle) {
            toggle.addEventListener("click", function () {
                var open = header.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", open ? "true" : "false");
            });
        }

        document.querySelectorAll(".hero").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector(".hero-prev");
            var next = hero.querySelector(".hero-next");
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
                    timer = null;
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
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
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            show(0);
            start();
        });

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        var searchInput = document.querySelector("[data-search-input]");
        var regionSelect = document.querySelector("[data-region-filter]");
        var yearSelect = document.querySelector("[data-year-filter]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));

        if (searchInput) {
            searchInput.value = query;
        }

        function applyFilters() {
            var keyword = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            cards.forEach(function (card) {
                var haystack = card.getAttribute("data-filter") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var matched = (!keyword || haystack.indexOf(keyword) !== -1) && (!region || cardRegion === region) && (!year || cardYear === year);
                card.style.display = matched ? "" : "none";
            });
        }

        [searchInput, regionSelect, yearSelect].forEach(function (el) {
            if (el) {
                el.addEventListener("input", applyFilters);
                el.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    });
})();

function initMoviePlayer(config) {
    var video = document.getElementById("movie-player");
    var frame = document.querySelector(".player-frame");
    var cover = document.querySelector(".player-cover");
    var button = document.querySelector(".player-start");
    var loaded = false;
    var hlsInstance = null;

    function attach() {
        if (!video || loaded) {
            return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = config.url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(config.url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = config.url;
        }
    }

    function play() {
        if (!video) {
            return;
        }
        attach();
        if (cover) {
            cover.classList.add("is-hidden");
        }
        var promise = video.play();
        if (promise && promise.catch) {
            promise.catch(function () {});
        }
    }

    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            play();
        });
    }
    if (frame) {
        frame.addEventListener("click", function (event) {
            if (event.target === video && !video.paused) {
                return;
            }
            play();
        });
    }
    if (video) {
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        video.addEventListener("emptied", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
                loaded = false;
            }
        });
    }
}
