// Hand Tracker - MediaPipe Hands Integration
class HandTracker {
    constructor() {
        this.hands = null;
        this.camera = null;
        this.videoElement = null;
        this.onHandUpdate = null;
        this.currentHands = [];
    }

    async init(videoElement, onHandUpdate) {
        this.videoElement = videoElement;
        this.onHandUpdate = onHandUpdate;

        // Initialize MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.7
        });

        this.hands.onResults((results) => this.processResults(results));

        // Start camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });

            videoElement.srcObject = stream;
            await videoElement.play();

            // Initialize MediaPipe Camera
            this.camera = new Camera(videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: videoElement });
                },
                width: 640,
                height: 480
            });

            await this.camera.start();
            console.log('✅ Hand tracking initialized');
            return true;
        } catch (error) {
            console.error('❌ Camera error:', error);
            alert('Tidak bisa akses kamera!\n\nPastikan:\n- Izinkan akses kamera\n- Gunakan Chrome/Edge\n- HTTPS atau localhost');
            return false;
        }
    }

    processResults(results) {
        this.currentHands = [];

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            results.multiHandLandmarks.forEach((landmarks, index) => {
                const handedness = results.multiHandedness[index];
                const handType = handedness.label; // "Left" or "Right"

                // Get palm center (landmark 9)
                const palmCenter = landmarks[9];
                
                // Non-mirrored coordinates
                const x = 1 - palmCenter.x;
                const y = palmCenter.y;
                const z = palmCenter.z;

                // Detect gesture
                const gesture = this.detectGesture(landmarks);

                this.currentHands.push({
                    type: handType,
                    position: { x, y, z },
                    landmarks: landmarks,
                    gesture: gesture
                });
            });
        }

        if (this.onHandUpdate) {
            this.onHandUpdate(this.currentHands);
        }
    }

    detectGesture(landmarks) {
        // Simple gesture detection
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];
        const ring = landmarks[16];
        const pinky = landmarks[20];

        // Pinch detection
        const thumbIndexDist = this.distance3D(thumb, index);
        if (thumbIndexDist < 0.05) {
            return 'pinch';
        }

        // Count extended fingers
        const extended = [];
        if (index.y < landmarks[6].y) extended.push('index');
        if (middle.y < landmarks[10].y) extended.push('middle');
        if (ring.y < landmarks[14].y) extended.push('ring');
        if (pinky.y < landmarks[18].y) extended.push('pinky');

        // Thumbs up detection (thumb extended UP, others closed)
        const thumbUp = thumb.y < landmarks[2].y; // Thumb tip above thumb base
        if (thumbUp && extended.length <= 1) return 'thumbs_up';

        if (extended.length === 0) return 'fist';
        if (extended.length === 1 && extended.includes('index')) return 'point';
        if (extended.length === 2 && extended.includes('index') && extended.includes('middle')) return 'peace';
        if (extended.length >= 4) return 'open';

        return 'neutral';
    }

    distance3D(point1, point2) {
        const dx = point1.x - point2.x;
        const dy = point1.y - point2.y;
        const dz = (point1.z || 0) - (point2.z || 0);
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    drawHands(canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.currentHands.forEach(hand => {
            const landmarks = hand.landmarks;
            
            // Draw connections
            ctx.strokeStyle = hand.type === 'Left' ? '#00FFFF' : '#FFD700';
            ctx.lineWidth = 3;
            
            const connections = [
                [0,1],[1,2],[2,3],[3,4], // Thumb
                [0,5],[5,6],[6,7],[7,8], // Index
                [5,9],[9,10],[10,11],[11,12], // Middle
                [9,13],[13,14],[14,15],[15,16], // Ring
                [13,17],[17,18],[18,19],[19,20], // Pinky
                [0,17] // Palm
            ];

            connections.forEach(([start, end]) => {
                const p1 = landmarks[start];
                const p2 = landmarks[end];
                
                ctx.beginPath();
                ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height);
                ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height);
                ctx.stroke();
            });

            // Draw landmarks
            landmarks.forEach(lm => {
                ctx.fillStyle = hand.type === 'Left' ? '#00FFFF' : '#FFD700';
                ctx.beginPath();
                ctx.arc((1 - lm.x) * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
                ctx.fill();
            });
        });
    }
}

// Export
window.HandTracker = HandTracker;
