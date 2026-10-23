// Gamelan Sound System - Traditional Indonesian Music
class GamelanSound {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.ambientOsc = null;
        this.ambientInterval = null;
    }

    // Gong Ageng - Deep ceremonial gong
    playGong() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 2);
        
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 3);
    }

    // Saron - Metallic xylophone sound
    playSaron(note = 0) {
        const frequencies = [523, 587, 659, 698, 784]; // C major pentatonic
        const freq = frequencies[note % 5];
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.frequency.value = freq;
        osc.type = 'square';
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // Kendang - Drum sound
    playKendang() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const noise = this.ctx.createBufferSource();
        
        // Create noise buffer
        const bufferSize = this.ctx.sampleRate * 0.1;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noise.buffer = buffer;
        
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        
        osc.connect(gain);
        noise.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        noise.start();
        osc.stop(this.ctx.currentTime + 0.15);
        noise.stop(this.ctx.currentTime + 0.1);
    }

    playAmbient(track = 'gending') {
        // Stop previous ambient if exists
        if (this.ambientOsc) {
            this.ambientOsc.stop();
        }
        if (this.ambientInterval) {
            clearInterval(this.ambientInterval);
        }
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        // Different scales for each track
        let frequencies;
        let interval;
        
        if (track === 'slendro') {
            // Slendro pentatonic: C D E G A
            frequencies = [261.63, 293.66, 329.63, 392.00, 440.00];
            interval = 2000; // Slower, meditative
        } else if (track === 'pelog') {
            // Pelog heptatonic: C Db E F G Ab B
            frequencies = [261.63, 277.18, 329.63, 349.23, 392.00, 415.30, 493.88];
            interval = 1500; // Medium pace
        } else {
            // Gending Jawa (default): Traditional gamelan
            frequencies = [220.00, 246.94, 261.63, 293.66, 329.63];
            interval = 1800;
        }
        
        gain.gain.value = 0.05; // Subtle background
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        let currentIndex = 0;
        
        const playNote = () => {
            osc.frequency.setValueAtTime(frequencies[currentIndex], this.ctx.currentTime);
            currentIndex = (currentIndex + 1) % frequencies.length;
        };
        
        osc.start();
        playNote();
        
        const intervalId = setInterval(playNote, interval);
        
        // Store for cleanup
        this.ambientOsc = osc;
        this.ambientInterval = intervalId;
        
        return {
            stop: () => {
                clearInterval(intervalId);
                gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
                setTimeout(() => osc.stop(), 500);
            }
        };
    }
}

// Export
window.GamelanSound = GamelanSound;
