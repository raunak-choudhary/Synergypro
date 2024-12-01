document.addEventListener('DOMContentLoaded', function() {

    // Add at the beginning of your DOMContentLoaded event listener
    const createTaskBtn = document.getElementById('createTaskBtn');
    const modal = document.getElementById('taskModal');
    const closeBtn = modal.querySelector('.close');
    const taskForm = document.getElementById('taskForm');

    createTaskBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        // Set default dates
        const now = new Date();
        document.getElementById('taskStartDate').value = now.toISOString().split('T')[0];
        document.getElementById('taskStartTime').value = now.toTimeString().slice(0,5);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('taskEndDate').value = tomorrow.toISOString().split('T')[0];
        document.getElementById('taskEndTime').value = now.toTimeString().slice(0,5);
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const startDate = document.getElementById('taskStartDate').value;
        const startTime = document.getElementById('taskStartTime').value;
        const endDate = document.getElementById('taskEndDate').value;
        const endTime = document.getElementById('taskEndTime').value;

        // Create start and end datetime strings
        const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
        const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('start_date', startDateTime);
        formData.append('end_date', endDateTime);
        formData.append('status', 'yet_to_start');

        try {
            const response = await fetch('/api/tasks/create/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {  // Check HTTP status first
                modal.style.display = 'none';
                taskForm.reset();
                fetchTasks(); // Refresh the task list
            } else {
                alert('Failed to create task: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while creating the task');
        }
    });

    function fetchTasks() {
        fetch('/api/tasks/')
        .then(response => response.json())
        .then(data => {
            const inProgressTasks = document.getElementById('in-progress-tasks');
            const completedTasks = document.getElementById('completed-tasks');
            const overdueTasks = document.getElementById('overdue-tasks');

            inProgressTasks.innerHTML = '';
            completedTasks.innerHTML = '';
            overdueTasks.innerHTML = '';

            data.forEach(task => {
                const taskElement = createTaskElement(task);
                if (task.status === 'completed') {
                    completedTasks.appendChild(taskElement);
                } else if (task.is_overdue) {
                    overdueTasks.appendChild(taskElement);
                } else {
                    inProgressTasks.appendChild(taskElement);
                }
            });

             setTimeout(() => {
                sections.forEach(section => {
                    const isScrollable = section.wrapper.scrollWidth > section.wrapper.clientWidth;
                    if (isScrollable) {
                        section.rightArrow.style.display = 'flex';
                        // Only show left arrow if not at the start
                        section.leftArrow.style.display = section.wrapper.scrollLeft > 0 ? 'flex' : 'none';
                    }
                });
            }, 100);

            updateArrowVisibility();
        })
        .catch(error => console.error('Error fetching tasks:', error));
    }

    function createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-tile';
        taskDiv.dataset.taskId = task.id;

        // Format the date display
        const endDate = new Date(task.end_date);
        const now = new Date();
        const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

        let dateDisplay;
        if (task.status === "completed") {
            dateDisplay = '';
        } else if (daysLeft < 0) {
            dateDisplay = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 4px; display: inline-block;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
        } else if (daysLeft <= 7) {
            dateDisplay = `${daysLeft} day(s) left`;
        } else {
            dateDisplay = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="vertical-align: -2px; margin-right: 4px; display: inline-block;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/>
            </svg>${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
        }

        // TODO: Replace with actual progress
        const progress = Math.floor(Math.random() * 100);



        const statusElement = document.createElement('p');
        statusElement.className = 'task-status';
        statusElement.textContent = `Status: ${task.status.replace('_', ' ')}`;
        taskDiv.appendChild(statusElement);

        // Generate dynamic colors based on category name
        function generatePastelColor(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = str.charCodeAt(i) + ((hash << 5) - hash);
            }

            // Generate pastel background color
            const h = hash % 360;
            const s = 30 + (hash % 30); // Keep saturation low for pastel
            const l = 85 + (hash % 10); // Keep lightness high for pastel

            // Generate darker text color with same hue
            const textL = 30; // Darker text for contrast

            return {
                background: `hsl(${h}, ${s}%, ${l}%)`,
                text: `hsl(${h}, ${s}%, ${textL}%)`
            };
        }

        let categoryHTML = '';
        if (task.category) {
            const colors = generatePastelColor(task.category.name);
            categoryHTML = `
                <div class="category-tag" style="background-color: ${colors.background}; color: ${colors.text}">
                    ${task.category.name}
                </div>
            `;
        }

        taskDiv.innerHTML = `
            <div class="task-header">
                <h3>${task.title}</h3>
                <div class="menu-container">
                    <button class="menu-dots">⋮</button>
                    <div class="menu-dropdown">
                        <button class="menu-item delete-option">Delete</button>
                    </div>
                </div>
            </div>
            ${categoryHTML}
            <div class="task-footer">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                    <span class="progress-text">${progress}%</span>
                </div>
                <p class="task-dates">${dateDisplay}</p>
            </div>
        `;

        const menuButton = taskDiv.querySelector('.menu-dots');
        const menuDropdown = taskDiv.querySelector('.menu-dropdown');
        const deleteButton = taskDiv.querySelector('.delete-option');

        menuButton.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDropdown.classList.toggle('show');
        });

        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteTask(task.id);
        });

        taskDiv.addEventListener('click', () => openTaskDetail(task.id));
        return taskDiv;
    }

    // Add delete task function
    function deleteTask(taskId) {

        if (confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            fetch(`/api/task/${taskId}/delete/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': getCookie('csrftoken')
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    fetchTasks(); // Refresh the task list
                } else {
                    alert('Failed to delete task');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    // Add CSRF token function
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

    function openTaskDetail(taskId) {
        window.location.href = `/task/${taskId}/`;
    }

    const sections = [
        {
            wrapper: document.getElementById('in-progress-tasks'),
            leftArrow: document.querySelector('.in-progress-arrow.left-arrow'),
            rightArrow: document.querySelector('.in-progress-arrow.right-arrow')
        },
        {
            wrapper: document.getElementById('completed-tasks'),
            leftArrow: document.querySelector('.completed-arrow.left-arrow'),
            rightArrow: document.querySelector('.completed-arrow.right-arrow')
        },
        {
            wrapper: document.getElementById('overdue-tasks'),
            leftArrow: document.querySelector('.overdue-arrow.left-arrow'),
            rightArrow: document.querySelector('.overdue-arrow.right-arrow')
        }
    ];

    sections.forEach(section => {
        section.leftArrow.addEventListener('click', () => {
            section.wrapper.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });

        section.rightArrow.addEventListener('click', () => {
            section.wrapper.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });

        // Update arrow visibility
        function updateArrowVisibility() {
             const isScrollable = section.wrapper.scrollWidth > section.wrapper.clientWidth;

            // Show both arrows by default if content is scrollable
            if (isScrollable) {
                section.leftArrow.style.display = 'flex';
                section.rightArrow.style.display = 'flex';
            } else {
                section.leftArrow.style.display = 'none';
                section.rightArrow.style.display = 'none';
            }

            // Optionally hide left arrow when at start and right arrow when at end
            const isAtStart = section.wrapper.scrollLeft <= 0;
            const isAtEnd = section.wrapper.scrollLeft >= section.wrapper.scrollWidth - section.wrapper.clientWidth;

            if (isScrollable) {
                if (isAtStart) {
                    section.leftArrow.style.display = 'none';
                }
                if (isAtEnd) {
                    section.rightArrow.style.display = 'none';
                }
            }
        }

        section.wrapper.addEventListener('scroll', updateArrowVisibility);
        window.addEventListener('resize', updateArrowVisibility);
        updateArrowVisibility();
    });

    function checkForStatusUpdate() {
        const statusUpdated = sessionStorage.getItem('statusUpdated');
        if (statusUpdated) {
            fetchTasks(); // Refresh tasks
            sessionStorage.removeItem('statusUpdated');
        }
    }

    fetchTasks();
    checkForStatusUpdate();

    // Add at the beginning of your DOMContentLoaded event
    const categoryFilter = document.getElementById('categoryFilter');
    let allTasks = []; // Store all tasks

    function loadCategories() {
        fetch('/api/tasks/categories/')
            .then(response => response.json())
            .then(data => {
                const categories = data.categories;
                categoryFilter.innerHTML = '<option value="">All Categories</option>';

                if (categories.length === 0) {
                    const option = new Option('No categories', '');
                    option.disabled = true;
                    categoryFilter.add(option);
                } else {
                    categories.forEach(category => {
                        categoryFilter.add(new Option(category.name, category.id));
                    });
                }
            })
            .catch(error => console.error('Error loading categories:', error));
    }

    function filterTasks() {
        const selectedCategoryId = categoryFilter.value;
        const filteredTasks = selectedCategoryId ?
            allTasks.filter(task => task.category && task.category.id.toString() === selectedCategoryId) :
            allTasks;

        const inProgressTasks = document.getElementById('in-progress-tasks');
        const completedTasks = document.getElementById('completed-tasks');
        const overdueTasks = document.getElementById('overdue-tasks');

        inProgressTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        overdueTasks.innerHTML = '';

        filteredTasks.forEach(task => {
            const taskElement = createTaskElement(task);
            if (task.status === 'completed') {
                completedTasks.appendChild(taskElement);
            } else if (task.is_overdue) {
                overdueTasks.appendChild(taskElement);
            } else {
                inProgressTasks.appendChild(taskElement);
            }
        });

        updateArrowVisibility();
    }

    // Add category filter event listener
    categoryFilter.addEventListener('change', filterTasks);

    // Initialize categories and tasks
    loadCategories();
    fetchTasks();

    function initializeLogout() {
        const logoutLink = document.querySelector('a[href*="logout"]');
        if (logoutLink) {
            logoutLink.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('/api/logout/', {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                        }
                    });
                    if (response.ok) {
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                }
            });
        }
    }

    initializeLogout();
});

document.querySelector('.scroll-arrow').addEventListener('click', function() {
    const tasksWrapper = document.querySelector('.tasks-wrapper');
    tasksWrapper.scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});
