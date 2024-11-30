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
                // Add the new file to the list without reloading the page
                const fileList = document.getElementById('fileList');
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.style.color = '#666';
                fileItem.innerHTML = `
                    <p>File: <a href="${data.file_url}" class="download-btn" download>${file.name}</a></p>
                    <p>Uploaded at: ${new Date().toLocaleString()}</p>
                `;
                fileList.appendChild(fileItem);

                // Clear the file input
                document.getElementById('taskFile').value = '';
            } else {
                console.error('Upload failed:', data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }

    const deleteButton = document.getElementById('deleteButton');
    const deleteModal = document.getElementById('deleteModal');
    const confirmDelete = document.getElementById('confirmDelete');
    const cancelDelete = document.getElementById('cancelDelete');

    // Show modal
    deleteButton.addEventListener('click', function() {
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

    // Add this part for the status dropdown
    const statusDropdown = document.getElementById('editStatus');
    if (statusDropdown) {
        statusDropdown.addEventListener('change', function() {
            updateTaskStatus(this.value);
        });
    }

    // Category handling
    const categorySelect = document.getElementById('taskCategory');
    const newCategoryInput = document.getElementById('newCategoryInput');
    const newCategoryField = document.getElementById('newCategory');
    const addNewCategoryBtn = document.getElementById('addNewCategory');

    // Load categories from backend
    function loadCategories() {
        fetch('/api/tasks/categories/')
            .then(response => response.json())
            .then(data => {
                populateCategories(data.categories);
            })
            .catch(error => console.error('Error:', error));
    }

    function populateCategories(categories) {
        categorySelect.innerHTML = `
            <option value="">Select Category</option>
            <option value="add_new">+ Add Category</option>
        `;

        categories.forEach(category => {
            const option = new Option(category.name, category.id);
            categorySelect.add(option);
        });
    }

    categorySelect.addEventListener('change', function() {
        if (this.value === 'add_new') {
            newCategoryInput.style.display = 'flex';
            newCategoryField.focus();
        } else if (this.value) {
            newCategoryInput.style.display = 'none';
            updateTaskCategory(this.value);
        }
    });

    addNewCategoryBtn.addEventListener('click', function() {
        const newCategory = newCategoryField.value.trim();
        if (newCategory) {
            fetch('/api/tasks/categories/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ name: newCategory })
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    loadCategories();
                    categorySelect.value = data.category.id;
                    newCategoryInput.style.display = 'none';
                    newCategoryField.value = '';
                    updateTaskCategory(data.category.id);
                }
            })
            .catch(error => console.error('Error:', error));
        }
    });

    // Initialize categories on page load
    loadCategories();

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
});
