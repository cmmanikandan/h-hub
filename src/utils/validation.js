export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
};

export const validatePassword = (password) => {
    // Min 6 characters
    return password.length >= 6;
};

export const getPasswordStrength = (password) => {
    if (!password) return { strength: '', color: '', width: '0%', label: '' };

    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z\d]/.test(password)) score++;

    if (score <= 2) return { strength: 'Weak', color: '#ef4444', width: '33%', label: '⚠️ Weak' };
    if (score <= 4) return { strength: 'Medium', color: '#f59e0b', width: '66%', label: '⚡ Medium' };
    return { strength: 'Strong', color: '#10b981', width: '100%', label: '✓ Strong' };
};

export const getEmailValidation = (email) => {
    if (!email) return { valid: null, message: '' };
    const valid = validateEmail(email);
    return {
        valid,
        message: valid ? '✓ Valid email' : '✗ Invalid email format',
        color: valid ? '#10b981' : '#ef4444'
    };
};

export const getPhoneValidation = (phone) => {
    if (!phone) return { valid: null, message: '' };
    const valid = validatePhone(phone);
    return {
        valid,
        message: valid ? '✓ Valid mobile number' : '✗ Must be 10 digits',
        color: valid ? '#10b981' : '#ef4444'
    };
};

export const getValidationErrors = (data, options = {}) => {
    const errors = [];

    if (data.email && !validateEmail(data.email)) {
        errors.push("Invalid email format (e.g. user@example.com)");
    }

    if (data.phone && !validatePhone(data.phone)) {
        errors.push("Mobile number must be exactly 10 digits");
    }

    if (data.password && !validatePassword(data.password)) {
        errors.push("Password must be at least 6 characters long");
    }

    if (options.checkConfirm && data.password !== data.confirmPassword) {
        errors.push("Passwords do not match");
    }

    return errors;
};
