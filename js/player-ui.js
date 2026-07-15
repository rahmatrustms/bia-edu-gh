/*
==========================================
Breman Islamic Academy
Player UI Controller
==========================================
*/

let player = window.audioPlayer || null;

const title =
document.getElementById("trackTitle");

const artist =
document.getElementById("trackArtist");

const artwork =
document.getElementById("trackArtwork");

// Controls
const playPauseButton = document.getElementById("playPause");
const backwardButton = document.getElementById("backward");
const forwardButton = document.getElementById("forward");

const progress = document.getElementById("progress");

const currentTime = document.getElementById("currentTime");
const duration = document.getElementById("duration");

const volume = document.getElementById("volume");
const mute = document.getElementById("mute");
const volumeRate = document.querySelector(".volume-rate");

const speed = document.getElementById("speed");

const backward10 = document.getElementById("backward-10");
const forward10 = document.getElementById("forward-10");

/*
==========================================
PLAY / PAUSE
==========================================
*/

function updatePlayButton() {
    if (!playPauseButton || !player || !player.audio) return;

    const icon = playPauseButton.querySelector("i");
    if (!icon) return;

    if (player.audio.paused) {
        icon.className = "bi bi-play-fill";
    } else {
        icon.className = "bi bi-pause-fill";
    }

}

function updateVolumeUI() {
    if (!player || !player.audio) return;

    if (volume) {
        volume.value = player.audio.volume;
    }

    if (volumeRate) {
        volumeRate.textContent = `${Math.round(player.audio.volume * 100)}%`;
    }

    if (!mute) return;
    const icon = mute.querySelector("i");
    if (!icon) return;

    if (player.audio.muted || player.audio.volume === 0) {
        icon.className = "bi bi-volume-mute-fill";
    } else {
        icon.className = "bi bi-volume-up-fill";
    }

}

function updateTrackTitle(titleText) {
    if (!title) return;

    const marquee = title.querySelector("marquee");
    const value = titleText || "- - - No Track Playing - - -";

    if (marquee) {
        marquee.textContent = value;
    } else {
        title.textContent = value;
    }
}

function updateTrackInfo() {
    if (!player) return;
    const track = player.getCurrentTrack();
    if (!track) return;

    updateTrackTitle(track.title);
    if (artist) artist.textContent = track.artist;
    if (artwork) artwork.src = track.artwork || artwork.src;

}

if (playPauseButton) {
    playPauseButton.addEventListener("click", () => {
        if (!player) return;
        player.toggle();
    });
}

/*
==========================================
NEXT / PREVIOUS
==========================================
*/

if (forwardButton) {
    forwardButton.addEventListener("click", () => {
        if (!player) return;
        player.next();
    });
}

if (backwardButton) {
    backwardButton.addEventListener("click", () => {
        if (!player) return;
        player.previous();
    });
}

/*
==========================================
10 SECOND SEEK
==========================================
*/

if (forward10) {
    forward10.addEventListener("click", () => {
        if (!player) return;
        player.forward10();
    });
}

if (backward10) {
    backward10.addEventListener("click", () => {
        if (!player) return;
        player.backward10();
    });
}

/*
==========================================
PROGRESS BAR
==========================================
*/

if (progress) {
    progress.addEventListener("input", () => {
        if (!player) return;
        player.seek(progress.value);
    });
}

/*
==========================================
VOLUME
==========================================
*/

if (volume) {
    volume.addEventListener("input", () => {
        if (!player) return;
        player.setVolume(Number(volume.value));
        updateVolumeUI();
    });
}

if (mute) {
    mute.addEventListener("click", () => {
        if (!player) return;
        player.toggleMute();
        updateVolumeUI();
    });
}

/*
==========================================
PLAYBACK SPEED
==========================================
*/

if (speed) {
    speed.addEventListener("change", () => {
        if (!player) return;
        player.setPlaybackRate(Number(speed.value));
    });
}

/*
==========================================
PLAYER EVENTS
==========================================
*/

function attachPlayerEvents() {
    if (!player) return;

    player.on("play", () => {
        updatePlayButton();
    });

    player.on("pause", () => {
        updatePlayButton();
    });

    player.on("loadedmetadata", () => {
        if (duration) duration.textContent = player.format(player.getDuration());
        if (currentTime) currentTime.textContent = player.format(player.getCurrentTime());
    });

    player.on("timeupdate", () => {
        if (currentTime) currentTime.textContent = player.format(player.getCurrentTime());
        if (player.audio.duration && progress) {
            progress.value = (player.audio.currentTime / player.audio.duration) * 100;
        }
    });

    player.on("volumechange", () => {
        updateVolumeUI();
    });

    player.on("ratechange", () => {
        if (speed) speed.value = player.audio.playbackRate;
    });

    player.on("trackchange", () => {
        updateTrackInfo();
        updatePlayButton();
        if (currentTime) currentTime.textContent = "00:00";
        if (duration) duration.textContent = "00:00";
        if (progress) progress.value = 0;
    });

    player.on("error", () => {
        console.error("Player reported an error for src:", player.audio && player.audio.src, player.getCurrentTrack());
        updatePlayButton();
        updateVolumeUI();
    });
}

if (!player) {
    const pInterval = setInterval(() => {
        if (window.audioPlayer) {
            player = window.audioPlayer;
            clearInterval(pInterval);
            attachPlayerEvents();
            updatePlayButton();
            updateVolumeUI();
        }
    }, 100);
} else {
    attachPlayerEvents();
}

player.on("error", () => {
    console.error("Player reported an error for src:", player.audio.src, player.getCurrentTrack());
    updatePlayButton();
    updateVolumeUI();
});

/*
==========================================
HELPER METHODS
==========================================
*/
/* Helper functions removed: use `player.isPaused()` / `player.isMuted()` instead */

/*
==========================================
INITIALIZE
==========================================
*/

updatePlayButton();
updateVolumeUI();

speed.value = player.audio.playbackRate;


