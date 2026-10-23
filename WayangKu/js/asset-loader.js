// Asset Loader - Load & Process Wayang Images
class AssetLoader {
    constructor() {
        this.cache = new Map();
    }

    async loadWayangTexture(characterId) {
        // Check cache
        if (this.cache.has(characterId)) {
            return this.cache.get(characterId);
        }

        const path = `assets/${characterId}.jpg`;
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                // Remove background
                const texture = this.removeBackground(img);
                this.cache.set(characterId, texture);
                resolve(texture);
            };
            
            img.onerror = () => reject(new Error(`Failed to load: ${path}`));
            img.src = path;
        });
    }

    removeBackground(img) {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        // Draw image
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        // Sample corners for background color
        const corners = [
            this.getPixel(data, 0, 0, canvas.width),
            this.getPixel(data, canvas.width - 1, 0, canvas.width),
            this.getPixel(data, 0, canvas.height - 1, canvas.width),
            this.getPixel(data, canvas.width - 1, canvas.height - 1, canvas.width)
        ];
        
        // Average background color
        const bgColor = {
            r: Math.floor((corners[0].r + corners[1].r + corners[2].r + corners[3].r) / 4),
            g: Math.floor((corners[0].g + corners[1].g + corners[2].g + corners[3].g) / 4),
            b: Math.floor((corners[0].b + corners[1].b + corners[2].b + corners[3].b) / 4)
        };
        
        console.log(`🎨 BG Color detected:`, bgColor);
        
        // Remove background (threshold 80)
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Calculate color distance
            const distance = Math.sqrt(
                Math.pow(r - bgColor.r, 2) +
                Math.pow(g - bgColor.g, 2) +
                Math.pow(b - bgColor.b, 2)
            );
            
            if (distance < 80) {
                // Full transparent
                data[i + 3] = 0;
            } else if (distance < 120) {
                // Fade
                data[i + 3] = Math.floor((distance - 80) * 6.375);
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to THREE.js texture
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }

    getPixel(data, x, y, width) {
        const index = (y * width + x) * 4;
        return {
            r: data[index],
            g: data[index + 1],
            b: data[index + 2]
        };
    }
}

// Export
window.AssetLoader = AssetLoader;
