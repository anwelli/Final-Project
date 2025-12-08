// Authentication System for Azuka Dashboard
class AuthSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkPasswordStrength();
    }

    setupEventListeners() {
        // Form switching
        document.getElementById('showSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('signupForm');
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('loginForm');
        });

        document.getElementById('showForgot')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgotForm');
        });

        document.getElementById('showLoginFromForgot')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('loginForm');
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        document.getElementById('forgotForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Password visibility toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.currentTarget.dataset.target;
                const input = document.getElementById(targetId);
                if (input.type === 'password') {
                    input.type = 'text';
                    e.currentTarget.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    e.currentTarget.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.currentTarget.classList.contains('google') ? 'google' : 'github';
                this.handleSocialLogin(provider);
            });
        });
    }

    showForm(formId) {
        // Hide all forms
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.remove('active');
        });
        
        // Show requested form
        const form = document.getElementById(formId);
        if (form) {
            form.classList.add('active');
        }
    }

    checkPasswordStrength() {
        const passwordInput = document.getElementById('signupPassword');
        if (!passwordInput) return;

        passwordInput.addEventListener('input', (e) => {
            const password = e.target.value;
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            let strength = 0;
            
            // Length check
            if (password.length >= 8) strength++;
            
            // Mixed case check
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            
            // Number check
            if (/\d/.test(password)) strength++;
            
            // Special character check
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Update UI
            const strengthPercent = strength * 25;
            strengthFill.style.width = `${strengthPercent}%`;
            
            const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
            strengthText.textContent = strengthLabels[strength];
            
            // Update color
            const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'];
            strengthFill.style.backgroundColor = colors[strength];
        });
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // Validation
        if (!this.validateEmail(email)) {
            this.showError('loginForm', 'Please enter a valid email address');
            return;
        }

        if (!password) {
            this.showError('loginForm', 'Password is required');
            return;
        }

        // Demo account
        if (email === 'demo@azukadashboard.com' && password === 'demo123') {
            const demoUser = {
                id: 'demo-user',
                firstName: 'Demo',
                lastName: 'User',
                email: 'demo@azukadashboard.com',
                joined: new Date().toISOString(),
                stats: {
                    goals: 3,
                    tasks: 8,
                    streak: 7
                }
            };
            this.loginUser(demoUser, rememberMe);
            return;
        }

        // Check local storage for users
        const users = JSON.parse(localStorage.getItem('azuka_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.loginUser(user, rememberMe);
        } else {
            this.showError('loginForm', 'Invalid email or password');
        }
    }

    async handleSignup() {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const termsAgreed = document.getElementById('termsAgreement').checked;
        const newsletter = document.getElementById('newsletter').checked;

        // Validation
        if (!firstName || !lastName) {
            this.showError('signupForm', 'First and last name are required');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showError('signupForm', 'Please enter a valid email address');
            return;
        }

        if (password.length < 8) {
            this.showError('signupForm', 'Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            this.showError('signupForm', 'Passwords do not match');
            return;
        }

        if (!termsAgreed) {
            this.showError('signupForm', 'You must agree to the terms and conditions');
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('azuka_users') || '[]');
        if (users.find(u => u.email === email)) {
            this.showError('signupForm', 'An account with this email already exists');
            return;
        }

        // Create new user
        const newUser = {
            id: 'user-' + Date.now(),
            firstName,
            lastName,
            email,
            password, // Note: In a real app, this should be hashed
            newsletter,
            joined: new Date().toISOString(),
            preferences: {
                theme: 'light',
                dailyReminders: true,
                weeklyReports: true,
                goalNotifications: true
            },
            stats: {
                goals: 0,
                tasks: 0,
                streak: 0
            }
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('azuka_users', JSON.stringify(users));

        // Login the new user
        this.loginUser(newUser, true);
    }

    async handleForgotPassword() {
        const email = document.getElementById('resetEmail').value;

        if (!this.validateEmail(email)) {
            this.showError('forgotForm', 'Please enter a valid email address');
            return;
        }

        // Simulate sending reset email
        this.showMessage('forgotForm', 'success', 'Reset instructions have been sent to your email');
        
        // Clear form and return to login after delay
        setTimeout(() => {
            document.getElementById('forgotForm').reset();
            this.showForm('loginForm');
        }, 3000);
    }

    async handleSocialLogin(provider) {
        // In a real app, this would integrate with OAuth providers
        // For now, we'll simulate a successful social login
        const socialUser = {
            id: `${provider}-user-${Date.now()}`,
            firstName: 'Social',
            lastName: 'User',
            email: `${provider}@example.com`,
            joined: new Date().toISOString(),
            stats: {
                goals: 2,
                tasks: 5,
                streak: 3
            }
        };

        this.loginUser(socialUser, true);
    }

    loginUser(user, remember) {
        // Remove password from user object before storing
        const userForStorage = { ...user };
        delete userForStorage.password;

        // Store user data
        if (remember) {
            localStorage.setItem('azuka_user', JSON.stringify(userForStorage));
        } else {
            sessionStorage.setItem('azuka_user', JSON.stringify(userForStorage));
        }

        // Redirect to app
        window.location.reload();
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    showError(formId, message) {
        this.showMessage(formId, 'error', message);
    }

    showMessage(formId, type, message) {
        const form = document.getElementById(formId);
        
        // Remove any existing messages
        const existingMessage = form.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to form
        form.insertBefore(messageDiv, form.firstChild);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode === form) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize auth system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authSystem = new AuthSystem();
});