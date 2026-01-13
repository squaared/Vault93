/**
 * Vault 93 Wishlist Manager
 * Wishlist functionality with authentication requirement and localStorage persistence
 */

class WishlistManager {
    constructor() {
        this.wishlist = this.loadWishlist();
        this.listeners = [];
    }

    // Load wishlist from localStorage (per user)
    loadWishlist() {
        try {
            // Check if user is logged in
            if (typeof authSystem === 'undefined' || !authSystem.isLoggedIn()) {
                return [];
            }

            const user = authSystem.getCurrentUser();
            const wishlistKey = `vault93_wishlist_${user.email}`;
            const saved = localStorage.getItem(wishlistKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading wishlist:', e);
            return [];
        }
    }

    // Save wishlist to localStorage
    saveWishlist() {
        try {
            if (typeof authSystem === 'undefined' || !authSystem.isLoggedIn()) {
                return;
            }

            const user = authSystem.getCurrentUser();
            const wishlistKey = `vault93_wishlist_${user.email}`;
            localStorage.setItem(wishlistKey, JSON.stringify(this.wishlist));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving wishlist:', e);
        }
    }

    // Check if user is logged in
    requireLogin() {
        if (typeof authSystem === 'undefined' || !authSystem.isLoggedIn()) {
            this.showLoginPrompt();
            return false;
        }
        return true;
    }

    // Show login prompt
    showLoginPrompt() {
        // Add overlay background
        const overlay = document.createElement('div');
        overlay.id = 'wishlist-prompt-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(4px);
            z-index: 9999;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(overlay);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.7);
            background: white;
            padding: 2rem 3rem;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            text-align: center;
            min-width: 400px;
            max-width: 90%;
            opacity: 0;
            animation: popupSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        `;
        
        // Add CSS animations if not already present (reuse from cart manager)
        if (!document.getElementById('popup-animations')) {
            const animationStyle = document.createElement('style');
            animationStyle.id = 'popup-animations';
            animationStyle.textContent = `
                @keyframes popupSlideIn {
                    0% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.7);
                    }
                    100% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }
                
                @keyframes popupSlideOut {
                    0% {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                    100% {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.7);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                @keyframes fadeOut {
                    from {
                        opacity: 1;
                    }
                    to {
                        opacity: 0;
                    }
                }
                
                @media (max-width: 576px) {
                    .login-prompt-modal {
                        min-width: 90% !important;
                        padding: 1.5rem 2rem !important;
                    }
                }
            `;
            document.head.appendChild(animationStyle);
        }
        notification.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 1rem;">❤️</div>
            <h3 style="font-family: 'Russo One', sans-serif; color: #1a1a1a; margin-bottom: 1rem;">Login Required</h3>
            <p style="color: #6c757d; margin-bottom: 1.5rem;">Please login to save items to your wishlist</p>
            <button onclick="closeWishlistPrompt(this, true)" 
                style="background: linear-gradient(135deg, #FF4500, #D32F2F); 
                       color: white; 
                       border: none; 
                       padding: 0.8rem 2rem; 
                       border-radius: 50px; 
                       font-weight: 700; 
                       cursor: pointer;
                       text-transform: uppercase;
                       letter-spacing: 1px;
                       transition: all 0.3s ease;">
                Login Now
            </button>
            <button onclick="closeWishlistPrompt(this, false)" 
                style="background: transparent; 
                       color: #6c757d; 
                       border: none; 
                       padding: 0.8rem 2rem; 
                       font-weight: 600; 
                       cursor: pointer;
                       margin-left: 1rem;
                       transition: all 0.3s ease;">
                Cancel
            </button>
        `;
        document.body.appendChild(notification);
        
        // Close on overlay click
        overlay.addEventListener('click', () => {
            closeWishlistPromptByElement(notification, false);
        });

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                closeWishlistPromptByElement(notification, false);
            }
        }, 5000);
    }

    // Add item to wishlist
    addItem(product) {
        if (!this.requireLogin()) {
            return false;
        }

        // Check if item already in wishlist
        const existingItem = this.wishlist.find(item => item.id === product.id);

        if (existingItem) {
            this.showNotification(`${product.name} is already in your wishlist!`, 'info');
            return false;
        }

        this.wishlist.push({
            id: product.id,
            brand: product.brand,
            name: product.name,
            price: product.price,
            image: product.image || '🏎️',
            addedAt: new Date().toISOString()
        });

        this.saveWishlist();
        this.showNotification(`${product.name} added to wishlist!`, 'success');
        return true;
    }

    // Remove item from wishlist
    removeItem(itemId) {
        if (!this.requireLogin()) {
            return false;
        }

        const item = this.wishlist.find(i => i.id === itemId);
        this.wishlist = this.wishlist.filter(item => item.id !== itemId);
        this.saveWishlist();

        if (item) {
            this.showNotification(`${item.name} removed from wishlist`, 'info');
        }
        return true;
    }

    // Check if item is in wishlist
    isInWishlist(itemId) {
        if (!this.requireLogin()) {
            return false;
        }
        return this.wishlist.some(item => item.id === itemId);
    }

    // Toggle item in wishlist
    toggleItem(product) {
        if (!this.requireLogin()) {
            return false;
        }

        if (this.isInWishlist(product.id)) {
            return this.removeItem(product.id);
        } else {
            return this.addItem(product);
        }
    }

    // Get wishlist items
    getItems() {
        if (!this.requireLogin()) {
            return [];
        }
        return this.wishlist;
    }

    // Get wishlist count
    getItemCount() {
        if (typeof authSystem === 'undefined' || !authSystem.isLoggedIn()) {
            return 0;
        }
        return this.wishlist.length;
    }

    // Clear wishlist
    clearWishlist() {
        if (!this.requireLogin()) {
            return;
        }

        if (confirm('Are you sure you want to clear your entire wishlist?')) {
            this.wishlist = [];
            this.saveWishlist();
            this.showNotification('Wishlist cleared!', 'info');
        }
    }

    // Subscribe to wishlist changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.wishlist));
    }

    // Show notification
    showNotification(message, type = 'success') {
        let container = document.getElementById('wishlist-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'wishlist-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }

        const colors = {
            success: 'linear-gradient(135deg, #FF4500, #D32F2F)',
            info: 'linear-gradient(135deg, #2196F3, #1976D2)',
            warning: 'linear-gradient(135deg, #FF9800, #F57C00)'
        };

        const icons = {
            success: 'fa-heart',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        const notification = document.createElement('div');
        notification.className = 'wishlist-notification';
        notification.innerHTML = `
            <i class="fas ${icons[type]}"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            margin-bottom: 10px;
            box-shadow: 0 4px 20px rgba(255, 69, 0, 0.4);
            display: flex;
            align-items: center;
            gap: 0.8rem;
            font-weight: 700;
            animation: slideIn 0.3s ease;
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Move item from wishlist to cart
    moveToCart(itemId) {
        if (!this.requireLogin()) {
            return false;
        }

        const item = this.wishlist.find(i => i.id === itemId);
        if (!item) {
            return false;
        }

        // Add to cart
        if (typeof cart !== 'undefined') {
            cart.addItem(item);
        }

        // Remove from wishlist
        this.removeItem(itemId);
        return true;
    }
}

// Initialize wishlist manager
const wishlistManager = new WishlistManager();

// Function to setup wishlist button on product pages
function setupWishlistButton(buttonElement, productData) {
    if (!buttonElement) return;

    // Update button appearance based on wishlist status
    function updateButtonState() {
        if (typeof authSystem !== 'undefined' && authSystem.isLoggedIn()) {
            const isWishlisted = wishlistManager.isInWishlist(productData.id);
            
            if (isWishlisted) {
                buttonElement.innerHTML = '♥'; // Filled heart
                buttonElement.style.background = 'var(--primary-orange)';
                buttonElement.style.color = 'var(--lighter-gray)';
                buttonElement.style.borderColor = 'var(--primary-orange)';
            } else {
                buttonElement.innerHTML = '♡'; // Empty heart
                buttonElement.style.background = 'transparent';
                buttonElement.style.color = 'var(--primary-orange)';
                buttonElement.style.borderColor = 'var(--primary-orange)';
            }
        } else {
            buttonElement.innerHTML = '♡';
            buttonElement.style.background = 'transparent';
            buttonElement.style.color = 'var(--primary-orange)';
            buttonElement.style.borderColor = 'var(--primary-orange)';
        }
    }

    // Initial state
    updateButtonState();

    // Click handler
    buttonElement.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (typeof authSystem !== 'undefined' && authSystem.isLoggedIn()) {
            wishlistManager.toggleItem(productData);
            updateButtonState();
        } else {
            wishlistManager.requireLogin();
        }
    });

    // Subscribe to wishlist changes
    wishlistManager.subscribe(() => {
        updateButtonState();
    });

    // Subscribe to auth changes
    if (typeof authSystem !== 'undefined') {
        // Reload wishlist when user logs in
        const originalSaveUser = authSystem.saveUser.bind(authSystem);
        authSystem.saveUser = function(user) {
            originalSaveUser(user);
            wishlistManager.wishlist = wishlistManager.loadWishlist();
            updateButtonState();
        };

        // Clear wishlist display when user logs out
        const originalLogout = authSystem.logout.bind(authSystem);
        authSystem.logout = function() {
            originalLogout();
            wishlistManager.wishlist = [];
            updateButtonState();
        };
    }
}

// Helper function to close wishlist prompt with animation
function closeWishlistPrompt(button, openLogin) {
    const notification = button.closest('div[style*="position: fixed"]');
    closeWishlistPromptByElement(notification, openLogin);
}

function closeWishlistPromptByElement(notification, openLogin) {
    if (!notification) return;
    
    const overlay = document.getElementById('wishlist-prompt-overlay');
    
    // Animate out
    notification.style.animation = 'popupSlideOut 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease forwards';
    }
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
        if (overlay && overlay.parentElement) {
            overlay.remove();
        }
        
        // Open login modal if requested
        if (openLogin && typeof authSystem !== 'undefined') {
            authSystem.openAuthModal('login');
        }
    }, 300);
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { wishlistManager, setupWishlistButton };
}