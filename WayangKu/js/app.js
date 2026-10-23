// Main App - WayangKu Virtual Dalang
let handTracker = null;
let wayang3D = null;
let gamelanSound = null;
let selectedCharacter = null;
let ambientMusic = null;
let currentMusicTrack = 'gending';
let currentBgTheme = 'kelir';
let dialogSystem = null; // NEW: Dialog system

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    console.log('🎬 DOMContentLoaded - Initializing...');
    
    setupCharacterPicker();
    setupButtons();
    setupSettings(); // NEW: Setup music & bg selectors
    
    gamelanSound = new GamelanSound();
    console.log('🎵 GamelanSound created:', !!gamelanSound);
    
    wayang3D = new Wayang3D('#wayangCanvas');
    console.log('🎭 Wayang3D created:', !!wayang3D);
    console.log('🎭 Wayang3D has loadWayang?', typeof wayang3D?.loadWayang);
    
    dialogSystem = new DialogSystem(); // NEW: Initialize dialog system
    window.dialogSystem = dialogSystem; // EXPOSE GLOBALLY!
    window.wayang3D = wayang3D; // EXPOSE GLOBALLY!
    
    // Initialize accessories after wayang3D is ready
    if (window.AccessorySystem) {
        window.accessorySystem = new AccessorySystem(wayang3D.scene);
        console.log('🎨 Accessories system initialized!');
    }
    
    console.log('✅ WayangKu initialized');
});

function setupCharacterPicker() {
    const cards = document.querySelectorAll('.wayang-card');
    
    cards.forEach(card => {
        card.addEventListener('click', () => {
            // Deselect all
            cards.forEach(c => c.classList.remove('selected'));
            
            // Select this
            card.classList.add('selected');
            selectedCharacter = card.dataset.id;
            
            // Enable start button
            document.getElementById('startBtn').disabled = false;
            
            // Play sound
            gamelanSound.playSaron(Math.floor(Math.random() * 5));
        });
    });
}

function setupButtons() {
    const startBtn = document.getElementById('startBtn');
    const changeBtn = document.getElementById('changeWayangBtn');
    
    startBtn.addEventListener('click', async () => {
        if (!selectedCharacter) {
            alert('Pilih wayang dulu!');
            return;
        }
        
        await startPerformance();
    });
    
    // Show changeBtn after performance starts
    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            showCharacterPicker();
            changeBtn.style.display = 'none'; // Hide when showing picker
        });
    }
}

function setupSettings() {
    const musicSelect = document.getElementById('musicSelect');
    const bgSelect = document.getElementById('bgSelect');
    const accessorySelect = document.getElementById('accessorySelect');
    const clearAccessoriesBtn = document.getElementById('clearAccessoriesBtn');
    
    // Music change
    if (musicSelect) {
        musicSelect.addEventListener('change', (e) => {
            currentMusicTrack = e.target.value;
            console.log('🎵 Music changed:', currentMusicTrack);
            
            // Stop current music
            if (ambientMusic) {
                ambientMusic.stop();
            }
            
            // Play new music track
            ambientMusic = gamelanSound.playAmbient(currentMusicTrack);
        });
    }
    
    // Background change
    if (bgSelect) {
        bgSelect.addEventListener('change', (e) => {
            currentBgTheme = e.target.value;
            console.log('🎨 Theme changed:', currentBgTheme);
            
            if (wayang3D) {
                wayang3D.changeBackground(currentBgTheme);
            }
        });
    }
    
    // Accessories spawn
    if (accessorySelect) {
        accessorySelect.addEventListener('change', (e) => {
            const type = e.target.value;
            if (type && window.accessorySystem) {
                window.accessorySystem.spawnAccessory(type);
                console.log('🎨 Spawned:', type);
                // Reset dropdown
                e.target.value = '';
            }
        });
    }
    
    // Clear all accessories
    if (clearAccessoriesBtn) {
        clearAccessoriesBtn.addEventListener('click', () => {
            if (window.accessorySystem) {
                window.accessorySystem.clearAll();
                console.log('🗑️ Cleared all accessories');
            }
        });
    }
}

async function startPerformance() {
    console.log('🎬 startPerformance() called');
    console.log('🎭 wayang3D exists?', !!wayang3D);
    console.log('🎭 wayang3D.loadWayang exists?', typeof wayang3D?.loadWayang);
    
    // Check if wayang3D is initialized
    if (!wayang3D) {
        alert('Error: Wayang3D not initialized! Refresh the page.');
        return;
    }
    
    // Show loading
    const loading = document.getElementById('loadingOverlay');
    loading.classList.add('active');
    
    try {
        // Initialize hand tracking
        const videoElement = document.getElementById('cameraFeed');
        const handOverlay = document.getElementById('handOverlay');
        
        handOverlay.width = window.innerWidth;
        handOverlay.height = window.innerHeight;
        
        handTracker = new HandTracker();
        const success = await handTracker.init(videoElement, (hands) => {
            // Update wayang position from hands
            wayang3D.updateFromHands(hands);
            
            // Draw hand overlay
            handTracker.drawHands(handOverlay);
        });
        
        if (!success) {
            loading.classList.remove('active');
            return;
        }
        
        // Load wayang
        await wayang3D.loadWayang(selectedCharacter);
        
        // Hide picker, show Tambah Wayang button
        document.getElementById('characterPicker').classList.remove('active');
        const changeBtn = document.getElementById('changeWayangBtn');
        if (changeBtn) {
            changeBtn.style.display = 'block'; // Show "Tambah Wayang" button
        }
        
        // Play gong!
        gamelanSound.playGong();
        
        // Start ambient music
        ambientMusic = gamelanSound.playAmbient();
        
        loading.classList.remove('active');
        
        console.log('✅ Performance started!');
    } catch (error) {
        console.error('❌ Error starting performance:', error);
        alert('Gagal memulai pertunjukan!\n' + error.message);
        loading.classList.remove('active');
    }
}

function showCharacterPicker() {
    document.getElementById('characterPicker').classList.add('active');
    
    // Stop ambient music
    if (ambientMusic) {
        clearInterval(ambientMusic);
        ambientMusic = null;
    }
}

// Handle window focus (resume camera)
window.addEventListener('focus', () => {
    if (handTracker && handTracker.camera) {
        handTracker.camera.start();
    }
});

// Keyboard shortcuts for wayang switching
document.addEventListener('keydown', (e) => {
    console.log('🎹 Key pressed:', e.key, 'wayang3D exists?', !!window.wayang3D); // DEBUG!
    
    const wayang = window.wayang3D || wayang3D;
    
    if (wayang && wayang.wayangs && wayang.wayangs.length > 0) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= wayang.wayangs.length) {
            wayang.selectWayang(key - 1);
        }
    }
    
    // M key to toggle mode (ALWAYS WORKS!)
    if (e.key.toLowerCase() === 'm') {
        console.log('🎮 M pressed! wayang3D:', !!window.wayang3D);
        const wayang = window.wayang3D || wayang3D;
        if (wayang && typeof wayang.toggleMode === 'function') {
            console.log('✅ Calling toggleMode()...');
            wayang.toggleMode();
        } else {
            console.error('❌ toggleMode not found! wayang:', wayang);
            alert('ERROR: wayang3D not initialized yet! Start the show first.');
        }
    }
});
