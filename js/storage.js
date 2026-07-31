/*
==========================================
B.I.A Media Library
Storage Manager
==========================================
*/

const StorageManager = {

    KEYS: {

        TRACK: "bia-track",

        TIME: "bia-time",

        VOLUME: "bia-volume",

        SPEED: "bia-speed",

        FAVORITES: "bia-favorites",

        PLAYING: "bia-playing"

    },

    saveTrack(index) {

        localStorage.setItem(
            this.KEYS.TRACK,
            index
        );

    },

    getTrack() {

        const value = localStorage.getItem(
            this.KEYS.TRACK
        );

        if (value === null || value === "") return null;

        const parsed = Number(value);

        return Number.isNaN(parsed) ? null : parsed;

    },

    saveTime(time) {

        localStorage.setItem(
            this.KEYS.TIME,
            time
        );

    },

    getTime() {

        const value = localStorage.getItem(
            this.KEYS.TIME
        );

        if (value === null || value === "") return null;

        const parsed = Number(value);

        return Number.isNaN(parsed) ? null : parsed;

    },

    saveVolume(volume) {

        localStorage.setItem(
            this.KEYS.VOLUME,
            volume
        );

    },

    getVolume() {

        const value =
            localStorage.getItem(
                this.KEYS.VOLUME
            );

        return value === null
            ? 1
            : Number(value);

    },

    saveSpeed(speed) {

        localStorage.setItem(
            this.KEYS.SPEED,
            speed
        );

    },

    getSpeed() {

        const value =
            localStorage.getItem(
                this.KEYS.SPEED
            );

        return value === null
            ? 1
            : Number(value);

    },

    savePlaying(isPlaying) {

        localStorage.setItem(
            this.KEYS.PLAYING,
            isPlaying ? "true" : "false"
        );

    },

    getPlaying() {

        const value = localStorage.getItem(
            this.KEYS.PLAYING
        );

        return value === "true";

    },

    saveFavorites(list) {

        localStorage.setItem(

            this.KEYS.FAVORITES,

            JSON.stringify(list)

        );

    },

    getFavorites() {

        return JSON.parse(

            localStorage.getItem(

                this.KEYS.FAVORITES

            )

        ) || [];

    },

    clearPlayer() {

        localStorage.removeItem(
            this.KEYS.TRACK
        );

        localStorage.removeItem(
            this.KEYS.TIME
        );

        localStorage.removeItem(
            this.KEYS.PLAYING
        );

    }

};

window.StorageManager = StorageManager;