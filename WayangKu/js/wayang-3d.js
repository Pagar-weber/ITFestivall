// Wayang 3D Engine - Multiple Wayang Support
class Wayang3D {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.wayangs = []; // Array of wayang objects
        this.selectedWayangIndex = 0;
        this.assetLoader = new AssetLoader();
        this.isGrabbing = false; // Grab state
        this.lastPinchState = false;
        this.isDualMode = false; // NEW: Single or Dual control mode
        
        this.init();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x1a0f00, 0.015);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 12); // CLOSER! Was 15, now 12
        
        console.log('📷 Camera position:', this.camera.position);
        this.camera.lookAt(0, 0, 0); // Look at center!

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('wayangCanvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Kelir Screen (Backlit)
        this.createKelirScreen();

        // Dramatic Lighting (Blencong-style)
        this.createLighting();

        // Particles (Incense smoke effect)
        this.createParticles();

        // Handle resize
        window.addEventListener('resize', () => this.onResize());

        // Start animation
        this.animate();
    }

    createKelirScreen() {
        // Large glowing screen behind wayang - NO GOLDEN GLOW
        const geometry = new THREE.PlaneGeometry(30, 20);
        const material = new THREE.MeshBasicMaterial({
            color: 0xFFF8E7,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const screen = new THREE.Mesh(geometry, material);
        screen.position.z = -5;
        this.scene.add(screen);
    }

    createLighting() {
        // Ambient (dim)
        const ambient = new THREE.AmbientLight(0x4a2a0a, 0.3);
        this.scene.add(ambient);

        // Main backlight (Blencong - traditional oil lamp)
        const backlight = new THREE.PointLight(0xFFD700, 1.5, 50);
        backlight.position.set(0, 5, -8);
        backlight.castShadow = true;
        this.scene.add(backlight);

        // Front rim light (to show silhouette edges)
        const rimLight = new THREE.DirectionalLight(0xFF9933, 0.4);
        rimLight.position.set(-5, 3, 8);
        this.scene.add(rimLight);

        // Spotlight from above (mystical)
        const spotlight = new THREE.SpotLight(0xFFAA33, 0.8);
        spotlight.position.set(0, 15, 5);
        spotlight.angle = Math.PI / 4;
        spotlight.penumbra = 0.5;
        spotlight.castShadow = true;
        this.scene.add(spotlight);
    }

    createParticles() {
        // DISABLED - Too distracting!
        // Particles commented out for cleaner view
        /*
        const particleCount = 150;
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xFFD700,
            size: 0.15,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
        */
        this.particles = null; // No particles!
    }

    async loadWayang(characterId) {
        console.log('🎭 Loading wayang:', characterId);
        
        // Load texture with transparent background
        const texture = await this.assetLoader.loadWayangTexture(characterId);

        // Create wayang mesh (large, ornate)
        const aspect = texture.image.width / texture.image.height;
        const height = 8; // 8 meters tall
        const width = height * aspect;

        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            side: THREE.DoubleSide,
            metalness: 0.3,
            roughness: 0.7,
            alphaTest: 0.1,
            depthTest: true,
            depthWrite: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Spawn at DIFFERENT positions (no overlap!)
        const existingCount = this.wayangs.length;
        const spawnX = -8 + (existingCount * 4); // Spread out: -8, -4, 0, +4, +8...
        const spawnZ = 0; // FRONT! No depth offset
        const spawnY = 0; // CENTER screen!
        mesh.position.set(spawnX, spawnY, spawnZ);
        mesh.castShadow = true;
        
        console.log(`🎭 Wayang spawned at:`, {x: spawnX, y: spawnY, z: spawnZ, scale: {w: width, h: height}});

        // NO RODS! Removed completely!

        // Add to scene
        this.scene.add(mesh);
        
        // Store wayang object
        const wayangObj = {
            id: characterId,
            mesh: mesh,
            controlRods: [], // Empty array, no rods!
            targetPosition: new THREE.Vector3().copy(mesh.position),
            currentPosition: new THREE.Vector3().copy(mesh.position)
        };
        
        this.wayangs.push(wayangObj);
        this.selectedWayangIndex = this.wayangs.length - 1;

        console.log(`✅ Wayang loaded! Total: ${this.wayangs.length}`);
        
        // Update selector UI
        this.updateWayangSelector();
        
        // Update dialog system speaker list
        if (window.dialogSystem) {
            window.dialogSystem.updateSpeakerList(this.wayangs);
        }
        
        return true;
    }

    createControlRods(position) {
        const rodGeometry = new THREE.CylinderGeometry(0.05, 0.05, 6, 8);
        const rodMaterial = new THREE.MeshStandardMaterial({
            color: 0x8B4513,
            metalness: 0.2,
            roughness: 0.8,
            transparent: true,
            opacity: 0.3 // Semi-transparent!
        });

        const leftRod = new THREE.Mesh(rodGeometry, rodMaterial);
        // Position FAR behind wayang (Z-axis negative = behind)
        leftRod.position.set(position.x - 1.5, position.y - 3, position.z - 5);
        leftRod.rotation.z = Math.PI / 6;
        this.scene.add(leftRod);

        const rightRod = new THREE.Mesh(rodGeometry, rodMaterial);
        // Position FAR behind wayang (Z-axis negative = behind)
        rightRod.position.set(position.x + 1.5, position.y - 3, position.z - 5);
        rightRod.rotation.z = -Math.PI / 6;
        this.scene.add(rightRod);

        return [leftRod, rightRod];
    }

    changeBackground(theme) {
        console.log('🎨 Changing background to:', theme);
        
        const kelirScreen = document.getElementById('kelirScreen');
        if (!kelirScreen) return;
        
        const themes = {
            'kelir': { fog: 0x2d1810, lights: 0xFFD700, gradient: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, rgba(45, 24, 16, 0.9) 100%)' },
            'night': { fog: 0x1a0a2e, lights: 0x9d84b7, gradient: 'radial-gradient(ellipse at center, rgba(157, 132, 183, 0.3) 0%, rgba(26, 10, 46, 0.9) 100%)' },
            'gold': { fog: 0x3d2817, lights: 0xffaa00, gradient: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.4) 0%, rgba(61, 40, 23, 0.9) 100%)' },
            'forest': { fog: 0x1b3a1b, lights: 0x7CB342, gradient: 'radial-gradient(ellipse at center, rgba(124, 179, 66, 0.3) 0%, rgba(27, 58, 27, 0.9) 100%)' },
            'ocean': { fog: 0x0a2540, lights: 0x2196F3, gradient: 'radial-gradient(ellipse at center, rgba(33, 150, 243, 0.3) 0%, rgba(10, 37, 64, 0.9) 100%)' },
            'volcano': { fog: 0x3e1f1f, lights: 0xFF5722, gradient: 'radial-gradient(ellipse at center, rgba(255, 87, 34, 0.4) 0%, rgba(62, 31, 31, 0.9) 100%)' },
            'heaven': { fog: 0xe3f2fd, lights: 0xFFFFFF, gradient: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.5) 0%, rgba(227, 242, 253, 0.9) 100%)' },
            'hell': { fog: 0x1a0000, lights: 0xFF0000, gradient: 'radial-gradient(ellipse at center, rgba(255, 0, 0, 0.4) 0%, rgba(26, 0, 0, 0.9) 100%)' },
            'palace': { fog: 0x4a2c2a, lights: 0xFFD700, gradient: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.4) 0%, rgba(74, 44, 42, 0.9) 100%)' },
            'sunset': { fog: 0x4a2c2a, lights: 0xFF9800, gradient: 'radial-gradient(ellipse at center, rgba(255, 152, 0, 0.4) 0%, rgba(74, 44, 42, 0.9) 100%)' }
        };
        
        const selected = themes[theme] || themes['kelir'];
        
        // Change scene fog and background
        this.scene.fog.color.setHex(selected.fog);
        this.scene.background = new THREE.Color(selected.fog);
        
        // Adjust lights
        this.scene.children.forEach(child => {
            if (child.isLight && child.color) {
                child.color.setHex(selected.lights);
            }
        });
        
        // Update kelir screen
        kelirScreen.style.background = selected.gradient;
        
        console.log('✅ Background changed!');
    }

    selectWayang(index) {
        if (index >= 0 && index < this.wayangs.length) {
            // NO VISUAL GLOW - just switch!
            this.selectedWayangIndex = index;
            
            console.log(`🎯 Selected wayang ${index + 1}/${this.wayangs.length}`);
            
            // Update UI
            this.updateWayangSelector();
            
            // Play sound
            if (window.gamelanSound) {
                window.gamelanSound.playSaron(index);
            }
        }
    }

    async deleteWayang(index) {
        if (index < 0 || index >= this.wayangs.length) return;
        
        const wayang = this.wayangs[index];
        
        // Custom confirmation modal
        const confirmed = await window.confirmModal.show(
            `Wayang "${this.getWayangName(wayang.id)}" akan dihapus secara permanen.`,
            'Hapus Wayang?'
        );
        
        if (!confirmed) return;
        
        console.log('🗑️ Deleting wayang:', wayang.id);
        
        // Remove from scene
        this.scene.remove(wayang.mesh);
        
        // Remove from array
        this.wayangs.splice(index, 1);
        
        // Adjust selected index if needed
        if (this.selectedWayangIndex >= this.wayangs.length) {
            this.selectedWayangIndex = Math.max(0, this.wayangs.length - 1);
        }
        
        // Update UI
        this.updateWayangSelector();
        
        // Update dialog system speaker list
        if (window.dialogSystem) {
            window.dialogSystem.updateSpeakerList(this.wayangs);
        }
        
        // Play sound
        if (window.gamelanSound) {
            window.gamelanSound.playKendang();
        }
        
        console.log(`✅ Wayang deleted! Remaining: ${this.wayangs.length}`);
    }

    getWayangName(id) {
        const names = {
            'gajah-mada': 'Gajah Mada',
            'gatotkaca': 'Gatotkaca',
            'arjuna': 'Arjuna',
            'hang-tuah': 'Hang Tuah',
            'nyi-roro-kidul': 'Nyi Roro Kidul',
            'ken-arok': 'Ken Arok'
        };
        return names[id] || id;
    }

    updateWayangSelector() {
        const container = document.getElementById('wayangThumbs');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.wayangs.forEach((wayang, index) => {
            const thumb = document.createElement('div');
            thumb.className = 'wayang-thumb';
            thumb.dataset.index = index + 1;
            
            // Get icon from character
            const iconMap = {
                'gajah-mada': '⚔️',
                'gatotkaca': '🦅',
                'arjuna': '🎯',
                'hang-tuah': '🗡️',
                'nyi-roro-kidul': '🌊',
                'ken-arok': '👑'
            };
            
            // Use wayang image as thumbnail background
            thumb.style.backgroundImage = `url(assets/${wayang.id}.jpg), url(assets/${wayang.id}.png)`;
            thumb.style.backgroundSize = 'cover';
            thumb.style.backgroundPosition = 'center';
            thumb.style.backgroundRepeat = 'no-repeat';
            
            // Add number badge
            const badge = document.createElement('div');
            badge.style.cssText = `
                position: absolute;
                bottom: 2px;
                right: 2px;
                background: rgba(255, 215, 0, 0.9);
                color: #000;
                width: 18px;
                height: 18px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-weight: 700;
                font-family: 'Inter', sans-serif;
            `;
            badge.textContent = index + 1;
            thumb.appendChild(badge);
            
            if (index === this.selectedWayangIndex) {
                thumb.classList.add('active');
            }
            
            // Click to select (but not if clicking delete button)
            thumb.addEventListener('click', (e) => {
                // Don't trigger if clicking delete button
                if (!e.target.classList.contains('delete-wayang-btn')) {
                    this.selectWayang(index);
                }
            });
            
            // DELETE BUTTON (X) - top-right corner
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-wayang-btn';
            deleteBtn.innerHTML = '✕';
            deleteBtn.title = 'Hapus wayang';
            deleteBtn.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
                color: #fff;
                border: 2px solid #fff;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
                opacity: 0;
            `;
            
            // Show delete button on hover
            thumb.addEventListener('mouseenter', () => {
                deleteBtn.style.opacity = '1';
            });
            
            thumb.addEventListener('mouseleave', () => {
                deleteBtn.style.opacity = '0';
            });
            
            // Delete wayang on click
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Don't trigger thumb click
                this.deleteWayang(index);
            });
            
            thumb.appendChild(deleteBtn);
            container.appendChild(thumb);
        });
    }

    updateFromHands(hands) {
        if (this.wayangs.length === 0 || hands.length === 0) {
            return;
        }

        // SIMPLE AUTO-DETECT!
        // 1 hand = control selected wayang only
        // 2 hands = left hand controls selected, right hand controls next
        
        if (hands.length === 1) {
            // SINGLE HAND MODE
            const mainHand = hands[0];
            
            // Update debug
            const gestureText = document.getElementById('gestureText');
            if (gestureText) {
                gestureText.textContent = mainHand.gesture.toUpperCase();
                gestureText.style.color = mainHand.gesture === 'point' ? '#00FF00' : 
                                          mainHand.gesture === 'pinch' ? '#00FFFF' :
                                          mainHand.gesture === 'peace' ? '#FF00FF' :
                                          mainHand.gesture === 'open' ? '#FFFF00' : '#FFFFFF';
            }
            
            const modeText = document.getElementById('modeText');
            if (modeText) {
                modeText.textContent = '1 TANGAN';
                modeText.style.color = '#FFD700';
            }

            const selectedWayang = this.wayangs[this.selectedWayangIndex];
            if (!selectedWayang) return;

            this.controlWayang(selectedWayang, mainHand);
            
        } else if (hands.length >= 2) {
            // DUAL HAND MODE (AUTOMATIC!)
            const leftHand = hands.find(h => h.type === 'Left');
            const rightHand = hands.find(h => h.type === 'Right');

            // Update debug
            const gestureText = document.getElementById('gestureText');
            if (gestureText) {
                const leftG = leftHand ? leftHand.gesture.toUpperCase() : '-';
                const rightG = rightHand ? rightHand.gesture.toUpperCase() : '-';
                gestureText.textContent = `L:${leftG} | R:${rightG}`;
            }
            
            const modeText = document.getElementById('modeText');
            if (modeText) {
                modeText.textContent = '2 TANGAN';
                modeText.style.color = '#00FF00';
            }

            // Left hand controls selected wayang
            if (leftHand && this.wayangs[this.selectedWayangIndex]) {
                this.controlWayang(this.wayangs[this.selectedWayangIndex], leftHand);
            }

            // Right hand controls next wayang
            const nextIndex = (this.selectedWayangIndex + 1) % this.wayangs.length;
            if (rightHand && this.wayangs[nextIndex]) {
                this.controlWayang(this.wayangs[nextIndex], rightHand);
            }
        }
    }

    controlWayang(wayang, hand) {
        // Initialize wayang state if not exists
        if (wayang.lastPinchState === undefined) {
            wayang.lastPinchState = false;
            wayang.isGrabbing = false;
        }
        
        // GRAB/RELEASE SYSTEM with Pinch
        const isPinching = hand.gesture === 'pinch';
        
        // Detect pinch START (grab)
        if (isPinching && !wayang.lastPinchState) {
            wayang.isGrabbing = true;
            console.log('🤏 GRABBED wayang!');
            if (window.gamelanSound) {
                window.gamelanSound.playKendang();
            }
        }
        
        // Detect pinch END (release)
        if (!isPinching && wayang.lastPinchState) {
            wayang.isGrabbing = false;
            console.log('✋ RELEASED wayang!');
            if (window.gamelanSound) {
                window.gamelanSound.playSaron(2);
            }
        }
        
        wayang.lastPinchState = isPinching;

        // ONLY MOVE if grabbed!
        if (wayang.isGrabbing) {
            // Map hand position to 3D space
            const x = (hand.position.x - 0.5) * 20;
            const y = (0.5 - hand.position.y) * 15 + 3;
            const z = hand.position.z * 5;

            wayang.targetPosition.set(x, y, z);

            // Smooth follow
            wayang.currentPosition.lerp(wayang.targetPosition, 0.15);
            wayang.mesh.position.copy(wayang.currentPosition);

            // MANUAL ROTATION - Z axis (muter) based on hand twist
            const handRotation = hand.position.z * 0.5;
            wayang.mesh.rotation.z = THREE.MathUtils.lerp(
                wayang.mesh.rotation.z,
                handRotation,
                0.1
            );
            
            // X-axis tilt (Subtle up/down look)
            wayang.mesh.rotation.x = (y - 3) * 0.02;

            // NO RODS TO UPDATE!
        }

        // Y-AXIS ROTATION - ALWAYS ACTIVE WITH POINT! (Not only when grabbed!)
        if (hand.gesture === 'point') {
            // POINT (👉) = Full 3D Rotation mode!
            // Y-axis: Hand X position controls left/right rotation (madep kiri/kanan)
            const rotationY = (hand.position.x - 0.5) * Math.PI * 4; // Full 360° range (-2PI to +2PI)
            wayang.mesh.rotation.y = THREE.MathUtils.lerp(
                wayang.mesh.rotation.y,
                rotationY,
                0.2
            );
            
            // X-axis: Hand Y position controls forward/backward tilt (depan/belakang)
            // Invert Y because hand tracking Y is inverted (0=top, 1=bottom)
            const rotationX = (0.5 - hand.position.y) * Math.PI; // ±180° tilt range
            wayang.mesh.rotation.x = THREE.MathUtils.lerp(
                wayang.mesh.rotation.x,
                rotationX,
                0.2
            );
        }

        // Gesture effects (always active)
        if (hand.gesture === 'peace') {
            // PEACE = Special power per character!
            this.triggerSpecialPower(wayang);
        }
        if (hand.gesture === 'open') {
            wayang.mesh.scale.setScalar(1.2); // Grow
        } else {
            // ALWAYS restore scale when not open
            if (wayang.mesh.scale.x !== 1.0) {
                wayang.mesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }
        }
    }

    triggerSpecialPower(wayang) {
        // Prevent spam - debounce
        const now = Date.now();
        if (wayang.lastPowerTime && (now - wayang.lastPowerTime) < 500) {
            return; // Too soon!
        }
        wayang.lastPowerTime = now;
        
        // FORCE RESET FIRST to prevent stuck colors!
        wayang.mesh.material.emissive = new THREE.Color(0x000000);
        wayang.mesh.material.emissiveIntensity = 0;
        
        const characterPowers = {
            'gajah-mada': () => {
                // ⚔️ Gajah Mada: Sword strike (flash red + quick scale pulse)
                const original = { 
                    color: wayang.mesh.material.emissive.clone(), 
                    intensity: wayang.mesh.material.emissiveIntensity,
                    scale: wayang.mesh.scale.clone()
                };
                
                wayang.mesh.material.emissive = new THREE.Color(0xFF0000);
                wayang.mesh.material.emissiveIntensity = 0.8;
                wayang.mesh.scale.setScalar(1.15); // Pulse bigger
                
                setTimeout(() => {
                    wayang.mesh.material.emissive = original.color;
                    wayang.mesh.material.emissiveIntensity = original.intensity;
                    wayang.mesh.scale.copy(original.scale);
                }, 250);
                
                if (window.gamelanSound) window.gamelanSound.playKendang();
            },
            'gatotkaca': () => {
                // 🦅 Gatotkaca: Fly up (smooth arc trajectory)
                const startY = wayang.mesh.position.y;
                const peakY = startY + 3;
                const duration = 800;
                const startTime = Date.now();
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    
                    // Smooth ease-in-out
                    const eased = progress < 0.5 
                        ? 2 * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    
                    wayang.mesh.position.y = startY + (peakY - startY) * Math.sin(eased * Math.PI);
                    
                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        wayang.targetPosition.y = startY;
                    }
                };
                
                animate();
                if (window.gamelanSound) window.gamelanSound.playSaron(4);
            },
            'arjuna': () => {
                // 🎯 Arjuna: Arrow shot (flash cyan + quick forward dash)
                const original = { 
                    color: wayang.mesh.material.emissive.clone(), 
                    intensity: wayang.mesh.material.emissiveIntensity 
                };
                
                wayang.mesh.material.emissive = new THREE.Color(0x00FFFF);
                wayang.mesh.material.emissiveIntensity = 1.0;
                
                // Quick forward dash (arrow release)
                const originalZ = wayang.mesh.position.z;
                wayang.mesh.position.z += 0.5;
                
                setTimeout(() => {
                    wayang.mesh.position.z = originalZ;
                    wayang.mesh.material.emissive = original.color;
                    wayang.mesh.material.emissiveIntensity = original.intensity;
                }, 180);
                
                if (window.gamelanSound) window.gamelanSound.playSaron(3);
            },
            'hang-tuah': () => {
                // 🗡️ Hang Tuah: Wave slash (horizontal swipe + flash)
                const original = { color: wayang.mesh.material.emissive.clone(), intensity: wayang.mesh.material.emissiveIntensity };
                
                // Flash cyan (water blade)
                wayang.mesh.material.emissive = new THREE.Color(0x00FFFF);
                wayang.mesh.material.emissiveIntensity = 1.0;
                
                // Quick horizontal movement (slash effect)
                const originalX = wayang.mesh.position.x;
                wayang.mesh.position.x += 1.5; // Slash right
                
                setTimeout(() => {
                    wayang.mesh.position.x = originalX; // Return
                    wayang.mesh.material.emissive = original.color;
                    wayang.mesh.material.emissiveIntensity = original.intensity;
                }, 200);
                
                if (window.gamelanSound) window.gamelanSound.playKendang();
            },
            'nyi-roro-kidul': () => {
                // 🌊 Nyi Roro Kidul: Wave (smooth scale pulse + blue glow)
                
                // Smooth wave pulse
                const duration = 600;
                const startTime = Date.now();
                const startScale = 1.0; // Force start from 1.0
                
                // Set initial blue
                wayang.mesh.material.emissive = new THREE.Color(0x0066FF);
                wayang.mesh.material.emissiveIntensity = 0.9;
                
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        const scale = startScale + Math.sin(progress * Math.PI) * 0.3;
                        wayang.mesh.scale.setScalar(scale);
                        requestAnimationFrame(animate);
                    } else {
                        // FORCE RESET AT END
                        wayang.mesh.scale.setScalar(1.0);
                        wayang.mesh.material.emissive = new THREE.Color(0x000000);
                        wayang.mesh.material.emissiveIntensity = 0;
                    }
                };
                
                animate();
                if (window.gamelanSound) window.gamelanSound.playGong();
            },
            'ken-arok': () => {
                // 👑 Ken Arok: Royal power (gold burst + scale explosion)
                const original = { 
                    color: wayang.mesh.material.emissive.clone(), 
                    intensity: wayang.mesh.material.emissiveIntensity 
                };
                
                wayang.mesh.material.emissive = new THREE.Color(0xFFFF00);
                wayang.mesh.material.emissiveIntensity = 1.2;
                
                // Explosive scale
                wayang.mesh.scale.setScalar(1.4);
                
                setTimeout(() => {
                    wayang.mesh.scale.setScalar(1.0);
                    wayang.mesh.material.emissive = original.color;
                    wayang.mesh.material.emissiveIntensity = original.intensity;
                }, 300);
                
                if (window.gamelanSound) window.gamelanSound.playSaron(0);
            }
        };

        const power = characterPowers[wayang.id];
        if (power) {
            power();
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update dialog positions
        if (window.dialogSystem) {
            window.dialogSystem.updateAllDialogPositions();
        }

        // Animate particles (smoke rising)
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += 0.02; // Rise
                if (positions[i + 1] > 25) {
                    positions[i + 1] = 0; // Reset to bottom
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.rotation.y += 0.001;
        }

        this.renderer.render(this.scene, this.camera);
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Export
window.Wayang3D = Wayang3D;
