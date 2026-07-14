/*
==========================================
B.I.A Media Library
Reusable Playlist Engine
==========================================
*/

function renderPlaylist(playlist) {

    const container = document.getElementById("audio-list");

    if (!container) return;

    function getPlayer() {
        return (
            (window.parent && window.parent !== window && window.parent.audioPlayer) ||
            window.audioPlayer ||
            (window.top && window.top !== window && window.top.audioPlayer)
        );
    }

    function initializePlayerEvents(player) {
        player.on("play", updateIcons);
        player.on("pause", updateIcons);
        player.on("trackchange", () => {
            updateIcons();
            updateDurations();
        });
        player.on("timeupdate", () => {
            updateProgress();
            updateDurations();
        });
        // some players emit loadedmetadata; handle if present
        try {
            player.on("loadedmetadata", updateDurations);
        } catch (e) {
            // ignore if not supported
        }
    }

    function formatTime(sec) {
        if (!Number.isFinite(sec) || sec <= 0) return "00:00";
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        const m = Math.floor((sec / 60) % 60);
        const h = Math.floor(sec / 3600);
        if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s}`;
        return `${m}:${s}`;
    }

    function updateDurations() {
        const player = getPlayer();
        document.querySelectorAll('.collection-item').forEach((item, idx) => {
            const durEl = item.querySelector('.audio-duration');
            if (!durEl) return;
            // if this is the current playing track and audio has duration, show actual
            if (player && player.currentIndex === idx && player.audio && Number.isFinite(player.audio.duration) && player.audio.duration > 0) {
                durEl.textContent = formatTime(player.audio.duration);
            } else {
                // fallback to provided playlist duration or 00:00
                const fallback = (playlist[idx] && playlist[idx].duration) || '00:00';
                durEl.textContent = fallback;
            }
        });
    }


    // Probe each audio source to read real duration metadata on page load.
    function probeDurations() {
        if (!Array.isArray(playlist) || playlist.length === 0) return;

        playlist.forEach((track, idx) => {
            if (!track || !track.src) return;

            // If playlist already has a reasonable duration string, skip probing
            const provided = track.duration;
            if (provided && provided !== '00:00' && provided !== '') return;

            const a = new Audio();
            a.preload = 'metadata';
            let done = false;

            const cleanup = () => {
                try {
                    a.src = '';
                } catch (e) {}
                a.removeAttribute('src');
                a.onload = a.onloadedmetadata = a.onerror = null;
            };

            const onLoaded = () => {
                if (done) return;
                done = true;
                const dur = a.duration;
                if (Number.isFinite(dur) && dur > 0) {
                    // Update playlist data and DOM
                    playlist[idx].duration = formatTime(dur);
                    const item = container.querySelectorAll('.collection-item')[idx];
                    if (item) {
                        const durEl = item.querySelector('.audio-duration');
                        if (durEl) durEl.textContent = playlist[idx].duration;
                    }
                }
                cleanup();
            };

            const onError = () => {
                if (done) return;
                done = true;
                cleanup();
            };

            a.onloadedmetadata = onLoaded;
            a.onerror = onError;
            a.src = track.src;

            // timeout to avoid hanging forever
            setTimeout(() => {
                if (!done) onError();
            }, 5000);

        });
    }
    function ensurePlayerReady() {
        const player = getPlayer();
        if (player) {
            initializePlayerEvents(player);
            return true;
        }
        return false;
    }

    if (!ensurePlayerReady()) {
        const readyInterval = setInterval(() => {
            if (ensurePlayerReady()) {
                clearInterval(readyInterval);
            }
        }, 100);
    }

    container.innerHTML = "";

    
    

    let favorites = [];
    try {
        const raw = localStorage.getItem("favorites");
        favorites = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(favorites)) favorites = [];
    } catch (e) {
        console.warn('Playlist: failed to parse favorites, resetting', e);
        favorites = [];
    }

    playlist.forEach((track, index) => {

        const favorite =
            favorites.includes(track.src);

        const li = document.createElement("li");

        li.className = "collection-item audio-item";

        li.innerHTML = `
            <div class="audio-left">

                <div class="audio-title">
                    ${track.title}
                </div>

                <div class="audio-meta">

                    <i class="bi bi-hourglass"></i>

                    <span class="audio-duration">

                        ${track.duration}

                    </span>

                </div>

                <div class="progress-bar"
                     data-index="${index}">

                    <div class="progress-fill"></div>

                </div>

            </div>

            <div class="audio-actions">

                <span class="icon-box play-btn"
                      data-index="${index}">

                    <i class="bi bi-play-fill"></i>

                </span>

                <span class="icon-box fav-btn"
                      data-index="${index}">

                    <i class="bi ${favorite ?
                        "bi-heart-fill"
                        :
                        "bi-heart"}"></i>

                </span>

                <span class="icon-box download-btn"
                      data-src="${track.src}">

                    <i class="bi bi-download"></i>

                </span>

            </div>
        `;

        container.appendChild(li);

    });

    

    

    function updateIcons() {
        const player = getPlayer();
        if (!player) return;

        document
            .querySelectorAll(".play-btn")
            .forEach(btn => {

                const icon =
                    btn.querySelector("i");

                const index =
                    Number(btn.dataset.index);

                if (
                    player.currentIndex === index &&
                    !player.isPaused()
                ) {

                    icon.className =
                        "bi bi-pause-fill";

                }

                else {

                    icon.className =
                        "bi bi-play-fill";

                }

            });

    }

    function updateProgress() {
        const player = getPlayer();
        if (!player || !player.audio || !player.audio.duration) return;

        const percent = (player.audio.currentTime / player.audio.duration) * 100;

        document.querySelectorAll(".progress-bar").forEach(bar => {
            const barIndex = Number(bar.dataset.index);
            if (Number.isFinite(barIndex) && barIndex === player.currentIndex) {
                const fill = bar.querySelector(".progress-fill");
                if (fill) fill.style.width = percent + "%";
            }
        });

    }

    // `ensurePlayerReady` already binds the player event listeners.
    document.addEventListener("click", e => {

        /* PLAY */

        const play =
            e.target.closest(".play-btn");

        if (play) {
            const player = getPlayer();
            if (!player) return;

            const index = Number(play.dataset.index);
            if (!Number.isFinite(index) || index < 0 || index >= playlist.length) {
                console.warn('Playlist: invalid play index', index);
                return;
            }

            try {
                // toggle if same index
                if (player.currentIndex === index) {
                    if (player.isPaused()) {
                        player.play();
                    } else {
                        player.pause();
                    }
                } else {
                    player.loadPlaylist(playlist);
                    player.play(index);
                }
            } catch (err) {
                console.error('Playlist: play failed', index, playlist[index] && playlist[index].src, err);
            }

            updateIcons();

            return;

        }

        /* PLAY WHOLE ROW */

        const row =
            e.target.closest(".audio-item");

        if (
            row &&
            !e.target.closest(".fav-btn") &&
            !e.target.closest(".download-btn")
        ) {

            const player = getPlayer();
            if (!player) return;

            const playBtn = row.querySelector(".play-btn");
            if (!playBtn) return;

            const index = Number(playBtn.dataset.index);
            if (!Number.isFinite(index) || index < 0 || index >= playlist.length) {
                console.warn('Playlist: invalid row play index', index);
                return;
            }

            try {
                if (player.currentIndex === index) {
                    if (player.isPaused()) player.play(); else player.pause();
                } else {
                    player.loadPlaylist(playlist);
                    player.play(index);
                }
            } catch (err) {
                console.error('Playlist: row play failed', index, playlist[index] && playlist[index].src, err);
            }

            updateIcons();

            return;

        }

        /* FAVORITE */

        const fav =
            e.target.closest(".fav-btn");

        if (fav) {

            const index =
                Number(fav.dataset.index);

            const src =
                playlist[index].src;

            const icon =
                fav.querySelector("i");

            if (favorites.includes(src)) {

                favorites =
                    favorites.filter(
                        x => x !== src
                    );

                icon.className =
                    "bi bi-heart";

            }

            else {

                favorites.push(src);

                icon.className =
                    "bi bi-heart-fill";

            }

            localStorage.setItem(
                "favorites",
                JSON.stringify(favorites)
            );

            return;

        }

        /* DOWNLOAD */

        const download =
            e.target.closest(".download-btn");

        if (download) {

            const a =
                document.createElement("a");

            a.href =
                download.dataset.src;

            a.download = "";

            a.click();

        }

    });

    updateIcons();
    updateDurations();
    // start probing real durations for all tracks
    try { probeDurations(); } catch (e) { console.warn('Playlist: probeDurations failed', e); }

}