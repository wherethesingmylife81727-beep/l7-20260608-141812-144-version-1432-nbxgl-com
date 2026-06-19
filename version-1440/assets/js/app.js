(function () {
  var mobileToggle = document.querySelector(".mobile-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      var isOpen = mobileNav.classList.toggle("is-open");
      mobileToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  var backTop = document.querySelector(".back-top");

  if (backTop) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 420) {
        backTop.classList.add("is-visible");
      } else {
        backTop.classList.remove("is-visible");
      }
    });

    backTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

  if (slides.length > 0) {
    var activeIndex = 0;

    var showSlide = function (index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });

    showSlide(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }
  }

  var filters = document.querySelectorAll("[data-filter-input], [data-filter-select], [data-year-select]");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
  var empty = document.querySelector(".filter-empty");

  var normalise = function (value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");
  var searchInput = document.querySelector("[data-filter-input]");

  if (query && searchInput) {
    searchInput.value = query;
  }

  var applyFilters = function () {
    if (!cards.length) {
      return;
    }

    var keywordInput = document.querySelector("[data-filter-input]");
    var typeSelect = document.querySelector("[data-filter-select]");
    var yearSelect = document.querySelector("[data-year-select]");

    var keyword = normalise(keywordInput ? keywordInput.value : "");
    var typeValue = typeSelect ? typeSelect.value : "";
    var yearValue = yearSelect ? yearSelect.value : "";
    var visibleCount = 0;

    cards.forEach(function (card) {
      var haystack = normalise([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags"),
        card.getAttribute("data-year")
      ].join(" "));

      var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchedType = !typeValue || card.getAttribute("data-type") === typeValue || card.getAttribute("data-genre").indexOf(typeValue) !== -1;
      var matchedYear = !yearValue || card.getAttribute("data-year") === yearValue;

      if (matchedKeyword && matchedType && matchedYear) {
        card.style.display = "";
        visibleCount += 1;
      } else {
        card.style.display = "none";
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visibleCount === 0);
    }
  };

  filters.forEach(function (filter) {
    filter.addEventListener("input", applyFilters);
    filter.addEventListener("change", applyFilters);
  });

  applyFilters();
})();
