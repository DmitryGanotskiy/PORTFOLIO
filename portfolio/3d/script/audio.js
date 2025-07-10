class AudioManager {
    constructor(subtitles, subtitleDisplay) {
        this.audio = null;
        this.audioPlayed = false;
        this.audioPaused = false;
        this.audioStartTime = 0;
        this.subtitles = subtitles;
        this.subtitleDisplay = subtitleDisplay;

        this.setupSubtitleDisplay();
    }

    playAudio(url, currentTime) {
        this.audio = new Audio(url);
        this.audio.currentTime = currentTime || this.audioStartTime;
        this.audio.play();
        this.audio.addEventListener('timeupdate', () => {
            this.updateSubtitles(this.audio.currentTime);
        });
        this.audio.addEventListener('ended', () => {
            this.audioPlayed = false;
            this.audioPaused = false;
            this.audioStartTime = 0;
            this.clearSubtitles();
        });
    }

    updateSubtitles(currentTime) {
        for (let i = 0; i < this.subtitles.length; i++) {
            if (currentTime >= this.subtitles[i].startTime && currentTime < this.subtitles[i].endTime) {
                this.subtitleDisplay.textContent = this.subtitles[i].text;
                return;
            }
        }
        this.clearSubtitles();
    }

    clearSubtitles() {
        this.subtitleDisplay.textContent = '';
    }

    setupSubtitleDisplay() {
        this.subtitleDisplay.style.position = 'absolute';
        this.subtitleDisplay.style.bottom = '10px';
        this.subtitleDisplay.style.width = '100%';
        this.subtitleDisplay.style.textAlign = 'center';
        this.subtitleDisplay.style.color = '#ffffff';
        this.subtitleDisplay.style.fontSize = '20px';
        this.subtitleDisplay.style.fontFamily = 'Arial, sans-serif';
        this.subtitleDisplay.style.pointerEvents = 'none';
        this.subtitleDisplay.style.zIndex = "990";
        document.body.appendChild(this.subtitleDisplay);
    }

    pauseAudio() {
        if (this.audio && !this.audio.paused) {
            this.audio.pause();
            this.audioPaused = true;
            this.audioStartTime = this.audio.currentTime;
            this.clearSubtitles();
        }
    }
}

export { AudioManager };
