/*
==========================================
Breman Islamic Academy
Global Audio Player Engine
==========================================
*/
class AudioPlayer {

    constructor() {

        // Global Audio Object
        this.audio = new Audio();
        this.audio.volume = StorageManager.getVolume();
        this.audio.playbackRate = StorageManager.getSpeed();

        // Playlist
        this.playlist = [];

        // Current Track
        this.currentIndex = -1;

        // Player State
        this.isPlaying = false;

        // Event Callbacks
        this.callbacks = {};

        this.initialize();
    }

    /*
    =====================================
    INITIALIZE
    =====================================
    */

    initialize() {

        this.audio.addEventListener("play", () => {

            this.isPlaying = true;

            this.emit("play");

        });

        this.audio.addEventListener("pause", () => {

            this.isPlaying = false;

            this.emit("pause");

        });

        this.audio.addEventListener("ended", () => {

            this.next();

        });

        this.audio.addEventListener("timeupdate", () => {

            this.emit("timeupdate");
            StorageManager.saveTime(this.audio.currentTime);

        });

        this.audio.addEventListener("loadedmetadata", () => {

            this.emit("loadedmetadata");

        });

        this.audio.addEventListener("volumechange", () => {

            this.emit("volumechange");

        });

        this.audio.addEventListener("ratechange", () => {

            this.emit("ratechange");

        });

        this.audio.addEventListener("error", (ev) => {

            console.error("Audio playback error:", ev, "src:", this.audio.src);

            this.emit("error");

        });

        this.initializeMediaSession();

    }

    /*
    =====================================
    CALLBACK SYSTEM
    =====================================
    */

    on(event, callback) {

        if (!this.callbacks[event]) {

            this.callbacks[event] = [];

        }

        this.callbacks[event].push(callback);

    }

    off(event, callback) {

        if (!this.callbacks[event]) return;

        this.callbacks[event] = this.callbacks[event].filter(

            listener => listener !== callback

        );

    }

    emit(event) {

        if (!this.callbacks[event]) return;

        this.callbacks[event].forEach(callback => {

            callback(this);

        });

    }

    /*
    =====================================
    PLAYLIST
    =====================================
    */

    loadPlaylist(list) {

        this.playlist = list;

    }

    getCurrentTrack() {

        return this.playlist[this.currentIndex];

    }

    /*
    =====================================
    LOAD TRACK
    =====================================
    */

    load(index) {

        if (index < 0 || index >= this.playlist.length) return;

        this.currentIndex = index;

        this.emit("trackchange");

        const src = this.playlist[index] && this.playlist[index].src;

        if (!src) {
            console.error("Attempted to load track with missing src:", index, this.playlist[index]);
            this.emit("error");
            return;
        }

        this.audio.src = src;

        this.audio.load();

        this.updateMediaSession();

        this.emit("trackchange");

        StorageManager.saveTrack(index);

    }

    /*
    =====================================
    PLAY
    =====================================
    */

    async play(index = null) {

        if (index !== null) {

            this.load(index);

        }

        const tryPlay = async () => {
            try {
                await this.audio.play();
                return true;
            } catch (error) {
                console.warn('Audio.play() rejected, will wait for readiness:', this.audio.src, error);
                return false;
            }
        };

        const played = await tryPlay();

        if (!played) {
            // Retry once when the element becomes ready to play
            const retryOnce = async () => {
                try {
                    await this.audio.play();
                } catch (err) {
                    console.error('Retry play failed for', this.audio.src, err);
                } finally {
                    this.audio.removeEventListener('canplay', retryOnce);
                    this.audio.removeEventListener('canplaythrough', retryOnce);
                }
            };

            this.audio.addEventListener('canplay', retryOnce);
            this.audio.addEventListener('canplaythrough', retryOnce);

            // Cleanup after timeout to avoid leaked listeners
            setTimeout(() => {
                this.audio.removeEventListener('canplay', retryOnce);
                this.audio.removeEventListener('canplaythrough', retryOnce);
            }, 5000);
        }

        localStorage.setItem(
            "bia-current-track",
            this.currentIndex
        );

    }

    /*
    =====================================
    PAUSE
    =====================================
    */

    pause(){

        this.audio.pause();

    }

    /*
    =====================================
    TOGGLE
    =====================================
    */

    toggle(){

        if(this.audio.paused){

            this.audio.play();

        }

        else{

            this.audio.pause();

        }

    }

    /*
    =====================================
    NEXT
    =====================================
    */

    next(){

        if(this.playlist.length===0) return;

        let next=this.currentIndex+1;

        if(next>=this.playlist.length){

            next=0;

        }

        this.play(next);

    }

    /*
    =====================================
    PREVIOUS
    =====================================
    */

    previous(){

        if(this.playlist.length===0) return;

        let prev=this.currentIndex-1;

        if(prev<0){

            prev=this.playlist.length-1;

        }

        this.play(prev);

    }

    /*
    =====================================
    SEEK
    =====================================
    */

    seek(percent){

        if(!this.audio.duration) return;

        this.audio.currentTime=(percent/100)*this.audio.duration;

    }

    forward10() {

        const nextTime = Math.min(
            this.audio.duration || Infinity,
            this.audio.currentTime + 10
        );

        this.audio.currentTime = nextTime;

    }

    backward10() {

        const prevTime = Math.max(0, this.audio.currentTime - 10);

        this.audio.currentTime = prevTime;

    }

    /*
    =====================================
    VOLUME
    =====================================
    */

    setVolume(value){

        const normalized = Math.min(1, Math.max(0, value));
        this.audio.volume = normalized;

        StorageManager.saveVolume(normalized);

    }

    toggleMute() {

        this.audio.muted = !this.audio.muted;

        this.emit("volumechange");

    }

    /*
    =====================================
    SPEED
    =====================================
    */

    setPlaybackRate(rate){

        const normalized = Math.max(0.25, rate);
        this.audio.playbackRate = normalized;

        StorageManager.saveSpeed(normalized);

    }

    /*
    =====================================
    TIME
    =====================================
    */

    getCurrentTime(){

        return this.audio.currentTime;

    }

    getDuration(){

        return this.audio.duration;

    }

    isPaused() {
        return this.audio.paused;
    }

    isMuted() {
        return this.audio.muted;
    }

    /*
    =====================================
    FORMAT TIME
    =====================================
    */

    format(seconds){

        if(!isFinite(seconds)){

            return "00:00";

        }

        const mins=Math.floor(seconds/60);

        const secs=Math.floor(seconds%60);

        return `${String(mins).padStart(2,"0")}:${String(secs).padStart(2,"0")}`;

    }

    /*
    =====================================
    MEDIA SESSION
    =====================================
    */

    initializeMediaSession(){

        if(!("mediaSession" in navigator)) return;

        navigator.mediaSession.setActionHandler("play",()=>{

            this.play();

        });

        navigator.mediaSession.setActionHandler("pause",()=>{

            this.pause();

        });

        navigator.mediaSession.setActionHandler("nexttrack",()=>{

            this.next();

        });

        navigator.mediaSession.setActionHandler("previoustrack",()=>{

            this.previous();

        });

    }

    updateMediaSession(){

        if(!("mediaSession" in navigator)) return;

        const track=this.getCurrentTrack();

        if(!track) return;

        navigator.mediaSession.metadata=new MediaMetadata({

            title: track.title,

            artist: track.artist,

            artwork: [

                {

                    src: track.artwork,

                    sizes: "10x10",

                    type: "image/jpeg"

                }

            ]

        });

    }

    restore() {

        const track =
            StorageManager.getTrack();

        if (
            Number.isNaN(track) ||
            track < 0 ||
            track >= this.playlist.length
        ) return;

        const time = StorageManager.getTime();

        this.load(track);

        this.audio.addEventListener(
            "loadedmetadata",
            () => {
                if (!Number.isNaN(time) && time > 0 && time < this.audio.duration) {
                    this.audio.currentTime = time;
                }
            },
            { once: true }
        );

    }

}

/*
==========================================
GLOBAL PLAYER
==========================================
*/

window.audioPlayer=new AudioPlayer();