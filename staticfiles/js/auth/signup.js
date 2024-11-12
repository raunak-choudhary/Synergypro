async function handleSignup(formData) {
    try {
        const response = await fetch('/api/signup/', {  // Make sure this URL matches your urls.py
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            showToast(data.message, 'error');  // Updated to use data.message
            return false;
        }

        showToast(data.message, 'success');
        return true;
    } catch (error) {
        console.error('Signup error:', error);
        showToast('An unexpected error occurred. Please try again.', 'error');
        return false;
    }
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const toastTimeline = document.getElementById('toast-timeline');
    
    toastMessage.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> ${message}`;
    toast.style.backgroundColor = type === 'error' ? '#ff4444' : '#58d68d';
    toast.classList.add('show');
    toast.style.display = 'block';
    
    let timerWidth = 100;
    toastTimeline.style.width = '100%';
    toastTimeline.style.backgroundColor = type === 'error' ? '#cc0000' : '#239b56';
    
    const countdownInterval = setInterval(() => {
        timerWidth -= 2;
        toastTimeline.style.width = `${timerWidth}%`;
        
        if (timerWidth <= 0) {
            clearInterval(countdownInterval);
            toast.classList.add('hide');
            setTimeout(() => {
                toast.style.display = 'none';
                toast.classList.remove('show', 'hide');
            }, 300);
        }
    }, 50);
}