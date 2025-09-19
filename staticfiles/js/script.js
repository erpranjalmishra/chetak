// Health Sentinel JavaScript Functions - Multi-User Portal

// Cross-browser DOM ready function
function domReady(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // DOM is already ready
        setTimeout(callback, 1);
    } else if (document.addEventListener) {
        // Modern browsers
        document.addEventListener('DOMContentLoaded', callback);
    } else if (document.attachEvent) {
        // IE8 and below
        document.attachEvent('onreadystatechange', function() {
            if (document.readyState === 'complete') {
                callback();
            }
        });
    }
}

domReady(function() {
    // Initialize tooltips with error handling
    try {
        var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        var tooltipList = tooltipTriggerList.map(function(tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    } catch (e) {
        console.log('Tooltip initialization failed:', e);
    }

    // Initialize multi-user form handling
    initializeUserTypeHandling();

    // Initialize event listeners for elements that had inline handlers
    initializeEventListeners();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Form validation and submission
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // Login form handling with real API integration
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userType = document.querySelector('input[name="userType"]:checked').value;
            
            if (validateLoginByUserType(userType)) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
                submitBtn.disabled = true;

                // Get login credentials based on user type
                const loginData = getLoginDataByUserType(userType);
                
                if (loginData) {
                    // Make API call to backend
                    fetch('/api/login/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify(loginData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const userTypeNames = {
                                'general': 'General User',
                                'asha': 'ASHA Worker',
                                'doctor': 'Healthcare Provider',
                                'official': 'Government Official',
                                'admin': 'System Administrator',
                                'researcher': 'Researcher',
                                'volunteer': 'Volunteer'
                            };
                            
                            showNotification(`Welcome back, ${data.first_name}! You are logged in as ${userTypeNames[data.user_type]}.`, 'success');
                            bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
                            loginForm.reset();
                            
                            // Update UI to show logged in state
                            updateUIForLoggedInUser(data);
                            
                        } else {
                            showNotification(data.errors.join('<br>'), 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Login error:', error);
                        showNotification('Login failed. Please check your connection and try again.', 'error');
                    })
                    .finally(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                } else {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Register form handling with real API integration
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const userType = document.querySelector('input[name="regUserType"]:checked').value;
            
            if (validateRegistrationByUserType(userType)) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                submitBtn.disabled = true;

                // Get registration data based on user type
                const registrationData = getRegistrationDataByUserType(userType);
                
                if (registrationData) {
                    // Make API call to backend
                    fetch('/api/signup/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: JSON.stringify(registrationData)
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const userTypeNames = {
                                'general': 'General User',
                                'asha': 'ASHA Worker',
                                'doctor': 'Healthcare Provider',
                                'official': 'Government Official',
                                'researcher': 'Researcher',
                                'volunteer': 'Volunteer'
                            };
                            
                            showNotification(`Account created successfully as ${userTypeNames[data.user_type]}! ${data.message}`, 'success');
                            bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
                            registerForm.reset();
                            
                            // Reset user type selection
                            document.getElementById('regUserType1').checked = true;
                            showRegistrationFields('general');
                            
                            // Optionally show login modal
                            setTimeout(() => {
                                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                                loginModal.show();
                            }, 2000);
                            
                        } else {
                            showNotification(data.errors.join('<br>'), 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Registration error:', error);
                        showNotification('Registration failed. Please check your connection and try again.', 'error');
                    })
                    .finally(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                    });
                } else {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Initialize health tips carousel (if exists)
    initializeHealthTips();

    // Emergency contact quick access
    setupEmergencyContacts();

    // PWA initialization to clean up existing service workers
    initializePWA();
});

// Initialize user type handling for login and registration
function initializeUserTypeHandling() {
    // Login modal user type handling
    document.querySelectorAll('input[name="userType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            showLoginFields(this.value);
            updateLoginButtonText(this.value);
        });
    });

    // Registration modal user type handling
    document.querySelectorAll('input[name="regUserType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            showRegistrationFields(this.value);
            updateRegistrationButtonText(this.value);
        });
    });

    // Initialize with default selections
    showLoginFields('general');
    showRegistrationFields('general');
}

// Show appropriate login fields based on user type
function showLoginFields(userType) {
    // Hide all login sections
    document.querySelectorAll('.login-section').forEach(section => {
        section.classList.add('d-none');
    });

    // Show specific login section
    const targetSection = document.getElementById(userType + 'Login');
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Show appropriate registration fields based on user type
function showRegistrationFields(userType) {
    // Hide all registration sections
    document.querySelectorAll('.reg-section').forEach(section => {
        section.classList.add('d-none');
    });

    // Show specific registration section
    const targetSection = document.getElementById(userType + 'Reg');
    if (targetSection) {
        targetSection.classList.remove('d-none');
    }
}

// Update login button text based on user type
function updateLoginButtonText(userType) {
    const buttonTexts = {
        'general': 'Login to Portal',
        'asha': 'ASHA Login',
        'doctor': 'Provider Login',
        'official': 'Official Login',
        'admin': 'Admin Access',
        'researcher': 'Researcher Login'
    };
    
    const buttonElement = document.getElementById('loginButtonText');
    if (buttonElement) {
        buttonElement.textContent = buttonTexts[userType] || 'Login';
    }
}

// Update registration button text based on user type
function updateRegistrationButtonText(userType) {
    const buttonTexts = {
        'general': 'Create Account',
        'asha': 'Register as ASHA Worker',
        'doctor': 'Register as Healthcare Provider',
        'official': 'Register as Government Official',
        'admin': 'Request Admin Access',
        'researcher': 'Register as Researcher',
        'volunteer': 'Join as Volunteer'
    };
    
    const buttonElement = document.getElementById('registerButtonText');
    if (buttonElement) {
        buttonElement.textContent = buttonTexts[userType] || 'Create Account';
    }
}

// Validate login based on user type
function validateLoginByUserType(userType) {
    switch (userType) {
        case 'general':
            return validateGeneralLogin();
        case 'asha':
            return validateAshaLogin();
        case 'doctor':
            return validateDoctorLogin();
        case 'official':
            return validateOfficialLogin();
        case 'admin':
            return validateAdminLogin();
        case 'researcher':
            return validateResearcherLogin();
        default:
            return false;
    }
}

// Validate registration based on user type
function validateRegistrationByUserType(userType) {
    // Common validation first
    if (!validateCommonRegistrationFields()) {
        return false;
    }

    switch (userType) {
        case 'general':
            return validateGeneralRegistration();
        case 'asha':
            return validateAshaRegistration();
        case 'doctor':
            return validateDoctorRegistration();
        case 'official':
            return validateOfficialRegistration();
        case 'researcher':
            return validateResearcherRegistration();
        case 'volunteer':
            return validateVolunteerRegistration();
        default:
            return false;
    }
}

// Common registration field validation
function validateCommonRegistrationFields() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!firstName || !lastName) {
        showNotification('Please enter your first and last name.', 'danger');
        return false;
    }

    if (password.length < 8) {
        showNotification('Password must be at least 8 characters long.', 'danger');
        return false;
    }

    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'danger');
        return false;
    }

    if (!agreeTerms) {
        showNotification('Please agree to the terms and conditions.', 'danger');
        return false;
    }

    return true;
}

// User type specific validation functions
function validateGeneralLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'danger');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'danger');
        return false;
    }
    
    return true;
}

function validateAshaLogin() {
    const ashaId = document.getElementById('ashaId').value;
    const phone = document.getElementById('ashaPhone').value;
    const password = document.getElementById('ashaPassword').value;
    
    if (!ashaId || !ashaId.startsWith('ASHA')) {
        showNotification('Please enter a valid ASHA ID.', 'danger');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid 10-digit mobile number.', 'danger');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'danger');
        return false;
    }
    
    return true;
}

function validateDoctorLogin() {
    const regNo = document.getElementById('doctorRegNo').value;
    const email = document.getElementById('doctorEmail').value;
    const password = document.getElementById('doctorPassword').value;
    
    if (!regNo) {
        showNotification('Please enter your medical registration number.', 'danger');
        return false;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid professional email address.', 'danger');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'danger');
        return false;
    }
    
    return true;
}

function validateOfficialLogin() {
    const empId = document.getElementById('officialId').value;
    const email = document.getElementById('officialEmail').value;
    const password = document.getElementById('officialPassword').value;
    
    if (!empId) {
        showNotification('Please enter your employee ID.', 'danger');
        return false;
    }
    
    if (!email.includes('@gov.in')) {
        showNotification('Please use your official @gov.in email address.', 'danger');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'danger');
        return false;
    }
    
    return true;
}

function validateAdminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const otp = document.getElementById('adminOtp').value;
    
    if (!username) {
        showNotification('Please enter admin username.', 'danger');
        return false;
    }
    
    if (password.length < 8) {
        showNotification('Admin password must be at least 8 characters long.', 'danger');
        return false;
    }
    
    if (!otp || otp.length !== 6) {
        showNotification('Please enter a valid 6-digit 2FA code.', 'danger');
        return false;
    }
    
    return true;
}

function validateResearcherLogin() {
    const researcherId = document.getElementById('researcherId').value;
    const institution = document.getElementById('researcherInstitution').value;
    const email = document.getElementById('researcherEmail').value;
    const password = document.getElementById('researcherPassword').value;
    
    if (!researcherId) {
        showNotification('Please enter your researcher ID.', 'danger');
        return false;
    }
    
    if (!institution) {
        showNotification('Please enter your institution name.', 'danger');
        return false;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid academic email address.', 'danger');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long.', 'danger');
        return false;
    }
    
    return true;
}

// Registration validation functions
function validateGeneralRegistration() {
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('phoneNumber').value;
    const ageGroup = document.getElementById('ageGroup').value;
    const state = document.getElementById('generalState').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'danger');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid phone number.', 'danger');
        return false;
    }
    
    if (!ageGroup) {
        showNotification('Please select your age group.', 'danger');
        return false;
    }
    
    if (!state) {
        showNotification('Please select your state.', 'danger');
        return false;
    }
    
    return true;
}

function validateAshaRegistration() {
    const ashaId = document.getElementById('ashaRegId').value;
    const phone = document.getElementById('ashaRegPhone').value;
    const district = document.getElementById('ashaDistrict').value;
    const block = document.getElementById('ashaBlock').value;
    
    if (!ashaId || !ashaId.startsWith('ASHA')) {
        showNotification('Please enter a valid ASHA ID.', 'danger');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid registered mobile number.', 'danger');
        return false;
    }
    
    if (!district || !block) {
        showNotification('Please enter your district and block/PHC details.', 'danger');
        return false;
    }
    
    return true;
}

function validateDoctorRegistration() {
    const regNo = document.getElementById('doctorRegNumber').value;
    const specialty = document.getElementById('doctorSpecialty').value;
    const email = document.getElementById('doctorEmail').value;
    const phone = document.getElementById('doctorPhone').value;
    const institution = document.getElementById('doctorInstitution').value;
    
    if (!regNo) {
        showNotification('Please enter your medical registration number.', 'danger');
        return false;
    }
    
    if (!specialty) {
        showNotification('Please select your specialization.', 'danger');
        return false;
    }
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid professional email.', 'danger');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid contact number.', 'danger');
        return false;
    }
    
    if (!institution) {
        showNotification('Please enter your institution/hospital name.', 'danger');
        return false;
    }
    
    return true;
}

function validateOfficialRegistration() {
    const empId = document.getElementById('officialRegId').value;
    const email = document.getElementById('officialRegEmail').value;
    const department = document.getElementById('officialDepartment').value;
    const designation = document.getElementById('officialDesignation').value;
    const location = document.getElementById('officialLocation').value;
    
    if (!empId) {
        showNotification('Please enter your employee ID.', 'danger');
        return false;
    }
    
    if (!email.includes('@gov.in')) {
        showNotification('Please use your official @gov.in email address.', 'danger');
        return false;
    }
    
    if (!department) {
        showNotification('Please select your department.', 'danger');
        return false;
    }
    
    if (!designation || !location) {
        showNotification('Please enter your designation and office location.', 'danger');
        return false;
    }
    
    return true;
}

function validateResearcherRegistration() {
    const email = document.getElementById('researcherRegEmail').value;
    const institution = document.getElementById('researcherInst').value;
    const field = document.getElementById('researcherField').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid academic email address.', 'danger');
        return false;
    }
    
    if (!institution) {
        showNotification('Please enter your institution name.', 'danger');
        return false;
    }
    
    if (!field) {
        showNotification('Please select your research field.', 'danger');
        return false;
    }
    
    return true;
}

function validateVolunteerRegistration() {
    const email = document.getElementById('volunteerEmail').value;
    const phone = document.getElementById('volunteerPhone').value;
    const interest = document.getElementById('volunteerInterest').value;
    
    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'danger');
        return false;
    }
    
    if (!validatePhone(phone)) {
        showNotification('Please enter a valid phone number.', 'danger');
        return false;
    }
    
    if (!interest) {
        showNotification('Please select at least one area of interest.', 'danger');
        return false;
    }
    
    return true;
}

// Function to select user type and open login modal
function selectUserType(userType) {
    // Set the appropriate radio button
    const userTypeRadio = document.querySelector(`input[name="userType"][value="${userType}"]`);
    if (userTypeRadio) {
        userTypeRadio.checked = true;
        showLoginFields(userType);
        updateLoginButtonText(userType);
    }
}

// Email validation function - Cross-browser compatible
function validateEmail(email) {
    // More robust email validation for Edge/IE compatibility
    if (!email || typeof email !== 'string') {
        return false;
    }
    
    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Additional checks for Edge/IE
    if (email.length > 320) { // RFC 5321 limit
        return false;
    }
    
    return emailRegex.test(email.trim());
}

// Phone validation function
function validatePhone(phone) {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Notification system - Cross-browser compatible
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    for (let i = 0; i < existingNotifications.length; i++) {
        existingNotifications[i].remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'alert alert-' + type + ' custom-notification position-fixed';
    
    // Cross-browser style setting
    if (notification.style.cssText !== undefined) {
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border: none; border-radius: 8px;';
    } else {
        // Fallback for older browsers
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.maxWidth = '400px';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        notification.style.border = 'none';
        notification.style.borderRadius = '8px';
        notification.style.position = 'fixed';
    }
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas fa-${getIconForType(type)} me-2"></i>
            <div class="flex-grow-1">${message}</div>
            <button type="button" class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Get icon for notification type
function getIconForType(type) {
    const icons = {
        'success': 'check-circle',
        'danger': 'exclamation-triangle',
        'warning': 'exclamation-circle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Initialize health tips
function initializeHealthTips() {
    const healthTips = [
        "Drink at least 8 glasses of water daily for optimal health.",
        "Take a 10-minute walk after every meal to aid digestion.",
        "Get 7-9 hours of quality sleep each night.",
        "Eat at least 5 servings of fruits and vegetables daily.",
        "Practice deep breathing exercises to reduce stress.",
        "Wash your hands frequently to prevent infections.",
        "Limit screen time before bedtime for better sleep quality.",
        "Regular health check-ups can prevent serious illnesses."
    ];

    // Display random health tip
    const tipElement = document.getElementById('healthTip');
    if (tipElement) {
        const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
        tipElement.textContent = randomTip;
    }
}

// Emergency contacts setup
function setupEmergencyContacts() {
    const emergencyButtons = document.querySelectorAll('.emergency-contact');
    emergencyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const contactType = this.dataset.contact;
            showEmergencyModal(contactType);
        });
    });
}

// Show emergency contact modal
function showEmergencyModal(contactType) {
    const emergencyContacts = {
        'ambulance': { number: '108', service: 'Ambulance Emergency' },
        'police': { number: '100', service: 'Police Emergency' },
        'fire': { number: '101', service: 'Fire Emergency' },
        'health': { number: '1075', service: 'Health Helpline' }
    };

    const contact = emergencyContacts[contactType];
    if (contact) {
        const modalHtml = `
            <div class="modal fade" id="emergencyModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header bg-danger text-white">
                            <h5 class="modal-title">
                                <i class="fas fa-exclamation-triangle"></i> Emergency Contact
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <h3>${contact.service}</h3>
                            <h1 class="text-danger">${contact.number}</h1>
                            <p>Click the button below to call immediately</p>
                            <a href="tel:${contact.number}" class="btn btn-danger btn-lg">
                                <i class="fas fa-phone"></i> Call Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('emergencyModal'));
        modal.show();
        
        // Remove modal after it's hidden
        document.getElementById('emergencyModal').addEventListener('hidden.bs.modal', function() {
            this.remove();
        });
    }
}

// Progressive Web App initialization - DISABLED
function initializePWA() {
    // PWA functionality disabled to prevent 404 errors for sw.js
    console.log('PWA initialization disabled');
    
    // Unregister any existing service workers
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister().then(function(boolean) {
                    console.log('Service worker unregistered:', boolean);
                });
            }
        });
    }
}

// Install prompt handling - DISABLED
// PWA install prompts disabled to prevent unnecessary functionality

// Show install prompt
function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.className = 'alert alert-primary position-fixed';
    installBanner.style.cssText = `
        bottom: 20px;
        left: 20px;
        right: 20px;
        z-index: 9999;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    `;
    
    installBanner.innerHTML = `
        <div class="d-flex align-items-center justify-content-between">
            <div>
                <strong>Install Health Sentinel</strong><br>
                <small>Get quick access to health resources</small>
            </div>
            <div>
                <button class="btn btn-primary btn-sm me-2" onclick="installApp()">Install</button>
                <button class="btn btn-outline-secondary btn-sm" onclick="this.parentElement.parentElement.parentElement.remove()">Later</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(installBanner);
}

// Install app function - DISABLED
function installApp() {
    console.log('PWA install functionality disabled');
}

// Health data tracking (localStorage)
const HealthTracker = {
    saveUserData: function(key, value) {
        localStorage.setItem(`healthSentinel_${key}`, JSON.stringify(value));
    },
    
    getUserData: function(key) {
        const data = localStorage.getItem(`healthSentinel_${key}`);
        return data ? JSON.parse(data) : null;
    },
    
    removeUserData: function(key) {
        localStorage.removeItem(`healthSentinel_${key}`);
    }
};

// Health scheme search functionality
function searchSchemes() {
    const searchTerm = document.getElementById('schemeSearch')?.value.toLowerCase();
    if (!searchTerm) return;

    const schemes = document.querySelectorAll('.scheme-card');
    schemes.forEach(scheme => {
        const title = scheme.querySelector('.card-title')?.textContent.toLowerCase();
        const description = scheme.querySelector('.card-text')?.textContent.toLowerCase();
        
        if (title?.includes(searchTerm) || description?.includes(searchTerm)) {
            scheme.parentElement.style.display = 'block';
        } else {
            scheme.parentElement.style.display = 'none';
        }
    });
}

// Health calculator utilities
const HealthCalculators = {
    bmi: function(weight, height) {
        const bmi = weight / (height * height);
        let category = '';
        
        if (bmi < 18.5) category = 'Underweight';
        else if (bmi < 25) category = 'Normal weight';
        else if (bmi < 30) category = 'Overweight';
        else category = 'Obese';
        
        return { value: bmi.toFixed(1), category };
    },
    
    waterIntake: function(weight, activityLevel = 'moderate') {
        const base = weight * 35; // ml per kg
        const multiplier = activityLevel === 'high' ? 1.3 : activityLevel === 'low' ? 0.8 : 1;
        return Math.round(base * multiplier);
    }
};

// Initialize page-specific functionality
document.addEventListener('DOMContentLoaded', function() {
    // Add animation classes on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);

    // Observe all cards and feature sections
    document.querySelectorAll('.card, .feature-icon').forEach(el => {
        observer.observe(el);
    });
});

// Initialize event listeners for elements that previously had inline handlers
function initializeEventListeners() {
    // Add a small delay to ensure DOM is fully loaded (Edge compatibility)
    setTimeout(function() {
        try {
            // Language selector with error handling
            const languageSelect = document.getElementById('languageSelect');
            if (languageSelect) {
                // Use both 'change' and 'input' events for better Edge support
                languageSelect.addEventListener('change', function() {
                    try {
                        changeLanguage(this.value);
                    } catch (e) {
                        console.error('Language change error:', e);
                    }
                });
                languageSelect.addEventListener('input', function() {
                    try {
                        changeLanguage(this.value);
                    } catch (e) {
                        console.error('Language input error:', e);
                    }
                });
            }
        } catch (e) {
            console.error('Language selector initialization error:', e);
        }
    }, 100);

    // Accessibility toggle with error handling
    try {
        const accessibilityToggle = document.querySelector('.accessibility-toggle');
        if (accessibilityToggle) {
            accessibilityToggle.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    toggleAccessibility();
                } catch (err) {
                    console.error('Accessibility toggle error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Accessibility toggle initialization error:', e);
    }

    // Help button with error handling
    try {
        const helpButton = document.querySelector('.help-button');
        if (helpButton) {
            helpButton.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    openHelpModal();
                } catch (err) {
                    console.error('Help modal error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Help button initialization error:', e);
    }

    // Feedback button with error handling
    try {
        const feedbackButton = document.querySelector('.feedback-button');
        if (feedbackButton) {
            feedbackButton.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    openFeedbackModal();
                } catch (err) {
                    console.error('Feedback modal error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Feedback button initialization error:', e);
    }

    // User type login buttons with error handling
    try {
        const userTypeLoginButtons = document.querySelectorAll('.user-type-login');
        userTypeLoginButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    const userType = this.getAttribute('data-user-type');
                    if (userType) {
                        selectUserType(userType);
                    }
                } catch (err) {
                    console.error('User type login error:', err);
                }
            });
        });
    } catch (e) {
        console.error('User type buttons initialization error:', e);
    }

    // Accessibility panel event listeners
    try {
        const accessibilityClose = document.querySelector('.accessibility-close');
        if (accessibilityClose) {
            accessibilityClose.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    toggleAccessibility();
                } catch (err) {
                    console.error('Accessibility close error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Accessibility close initialization error:', e);
    }

    // Font size buttons with error handling
    try {
        const fontSizeButtons = document.querySelectorAll('.font-size-btn');
        fontSizeButtons.forEach(function(button) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    const size = this.getAttribute('data-size');
                    if (size) {
                        changeFontSize(size);
                    }
                } catch (err) {
                    console.error('Font size change error:', err);
                }
            });
        });
    } catch (e) {
        console.error('Font size buttons initialization error:', e);
    }

    // High contrast mode with error handling
    try {
        const highContrastMode = document.getElementById('highContrastMode');
        if (highContrastMode) {
            highContrastMode.addEventListener('change', function() {
                try {
                    toggleHighContrast();
                } catch (err) {
                    console.error('High contrast toggle error:', err);
                }
            });
        }
    } catch (e) {
        console.error('High contrast mode initialization error:', e);
    }

    // Screen reader mode with error handling
    try {
        const screenReaderMode = document.getElementById('screenReaderMode');
        if (screenReaderMode) {
            screenReaderMode.addEventListener('change', function() {
                try {
                    toggleScreenReader();
                } catch (err) {
                    console.error('Screen reader toggle error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Screen reader mode initialization error:', e);
    }

    // Keyboard navigation with error handling
    try {
        const keyboardNavigation = document.getElementById('keyboardNavigation');
        if (keyboardNavigation) {
            keyboardNavigation.addEventListener('change', function() {
                try {
                    toggleKeyboardNav();
                } catch (err) {
                    console.error('Keyboard navigation toggle error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Keyboard navigation initialization error:', e);
    }

    // Reset accessibility with error handling
    try {
        const resetAccessibilityBtn = document.querySelector('.reset-accessibility');
        if (resetAccessibilityBtn) {
            resetAccessibilityBtn.addEventListener('click', function(e) {
                e.preventDefault();
                try {
                    resetAccessibility();
                } catch (err) {
                    console.error('Reset accessibility error:', err);
                }
            });
        }
    } catch (e) {
        console.error('Reset accessibility initialization error:', e);
    }
}

// Export functions for global access
window.HealthSentinel = {
    showNotification,
    HealthTracker,
    HealthCalculators,
    searchSchemes,
    installApp
};

// Language Selector Functionality
const translations = {
    'en': {
        'The Chetak': 'The Chetak',
        'Health Community Portal': 'Health Community Portal',
        'Unified Portal': 'Unified Portal',
        'Home': 'Home',
        'Health Schemes': 'Health Schemes',
        'Health Alerts': 'Health Alerts',
        'Education': 'Education',
        'Community': 'Community',
        'Services': 'Services',
        'Emergency': 'Emergency',
        'Contact': 'Contact',
        'Login': 'Login',
        'Register': 'Register',
        'Welcome': 'Welcome',
        'General Public': 'General Public',
        'General Public Portal': 'General Public Portal',
        'ASHA Worker Portal': 'ASHA Worker Portal',
        'Healthcare Provider Portal': 'Healthcare Provider Portal',
        'ASHA Workers': 'ASHA Workers',
        'Healthcare Providers': 'Healthcare Providers',
        'Government Officials': 'Government Officials',
        'System Administrators': 'System Administrators',
        'Researchers': 'Researchers',
        'Volunteers': 'Volunteers',
        'Government of India': 'Government of India',
        'Government of India Ministry of Health': 'Government of India Ministry of Health',
        'Healthy India, Digital India': 'Healthy India, Digital India',
        'Quick Links': 'Quick Links',
        'Important Links': 'Important Links',
        'Contact Information': 'Contact Information',
        'Helpline': 'Helpline',
        'Emergency': 'Emergency',
        'Email': 'Email',
        'Follow Us': 'Follow Us',
        'Help': 'Help',
        'Feedback': 'Feedback',
        'Accessibility': 'Accessibility',
        'Comprehensive health ecosystem': 'Comprehensive health ecosystem connecting citizens, healthcare providers, ASHA workers, government officials, and researchers. One platform for health education, community support, and policy implementation.',
        'Health information and services': 'Health information and services for citizens',
        'Community health resources': 'Community health resources and tools',
        'Professional tools': 'Professional tools and patient management'
    },
    'hi': {
        'The Chetak': 'द चेतक',
        'Health Community Portal': 'स्वास्थ्य सामुदायिक पोर्टल',
        'Unified Portal': 'एकीकृत पोर्टल',
        'Home': 'होम',
        'Health Schemes': 'स्वास्थ्य योजनाएं',
        'Health Alerts': 'स्वास्थ्य चेतावनी',
        'Education': 'शिक्षा',
        'Community': 'समुदाय',
        'Services': 'सेवाएं',
        'Emergency': 'आपातकाल',
        'Contact': 'संपर्क',
        'Login': 'लॉगिन',
        'Register': 'पंजीकरण',
        'Welcome': 'स्वागत',
        'General Public': 'आम जनता',
        'General Public Portal': 'आम जनता पोर्टल',
        'ASHA Worker Portal': 'आशा कार्यकर्ता पोर्टल',
        'Healthcare Provider Portal': 'स्वास्थ्य सेवा प्रदाता पोर्टल',
        'ASHA Workers': 'आशा कार्यकर्ता',
        'Healthcare Providers': 'स्वास्थ्य सेवा प्रदाता',
        'Government Officials': 'सरकारी अधिकारी',
        'System Administrators': 'सिस्टम प्रशासक',
        'Researchers': 'शोधकर्ता',
        'Volunteers': 'स्वयंसेवक',
        'Government of India': 'भारत सरकार',
        'Government of India Ministry of Health': 'भारत सरकार स्वास्थ्य मंत्रालय',
        'Healthy India, Digital India': 'स्वस्थ भारत, डिजिटल भारत',
        'Quick Links': 'त्वरित लिंक',
        'Important Links': 'महत्वपूर्ण लिंक',
        'Contact Information': 'संपर्क जानकारी',
        'Helpline': 'हेल्पलाइन',
        'Emergency': 'आपातकाल',
        'Email': 'ईमेल',
        'Follow Us': 'हमें फॉलो करें',
        'Help': 'सहायता',
        'Feedback': 'फीडबैक',
        'Accessibility': 'सुगम्यता',
        'Comprehensive health ecosystem': 'व्यापक स्वास्थ्य पारिस्थितिकी तंत्र जो नागरिकों, स्वास्थ्य सेवा प्रदाताओं, आशा कार्यकर्ताओं, सरकारी अधिकारियों और शोधकर्ताओं को जोड़ता है। स्वास्थ्य शिक्षा, सामुदायिक सहायता और नीति कार्यान्वयन के लिए एक मंच।',
        'Health information and services': 'नागरिकों के लिए स्वास्थ्य जानकारी और सेवाएं',
        'Community health resources': 'सामुदायिक स्वास्थ्य संसाधन और उपकरण',
        'Professional tools': 'पेशेवर उपकरण और रोगी प्रबंधन'
    }
};

let currentLanguage = 'en';

function changeLanguage(language) {
    currentLanguage = language;
    
    // Save language preference
    localStorage.setItem('preferredLanguage', language);
    
    // Update all translatable elements
    const translatedElements = document.querySelectorAll('[data-translate]');
    console.log(`Found ${translatedElements.length} elements to translate`);
    
    translatedElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
            console.log(`Translated "${key}" to "${translations[language][key]}"`);
        } else {
            console.warn(`Translation not found for key: "${key}" in language: ${language}`);
        }
    });
    
    // Update page direction for Hindi
    if (language === 'hi') {
        document.body.setAttribute('dir', 'ltr'); // Keep LTR for better layout
        document.body.classList.add('hindi-font');
    } else {
        document.body.removeAttribute('dir');
        document.body.classList.remove('hindi-font');
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = language;
    
    // Show success notification
    const languageNames = {
        'en': 'English',
        'hi': 'हिंदी'
    };
    
    showNotification(`Language changed to ${languageNames[language]}`, 'success');
}

// Font Size Control
function changeFontSize(size) {
    // Remove existing font size classes
    document.body.classList.remove('font-small', 'font-large');
    
    // Update accessibility panel buttons
    document.querySelectorAll('.accessibility-panel .btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Apply new font size
    if (size === 'small') {
        document.body.classList.add('font-small');
        document.querySelector('.accessibility-panel .btn-group .btn[onclick*="small"]').classList.add('active');
    } else if (size === 'large') {
        document.body.classList.add('font-large');
        document.querySelector('.accessibility-panel .btn-group .btn[onclick*="large"]').classList.add('active');
    } else {
        document.querySelector('.accessibility-panel .btn-group .btn[onclick*="normal"]').classList.add('active');
    }
    
    // Save preference
    localStorage.setItem('fontSize', size);
    
    showNotification(`Font size changed to ${size}`, 'info');
}

// Accessibility Panel Toggle
function toggleAccessibility() {
    const panel = document.getElementById('accessibilityPanel');
    if (panel) {
        panel.classList.toggle('show');
    }
}

// High Contrast Mode
function toggleHighContrast() {
    const isEnabled = document.body.classList.toggle('high-contrast');
    localStorage.setItem('highContrast', isEnabled);
    
    showNotification(`High contrast mode ${isEnabled ? 'enabled' : 'disabled'}`, 'info');
}

// Screen Reader Support
function toggleScreenReader() {
    const isEnabled = document.body.classList.toggle('screen-reader-mode');
    localStorage.setItem('screenReaderMode', isEnabled);
    
    if (isEnabled) {
        // Add ARIA labels and descriptions
        addScreenReaderSupport();
        showNotification('Screen reader support enabled', 'info');
    } else {
        removeScreenReaderSupport();
        showNotification('Screen reader support disabled', 'info');
    }
}

// Keyboard Navigation Enhancement
function toggleKeyboardNav() {
    const isEnabled = document.body.classList.toggle('keyboard-nav');
    localStorage.setItem('keyboardNavigation', isEnabled);
    
    if (isEnabled) {
        enhanceKeyboardNavigation();
        showNotification('Enhanced keyboard navigation enabled', 'info');
    } else {
        removeKeyboardNavigation();
        showNotification('Enhanced keyboard navigation disabled', 'info');
    }
}

// Reset Accessibility Settings
function resetAccessibility() {
    // Remove all accessibility classes
    document.body.classList.remove('font-small', 'font-large', 'high-contrast', 'screen-reader-mode', 'keyboard-nav', 'hindi-font');
    
    // Reset form controls
    document.getElementById('highContrastMode').checked = false;
    document.getElementById('screenReaderMode').checked = false;
    document.getElementById('keyboardNavigation').checked = false;
    
    // Reset font size buttons
    document.querySelectorAll('.accessibility-panel .btn-group .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.accessibility-panel .btn-group .btn[onclick*="normal"]').classList.add('active');
    
    // Reset language
    document.getElementById('languageSelect').value = 'en';
    changeLanguage('en');
    
    // Clear localStorage
    localStorage.removeItem('fontSize');
    localStorage.removeItem('highContrast');
    localStorage.removeItem('screenReaderMode');
    localStorage.removeItem('keyboardNavigation');
    localStorage.removeItem('preferredLanguage');
    
    showNotification('All accessibility settings reset to default', 'success');
}

// Add Screen Reader Support
function addScreenReaderSupport() {
    // Add ARIA labels to important elements
    document.querySelectorAll('img:not([alt])').forEach(img => {
        img.setAttribute('alt', 'Image');
    });
    
    // Add role and aria-label to navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        if (!link.getAttribute('aria-label')) {
            link.setAttribute('aria-label', link.textContent.trim());
        }
    });
    
    // Add aria-expanded to dropdown buttons
    document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
        toggle.setAttribute('aria-expanded', 'false');
    });
    
    // Add live region for notifications
    if (!document.getElementById('ariaLiveRegion')) {
        const liveRegion = document.createElement('div');
        liveRegion.id = 'ariaLiveRegion';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        document.body.appendChild(liveRegion);
    }
}

// Remove Screen Reader Support
function removeScreenReaderSupport() {
    // Remove live region
    const liveRegion = document.getElementById('ariaLiveRegion');
    if (liveRegion) {
        liveRegion.remove();
    }
}

// Enhance Keyboard Navigation
function enhanceKeyboardNavigation() {
    // Add skip links if not present
    if (!document.getElementById('skipToMain')) {
        const skipLink = document.createElement('a');
        skipLink.id = 'skipToMain';
        skipLink.href = '#main-content';
        skipLink.textContent = 'Skip to main content';
        skipLink.style.cssText = `
            position: absolute;
            top: -40px;
            left: 6px;
            z-index: 10000;
            background: #000;
            color: #fff;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            transition: top 0.3s;
        `;
        skipLink.addEventListener('focus', () => {
            skipLink.style.top = '6px';
        });
        skipLink.addEventListener('blur', () => {
            skipLink.style.top = '-40px';
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
    
    // Ensure all interactive elements are focusable
    document.querySelectorAll('button, a, input, select, textarea').forEach(element => {
        if (!element.hasAttribute('tabindex') && element.tabIndex < 0) {
            element.tabIndex = 0;
        }
    });
}

// Remove Keyboard Navigation Enhancements
function removeKeyboardNavigation() {
    const skipLink = document.getElementById('skipToMain');
    if (skipLink) {
        skipLink.remove();
    }
}

// Help Modal Functions
function openHelpModal() {
    const helpModal = new bootstrap.Modal(document.getElementById('helpModal'));
    helpModal.show();
}

// Feedback Modal Functions
function openFeedbackModal() {
    const feedbackModal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    feedbackModal.show();
    
    // Initialize rating stars
    initializeFeedbackRating();
}

// Initialize Feedback Rating System
function initializeFeedbackRating() {
    const stars = document.querySelectorAll('.rating-stars i');
    let selectedRating = 0;
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            selectedRating = index + 1;
            updateStarDisplay(selectedRating);
        });
        
        star.addEventListener('mouseover', () => {
            updateStarDisplay(index + 1);
        });
    });
    
    document.querySelector('.rating-stars').addEventListener('mouseleave', () => {
        updateStarDisplay(selectedRating);
    });
    
    function updateStarDisplay(rating) {
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
    
    // Handle feedback form submission
    document.getElementById('feedbackForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = {
            type: document.getElementById('feedbackType').value,
            subject: document.getElementById('feedbackSubject').value,
            message: document.getElementById('feedbackMessage').value,
            email: document.getElementById('feedbackEmail').value,
            rating: selectedRating
        };
        
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            showNotification('Thank you for your feedback! We will review it shortly.', 'success');
            bootstrap.Modal.getInstance(document.getElementById('feedbackModal')).hide();
            this.reset();
            selectedRating = 0;
            updateStarDisplay(0);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Load Saved Preferences on Page Load
document.addEventListener('DOMContentLoaded', function() {
    // Load language preference
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        document.getElementById('languageSelect').value = savedLanguage;
        changeLanguage(savedLanguage);
    }
    
    // Add debug information
    console.log('Language system initialized');
    console.log('Available translations:', Object.keys(translations));
    console.log('Elements with data-translate:', document.querySelectorAll('[data-translate]').length);
    
    // Load font size preference
    const savedFontSize = localStorage.getItem('fontSize');
    if (savedFontSize) {
        changeFontSize(savedFontSize);
    }
    
    // Load high contrast preference
    const savedHighContrast = localStorage.getItem('highContrast') === 'true';
    if (savedHighContrast) {
        document.getElementById('highContrastMode').checked = true;
        toggleHighContrast();
    }
    
    // Load screen reader preference
    const savedScreenReader = localStorage.getItem('screenReaderMode') === 'true';
    if (savedScreenReader) {
        document.getElementById('screenReaderMode').checked = true;
        toggleScreenReader();
    }
    
    // Load keyboard navigation preference
    const savedKeyboardNav = localStorage.getItem('keyboardNavigation') === 'true';
    if (savedKeyboardNav) {
        document.getElementById('keyboardNavigation').checked = true;
        toggleKeyboardNav();
    }
});

// Helper function to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Function to get login data based on user type
function getLoginDataByUserType(userType) {
    const commonData = {
        user_type: userType
    };
    
    switch (userType) {
        case 'general':
            const generalEmail = document.getElementById('loginEmail').value;
            const generalPassword = document.getElementById('loginPassword').value;
            return {
                ...commonData,
                username: generalEmail,
                password: generalPassword
            };
            
        case 'asha':
            const ashaId = document.getElementById('ashaId').value;
            const ashaPassword = document.getElementById('ashaPassword').value;
            return {
                ...commonData,
                username: ashaId,
                password: ashaPassword
            };
            
        case 'doctor':
            const doctorRegNo = document.getElementById('doctorRegNo').value;
            const doctorPassword = document.getElementById('doctorPassword').value;
            return {
                ...commonData,
                username: doctorRegNo,
                password: doctorPassword
            };
            
        case 'official':
            const officialId = document.getElementById('officialId').value;
            const officialPassword = document.getElementById('officialPassword').value;
            return {
                ...commonData,
                username: officialId,
                password: officialPassword
            };
            
        case 'admin':
            const adminUsername = document.getElementById('adminUsername').value;
            const adminPassword = document.getElementById('adminPassword').value;
            return {
                ...commonData,
                username: adminUsername,
                password: adminPassword
            };
            
        case 'researcher':
            const researcherId = document.getElementById('researcherId').value;
            const researcherPassword = document.getElementById('researcherPassword').value;
            return {
                ...commonData,
                username: researcherId,
                password: researcherPassword
            };
            
        default:
            showNotification('Please select a valid user type.', 'error');
            return null;
    }
}

// Function to get registration data based on user type
function getRegistrationDataByUserType(userType) {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    
    const commonData = {
        user_type: userType,
        first_name: firstName,
        last_name: lastName
    };
    
    switch (userType) {
        case 'general':
            return {
                ...commonData,
                username: document.getElementById('registerEmail').value,
                email: document.getElementById('registerEmail').value,
                password: document.getElementById('registerPassword').value,
                confirm_password: document.getElementById('confirmPassword').value,
                phone_number: document.getElementById('phoneNumber').value,
                age_group: document.getElementById('ageGroup').value,
                state: document.getElementById('generalState').value,
                district: document.getElementById('generalDistrict') ? document.getElementById('generalDistrict').value : '',
                newsletter_subscription: document.getElementById('newsletterSubscription') ? document.getElementById('newsletterSubscription').checked : false,
                data_consent: document.getElementById('dataConsent') ? document.getElementById('dataConsent').checked : false
            };
            
        case 'asha':
            return {
                ...commonData,
                username: document.getElementById('ashaRegId').value,
                email: document.getElementById('ashaRegEmail').value,
                password: document.getElementById('ashaRegPassword').value,
                confirm_password: document.getElementById('ashaConfirmPassword').value,
                phone_number: document.getElementById('ashaRegPhone').value,
                asha_id: document.getElementById('ashaRegId').value,
                district: document.getElementById('ashaDistrict').value,
                block_phc: document.getElementById('ashaBlock').value,
                assigned_villages: document.getElementById('ashaVillages').value
            };
            
        case 'doctor':
            return {
                ...commonData,
                username: document.getElementById('doctorRegNo').value,
                email: document.getElementById('doctorRegEmail').value,
                password: document.getElementById('doctorRegPassword').value,
                confirm_password: document.getElementById('doctorConfirmPassword').value,
                phone_number: document.getElementById('doctorRegPhone').value,
                registration_number: document.getElementById('doctorRegNo').value,
                specialization: document.getElementById('doctorSpecialization').value,
                institution: document.getElementById('doctorInstitution').value,
                experience_years: document.getElementById('doctorExperience').value,
                available_for_telemedicine: document.getElementById('doctorTelemedicine') ? document.getElementById('doctorTelemedicine').checked : false
            };
            
        case 'official':
            return {
                ...commonData,
                username: document.getElementById('officialRegId').value,
                email: document.getElementById('officialRegEmail').value,
                password: document.getElementById('officialRegPassword').value,
                confirm_password: document.getElementById('officialConfirmPassword').value,
                phone_number: document.getElementById('officialRegPhone').value,
                employee_id: document.getElementById('officialRegId').value,
                department: document.getElementById('officialDepartment').value,
                designation: document.getElementById('officialDesignation').value,
                office_location: document.getElementById('officialLocation').value
            };
            
        case 'researcher':
            return {
                ...commonData,
                username: document.getElementById('researcherRegId').value,
                email: document.getElementById('researcherRegEmail').value,
                password: document.getElementById('researcherRegPassword').value,
                confirm_password: document.getElementById('researcherConfirmPassword').value,
                phone_number: document.getElementById('researcherRegPhone').value,
                researcher_id: document.getElementById('researcherRegId').value,
                institution: document.getElementById('researcherInstitution').value,
                research_field: document.getElementById('researcherField').value,
                research_focus: document.getElementById('researcherFocus').value
            };
            
        case 'volunteer':
            return {
                ...commonData,
                username: document.getElementById('volunteerRegEmail').value,
                email: document.getElementById('volunteerRegEmail').value,
                password: document.getElementById('volunteerRegPassword').value,
                confirm_password: document.getElementById('volunteerConfirmPassword').value,
                phone_number: document.getElementById('volunteerRegPhone').value,
                areas_of_interest: getSelectedVolunteerInterests(),
                availability: document.getElementById('volunteerAvailability').value,
                previous_experience: document.getElementById('volunteerExperience').value,
                skills: document.getElementById('volunteerSkills').value
            };
            
        default:
            showNotification('Please select a valid user type.', 'error');
            return null;
    }
}

// Function to get selected volunteer interests
function getSelectedVolunteerInterests() {
    const checkboxes = document.querySelectorAll('input[name="volunteerInterests"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// Function to update UI for logged in user
function updateUIForLoggedInUser(userData) {
    // Update header buttons
    const loginBtn = document.querySelector('.header-login-btn');
    const registerBtn = document.querySelector('.header-register-btn');
    
    if (loginBtn && registerBtn) {
        // Replace login/register buttons with user menu
        const userMenu = `
            <div class="dropdown">
                <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i class="fas fa-user"></i> ${userData.first_name}
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" onclick="showProfile()"><i class="fas fa-user-circle"></i> Profile</a></li>
                    <li><a class="dropdown-item" href="#" onclick="showDashboard()"><i class="fas fa-tachometer-alt"></i> Dashboard</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
                </ul>
            </div>
        `;
        
        loginBtn.parentNode.innerHTML = userMenu;
    }
    
    // Store user data in localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData));
}

// Function to handle logout
function logout() {
    fetch('/api/logout/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Logged out successfully!', 'success');
            
            // Clear user data from localStorage
            localStorage.removeItem('userData');
            
            // Reload page to reset UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            showNotification('Logout failed. Please try again.', 'error');
        }
    })
    .catch(error => {
        console.error('Logout error:', error);
        showNotification('Logout failed. Please try again.', 'error');
    });
}

// Function to show user profile
function showProfile() {
    fetch('/api/profile/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Display profile information in a modal or redirect to profile page
            console.log('Profile data:', data.profile);
            showNotification('Profile loaded successfully!', 'info');
        } else {
            showNotification('Failed to load profile data.', 'error');
        }
    })
    .catch(error => {
        console.error('Profile error:', error);
        showNotification('Failed to load profile data.', 'error');
    });
}

// Function to show dashboard (placeholder)
function showDashboard() {
    showNotification('Dashboard feature coming soon!', 'info');
}

// Check if user is already logged in on page load
domReady(function() {
    fetch('/api/user-status/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.authenticated) {
            updateUIForLoggedInUser({
                first_name: data.first_name,
                username: data.username,
                user_type: data.user_type
            });
        }
    })
    .catch(error => {
        console.log('User status check failed:', error);
    });
});

// Additional utility functions for better UX
function setButtonLoading(button, isLoading, originalText) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    } else {
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

// Handle network connectivity issues
function handleNetworkError(error) {
    if (!navigator.onLine) {
        showNotification('No internet connection. Please check your network and try again.', 'error');
    } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showNotification('Server connection failed. Please try again later.', 'error');
    } else {
        showNotification('An unexpected error occurred. Please try again.', 'error');
    }
}

// Form validation helpers
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

function validatePassword(password) {
    return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
}

// Initialize tooltips and accessibility features
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Add keyboard navigation support
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            // Close any open modals
            const openModals = document.querySelectorAll('.modal.show');
            openModals.forEach(modal => {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            });
        }
    });
    
    // Add focus management for modals
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('shown.bs.modal', function() {
            const firstFocusable = modal.querySelector('input, select, textarea, button');
            if (firstFocusable) firstFocusable.focus();
        });
    });
});