// Custom Confirmation Modal System
class ConfirmModal {
    constructor() {
        this.modal = null;
        this.resolvePromise = null;
        this.createModal();
    }

    createModal() {
        // Create modal overlay
        this.modal = document.createElement('div');
        this.modal.id = 'confirmModal';
        this.modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(8px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;

        // Create modal box
        const modalBox = document.createElement('div');
        modalBox.style.cssText = `
            background: linear-gradient(135deg, rgba(20, 10, 5, 0.98) 0%, rgba(40, 25, 15, 0.98) 100%);
            border: 3px solid rgba(255, 215, 0, 0.5);
            border-radius: 20px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.2);
            transform: scale(0.8);
            transition: transform 0.3s ease;
        `;

        // Icon
        const icon = document.createElement('div');
        icon.style.cssText = `
            font-size: 48px;
            text-align: center;
            margin-bottom: 20px;
        `;
        icon.textContent = '⚠️';

        // Title
        const title = document.createElement('div');
        title.id = 'confirmModalTitle';
        title.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            color: #FFD700;
            text-align: center;
            margin-bottom: 15px;
            font-family: 'Inter', sans-serif;
        `;
        title.textContent = 'Konfirmasi';

        // Message
        const message = document.createElement('div');
        message.id = 'confirmModalMessage';
        message.style.cssText = `
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            margin-bottom: 30px;
            line-height: 1.5;
            font-family: 'Inter', sans-serif;
        `;
        message.textContent = 'Apakah Anda yakin?';

        // Button container
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;

        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.id = 'confirmModalCancel';
        cancelBtn.textContent = 'Batal';
        cancelBtn.style.cssText = `
            padding: 12px 30px;
            background: linear-gradient(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(60, 60, 60, 0.3) 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
        `;

        // Confirm button (red for delete)
        const confirmBtn = document.createElement('button');
        confirmBtn.id = 'confirmModalConfirm';
        confirmBtn.textContent = 'Hapus';
        confirmBtn.style.cssText = `
            padding: 12px 30px;
            background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 10px;
            color: #fff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 15px rgba(255, 0, 0, 0.3);
        `;

        // Hover effects
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.background = 'linear-gradient(135deg, rgba(120, 120, 120, 0.4) 0%, rgba(80, 80, 80, 0.4) 100%)';
            cancelBtn.style.transform = 'scale(1.05)';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.background = 'linear-gradient(135deg, rgba(100, 100, 100, 0.3) 0%, rgba(60, 60, 60, 0.3) 100%)';
            cancelBtn.style.transform = 'scale(1)';
        });

        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.background = 'linear-gradient(135deg, #ff6666 0%, #ff0000 100%)';
            confirmBtn.style.transform = 'scale(1.05)';
            confirmBtn.style.boxShadow = '0 6px 20px rgba(255, 0, 0, 0.5)';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.background = 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)';
            confirmBtn.style.transform = 'scale(1)';
            confirmBtn.style.boxShadow = '0 4px 15px rgba(255, 0, 0, 0.3)';
        });

        // Click handlers
        cancelBtn.addEventListener('click', () => this.close(false));
        confirmBtn.addEventListener('click', () => this.close(true));

        // Assemble
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);

        modalBox.appendChild(icon);
        modalBox.appendChild(title);
        modalBox.appendChild(message);
        modalBox.appendChild(buttonContainer);

        this.modal.appendChild(modalBox);
        this.modalBox = modalBox;

        // Add to body
        document.body.appendChild(this.modal);

        // ESC key to cancel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal.style.display === 'flex') {
                this.close(false);
            }
        });
    }

    show(message, title = 'Konfirmasi') {
        return new Promise((resolve) => {
            this.resolvePromise = resolve;

            // Set content
            document.getElementById('confirmModalTitle').textContent = title;
            document.getElementById('confirmModalMessage').textContent = message;

            // Show modal
            this.modal.style.display = 'flex';
            
            // Trigger animation
            setTimeout(() => {
                this.modal.style.opacity = '1';
                this.modalBox.style.transform = 'scale(1)';
            }, 10);
        });
    }

    close(result) {
        // Animate out
        this.modal.style.opacity = '0';
        this.modalBox.style.transform = 'scale(0.8)';

        setTimeout(() => {
            this.modal.style.display = 'none';
            if (this.resolvePromise) {
                this.resolvePromise(result);
                this.resolvePromise = null;
            }
        }, 300);
    }
}

// Create global instance
window.confirmModal = new ConfirmModal();
