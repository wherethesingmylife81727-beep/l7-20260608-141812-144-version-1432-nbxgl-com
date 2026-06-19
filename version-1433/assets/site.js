(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var query = input.value.trim();
            if (query) {
                event.preventDefault();
                window.location.href = './search.html?q=' + encodeURIComponent(query);
            }
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        var show = function (next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('active', current === index);
            });
        };

        dots.forEach(function (dot, current) {
            dot.addEventListener('click', function () {
                show(current);
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                show(index + 1);
            }, 6200);
        }
    }

    var scope = document.querySelector('[data-filter-scope]');
    if (scope) {
        var input = document.querySelector('[data-filter-input]');
        var typeSelect = document.querySelector('[data-filter-type]');
        var yearSelect = document.querySelector('[data-filter-year]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q') || '';

        if (input && initial) {
            input.value = initial;
        }

        var applyFilter = function () {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var type = typeSelect ? typeSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var matched = true;

                if (keyword && text.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (type && cardType !== type) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }

                card.classList.toggle('is-hidden', !matched);
            });
        };

        [input, typeSelect, yearSelect].forEach(function (item) {
            if (item) {
                item.addEventListener('input', applyFilter);
                item.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
})();
