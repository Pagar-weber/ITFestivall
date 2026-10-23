// Microphone Input System for Dalang Narration
class MicSystem {
    constructor() {
        this.stream = null;
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.isRecording = false;
        this.isMuted = false;
        this.volumeLevel = 0;
        
        this.createUI();
    }

    createUI() {
        // Mic control panel (bottom-left)
        const micPanel = document.createElement('div');
        micPanel.id = 'micPanel';
        micPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 900;
            min-width: 180px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        `;

        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            color: #FFD700;
            font-size: 12px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            margin-bottom: 5px;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        title.innerHTML = '🎤 MICROPHONE';

        // Status indicator
        const statusDiv = document.createElement('div');
        statusDiv.id = 'micStatus';
        statusDiv.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.7);
            font-family: 'Inter', sans-serif;
        `;
        
        const statusDot = document.createElement('div');
        statusDot.id = 'micStatusDot';
        statusDot.style.cssText = `
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: #888;
        `;
        
        const statusText = document.createElement('span');
        statusText.id = 'micStatusText';
        statusText.textContent = 'Inactive';
        
        statusDiv.appendChild(statusDot);
        statusDiv.appendChild(statusText);

        // Volume meter (waveform bars)
        const volumeMeter = document.createElement('div');
        volumeMeter.style.cssText = `
            display: flex;
            gap: 3px;
            height: 40px;
            align-items: flex-end;
            justify-content: center;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 6px;
            padding: 5px;
        `;
        
        // Create 8 bars
        for (let i = 0; i < 8; i++) {
            const bar = document.createElement('div');
            bar.className = 'volume-bar';
            bar.style.cssText = `
                width: 8px;
                height: 10%;
                background: linear-gradient(to top, #FFD700, #FFA500);
                border-radius: 2px;
                transition: height 0.1s ease;
            `;
            volumeMeter.appendChild(bar);
        }
        this.volumeMeter = volumeMeter;

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
        `;

        // Start/Stop button
        const startBtn = document.createElement('button');
        startBtn.id = 'micStartBtn';
        startBtn.innerHTML = '▶️ Start';
        startBtn.style.cssText = `
            flex: 1;
            padding: 8px;
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
            border: none;
            border-radius: 8px;
            color: #fff;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
        `;
        
        startBtn.addEventListener('click', () => {
            if (this.isRecording) {
                this.stop();
            } else {
                this.start();
            }
        });

        // Mute/Unmute button
        const muteBtn = document.createElement('button');
        muteBtn.id = 'micMuteBtn';
        muteBtn.innerHTML = '🔊';
        muteBtn.style.cssText = `
            width: 40px;
            padding: 8px;
            background: linear-gradient(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(60, 60, 60, 0.3) 100%);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            color: #fff;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: none;
        `;
        
        muteBtn.addEventListener('click', () => {
            this.toggleMute();
        });

        // Hover effects
        startBtn.addEventListener('mouseenter', () => {
            startBtn.style.transform = 'scale(1.05)';
        });
        startBtn.addEventListener('mouseleave', () => {
            startBtn.style.transform = 'scale(1)';
        });

        muteBtn.addEventListener('mouseenter', () => {
            muteBtn.style.transform = 'scale(1.05)';
        });
        muteBtn.addEventListener('mouseleave', () => {
            muteBtn.style.transform = 'scale(1)';
        });

        buttonContainer.appendChild(startBtn);
        buttonContainer.appendChild(muteBtn);

        // Assemble
        micPanel.appendChild(title);
        micPanel.appendChild(statusDiv);
        micPanel.appendChild(volumeMeter);
        micPanel.appendChild(buttonContainer);

        document.body.appendChild(micPanel);

        this.startBtn = startBtn;
        this.muteBtn = muteBtn;
        this.statusDot = statusDot;
        this.statusText = statusText;
    }

    async start() {
        try {
            console.log('🎤 Requesting microphone access...');
            
            // Request microphone permission
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } 
            });
            
            // Setup audio context and analyser
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            this.microphone.connect(this.analyser);
            
            this.isRecording = true;
            this.updateUI();
            
            // Start volume meter animation
            this.animateVolumeMeter();
            
            console.log('✅ Microphone active!');
            
        } catch (error) {
            console.error('❌ Microphone access denied:', error);
            alert('Microphone access denied! Please allow microphone permission.');
        }
    }

    stop() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        this.isRecording = false;
        this.isMuted = false;
        this.updateUI();
        
        // Reset volume bars
        const bars = this.volumeMeter.querySelectorAll('.volume-bar');
        bars.forEach(bar => {
            bar.style.height = '10%';
        });
        
        console.log('⏸️ Microphone stopped');
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.stream) {
            this.stream.getAudioTracks().forEach(track => {
                track.enabled = !this.isMuted;
            });
        }
        
        this.updateUI();
        
        console.log(this.isMuted ? '🔇 Microphone muted' : '🔊 Microphone unmuted');
    }

    updateUI() {
        // Update start/stop button
        if (this.isRecording) {
            this.startBtn.innerHTML = '⏸️ Stop';
            this.startBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
            this.muteBtn.style.display = 'block';
        } else {
            this.startBtn.innerHTML = '▶️ Start';
            this.startBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
            this.muteBtn.style.display = 'none';
        }
        
        // Update mute button
        if (this.isMuted) {
            this.muteBtn.innerHTML = '🔇';
            this.muteBtn.style.background = 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)';
        } else {
            this.muteBtn.innerHTML = '🔊';
            this.muteBtn.style.background = 'linear-gradient(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(60, 60, 60, 0.3) 100%)';
        }
        
        // Update status indicator
        if (this.isRecording && !this.isMuted) {
            this.statusDot.style.background = '#4CAF50';
            this.statusDot.style.animation = 'pulse 1.5s infinite';
            this.statusText.textContent = 'Recording';
            this.statusText.style.color = '#4CAF50';
        } else if (this.isRecording && this.isMuted) {
            this.statusDot.style.background = '#FFA500';
            this.statusDot.style.animation = 'none';
            this.statusText.textContent = 'Muted';
            this.statusText.style.color = '#FFA500';
        } else {
            this.statusDot.style.background = '#888';
            this.statusDot.style.animation = 'none';
            this.statusText.textContent = 'Inactive';
            this.statusText.style.color = 'rgba(255, 255, 255, 0.7)';
        }
    }

    animateVolumeMeter() {
        if (!this.isRecording || !this.analyser) return;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        this.volumeLevel = average / 255;
        
        // Update volume bars
        const bars = this.volumeMeter.querySelectorAll('.volume-bar');
        bars.forEach((bar, index) => {
            const threshold = (index + 1) * (255 / 8);
            if (average > threshold && !this.isMuted) {
                bar.style.height = `${Math.min(100, (index + 1) * 12.5 + average / 10)}%`;
                bar.style.opacity = '1';
            } else {
                bar.style.height = '10%';
                bar.style.opacity = '0.3';
            }
        });
        
        // Continue animation
        requestAnimationFrame(() => this.animateVolumeMeter());
    }

    getAudioStream() {
        return this.stream;
    }

    getVolumeLevel() {
        return this.volumeLevel;
    }

    isActive() {
        return this.isRecording && !this.isMuted;
    }
}

// Add pulse animation for status dot
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.2); }
    }
`;
document.head.appendChild(style);

// Create global instance
window.micSystem = new MicSystem();
