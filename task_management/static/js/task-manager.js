document.addEventListener('DOMContentLoaded', function() {

    function fetchTasks() {
        const tasksWrapper = document.getElementById('tasks-wrapper');
        if (!tasksWrapper) {
            console.error('Tasks wrapper element not found or is not a valid HTML element');
            return;
        }
        fetch('/api/tasks/')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })

            .then(data => {
                console.log('Fetched tasks:', data);
                tasksWrapper.innerHTML = '';
                if (data.length === 0) {
                    tasksWrapper.innerHTML = '<p>No tasks found.</p>';
                } else {
                    data.forEach(task => {
                        const taskElement = createTaskElement(task);
                        tasksWrapper.appendChild(taskElement);
                    });
                    tasksWrapper.offsetHeight;
                }
                console.log('Tasks-wrapper structure:', tasksWrapper.outerHTML);
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
            dateDisplay = `${daysLeft} days left`;
        } else {
            dateDisplay = `Due date: ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getDate()}`;
        }

        // TODO: Replace with actual progress
        const progress = Math.floor(Math.random() * 100);

        taskDiv.innerHTML = `
            <h3>${task.title}</h3>
            <p class="task-description">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
            <div class="task-footer">
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                    <span class="progress-text">${progress}%</span>
                </div>
                <p class="task-dates">${dateDisplay}</p>
            </div>
        `;

        taskDiv.addEventListener('click', () => openTaskDetail(task.id));
        return taskDiv;
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

    // Add this to your fetchTasks function's then block after loading tasks
    setTimeout(updateArrowVisibility, 100);

    fetchTasks();
});

document.querySelector('.scroll-arrow').addEventListener('click', function() {
    const tasksWrapper = document.querySelector('.tasks-wrapper');
    tasksWrapper.scrollBy({
        left: 300,
        behavior: 'smooth'
    });
});
