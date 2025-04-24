// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

// Tab Switching
tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        tabButtons.forEach(btn => btn.classList.remove('active'));
        authForms.forEach(form => form.classList.remove('active'));
        
        // Add active class to clicked button and corresponding form
        button.classList.add('active');
        const formId = button.dataset.tab + '-form';
        document.getElementById(formId).classList.add('active');
    });
});

// Handle Login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        // Here you would typically make an API call to your backend
        // For now, we'll simulate a successful login
        const response = await simulateLogin(email, password);
        
        if (response.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: email,
                name: response.name
            }));
            
            // Redirect to chat page
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password');
        }
    } catch (error) {
        alert('An error occurred during login');
        console.error('Login error:', error);
    }
});

// Handle Sign Up
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    try {
        // Here you would typically make an API call to your backend
        // For now, we'll simulate a successful signup
        const response = await simulateSignup(name, email, password);
        
        if (response.success) {
            // Store user data in localStorage
            localStorage.setItem('user', JSON.stringify({
                email: email,
                name: name
            }));
            
            // Redirect to chat page
            window.location.href = 'index.html';
        } else {
            alert('Signup failed. Please try again.');
        }
    } catch (error) {
        alert('An error occurred during signup');
        console.error('Signup error:', error);
    }
});

// Simulated API calls (replace with actual API calls)
async function simulateLogin(email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would be an API call
    return {
        success: true,
        name: 'Test User'
    };
}

async function simulateSignup(name, email, password) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In a real application, this would be an API call
    return {
        success: true
    };
}

// Check if user is already logged in
window.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('user');
    if (user) {
        window.location.href = 'index.html';
    }
}); 