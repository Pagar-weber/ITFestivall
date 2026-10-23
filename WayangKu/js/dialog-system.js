// Dialog System - RPG-style dialog box (inspired by Pokemon/classic RPG)
class DialogSystem {
    constructor() {
        this.activeWayang = null;
        this.isDialogOpen = false;
        this.createRPGDialogBox();
        this.setupKeyboardShortcuts();
    }

    createRPGDialogBox() {
        // RPG Dialog Box (hidden by default)
        const dialogBox = document.createElement('div');
        dialogBox.id = 'rpgDialogBox';
        dialogBox.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            width: 90%;
            max-width: 1000px;
            background: linear-gradient(135deg, rgba(40, 20, 60, 0.98) 0%, rgba(30, 15, 45, 0.98) 100%);
            border: 4px solid #fff;
            border-radius: 16px;
            padding: 0;
            display: none;
            z-index: 2000;
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
        `;

        // Inner container (flex: portrait + text)
        const innerContainer = document.createElement('div');
        innerContainer.style.cssText = `
            display: flex;
            gap: 0;
            height: 180px;
        `;

        // Left: Portrait area (WAYANG PHOTO)
        const portraitArea = document.createElement('div');
        portraitArea.id = 'dialogPortrait';
        portraitArea.style.cssText = `
            width: 180px;
            height: 180px;
            background: linear-gradient(135deg, rgba(20, 10, 30, 0.9) 0%, rgba(10, 5, 15, 0.9) 100%);
            border-right: 3px solid #fff;
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            border-radius: 12px 0 0 12px;
        `;
        portraitArea.style.backgroundImage = 'url(assets/gajah-mada.jpg)'; // Default wayang photo

        // Right: Text area
        const textArea = document.createElement('div');
        textArea.style.cssText = `
            flex: 1;
            padding: 20px 24px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        `;

        // Speaker name
        const speakerName = document.createElement('div');
        speakerName.id = 'dialogSpeakerName';
        speakerName.style.cssText = `
            font-size: 18px;
            font-weight: 700;
            color: #FFD700;
            font-family: 'Inter', sans-serif;
            margin-bottom: 4px;
        `;
        speakerName.textContent = 'Gajah Mada';

        // Dialog text display
        const dialogText = document.createElement('div');
        dialogText.id = 'dialogText';
        dialogText.style.cssText = `
            font-size: 20px;
            font-weight: 600;
            color: #fff;
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            flex: 1;
            overflow-y: auto;
        `;
        dialogText.textContent = 'Tekan T atau Enter untuk bicara...';

        // Input area (bottom of text area)
        const inputArea = document.createElement('div');
        inputArea.style.cssText = `
            display: flex;
            gap: 12px;
            padding-top: 12px;
            border-top: 2px solid rgba(255, 255, 255, 0.2);
        `;

        // Input field
        const input = document.createElement('input');
        input.type = 'text';
        input.id = 'rpgDialogInput';
        input.placeholder = 'Ketik dialog...';
        input.style.cssText = `
            flex: 1;
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            color: #fff;
            font-size: 16px;
            font-family: 'Inter', sans-serif;
            outline: none;
        `;

        // Send button
        const sendBtn = document.createElement('button');
        sendBtn.id = 'rpgSendBtn';
        sendBtn.textContent = '💬 Bicara';
        sendBtn.style.cssText = `
            padding: 10px 24px;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            border: none;
            border-radius: 8px;
            color: #000;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Inter', sans-serif;
        `;

        sendBtn.addEventListener('mouseenter', () => {
            sendBtn.style.transform = 'translateY(-2px)';
            sendBtn.style.boxShadow = '0 4px 12px rgba(255, 215, 0, 0.5)';
        });

        sendBtn.addEventListener('mouseleave', () => {
            sendBtn.style.transform = 'translateY(0)';
            sendBtn.style.boxShadow = 'none';
        });

        // Assemble
        inputArea.appendChild(input);
        inputArea.appendChild(sendBtn);
        
        textArea.appendChild(speakerName);
        textArea.appendChild(dialogText);
        textArea.appendChild(inputArea);
        
        innerContainer.appendChild(portraitArea);
        innerContainer.appendChild(textArea);
        
        dialogBox.appendChild(innerContainer);
        document.body.appendChild(dialogBox);

        // Event listeners
        sendBtn.addEventListener('click', () => this.sendDialog());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendDialog();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // T or Enter to open dialog (when not already typing)
            if ((e.key === 't' || e.key === 'T' || e.key === 'Enter') && !this.isDialogOpen) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    this.openDialog();
                }
            }
            
            // ESC to close dialog
            if (e.key === 'Escape' && this.isDialogOpen) {
                this.closeDialog();
            }
        });
    }

    openDialog() {
        const dialogBox = document.getElementById('rpgDialogBox');
        if (!dialogBox) return;

        // Get current selected wayang
        const wayangs = window.wayang3D?.wayangs || [];
        const selectedIndex = window.wayang3D?.selectedWayangIndex || 0;
        
        if (wayangs.length === 0) {
            alert('Spawn wayang dulu!');
            return;
        }

        this.activeWayang = wayangs[selectedIndex];
        
        // Update portrait & name
        this.updateSpeaker(this.activeWayang);

        // Show dialog box
        dialogBox.style.display = 'block';
        this.isDialogOpen = true;

        // Focus input
        const input = document.getElementById('rpgDialogInput');
        if (input) {
            setTimeout(() => input.focus(), 100);
        }

        // Clear text display
        document.getElementById('dialogText').textContent = '';
    }

    closeDialog() {
        const dialogBox = document.getElementById('rpgDialogBox');
        if (dialogBox) {
            dialogBox.style.display = 'none';
        }
        this.isDialogOpen = false;
    }

    updateSpeaker(wayang) {
        const portrait = document.getElementById('dialogPortrait');
        const speakerName = document.getElementById('dialogSpeakerName');

        if (!portrait || !speakerName || !wayang) return;

        const nameMap = {
            'gajah-mada': 'Gajah Mada',
            'gatotkaca': 'Gatotkaca',
            'arjuna': 'Arjuna',
            'hang-tuah': 'Hang Tuah',
            'nyi-roro-kidul': 'Nyi Roro Kidul',
            'ken-arok': 'Ken Arok',
            'si-pitung': 'Si Pitung',
            'roro-jonggrang': 'Roro Jonggrang',
            'bima': 'Bima'
        };

        // Set wayang photo as background (NO EMOJI!)
        portrait.style.backgroundImage = `url(assets/${wayang.id}.jpg)`;
        portrait.textContent = ''; // Clear emoji
        speakerName.textContent = nameMap[wayang.id] || wayang.id;
    }

    sendDialog() {
        const input = document.getElementById('rpgDialogInput');
        const dialogText = document.getElementById('dialogText');
        
        const text = input.value.trim();
        if (!text) return;

        // Display in dialog box
        if (dialogText) {
            dialogText.textContent = text;
        }

        // Clear input
        input.value = '';

        // Play sound
        if (window.gamelanSound) {
            window.gamelanSound.playSaron(Math.floor(Math.random() * 5));
        }

        // Auto-close after 3 seconds
        setTimeout(() => {
            if (dialogText.textContent === text) {
                this.closeDialog();
            }
        }, 3000);
    }

    // Called when wayang selection changes (1-6 keys)
    updateSpeakerList(wayangs) {
        // RPG style doesn't need dropdown - uses selected wayang automatically
        console.log('📋 Speaker list updated:', wayangs.length, 'wayangs');
    }

    // Called every frame to update dialog positions (compatibility function)
    updateAllDialogPositions() {
        // RPG style dialog is fixed at bottom - no position updates needed
        // This function exists for compatibility with wayang-3d.js animation loop
    }
}

// Export
window.DialogSystem = DialogSystem;
