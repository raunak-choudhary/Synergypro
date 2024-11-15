class OTPManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.modal = document.getElementById('otpVerificationModal');
        this.modalTitle = document.getElementById('otpModalTitle');
        this.otpDestination = document.getElementById('otpDestination');
        this.otpInputs = document.querySelectorAll('.otp-input');
        this.validateBtn = document.getElementById('validateOtpBtn');
        this.resendBtn = document.getElementById('resendOtpBtn');
        this.closeBtn = this.modal.querySelector('.close');
        
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

        /* Close modal on outside click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });*/
    }

    showOtpModal(type) {
        this.currentVerificationType = type;
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
    
        // Start the timer
        this.startTimer();
    }

    hideModal() {
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

        // For now, just show success and hide modal
        // This will be replaced with actual validation when backend is implemented
        this.showSuccess('Verification successful!');
        setTimeout(() => this.hideModal(), 1500);
    }

    resendOTP() {
        const timerCircle = document.querySelector('.timer-circle');
        const resendBtn = document.getElementById('resendOtpBtn');
        
        // First show "Sending..."
        resendBtn.disabled = true;
        resendBtn.textContent = 'Sending...';

        // Simulate OTP resend
        setTimeout(() => {
            resendBtn.textContent = 'OTP Sent';
            // Remove the timer restart logic - user only gets one chance to resend
            resendBtn.disabled = true; // Keep the button disabled
            
            // Optional: Add a class to style the "OTP Sent" text differently
            resendBtn.classList.add('otp-sent');
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

    startTimer() {
        const timerCircle = document.querySelector('.timer-circle');
        const timerText = document.querySelector('.timer-text');
        const timerProgress = document.querySelector('.timer-progress');
        const resendBtn = document.getElementById('resendOtpBtn');
        
        // Initial state
        let timeLeft = 60;
        resendBtn.style.display = 'none';
        timerCircle.classList.add('timer-active');
        
        // Update timer text every second
        const updateTimer = () => {
            timerText.textContent = `${timeLeft}s`;
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                timerCircle.style.display = 'none';
                resendBtn.style.display = 'block';
                resendBtn.textContent = 'Resend OTP';
                resendBtn.disabled = false;
            }
            timeLeft--;
        };
    
        // Start the countdown - using setInterval for accurate seconds
        const timerInterval = setInterval(updateTimer, 1000);
        updateTimer(); // Initial call
    }
}

// Initialize OTP Manager
document.addEventListener('DOMContentLoaded', () => {
    window.otpManager = new OTPManager();
});