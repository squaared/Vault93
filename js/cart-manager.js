/**
 * Vault 93 Shopping Cart Manager - Enhanced Version
 * Complete cart functionality with localStorage persistence + checkout auth
 */

class ShoppingCart {
    constructor() {
        this.cart = this.loadCart();
        this.listeners = [];
    }

    // Load cart from localStorage
    loadCart() {
        try {
            const saved = localStorage.getItem('vault93_cart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    // Save cart to localStorage
    saveCart() {
        try {
            localStorage.setItem('vault93_cart', JSON.stringify(this.cart));
            this.notifyListeners();
        } catch (e) {
            console.error('Error saving cart:', e);
        }
    }

    // Add item to cart
    addItem(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                brand: product.brand,
                name: product.name,
                price: product.price,
                image: product.image || '🏎️',
                quantity: 1
            });
        }

        this.saveCart();
        this.showNotification(`${product.name} added to cart!`);
        return true;
    }

    // Remove item from cart
    removeItem(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
    }

    // Update item quantity
    updateQuantity(itemId, quantity) {
        const item = this.cart.find(i => i.id === itemId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
        }
    }

    // Get cart items
    getItems() {
        return this.cart;
    }

    // Get cart total
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Get cart item count
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.saveCart();
    }

    // Subscribe to cart changes
    subscribe(callback) {
        this.listeners.push(callback);
    }

    // Notify all listeners
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.cart));
    }

    // Show add to cart notification
    showNotification(message) {
        // Check if notification container exists
        let container = document.getElementById('cart-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'cart-notification-container';
            container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(container);
        }

        // Create notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        notification.style.cssText = `
            background: linear-gradient(135deg, #FF4500, #D32F2F);
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

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // Helper function to render image (URL or emoji)
    renderImage(imageSource) {
        // Check if it's a URL (starts with http/https or /)
        if (imageSource.startsWith('http') || imageSource.startsWith('/') || imageSource.includes('.')) {
            return `<img src="${imageSource}" alt="Product" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">`;
        }
        // Otherwise it's an emoji
        return imageSource;
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .cart-mini-dropdown {
        position: fixed;
        top: 90px;
        right: 20px;
        background: white;
        border-radius: 15px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
        width: 380px;
        max-height: 500px;
        overflow-y: auto;
        z-index: 9998;
        display: none;
        animation: slideIn 0.3s ease;
    }

    .cart-mini-dropdown.show {
        display: block;
    }

    .cart-mini-header {
        padding: 1.5rem;
        border-bottom: 2px solid #f8f9fa;
        font-family: 'Russo One', sans-serif;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .cart-mini-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #6c757d;
        cursor: pointer;
        transition: color 0.3s ease;
    }

    .cart-mini-close:hover {
        color: #FF4500;
    }

    .cart-mini-items {
        padding: 1rem;
        max-height: 300px;
        overflow-y: auto;
    }

    .cart-mini-item {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        border-bottom: 1px solid #f8f9fa;
    }

    .cart-mini-item:last-child {
        border-bottom: none;
    }

    .cart-mini-image {
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        flex-shrink: 0;
        overflow: hidden;
    }

    .cart-mini-details {
        flex: 1;
    }

    .cart-mini-brand {
        color: #FF4500;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
    }

    .cart-mini-name {
        font-weight: 700;
        margin: 0.2rem 0;
        font-size: 0.95rem;
    }

    .cart-mini-price {
        color: #6c757d;
        font-weight: 600;
    }

    .cart-mini-quantity {
        font-size: 0.85rem;
        color: #6c757d;
    }

    .cart-mini-footer {
        padding: 1.5rem;
        border-top: 2px solid #f8f9fa;
    }

    .cart-mini-total {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
        font-family: 'Russo One', sans-serif;
        font-size: 1.3rem;
    }

    .cart-mini-total-value {
        color: #FF4500;
    }

    .cart-mini-checkout {
        width: 100%;
        background: linear-gradient(135deg, #FF4500, #D32F2F);
        color: white;
        border: none;
        padding: 1rem;
        border-radius: 50px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .cart-mini-checkout:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(255, 69, 0, 0.5);
    }

    .cart-mini-empty {
        padding: 3rem 2rem;
        text-align: center;
        color: #6c757d;
    }

    .cart-mini-empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }
`;
document.head.appendChild(style);

// Update cart badge function
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const count = cart.getItemCount();
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// Show mini cart dropdown
function showMiniCart() {
    let dropdown = document.getElementById('cart-mini-dropdown');

    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'cart-mini-dropdown';
        dropdown.className = 'cart-mini-dropdown';
        document.body.appendChild(dropdown);
    }

    const items = cart.getItems();
    const total = cart.getTotal();

    if (items.length === 0) {
        dropdown.innerHTML = `
            <div class="cart-mini-header">
                Shopping Cart
                <button class="cart-mini-close" onclick="hideMiniCart()">×</button>
            </div>
            <div class="cart-mini-empty">
                <div class="cart-mini-empty-icon">🛒</div>
                <div>Your cart is empty</div>
            </div>
        `;
    } else {
        dropdown.innerHTML = `
            <div class="cart-mini-header">
                Shopping Cart (${cart.getItemCount()})
                <button class="cart-mini-close" onclick="hideMiniCart()">×</button>
            </div>
            <div class="cart-mini-items">
                ${items.map(item => `
                    <div class="cart-mini-item">
                        <div class="cart-mini-image">${cart.renderImage(item.image)}</div>
                        <div class="cart-mini-details">
                            <div class="cart-mini-brand">${item.brand}</div>
                            <div class="cart-mini-name">${item.name}</div>
                            <div class="cart-mini-price">₱${item.price.toFixed(2)}</div>
                            <div class="cart-mini-quantity">Qty: ${item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-mini-footer">
                <div class="cart-mini-total">
                    <span>Total:</span>
                    <span class="cart-mini-total-value">₱${total.toFixed(2)}</span>
                </div>
                <button class="cart-mini-checkout" onclick="handleCheckoutClick()">
                    Checkout
                </button>
            </div>
        `;
    }

    dropdown.classList.add('show');
}

function hideMiniCart() {
    const dropdown = document.getElementById('cart-mini-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
}

// NEW: Handle checkout with login check
function handleCheckoutClick() {
    // Check if user is logged in
    if (typeof authSystem !== 'undefined' && authSystem.isLoggedIn()) {
        // User is logged in, proceed to checkout
        window.location.href = 'cart-checkout.html';
    } else {
        // User not logged in, show login modal
        hideMiniCart();
        
        // Add overlay background
        const overlay = document.createElement('div');
        overlay.id = 'login-prompt-overlay';
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
        
        // Show notification
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
        
        // Add CSS animations if not already present
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
            <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
            <h3 style="font-family: 'Russo One', sans-serif; color: #1a1a1a; margin-bottom: 1rem;">Login Required</h3>
            <p style="color: #6c757d; margin-bottom: 1.5rem;">Please login to proceed to checkout</p>
            <button onclick="closeLoginPrompt(this, true)" 
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
            <button onclick="closeLoginPrompt(this, false)" 
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
            closeLoginPromptByElement(notification, false);
        });
        
        // Remove notification after 5 seconds if not clicked
        setTimeout(() => {
            if (notification.parentElement) {
                closeLoginPromptByElement(notification, false);
            }
        }, 5000);
    }
}

// Helper function to close login prompt with animation
function closeLoginPrompt(button, openLogin) {
    const notification = button.closest('div[style*="position: fixed"]');
    closeLoginPromptByElement(notification, openLogin);
}

function closeLoginPromptByElement(notification, openLogin) {
    if (!notification) return;
    
    const overlay = document.getElementById('login-prompt-overlay');
    
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

// Subscribe to cart changes
cart.subscribe(() => {
    updateCartBadge();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Add click handler to ALL cart icons (mobile + desktop)
    const cartButtons = document.querySelectorAll('.btn-cart');
    cartButtons.forEach(cartButton => {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = document.getElementById('cart-mini-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                hideMiniCart();
            } else {
                showMiniCart();
            }
        });
    });

    // Close mini cart when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('cart-mini-dropdown');
        const cartButtons = document.querySelectorAll('.btn-cart');
        
        if (dropdown && dropdown.classList.contains('show')) {
            const clickedOnCartButton = Array.from(cartButtons).some(btn => btn.contains(e.target));
            
            if (!dropdown.contains(e.target) && !clickedOnCartButton) {
                hideMiniCart();
            }
        }
    });
});

// Add to cart function for product buttons
function addToCart(productId, brand, name, price, image = '🏎️') {
    cart.addItem({
        id: productId,
        brand: brand,
        name: name,
        price: price,
        image: image
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { cart, addToCart, updateCartBadge, showMiniCart, hideMiniCart, handleCheckoutClick };
}