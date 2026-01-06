/**
 * Vault 93 Shopping Cart Manager
 * Complete cart functionality with localStorage persistence
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

    // FIXED: Helper function to render image (URL or emoji)
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
                            <div class="cart-mini-price">$${item.price.toFixed(2)}</div>
                            <div class="cart-mini-quantity">Qty: ${item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="cart-mini-footer">
                <div class="cart-mini-total">
                    <span>Total:</span>
                    <span class="cart-mini-total-value">$${total.toFixed(2)}</span>
                </div>
                <button class="cart-mini-checkout" onclick="window.location.href='cart-checkout.html'">
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

// Subscribe to cart changes
cart.subscribe(() => {
    updateCartBadge();
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    // Add click handler to cart icon
    const cartButton = document.querySelector('.btn-cart');
    if (cartButton) {
        cartButton.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = document.getElementById('cart-mini-dropdown');
            if (dropdown && dropdown.classList.contains('show')) {
                hideMiniCart();
            } else {
                showMiniCart();
            }
        });
    }

    // Close mini cart when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('cart-mini-dropdown');
        const cartButton = document.querySelector('.btn-cart');

        if (dropdown && dropdown.classList.contains('show')) {
            if (!dropdown.contains(e.target) && !cartButton.contains(e.target)) {
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
    module.exports = { cart, addToCart, updateCartBadge, showMiniCart, hideMiniCart };
}