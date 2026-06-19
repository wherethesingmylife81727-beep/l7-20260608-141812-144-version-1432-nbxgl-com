let HlsLibrary = null;

try {
    const module = await import("./hls-vendor-dru42stk.js");
    HlsLibrary = module.H;
} catch (error) {
    console.warn("HLS module could not be loaded. Native playback will be used when available.", error);
}

function ready(callback) {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", callback);
    } else {
        callback();
    }
}

ready(function () {
    const player = document.querySelector("[data-player]");
    const video = player ? player.querySelector("video") : null;

    if (!player || !video) {
        return;
    }

    const source = video.getAttribute("data-video-src");
    const overlayButton = player.querySelector("[data-video-play]");
    const toggleButton = document.querySelector("[data-video-toggle]");
    const muteButton = document.querySelector("[data-video-mute]");
    const fullscreenButton = document.querySelector("[data-video-fullscreen]");

    initializeSource(video, source);

    function playOrPause() {
        if (video.paused) {
            video.play().catch(function (error) {
                console.warn("Playback was prevented by the browser.", error);
            });
        } else {
            video.pause();
        }
    }

    if (overlayButton) {
        overlayButton.addEventListener("click", playOrPause);
    }

    if (toggleButton) {
        toggleButton.addEventListener("click", playOrPause);
    }

    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "取消静音" : "静音";
        });
    }

    if (fullscreenButton) {
        fullscreenButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                player.requestFullscreen().catch(function (error) {
                    console.warn("Fullscreen request failed.", error);
                });
            }
        });
    }

    video.addEventListener("click", playOrPause);
    video.addEventListener("play", function () {
        player.classList.add("is-playing");
    });
    video.addEventListener("pause", function () {
        player.classList.remove("is-playing");
    });
    video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
    });
});

function initializeSource(video, source) {
    if (!source) {
        return;
    }

    if (HlsLibrary && HlsLibrary.isSupported()) {
        const hls = new HlsLibrary({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(HlsLibrary.Events.ERROR, function (_, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === HlsLibrary.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
            } else if (data.type === HlsLibrary.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
            } else {
                hls.destroy();
                video.src = source;
            }
        });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
    } else {
        video.src = source;
    }
}
