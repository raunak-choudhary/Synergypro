document.addEventListener('DOMContentLoaded', function() {

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
        if (daysLeft < 0) {
            dateDisplay = `<span class="overdue">Overdue</span>`;
        } else if (daysLeft <= 7) {
            dateDisplay = `${daysLeft} day(s) left`;
        } else {
            dateDisplay = `Due date: ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
        }

        // TODO: Replace with actual progress
        const progress = Math.floor(Math.random() * 100);

        const statusElement = document.createElement('p');
        statusElement.className = 'task-status';
        statusElement.textContent = `Status: ${task.status.replace('_', ' ')}`;
        taskDiv.appendChild(statusElement);

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
            <p class="task-description">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
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
            if (confirm('Are you sure you want to delete this task?')) {
                deleteTask(task.id);
            }
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

    const leftArrow = document.querySelector('.left-arrow');
    const rightArrow = document.querySelector('.right-arrow');
    const tasksWrapper = document.querySelector('.tasks-wrapper');

    function updateArrowVisibility() {
        const isScrollable = tasksWrapper.scrollWidth > tasksWrapper.clientWidth;
        const isAtStart = tasksWrapper.scrollLeft <= 0;
        const isAtEnd = tasksWrapper.scrollLeft >= tasksWrapper.scrollWidth - tasksWrapper.clientWidth;

        leftArrow.style.display = isScrollable && !isAtStart ? 'flex' : 'none';
        rightArrow.style.display = isScrollable && !isAtEnd ? 'flex' : 'none';
    }

    leftArrow.addEventListener('click', function() {
        tasksWrapper.scrollBy({
            left: -300,
            behavior: 'smooth'
        });
    });

    rightArrow.addEventListener('click', function() {
        tasksWrapper.scrollBy({
            left: 300,
            behavior: 'smooth'
        });
    });

    tasksWrapper.addEventListener('scroll', updateArrowVisibility);
    window.addEventListener('resize', updateArrowVisibility);

    // Call initially and after tasks are loaded
    updateArrowVisibility();

    setTimeout(updateArrowVisibility, 100);

    function checkForStatusUpdate() {
        const statusUpdated = sessionStorage.getItem('statusUpdated');
        if (statusUpdated) {
            fetchTasks(); // Refresh tasks
            sessionStorage.removeItem('statusUpdated');
        }
    }

    fetchTasks();
    checkForStatusUpdate();
});

document.querySelector('.scroll-arrow').addEventListener('click', function() {
    const tasksWrapper = document.querySelector('.tasks-wrapper');
    tasksWrapper.scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});
