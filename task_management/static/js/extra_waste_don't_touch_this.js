document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageUploadModal');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const closeBtn = document.querySelector('.close');
    const fileUploadOption = document.getElementById('fileUploadOption');
    const cameraOption = document.getElementById('cameraOption');
    const fileInput = document.getElementById('fileInput');
    const cameraContainer = document.getElementById('cameraContainer');
    const video = document.getElementById('video');
    const captureBtn = document.getElementById('captureBtn');
    const backToOptions = document.getElementById('backToOptions');
    const circleCanvas = document.getElementById('circleCanvas');
    
    let stream = null;

    // Check if this is a page reload after image upload
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('imageUpdated') === 'true') {
        showToast("Congrats!! Profile Image updated successfully.");
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Toast notification function
    function showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        toastContainer.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.5s ease-out forwards';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 500);
        }, 3000);
    }

    async function uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch('/api/profile/upload-image/', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Close modal
                modal.style.display = "none";
                stopCamera();

                // Reload the page with a query parameter
                window.location.href = window.location.pathname + '?imageUpdated=true';
            } else {
                showToast(data.error || 'Failed to upload image', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('An error occurred while uploading the image', 'error');
        }
    }

    // Show modal when camera button is clicked
    changePhotoBtn.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
        cameraContainer.style.display = "none";
    }

    // Close modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
        stopCamera();
    }

    // File upload option
    fileUploadOption.onclick = function() {
        fileInput.click();
    }

    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file);
        }
    }

    // Camera option
    cameraOption.onclick = async function() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            cameraContainer.style.display = "block";
            document.querySelector('.upload-options').style.display = "none";
            
            // Draw circular guide
            const ctx = circleCanvas.getContext('2d');
            circleCanvas.width = video.videoWidth;
            circleCanvas.height = video.videoHeight;
            
            function drawCircle() {
                ctx.clearRect(0, 0, circleCanvas.width, circleCanvas.height);
                ctx.beginPath();
                ctx.strokeStyle = '#4B1B7F';
                ctx.setLineDash([5, 5]);
                ctx.arc(circleCanvas.width/2, circleCanvas.height/2, 100, 0, Math.PI * 2);
                ctx.stroke();
                requestAnimationFrame(drawCircle);
            }
            
            video.onplay = () => {
                circleCanvas.width = video.videoWidth;
                circleCanvas.height = video.videoHeight;
                drawCircle();
            };
        } catch (err) {
            console.error("Error accessing camera:", err);
            showToast("Could not access camera. Please check permissions.", 'error');
        }
    }

    // Capture photo
    captureBtn.onclick = function() {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        
        canvas.toBlob(function(blob) {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            uploadImage(file);
        }, 'image/jpeg');
    }

    // Back button
    backToOptions.onclick = function() {
        cameraContainer.style.display = "none";
        document.querySelector('.upload-options').style.display = "flex";
        stopCamera();
    }

    function stopCamera() {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }
    }

    // Handle clicking outside modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            stopCamera();
        }
    }
});