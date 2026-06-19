(function () {
  window.initPlayer = function (sourceUrl, videoId, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var prepared = false;

    if (!video) {
      return;
    }

    var prepare = function () {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = sourceUrl;
    };

    var start = function () {
      prepare();

      if (button) {
        button.classList.add("is-hidden");
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          if (button) {
            button.classList.remove("is-hidden");
          }
        });
      }
    };

    if (button) {
      button.addEventListener("click", start);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener("play", function () {
      if (button) {
        button.classList.add("is-hidden");
      }
    });

    video.addEventListener("pause", function () {
      if (button && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    });
  };
})();
