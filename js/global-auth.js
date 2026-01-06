/**
 * Vault 93 Global Authentication System
 * Handles login, signup, and user session across all pages
 */

class AuthSystem {
    constructor() {
        this.currentUser = this.loadUser();
        this.init();
    }

    init() {
        // Load auth modal HTML and CSS
        this.loadAuthModal();
        // Update navbar based on auth state
        this.updateNavbar();
    }

    loadAuthModal() {
        // Check if modal already exists
        if (document.getElementById('authOverlay')) return;

        // Inject auth modal HTML
        const modalHTML = `
            <!-- Auth Modal Styles -->
            <style>
                /* Auth Modal Overlay */
                .auth-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9999;
                    animation: fadeIn 0.3s ease;
                }

                .auth-overlay.active {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Auth Modal */
                .auth-modal {
                    background: var(--lighter-gray, #ffffff);
                    border-radius: 30px;
                    max-width: 500px;
                    width: 90%;
                    max-height: 90vh;
                    overflow-y: auto;
                    position: relative;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    animation: slideUp 0.4s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .auth-modal::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 5px;
                    background: linear-gradient(to right, #FF4500, #D32F2F);
                    border-radius: 30px 30px 0 0;
                }

                /* Close Button */
                .auth-close {
                    position: absolute;
                    top: 1.5rem;
                    right: 1.5rem;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: #f8f9fa;
                    border-radius: 50%;
                    color: #1a1a1a;
                    font-size: 1.5rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }

                .auth-close:hover {
                    background: #FF4500;
                    color: #ffffff;
                    transform: rotate(90deg);
                }

                /* Modal Content */
                .auth-content {
                    padding: 3rem 2.5rem;
                }

                /* Brand in Modal */
                .auth-brand {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-brand-text {
                    font-family: 'Russo One', sans-serif;
                    font-size: 2.5rem;
                    color: #1a1a1a;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 0.3rem;
                }

                .auth-brand-text span {
                    color: #FF4500;
                }

                .auth-brand-tagline {
                    color: #6c757d;
                    font-size: 0.9rem;
                    letter-spacing: 1px;
                }

                /* Form Heading */
                .auth-heading {
                    text-align: center;
                    margin-bottom: 2rem;
                }

                .auth-heading h2 {
                    font-family: 'Russo One', sans-serif;
                    font-size: 1.8rem;
                    color: #1a1a1a;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    margin-bottom: 0.5rem;
                }

                .auth-heading p {
                    color: #6c757d;
                    font-size: 1rem;
                }

                /* Form Groups */
                .auth-form-group {
                    margin-bottom: 1.5rem;
                }

                .auth-label {
                    font-weight: 600;
                    color: #1a1a1a;
                    margin-bottom: 0.5rem;
                    font-size: 0.95rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    display: block;
                }

                .auth-input-group {
                    position: relative;
                }

                .auth-input {
                    width: 100%;
                    padding: 1rem 1.2rem;
                    padding-right: 3rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 15px;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                    background: #ffffff;
                    font-family: 'Rajdhani', sans-serif;
                }

                .auth-input:focus {
                    border-color: #FF4500;
                    box-shadow: 0 0 0 0.2rem rgba(255, 69, 0, 0.1);
                    outline: none;
                }

                .auth-input-icon {
                    position: absolute;
                    right: 1.2rem;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #6c757d;
                    font-size: 1.2rem;
                    pointer-events: none;
                }

                .auth-password-toggle {
                    position: absolute;
                    right: 1.2rem;
                    top: 50%;
                    transform: translateY(-50%);
                    background: none;
                    border: none;
                    color: #6c757d;
                    cursor: pointer;
                    font-size: 1.2rem;
                    transition: color 0.3s ease;
                    padding: 0.5rem;
                }

                .auth-password-toggle:hover {
                    color: #FF4500;
                }

                /* Form Options */
                .auth-options {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    font-size: 0.95rem;
                }

                .auth-checkbox {
                    display: flex;
                    align-items: center;
                }

                .auth-checkbox input {
                    width: 18px;
                    height: 18px;
                    border: 2px solid #FF4500;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-right: 0.5rem;
                }

                .auth-checkbox input:checked {
                    accent-color: #FF4500;
                }

                .auth-checkbox label {
                    color: #1a1a1a;
                    font-weight: 500;
                    cursor: pointer;
                }

                .auth-forgot {
                    color: #FF4500;
                    text-decoration: none;
                    font-weight: 600;
                    transition: all 0.3s ease;
                }

                .auth-forgot:hover {
                    color: #D32F2F;
                }

                /* Submit Button */
                .auth-submit {
                    width: 100%;
                    background: linear-gradient(135deg, #FF4500, #D32F2F);
                    color: #ffffff;
                    padding: 1rem;
                    border: none;
                    border-radius: 15px;
                    font-size: 1.1rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 6px 20px rgba(255, 69, 0, 0.3);
                    font-family: 'Rajdhani', sans-serif;
                }

                .auth-submit:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 30px rgba(255, 69, 0, 0.5);
                }

                .auth-submit:active {
                    transform: translateY(0);
                }

                /* Divider */
                .auth-divider {
                    display: flex;
                    align-items: center;
                    margin: 1.5rem 0;
                }

                .auth-divider::before,
                .auth-divider::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: #e0e0e0;
                }

                .auth-divider span {
                    padding: 0 1rem;
                    color: #6c757d;
                    font-weight: 600;
                    font-size: 0.9rem;
                }

                /* Social Login */
                .auth-social {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .auth-social-btn {
                    padding: 0.85rem;
                    border: 2px solid #e0e0e0;
                    border-radius: 15px;
                    background: #ffffff;
                    color: #1a1a1a;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    font-family: 'Rajdhani', sans-serif;
                }

                .auth-social-btn:hover {
                    border-color: #FF4500;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .auth-social-btn i {
                    font-size: 1.3rem;
                }

                .auth-social-btn.google:hover {
                    background: #4285F4;
                    color: white;
                    border-color: #4285F4;
                }

                .auth-social-btn.facebook:hover {
                    background: #1877F2;
                    color: white;
                    border-color: #1877F2;
                }

                /* Switch Form */
                .auth-switch {
                    text-align: center;
                    margin-top: 1.5rem;
                    color: #6c757d;
                }

                .auth-switch a {
                    color: #FF4500;
                    font-weight: 700;
                    text-decoration: none;
                    transition: color 0.3s ease;
                    cursor: pointer;
                }

                .auth-switch a:hover {
                    color: #D32F2F;
                }

                /* Alert */
                .auth-alert {
                    padding: 1rem;
                    border-radius: 10px;
                    margin-bottom: 1.5rem;
                    display: none;
                    animation: slideDown 0.3s ease;
                    font-weight: 600;
                }

                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .auth-alert.success {
                    background: rgba(76, 175, 80, 0.1);
                    color: #4CAF50;
                    border: 2px solid #4CAF50;
                }

                .auth-alert.error {
                    background: rgba(244, 67, 54, 0.1);
                    color: #F44336;
                    border: 2px solid #F44336;
                }

                /* Name Row for Signup */
                .auth-name-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }

                /* Responsive */
                @media (max-width: 576px) {
                    .auth-modal {
                        width: 95%;
                        max-height: 95vh;
                    }

                    .auth-content {
                        padding: 2.5rem 1.5rem;
                    }

                    .auth-brand-text {
                        font-size: 2rem;
                    }

                    .auth-heading h2 {
                        font-size: 1.5rem;
                    }

                    .auth-social {
                        grid-template-columns: 1fr;
                    }

                    .auth-name-row {
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }
                }
            </style>

            <!-- Auth Overlay & Modal -->
            <div class="auth-overlay" id="authOverlay">
                <div class="auth-modal">
                    <button class="auth-close" onclick="authSystem.closeAuthModal()">
                        <i class="fas fa-times"></i>
                    </button>

                    <div class="auth-content">
                        <!-- Brand -->
                        <div class="auth-brand">
                            <img src="images/logos/vault93-logo.png" alt="Vault 93" style="height: 70px; width: auto; margin-bottom: 0.5rem;">
                            <p class="auth-brand-tagline">Premium Diecast Collection</p>
                        </div>

                        <!-- Login Form -->
                        <div id="loginForm" class="auth-form">
                            <div class="auth-heading">
                                <h2>Welcome Back</h2>
                                <p>Sign in to access your collection</p>
                            </div>

                            <div class="auth-alert" id="loginAlert"></div>

                            <form onsubmit="authSystem.handleLogin(event)">
                                <div class="auth-form-group">
                                    <label class="auth-label" for="loginEmail">Email Address</label>
                                    <div class="auth-input-group">
                                        <input type="email" class="auth-input" id="loginEmail"
                                            placeholder="your.email@example.com" required>
                                        <i class="fas fa-envelope auth-input-icon"></i>
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-label" for="loginPassword">Password</label>
                                    <div class="auth-input-group">
                                        <input type="password" class="auth-input" id="loginPassword"
                                            placeholder="Enter your password" required>
                                        <button type="button" class="auth-password-toggle"
                                            onclick="authSystem.togglePassword('loginPassword', 'loginToggleIcon')">
                                            <i class="fas fa-eye" id="loginToggleIcon"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-options">
                                    <div class="auth-checkbox">
                                        <input type="checkbox" id="loginRemember">
                                        <label for="loginRemember">Remember me</label>
                                    </div>
                                    <a href="#" class="auth-forgot">Forgot Password?</a>
                                </div>

                                <button type="submit" class="auth-submit">
                                    <i class="fas fa-sign-in-alt"></i> Sign In
                                </button>
                            </form>

                            <div class="auth-divider">
                                <span>OR CONTINUE WITH</span>
                            </div>

                            <div class="auth-social">
                                <button class="auth-social-btn google" onclick="authSystem.socialLogin('Google')">
                                    <i class="fab fa-google"></i>
                                    <span>Google</span>
                                </button>
                                <button class="auth-social-btn facebook" onclick="authSystem.socialLogin('Facebook')">
                                    <i class="fab fa-facebook-f"></i>
                                    <span>Facebook</span>
                                </button>
                            </div>

                            <div class="auth-switch">
                                Don't have an account? <a onclick="authSystem.switchToSignup()">Sign up now</a>
                            </div>
                        </div>

                        <!-- Signup Form -->
                        <div id="signupForm" class="auth-form" style="display: none;">
                            <div class="auth-heading">
                                <h2>Join Vault 93</h2>
                                <p>Create your collector account</p>
                            </div>

                            <div class="auth-alert" id="signupAlert"></div>

                            <form onsubmit="authSystem.handleSignup(event)">
                                <div class="auth-name-row">
                                    <div class="auth-form-group">
                                        <label class="auth-label" for="signupFirstName">First Name</label>
                                        <div class="auth-input-group">
                                            <input type="text" class="auth-input" id="signupFirstName" placeholder="John"
                                                required>
                                            <i class="fas fa-user auth-input-icon"></i>
                                        </div>
                                    </div>

                                    <div class="auth-form-group">
                                        <label class="auth-label" for="signupLastName">Last Name</label>
                                        <div class="auth-input-group">
                                            <input type="text" class="auth-input" id="signupLastName" placeholder="Doe"
                                                required>
                                            <i class="fas fa-user auth-input-icon"></i>
                                        </div>
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-label" for="signupEmail">Email Address</label>
                                    <div class="auth-input-group">
                                        <input type="email" class="auth-input" id="signupEmail"
                                            placeholder="your.email@example.com" required>
                                        <i class="fas fa-envelope auth-input-icon"></i>
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-label" for="signupPassword">Password</label>
                                    <div class="auth-input-group">
                                        <input type="password" class="auth-input" id="signupPassword"
                                            placeholder="Create a strong password" required minlength="8">
                                        <button type="button" class="auth-password-toggle"
                                            onclick="authSystem.togglePassword('signupPassword', 'signupToggleIcon')">
                                            <i class="fas fa-eye" id="signupToggleIcon"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-form-group">
                                    <label class="auth-label" for="signupConfirmPassword">Confirm Password</label>
                                    <div class="auth-input-group">
                                        <input type="password" class="auth-input" id="signupConfirmPassword"
                                            placeholder="Re-enter your password" required minlength="8">
                                        <button type="button" class="auth-password-toggle"
                                            onclick="authSystem.togglePassword('signupConfirmPassword', 'signupConfirmToggleIcon')">
                                            <i class="fas fa-eye" id="signupConfirmToggleIcon"></i>
                                        </button>
                                    </div>
                                </div>

                                <div class="auth-options" style="justify-content: flex-start;">
                                    <div class="auth-checkbox">
                                        <input type="checkbox" id="signupTerms" required>
                                        <label for="signupTerms">I agree to Terms & Privacy Policy</label>
                                    </div>
                                </div>

                                <button type="submit" class="auth-submit">
                                    <i class="fas fa-user-plus"></i> Create Account
                                </button>
                            </form>

                            <div class="auth-divider">
                                <span>OR SIGN UP WITH</span>
                            </div>

                            <div class="auth-social">
                                <button class="auth-social-btn google" onclick="authSystem.socialLogin('Google')">
                                    <i class="fab fa-google"></i>
                                    <span>Google</span>
                                </button>
                                <button class="auth-social-btn facebook" onclick="authSystem.socialLogin('Facebook')">
                                    <i class="fab fa-facebook-f"></i>
                                    <span>Facebook</span>
                                </button>
                            </div>

                            <div class="auth-switch">
                                Already have an account? <a onclick="authSystem.switchToLogin()">Sign in</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Load user from localStorage
    loadUser() {
        try {
            const user = localStorage.getItem('vault93_currentUser');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            console.error('Error loading user:', e);
            return null;
        }
    }

    // Save user to localStorage
    saveUser(user) {
        try {
            localStorage.setItem('vault93_currentUser', JSON.stringify(user));
            this.currentUser = user;
        } catch (e) {
            console.error('Error saving user:', e);
        }
    }

    // Open Auth Modal
    openAuthModal(formType = 'login') {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (formType === 'signup') {
                this.switchToSignup();
            } else {
                this.switchToLogin();
            }
        }
    }

    // Close Auth Modal
    closeAuthModal() {
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            overlay.classList.remove('active');
            document.body.style.overflow = 'auto';

            // Clear forms
            const inputs = ['loginEmail', 'loginPassword', 'signupFirstName', 'signupLastName', 'signupEmail', 'signupPassword', 'signupConfirmPassword'];
            inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });

            // Hide alerts
            this.hideAlert('loginAlert');
            this.hideAlert('signupAlert');
        }
    }

    // Switch between forms
    switchToLogin() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm && signupForm) {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            this.hideAlert('signupAlert');
        }
    }

    switchToSignup() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        if (loginForm && signupForm) {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            this.hideAlert('loginAlert');
        }
    }

    // Toggle Password Visibility
    togglePassword(inputId, iconId) {
        const input = document.getElementById(inputId);
        const icon = document.getElementById(iconId);

        if (input && icon) {
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    }

    // Show Alert
    showAlert(elementId, message, type) {
        const alert = document.getElementById(elementId);
        if (alert) {
            alert.textContent = message;
            alert.className = `auth-alert ${type}`;
            alert.style.display = 'block';

            setTimeout(() => {
                this.hideAlert(elementId);
            }, 4000);
        }
    }

    // Hide Alert
    hideAlert(elementId) {
        const alert = document.getElementById(elementId);
        if (alert) {
            alert.style.display = 'none';
        }
    }

    // Handle Login
    handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const remember = document.getElementById('loginRemember').checked;

        // Get registered users from localStorage
        const users = JSON.parse(localStorage.getItem('vault93_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Save logged in user
            this.saveUser({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                loggedIn: true,
                rememberMe: remember
            });

            this.showAlert('loginAlert', 'Login successful! Welcome back!', 'success');

            // Update UI
            setTimeout(() => {
                this.updateNavbar();
                this.closeAuthModal();
            }, 1500);
        } else {
            this.showAlert('loginAlert', 'Invalid email or password. Please try again.', 'error');
        }
    }

    // Handle Signup
    handleSignup(event) {
        event.preventDefault();

        const firstName = document.getElementById('signupFirstName').value;
        const lastName = document.getElementById('signupLastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const terms = document.getElementById('signupTerms').checked;

        // Validate password match
        if (password !== confirmPassword) {
            this.showAlert('signupAlert', 'Passwords do not match!', 'error');
            return;
        }

        // Validate password strength
        if (password.length < 8) {
            this.showAlert('signupAlert', 'Password must be at least 8 characters long!', 'error');
            return;
        }

        // Check if terms are accepted
        if (!terms) {
            this.showAlert('signupAlert', 'Please accept the Terms & Privacy Policy', 'error');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('vault93_users') || '[]');

        // Check if email already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            this.showAlert('signupAlert', 'Email already registered. Please login.', 'error');
            return;
        }

        // Register new user
        const newUser = {
            firstName,
            lastName,
            email,
            password,
            registeredAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('vault93_users', JSON.stringify(users));

        // Auto-login the user
        this.saveUser({
            firstName,
            lastName,
            email,
            loggedIn: true,
            rememberMe: false
        });

        this.showAlert('signupAlert', 'Account created successfully! Welcome to Vault 93!', 'success');

        // Update UI
        setTimeout(() => {
            this.updateNavbar();
            this.closeAuthModal();
        }, 1500);
    }

    // Social Login
    socialLogin(provider) {
        this.showAlert('loginAlert', `${provider} login coming soon!`, 'error');
    }

    // Update Navbar for Logged In User
    updateNavbar() {
        const loginBtn = document.querySelector('.btn-login');

        if (this.currentUser && this.currentUser.loggedIn) {
            if (loginBtn) {
                loginBtn.textContent = `Hi, ${this.currentUser.firstName}`;
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    if (confirm('Do you want to logout?')) {
                        this.logout();
                    }
                };
            }
        } else {
            if (loginBtn) {
                loginBtn.textContent = 'Login';
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    this.openAuthModal('login');
                };
            }
        }
    }

    // Logout
    logout() {
        localStorage.removeItem('vault93_currentUser');
        this.currentUser = null;
        this.updateNavbar();

        // Optionally show a message
        alert('Logged out successfully!');
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser && this.currentUser.loggedIn;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth system globally
const authSystem = new AuthSystem();

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const overlay = document.getElementById('authOverlay');
    if (e.target === overlay) {
        authSystem.closeAuthModal();
    }
});