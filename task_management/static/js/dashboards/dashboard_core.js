document.addEventListener('DOMContentLoaded', function() {
    // Profile Dropdown Toggle
    const profileButton = document.getElementById('profileButton');
    const profileDropdown = document.getElementById('profileDropdown');
    
    if (profileButton && profileDropdown) {
        profileButton.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('hidden');
            
            // Position the dropdown
            const buttonRect = profileButton.getBoundingClientRect();
            profileDropdown.style.top = `${buttonRect.bottom + 5}px`;
            profileDropdown.style.right = '24px';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdown.contains(e.target) && !profileButton.contains(e.target)) {
                profileDropdown.classList.add('hidden');
            }
        });
    }

    // Chart.js Configuration
    const ctx = document.getElementById('activityChart');
    if (ctx) {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: [2, 4, 3, 5, 4, 6, 3],
                    borderColor: '#bf5af2',
                    backgroundColor: createGradient(ctx),
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 8,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0a0a7',
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0a0a7',
                            font: {
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }

    // Profile Image Upload Handling
    setupImageUpload();

    // Profile Form Handling
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Add your form submission logic here
            console.log('Profile form submitted');
        });
    }

});

// Create gradient for chart
function createGradient(ctx) {
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(191, 90, 242, 0.5)');
    gradient.addColorStop(1, 'rgba(191, 90, 242, 0)');
    return gradient;
}


// Profile Image Upload Functions
function setupImageUpload() {
    const imageUpload = document.getElementById('imageUpload');
    const profileImage = document.getElementById('profileImage');
    const imagePicker = document.getElementById('imagePicker');

    if (imagePicker) {
        imagePicker.addEventListener('click', () => {
            // Show upload options modal
            showUploadOptions();
        });
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }
}

function showUploadOptions() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-[#2A2B31] rounded-xl p-6 w-80 space-y-4">
            <h3 class="text-lg font-medium text-white mb-4">Update Profile Picture</h3>
            
            <!-- Upload from Device -->
            <button onclick="document.getElementById('imageUpload').click()" 
                    class="w-full flex items-center px-4 py-3 bg-[#32333A] rounded-lg hover:bg-opacity-80 transition-colors">
                <svg class="w-5 h-5 mr-3 text-[#bf5af2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <span class="text-white">Upload from Device</span>
            </button>
            
            <!-- Take Photo -->
            <button onclick="initCamera()" 
                    class="w-full flex items-center px-4 py-3 bg-[#32333A] rounded-lg hover:bg-opacity-80 transition-colors">
                <svg class="w-5 h-5 mr-3 text-[#bf5af2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="text-white">Take Photo</span>
            </button>
            
            <!-- Cancel Button -->
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="w-full px-4 py-3 text-gray-400 hover:text-white transition-colors">
                Cancel
            </button>
        </div>
    `;
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            // Update profile image
            const profileImage = document.getElementById('profileImage');
            if (profileImage) {
                profileImage.src = e.target.result;
            }
            
            // Close modal if open
            const modal = document.querySelector('.fixed.inset-0');
            if (modal) modal.remove();
            
            // Show success notification
            showNotification('Profile picture updated successfully', 'success');
            
            // Here you would typically upload the image to your server
            // For now, we're just updating the UI
        };
        reader.readAsDataURL(file);
    }
}

async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        
        // Create camera UI
        const cameraModal = document.createElement('div');
        cameraModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50';
        cameraModal.innerHTML = `
            <div class="bg-[#2A2B31] rounded-xl p-6 max-w-md w-full">
                <div class="relative">
                    <video id="cameraFeed" autoplay class="w-full rounded-lg"></video>
                    <button id="captureBtn" class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-[#bf5af2] text-white px-6 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                        Capture
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraModal);
        
        // Setup video stream
        const video = document.getElementById('cameraFeed');
        video.srcObject = stream;
        
        // Handle capture
        document.getElementById('captureBtn').onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            // Update profile image
            const profileImage = document.getElementById('profileImage');
            if (profileImage) {
                profileImage.src = canvas.toDataURL('image/png');
            }
            
            // Cleanup
            stream.getTracks().forEach(track => track.stop());
            cameraModal.remove();
            
            // Show success notification
            showNotification('Profile picture updated successfully', 'success');
        };
        
        // Close modal handler
        cameraModal.onclick = (e) => {
            if (e.target === cameraModal) {
                stream.getTracks().forEach(track => track.stop());
                cameraModal.remove();
            }
        };
    } catch (error) {
        showNotification('Unable to access camera', 'error');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-[#bf5af2]'
    } transition-all transform translate-y-0 opacity-100 z-50`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate out
    setTimeout(() => {
        notification.classList.add('translate-y-[-1rem]', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}