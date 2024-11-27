document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('taskFile');
    const uploadForm = document.getElementById('uploadForm');
    const taskId = window.location.pathname.split('/')[2];

    // Handle drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            fileInput.files = files;
            handleFileUpload(files[0]);
        }
    });

    // Handle file input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    function handleFileUpload(file) {
        const formData = new FormData();
        formData.append('file', file);

        fetch(`/task/${taskId}/upload/`, {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.reload();
            } else {
                console.error('Upload failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const deleteBtn = document.getElementById('deleteBtn');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');
    const taskId = window.location.pathname.split('/')[2];

    // Show modal
    deleteBtn.addEventListener('click', function() {
        deleteModal.style.display = 'flex';
    });

    // Hide modal
    cancelDelete.addEventListener('click', function() {
        deleteModal.style.display = 'none';
    });

    // Handle delete confirmation
    confirmDelete.addEventListener('click', function() {
        fetch(`/api/task/${taskId}/delete/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken')
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                window.location.href = '/tasks/';
            } else {
                alert('Failed to delete task');
            }
        })
        .catch(error => console.error('Error:', error));
        });
    });
});