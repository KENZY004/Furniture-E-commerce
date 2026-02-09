// Authentication System for NordForm E-commerce

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);

        // Password strength indicator
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', updatePasswordStrength);
        }
    }
});

// Signup Functions

function handleSignup(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    // Validation
    let isValid = true;

    if (fullName.length < 2) {
        showError('nameError', 'Name must be at least 2 characters');
        isValid = false;
    }

    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (password !== confirmPassword) {
        showError('confirmError', 'Passwords do not match');
        isValid = false;
    }

    if (!agreeTerms) {
        alert('Please agree to the Terms & Conditions');
        isValid = false;
    }

    if (!isValid) return;

    // Check if user already exists
    const users = getUsers();
    if (users.find(u => u.email === email)) {
        showError('emailError', 'An account with this email already exists');
        return;
    }

    // Create new user
    const newUser = {
        id: generateId(),
        name: fullName,
        email: email,
        password: simpleHash(password), // Simple hash for demo
        createdAt: new Date().toISOString()
    };

    // Save user
    users.push(newUser);
    localStorage.setItem('nordform_users', JSON.stringify(users));

    // Auto-login
    setCurrentUser(newUser);

    // Redirect to the page they originally tried to access, or shop page
    const redirectTo = sessionStorage.getItem('nordform_redirect_after_login') || 'shop.html';
    sessionStorage.removeItem('nordform_redirect_after_login');
    window.location.href = redirectTo;
}

function updatePasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthDiv = document.getElementById('passwordStrength');

    if (!password) {
        strengthDiv.innerHTML = '';
        return;
    }

    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    const levels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['#ff4444', '#ff8800', '#ffbb00', '#88cc00', '#00cc44'];

    const level = Math.min(strength, 4);
    strengthDiv.innerHTML = `<span style="color: ${colors[level]}">Strength: ${levels[level]}</span>`;
}

// Login Functions

function handleLogin(e) {
    e.preventDefault();

    // Clear previous errors
    clearErrors();

    // Get form values
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    // Validation
    let isValid = true;

    if (!isValidEmail(email)) {
        showError('emailError', 'Please enter a valid email address');
        isValid = false;
    }

    if (password.length < 6) {
        showError('passwordError', 'Password must be at least 6 characters');
        isValid = false;
    }

    if (!isValid) return;

    // Find user
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === simpleHash(password));

    if (!user) {
        showError('emailError', 'Invalid email or password');
        return;
    }

    // Set current user
    setCurrentUser(user, rememberMe);

    // Redirect to the page they originally tried to access, or shop page
    const redirectTo = sessionStorage.getItem('nordform_redirect_after_login') || 'shop.html';
    sessionStorage.removeItem('nordform_redirect_after_login');
    window.location.href = redirectTo;
}

// Page Protection Functions

// Redirect to login if NOT logged in (for protected pages)
function requireAuth() {
    if (!isLoggedIn()) {
        // Save the page they tried to access
        sessionStorage.setItem('nordform_redirect_after_login', window.location.pathname);
        window.location.href = 'login.html';
    }
}

// Redirect to shop if already logged in (for auth pages)
function redirectIfLoggedIn() {
    if (isLoggedIn()) {
        window.location.href = 'shop.html';
    }
}

// Helper Functions

function getUsers() {
    const users = localStorage.getItem('nordform_users');
    return users ? JSON.parse(users) : [];
}

function setCurrentUser(user, remember = true) {
    const userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        loggedInAt: new Date().toISOString()
    };

    if (remember) {
        localStorage.setItem('nordform_current_user', JSON.stringify(userData));
    } else {
        sessionStorage.setItem('nordform_current_user', JSON.stringify(userData));
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('nordform_current_user') ||
        sessionStorage.getItem('nordform_current_user');
    return user ? JSON.parse(user) : null;
}

function logout() {
    localStorage.removeItem('nordform_current_user');
    sessionStorage.removeItem('nordform_current_user');
    window.location.href = 'home.html';
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function simpleHash(str) {
    // Simple hash function for client-side use
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearErrors() {
    const errors = document.querySelectorAll('.error-message');
    errors.forEach(error => {
        error.textContent = '';
        error.style.display = 'none';
    });
}
