class OTPManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        // Tracking verification status
        this.isEmailVerified = false;
        this.isMobileVerified = false;
        // Tracking current transaction
        this.currentTransaction = {
            type: null,
            hasUsedResend: false,
            timerInterval: null
        };
    }

    initializeElements() {
        this.modal = document.getElementById('otpVerificationModal');
        this.modalTitle = document.getElementById('otpModalTitle');
        this.otpDestination = document.getElementById('otpDestination');
        this.otpInputs = document.querySelectorAll('.otp-input');
        this.validateBtn = document.getElementById('validateOtpBtn');
        this.resendBtn = document.getElementById('resendOtpBtn');
        this.closeBtn = this.modal.querySelector('.close');
        this.timerCircle = document.querySelector('.timer-circle');
        this.timerText = document.querySelector('.timer-text');
        
        // Verification buttons
        this.verifyEmailBtn = document.querySelector('.verify-email-btn');
        this.verifyPhoneBtn = document.querySelector('.verify-phone-btn');
    }

    attachEventListeners() {
        // OTP input handling
        this.otpInputs.forEach((input, index) => {
            input.addEventListener('keyup', (e) => this.handleOtpInput(e, index));
            input.addEventListener('keydown', (e) => this.handleBackspace(e, index));
            input.addEventListener('paste', (e) => this.handlePaste(e));
        });

        // Button clicks
        if (this.verifyEmailBtn) {
            this.verifyEmailBtn.addEventListener('click', () => this.showOtpModal('email'));
        }
        
        if (this.verifyPhoneBtn) {
            this.verifyPhoneBtn.addEventListener('click', () => this.showOtpModal('phone'));
        }

        // Modal controls
        this.validateBtn.addEventListener('click', () => this.validateOTP());
        this.resendBtn.addEventListener('click', () => this.resendOTP());
        this.closeBtn.addEventListener('click', () => this.hideModal());
    }

    showOtpModal(type) {
        // Check if already verified
        if ((type === 'email' && this.isEmailVerified) || 
            (type === 'mobile' && this.isMobileVerified)) {
            this.showSuccess(`${type === 'email' ? 'Email' : 'Mobile'} already verified!`);
            return;
        }

        // Reset transaction state
        this.currentTransaction = {
            type: type,
            hasUsedResend: false,
            timerInterval: null
        };

        this.modal.style.display = 'flex';
        document.body.classList.add('modal-open');
        
        // Clear previous inputs
        this.otpInputs.forEach(input => input.value = '');
        this.otpInputs[0].focus();

        // Update modal content based on verification type
        if (type === 'email') {
            const email = document.querySelector('input[type="email"]').value;
            this.otpDestination.textContent = email;
        } else {
            const phone = document.querySelector('input[type="tel"]').value;
            this.otpDestination.textContent = phone;
        }

        // Reset and start timer
        this.resetAndStartTimer();
    }

    resetAndStartTimer() {
        // Clear any existing timer
        if (this.currentTransaction.timerInterval) {
            clearInterval(this.currentTransaction.timerInterval);
        }

        // Reset UI elements
        this.timerCircle.style.display = 'block';
        this.timerCircle.classList.remove('timer-active');
        this.resendBtn.style.display = 'none';
        this.resendBtn.disabled = false;
        this.resendBtn.textContent = 'Resend OTP';
        this.resendBtn.classList.remove('otp-sent');
        
        // Force reflow for smooth animation
        void this.timerCircle.offsetWidth;
        
        // Start new timer
        this.startTimer();
    }

    startTimer() {
        let timeLeft = 60;
        this.timerCircle.classList.add('timer-active');
        
        const updateTimer = () => {
            this.timerText.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(this.currentTransaction.timerInterval);
                this.timerCircle.style.display = 'none';
                this.resendBtn.style.display = 'block';
                this.resendBtn.textContent = 'Resend OTP';
                this.resendBtn.disabled = false;
            }
            timeLeft--;
        };

        updateTimer(); // Initial call
        this.currentTransaction.timerInterval = setInterval(updateTimer, 1000);
    }

    hideModal() {
        // Clear any running timer
        if (this.currentTransaction.timerInterval) {
            clearInterval(this.currentTransaction.timerInterval);
        }

        this.modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }

    handleOtpInput(e, index) {
        const input = e.target;
        const value = input.value;
        
        if (value.length === 1) {
            input.value = value[0];
            if (index < this.otpInputs.length - 1) {
                this.otpInputs[index + 1].focus();
            }
        }
    }

    handleBackspace(e, index) {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            this.otpInputs[index - 1].focus();
        }
    }

    handlePaste(e) {
        e.preventDefault();
        const pastedData = (e.clipboardData || window.clipboardData)
            .getData('text')
            .trim()
            .slice(0, 6);

        [...pastedData].forEach((char, index) => {
            if (this.otpInputs[index]) {
                this.otpInputs[index].value = char;
            }
        });

        if (this.otpInputs[pastedData.length]) {
            this.otpInputs[pastedData.length].focus();
        }
    }

    validateOTP() {
        const otp = Array.from(this.otpInputs)
            .map(input => input.value)
            .join('');

        if (otp.length !== 6) {
            this.showError('Please enter complete OTP');
            return;
        }

        // Simulate OTP validation (replace with actual validation later)
        if (this.currentTransaction.type === 'email') {
            this.isEmailVerified = true;
        } else {
            this.isMobileVerified = true;
        }

        this.showSuccess('Verification successful!');
        setTimeout(() => this.hideModal(), 1500);
    }

    resendOTP() {
        if (this.currentTransaction.hasUsedResend) return;
        
        this.currentTransaction.hasUsedResend = true;
        this.resendBtn.disabled = true;
        this.resendBtn.textContent = 'Sending...';

        // Simulate OTP resend
        setTimeout(() => {
            this.resendBtn.textContent = 'OTP Sent';
            this.resendBtn.classList.add('otp-sent');
        }, 1500);
    }

    showError(message) {
        if (window.dashboard) {
            window.dashboard.showNotification(message, 'error');
        } else {
            alert(message);
        }
    }

    showSuccess(message) {
        if (window.dashboard) {
            window.dashboard.showNotification(message, 'success');
        } else {
            alert(message);
        }
    }
}

// Initialize OTP Manager
document.addEventListener('DOMContentLoaded', () => {
    window.otpManager = new OTPManager();
});