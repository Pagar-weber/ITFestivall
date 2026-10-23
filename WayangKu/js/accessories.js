// Stage Accessories System - Props untuk stage wayang
class AccessorySystem {
    constructor(scene) {
        this.scene = scene;
        this.accessories = [];
        this.selectedAccessory = null;
        
        this.accessoryTypes = {
            'rumput': { icon: '🌾', name: 'Rumput', color: 0x7CB342 },
            'pohon': { icon: '🌳', name: 'Pohon', color: 0x558B2F },
            'gunung': { icon: '⛰️', name: 'Gunung', color: 0x5D4037 },
            'istana': { icon: '🏰', name: 'Istana', color: 0xFFD700 },
            'awan': { icon: '☁️', name: 'Awan', color: 0xECEFF1 },
            'batu': { icon: '🪨', name: 'Batu', color: 0x78909C },
            'api': { icon: '🔥', name: 'Api', color: 0xFF5722 },
            'air': { icon: '💧', name: 'Air', color: 0x2196F3 },
            'bulan': { icon: '🌙', name: 'Bulan', color: 0xFFF9C4 },
            'matahari': { icon: '☀️', name: 'Matahari', color: 0xFFC107 }
        };
        
        this.createUI();
    }

    createUI() {
        // Accessory panel (top-right, below settings)
        const panel = document.createElement('div');
        panel.id = 'accessoryPanel';
        panel.style.cssText = `
            position: fixed;
            top: 250px;
            right: 20px;
            background: linear-gradient(135deg, rgba(20, 20, 20, 0.95) 0%, rgba(40, 40, 40, 0.95) 100%);
            backdrop-filter: blur(10px);
            border: 2px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 12px;
            z-index: 840;
            max-width: 160px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        `;

        // Title
        const title = document.createElement('div');
        title.style.cssText = `
            color: #FFD700;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 10px;
            font-family: 'Inter', sans-serif;
        `;
        title.innerHTML = '🎨 AKSESORIS';

        // Accessory grid
        const grid = document.createElement('div');
        grid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 6px;
        `;

        Object.keys(this.accessoryTypes).forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'accessory-btn';
            btn.dataset.type = type;
            btn.innerHTML = this.accessoryTypes[type].icon;
            btn.title = this.accessoryTypes[type].name;
            btn.style.cssText = `
                width: 26px;
                height: 26px;
                background: rgba(255, 215, 0, 0.1);
                border: 1px solid rgba(255, 215, 0, 0.3);
                border-radius: 6px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            `;

            btn.addEventListener('mouseenter', () => {
                btn.style.background = 'rgba(255, 215, 0, 0.3)';
                btn.style.transform = 'scale(1.1)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.background = 'rgba(255, 215, 0, 0.1)';
                btn.style.transform = 'scale(1)';
            });

            btn.addEventListener('click', () => {
                this.spawnAccessory(type);
            });

            grid.appendChild(btn);
        });

        // Clear all button
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '🗑️ Clear';
        clearBtn.style.cssText = `
            width: 100%;
            margin-top: 8px;
            padding: 6px;
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
            border: none;
            border-radius: 6px;
            color: #fff;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
        `;

        clearBtn.addEventListener('click', () => {
            this.clearAll();
        });

        panel.appendChild(title);
        panel.appendChild(grid);
        panel.appendChild(clearBtn);

        document.body.appendChild(panel);
    }

    spawnAccessory(type) {
        const config = this.accessoryTypes[type];
        
        // Create 3D object based on type with SMART POSITIONING
        let mesh;
        let autoPosition = { x: 0, y: 0, z: -3 }; // Default
        
        switch(type) {
            case 'rumput':
                // Grass at bottom (ground level)
                const grassGroup = new THREE.Group();
                for (let i = 0; i < 30; i++) {
                    const blade = new THREE.Mesh(
                        new THREE.ConeGeometry(0.05, 0.8, 4),
                        new THREE.MeshPhongMaterial({ color: config.color })
                    );
                    blade.position.x = (Math.random() - 0.5) * 20; // Spread across width
                    blade.position.z = (Math.random() - 0.5) * 2;
                    blade.rotation.z = (Math.random() - 0.5) * 0.3;
                    grassGroup.add(blade);
                }
                mesh = grassGroup;
                autoPosition = { x: 0, y: -4, z: -2 }; // Bottom ground
                break;
                
            case 'pohon':
                // Tree at ground level
                const treeGroup = new THREE.Group();
                const trunk = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.3, 0.4, 3, 8),
                    new THREE.MeshPhongMaterial({ color: 0x5D4037 })
                );
                trunk.position.y = 1.5;
                const leaves = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5, 8, 8),
                    new THREE.MeshPhongMaterial({ color: config.color })
                );
                leaves.position.y = 3.5;
                treeGroup.add(trunk);
                treeGroup.add(leaves);
                mesh = treeGroup;
                autoPosition = { x: (Math.random() - 0.5) * 16, y: -2, z: -4 }; // Side ground
                break;
                
            case 'gunung':
                // Mountain at back
                mesh = new THREE.Mesh(
                    new THREE.ConeGeometry(3, 6, 4),
                    new THREE.MeshPhongMaterial({ color: config.color })
                );
                autoPosition = { x: (Math.random() - 0.5) * 12, y: 0, z: -8 }; // Far back, center
                break;
                
            case 'istana':
                // Palace at back center
                const castleGroup = new THREE.Group();
                const base = new THREE.Mesh(
                    new THREE.BoxGeometry(3, 2, 2),
                    new THREE.MeshPhongMaterial({ color: config.color })
                );
                base.position.y = 1;
                const tower1 = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.4, 0.4, 3, 8),
                    new THREE.MeshPhongMaterial({ color: config.color })
                );
                tower1.position.set(-1.5, 2.5, 0);
                const tower2 = tower1.clone();
                tower2.position.set(1.5, 2.5, 0);
                castleGroup.add(base);
                castleGroup.add(tower1);
                castleGroup.add(tower2);
                mesh = castleGroup;
                autoPosition = { x: 0, y: 0, z: -7 }; // Back center
                break;
                
            case 'awan':
                // Clouds at top
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5, 16, 16),
                    new THREE.MeshPhongMaterial({ color: config.color, transparent: true, opacity: 0.7 })
                );
                mesh.scale.set(1.5, 0.8, 1);
                autoPosition = { x: (Math.random() - 0.5) * 16, y: 7, z: -5 }; // Top sky
                break;
                
            case 'batu':
                // Rock at ground
                mesh = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(1),
                    new THREE.MeshPhongMaterial({ color: config.color })
                );
                autoPosition = { x: (Math.random() - 0.5) * 14, y: -3, z: -3 }; // Ground side
                break;
                
            case 'api':
                // Fire at ground
                const fireGroup = new THREE.Group();
                for (let i = 0; i < 5; i++) {
                    const flame = new THREE.Mesh(
                        new THREE.ConeGeometry(0.3, 1.5, 4),
                        new THREE.MeshPhongMaterial({ 
                            color: i % 2 === 0 ? 0xFF5722 : 0xFFC107,
                            emissive: 0xFF5722,
                            emissiveIntensity: 0.5
                        })
                    );
                    flame.position.y = 0.75 + Math.random() * 0.5;
                    flame.position.x = (Math.random() - 0.5) * 0.5;
                    flame.position.z = (Math.random() - 0.5) * 0.5;
                    fireGroup.add(flame);
                }
                mesh = fireGroup;
                autoPosition = { x: (Math.random() - 0.5) * 12, y: -3, z: -2 }; // Ground
                break;
                
            case 'air':
                // Water at bottom
                mesh = new THREE.Mesh(
                    new THREE.PlaneGeometry(20, 3),
                    new THREE.MeshPhongMaterial({ 
                        color: config.color, 
                        transparent: true, 
                        opacity: 0.6,
                        side: THREE.DoubleSide
                    })
                );
                mesh.rotation.x = -Math.PI / 2;
                autoPosition = { x: 0, y: -5, z: 0 }; // Very bottom (water level)
                break;
                
            case 'bulan':
                // Moon at top left
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(1, 32, 32),
                    new THREE.MeshPhongMaterial({ 
                        color: config.color,
                        emissive: 0xFFF9C4,
                        emissiveIntensity: 0.3
                    })
                );
                autoPosition = { x: -10, y: 8, z: -6 }; // Top left back
                break;
                
            case 'matahari':
                // Sun at top right
                mesh = new THREE.Mesh(
                    new THREE.SphereGeometry(1.5, 32, 32),
                    new THREE.MeshPhongMaterial({ 
                        color: config.color,
                        emissive: 0xFFC107,
                        emissiveIntensity: 0.5
                    })
                );
                autoPosition = { x: 10, y: 8, z: -6 }; // Top right back
                break;
        }

        // Set auto position
        mesh.position.set(autoPosition.x, autoPosition.y, autoPosition.z);

        this.scene.add(mesh);
        this.accessories.push({ type, mesh });

        console.log(`✅ Spawned ${config.name} at (${autoPosition.x}, ${autoPosition.y}, ${autoPosition.z})`);

        // Play sound
        if (window.gamelanSound) {
            window.gamelanSound.playSaron(this.accessories.length);
        }
    }

    clearAll() {
        this.accessories.forEach(acc => {
            this.scene.remove(acc.mesh);
        });
        this.accessories = [];
        
        console.log('🗑️ All accessories cleared');
        
        // Play sound
        if (window.gamelanSound) {
            window.gamelanSound.playKendang();
        }
    }

    getAccessories() {
        return this.accessories;
    }
}

// Export
window.AccessorySystem = AccessorySystem;
