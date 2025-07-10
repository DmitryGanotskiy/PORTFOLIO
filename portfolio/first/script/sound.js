class Sounds {
  constructor() {
    this.context = new AudioContext();
    this.currentlyPlaying = null;
    this.sounds = {
      music: {
        english: new Audio('first/sounds/english.mp3'),
        russian: new Audio('first/sounds/russian.mp3'),
        german: new Audio('first/sounds/german.mp3'),
        spanish: new Audio('first/sounds/spanish.mp3'),
        french: new Audio('first/sounds/french.mp3'),
      }
    };
    this.resumed = false;

    // Ensure the AudioContext is resumed on the first user interaction
    window.addEventListener('mousedown', () => {
      if (!this.resumed) {
        this.context.resume();
        this.resumed = true;
      }
    });
  }

  async play(soundType, soundName) {
    // Stop currently playing music if there is any
    if (this.currentlyPlaying) {
      this.currentlyPlaying.pause();
      this.currentlyPlaying.currentTime = 0;
    }

    const sound = this.sounds[soundType][soundName];
    sound.currentTime = 0;
    this.currentlyPlaying = sound;

    // Play the selected sound
    const playPromise = sound.play();

    if (playPromise !== undefined) {
      playPromise.then(() => {
        // Add an event listener to replay the music when it ends
        sound.addEventListener('ended', this.onMusicEnded.bind(this), { once: true });
      }).catch((error) => {
        console.error('Error playing sound:', error);
      });
    }

    // Return a promise that resolves when the music ends
    return new Promise(resolve => {
      sound.addEventListener('ended', () => {
        resolve();
      });
    });
  }

  onMusicEnded() {
    if (this.currentlyPlaying) {
      this.currentlyPlaying.currentTime = 0;
      this.currentlyPlaying.play();
    }
  }

  stop(soundType, soundName) {
    const sound = this.sounds[soundType][soundName];
    sound.pause();
    sound.currentTime = 0;
  }
}

export { Sounds };
