(function () {
    var video = document.getElementById('moviePlayer');
    var button = document.querySelector('[data-player-start]');
    var card = document.querySelector('.player-card');

    if (!video || !button || !card) {
        return;
    }

    var started = false;
    var stream = video.dataset.stream;

    var load = function () {
        if (started) {
            return Promise.resolve();
        }
        started = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
            return Promise.resolve();
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: false,
                backBufferLength: 90
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            return Promise.resolve();
        }

        video.src = stream;
        return Promise.resolve();
    };

    var start = function () {
        card.classList.add('playing');
        load().then(function () {
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {
                    card.classList.remove('playing');
                });
            }
        });
    };

    button.addEventListener('click', start);
    video.addEventListener('click', function () {
        if (!started) {
            start();
        }
    });
})();
