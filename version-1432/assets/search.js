(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var params = new URLSearchParams(window.location.search);
        var keyword = (params.get("q") || "").trim();
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        var results = document.querySelector("[data-search-results]");
        var empty = document.querySelector("[data-search-empty]");
        var movies = Array.isArray(window.MOVIE_DATA) ? window.MOVIE_DATA : [];

        if (input) {
            input.value = keyword;
        }

        if (!keyword || !results) {
            return;
        }

        var normalizedKeyword = normalize(keyword);
        var matched = movies.filter(function (movie) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.type,
                movie.year,
                movie.genre,
                (movie.tags || []).join(" "),
                movie.oneLine,
                movie.summary
            ].join(" "));

            return haystack.indexOf(normalizedKeyword) !== -1;
        }).slice(0, 240);

        if (title) {
            title.textContent = "“" + keyword + "” 的搜索结果";
        }

        results.innerHTML = matched.map(renderCard).join("");

        if (empty) {
            empty.hidden = matched.length !== 0;
        }
    });

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function truncate(value, length) {
        var text = String(value || "");
        return text.length > length ? text.slice(0, length) + "…" : text;
    }

    function renderCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return [
            "<article class=\"movie-card medium\">",
            "    <a class=\"movie-poster\" href=\"" + escapeHtml(movie.url) + "\">",
            "        <img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\" />",
            "        <span class=\"movie-year\">" + escapeHtml(movie.year) + "</span>",
            "        <span class=\"movie-play\">播放</span>",
            "    </a>",
            "    <div class=\"movie-card-body\">",
            "        <h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>",
            "        <p>" + escapeHtml(truncate(movie.oneLine, 72)) + "</p>",
            "        <div class=\"movie-meta-row\">",
            "            <span>" + escapeHtml(movie.region) + "</span>",
            "            <span>" + escapeHtml(movie.type) + "</span>",
            "        </div>",
            "        <div class=\"tag-row\">" + tags + "</div>",
            "    </div>",
            "</article>"
        ].join("\n");
    }
})();
