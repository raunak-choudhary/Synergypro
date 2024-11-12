// task_manager.js
class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.initialize();
    }

    initialize() {
        this.taskContainer = document.querySelector('#task-container');
        this.taskForm = document.querySelector('#task-form');
        this.setupEventListeners();
        this.loadTasks();
    }

    setupEventListeners() {
        // New task form submission
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTaskSubmission(e);
            });
        }

        // Task filtering
        const filterButtons = document.querySelectorAll('[data-task-filter]');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.currentFilter = button.dataset.taskFilter;
                this.filterTasks(this.currentFilter);
            });
        });

        // Task actions (edit, delete, complete)
        if (this.taskContainer) {
            this.taskContainer.addEventListener('click', (e) => {
                if (e.target.matches('[data-task-action]')) {
                    const action = e.target.dataset.taskAction;
                    const taskId = e.target.closest('[data-task-id]').dataset.taskId;
                    this.handleTaskAction(action, taskId);
                }
            });
        }
    }

    async loadTasks() {
        try {
            const response = await fetch('/api/tasks/');
            const tasks = await response.json();
            this.tasks = tasks;
            this.renderTasks();
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showNotification('Error loading tasks', 'error');
        }
    }

    async handleTaskSubmission(event) {
        const formData = new FormData(event.target);
        const taskData = {
            title: formData.get('title'),
            description: formData.get('description'),
            due_date: formData.get('due_date'),
            priority: formData.get('priority'),
            category: formData.get('category')
        };

        try {
            const response = await fetch('/api/tasks/create/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify(taskData)
            });

            if (response.ok) {
                const newTask = await response.json();
                this.tasks.push(newTask);
                this.renderTasks();
                this.showNotification('Task created successfully', 'success');
                this.closeTaskModal();
            } else {
                throw new Error('Failed to create task');
            }
        } catch (error) {
            console.error('Error creating task:', error);
            this.showNotification('Error creating task', 'error');
        }
    }

    async handleTaskAction(action, taskId) {
        switch (action) {
            case 'edit':
                this.openEditModal(taskId);
                break;
            case 'delete':
                if (confirm('Are you sure you want to delete this task?')) {
                    await this.deleteTask(taskId);
                }
                break;
            case 'complete':
                await this.completeTask(taskId);
                break;
        }
    }

    async deleteTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.renderTasks();
                this.showNotification('Task deleted successfully', 'success');
            } else {
                throw new Error('Failed to delete task');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showNotification('Error deleting task', 'error');
        }
    }

    async completeTask(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/complete/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': this.getCsrfToken()
                }
            });

            if (response.ok) {
                const updatedTask = await response.json();
                this.tasks = this.tasks.map(task => 
                    task.id === taskId ? updatedTask : task
                );
                this.renderTasks();
                this.showNotification('Task completed successfully', 'success');
            } else {
                throw new Error('Failed to complete task');
            }
        } catch (error) {
            console.error('Error completing task:', error);
            this.showNotification('Error completing task', 'error');
        }
    }

    filterTasks(filter) {
        const filteredTasks = this.tasks.filter(task => {
            switch (filter) {
                case 'pending':
                    return !task.completed;
                case 'completed':
                    return task.completed;
                case 'high-priority':
                    return task.priority === 'high' && !task.completed;
                default:
                    return true;
            }
        });

        this.renderTasks(filteredTasks);
    }

    renderTasks(tasksToRender = this.tasks) {
        if (!this.taskContainer) return;

        this.taskContainer.innerHTML = tasksToRender.map(task => `
            <div class="task-card glass-effect" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${task.title}</h3>
                    <span class="task-priority ${task.priority}-priority">${task.priority}</span>
                </div>
                <p class="task-description">${task.description}</p>
                <div class="task-meta">
                    <span class="due-date">Due: ${this.formatDate(task.due_date)}</span>
                    <span class="category">${task.category}</span>
                </div>
                <div class="task-actions">
                    <button data-task-action="edit" class="edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button data-task-action="delete" class="delete-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                    ${!task.completed ? `
                        <button data-task-action="complete" class="complete-btn">
                            <i class="fas fa-check"></i>
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    showNotification(message, type) {
        // This method would integrate with your notification system
        if (window.dashboard && window.dashboard.notifications) {
            window.dashboard.notifications.show({
                message,
                type,
                duration: 3000
            });
        }
    }

    getCsrfToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]').value;
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    closeTaskModal() {
        // Implementation depends on your modal system
        const modal = document.querySelector('#task-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    openEditModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        // Implementation depends on your modal system
        const modal = document.querySelector('#task-modal');
        if (modal) {
            // Populate form fields with task data
            modal.querySelector('[name="title"]').value = task.title;
            modal.querySelector('[name="description"]').value = task.description;
            modal.querySelector('[name="due_date"]').value = task.due_date;
            modal.querySelector('[name="priority"]').value = task.priority;
            modal.querySelector('[name="category"]').value = task.category;
            
            modal.style.display = 'block';
        }
    }
}

// Initialize task manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});