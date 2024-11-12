// dashboard_core.js
class DashboardCore {
    constructor() {
        this.initializeComponents();
        this.setupEventListeners();
        this.initializeTheme();
    }

    initializeComponents() {
        // Initialize all dashboard components
        this.sidebar = new SidebarComponent();
        this.notifications = new NotificationsComponent();
        this.taskManager = new TaskManager();
        this.calendar = new CalendarComponent();
        
        // Initialize charts if they exist on the page
        if (document.querySelector('[data-chart]')) {
            this.initializeCharts();
        }
    }

    setupEventListeners() {
        // Global event listeners
        document.addEventListener('DOMContentLoaded', () => {
            this.handlePageLoad();
        });

        // Theme toggler
        const themeToggle = document.querySelector('#theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Search functionality
        const searchInput = document.querySelector('#search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    handlePageLoad() {
        // Add fade-in animation to main content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.add('fade-in');
        }

        // Initialize any data that needs to be loaded
        this.loadDashboardData();
    }

    async loadDashboardData() {
        try {
            // Fetch initial dashboard data
            const response = await fetch('/api/dashboard/data');
            const data = await response.json();
            this.updateDashboardStats(data);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showErrorNotification('Failed to load dashboard data');
        }
    }

    updateDashboardStats(data) {
        // Update all dashboard statistics
        const statElements = document.querySelectorAll('[data-stat]');
        statElements.forEach(element => {
            const statKey = element.dataset.stat;
            if (data[statKey]) {
                element.textContent = data[statKey];
            }
        });
    }

    showErrorNotification(message) {
        this.notifications.show({
            type: 'error',
            message: message,
            duration: 5000
        });
    }
}

// task_manager.js
class TaskManager {
    constructor() {
        this.tasks = [];
        this.initializeTaskListeners();
    }

    initializeTaskListeners() {
        // Add new task button
        const newTaskBtn = document.querySelector('#new-task-btn');
        if (newTaskBtn) {
            newTaskBtn.addEventListener('click', () => this.showNewTaskModal());
        }

        // Task list interactions
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-task-action]')) {
                this.handleTaskAction(e);
            }
        });
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks');
            const tasks = await response.json();
            this.renderTasks(tasks);
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    renderTasks(tasks) {
        const taskList = document.querySelector('#task-list');
        if (!taskList) return;

        taskList.innerHTML = tasks.map(task => `
            <div class="task-item glass-effect" data-task-id="${task.id}">
                <div class="task-header">
                    <h3>${task.title}</h3>
                    <span class="task-status">${task.status}</span>
                </div>
                <div class="task-body">
                    <p>${task.description}</p>
                    <div class="task-meta">
                        <span class="due-date">Due: ${task.dueDate}</span>
                        <div class="task-actions">
                            <button data-task-action="edit">Edit</button>
                            <button data-task-action="delete">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    handleTaskAction(event) {
        const action = event.target.dataset.taskAction;
        const taskId = event.target.closest('[data-task-id]').dataset.taskId;

        switch (action) {
            case 'edit':
                this.editTask(taskId);
                break;
            case 'delete':
                this.deleteTask(taskId);
                break;
            case 'complete':
                this.completeTask(taskId);
                break;
        }
    }
}
