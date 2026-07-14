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

        FAVORITES: "bia-favorites"

    },

    saveTrack(index) {

        localStorage.setItem(
            this.KEYS.TRACK,
            index
        );

    },

    getTrack() {

        return Number(
            localStorage.getItem(
                this.KEYS.TRACK
            )
        );

    },

    saveTime(time) {

        localStorage.setItem(
            this.KEYS.TIME,
            time
        );

    },

    getTime() {

        return Number(
            localStorage.getItem(
                this.KEYS.TIME
            )
        );

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

    }

};

window.StorageManager = StorageManager;