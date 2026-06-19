(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCategoryFilters();
        setupBackToTop();
    });

    function setupMobileMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");

        if (!button || !nav) {
            return;
        }

        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);

        if (slides.length > 1) {
            start();
        }
    }

    function setupCategoryFilters() {
        var panel = document.querySelector("[data-filter-panel]");

        if (!panel) {
            return;
        }

        var searchInput = panel.querySelector("[data-filter-search]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var resetButton = panel.querySelector("[data-filter-reset]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-grid] .movie-card"));
        var emptyState = document.querySelector("[data-filter-empty]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilters() {
            var keyword = normalize(searchInput && searchInput.value);
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchesYear = !year || card.getAttribute("data-year") === year;
                var matchesType = !type || card.getAttribute("data-type") === type;
                var isVisible = matchesKeyword && matchesYear && matchesType;

                card.hidden = !isVisible;

                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        [searchInput, yearSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (searchInput) {
                    searchInput.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                applyFilters();
            });
        }
    }

    function setupBackToTop() {
        var button = document.querySelector("[data-back-to-top]");

        if (!button) {
            return;
        }

        function toggle() {
            button.classList.toggle("is-visible", window.scrollY > 420);
        }

        window.addEventListener("scroll", toggle, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        toggle();
    }
})();
