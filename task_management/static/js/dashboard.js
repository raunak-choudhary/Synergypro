class DashboardManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeNotifications();
        this.initializeFocusTimer();
        this.updateTaskProgress();
    }

    initializeElements() {
        // Navigation Elements
        this.navItems = document.querySelectorAll('.nav-item');
        this.helpCenterBtn = document.querySelector('.help-btn');

        // Header Elements
        this.notificationIcon = document.querySelector('.notification-icon');
        this.userProfile = document.querySelector('.user-profile');
        
        // Sidebar Elements
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.sidebar = document.querySelector('.sidebar');

        // Focus Timer Elements
        this.timer = {
            display: document.querySelector('.timer-display'),
            startBtn: document.querySelector('#startTimer'),
            resetBtn: document.querySelector('#resetTimer'),
            time: 25 * 60, // 25 minutes in seconds
            interval: null,
            isRunning: false
        };

        // Stats and Progress Elements
        this.statCards = document.querySelectorAll('.stat-card');
        this.runningTaskProgress = document.querySelector('.running .progress-fill');
        this.upcomingTaskProgress = document.querySelector('.upcoming .progress-fill');
    }

    attachEventListeners() {
        // Help Center
        if (this.helpCenterBtn) {
            this.helpCenterBtn.addEventListener('click', () => this.showHelpCenter());
        }

        // Notification Events
        if (this.notificationIcon) {
            this.notificationIcon.addEventListener('click', () => this.toggleNotifications());
        }

        // User Profile
        if (this.userProfile) {
            this.userProfile.addEventListener('click', () => this.toggleUserMenu());
        }

        // Sidebar Events
        if (this.sidebarToggle) {
            this.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation Items
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Timer Events
        if (this.timer.startBtn) {
            this.timer.startBtn.addEventListener('click', () => this.toggleTimer());
        }
        if (this.timer.resetBtn) {
            this.timer.resetBtn.addEventListener('click', () => this.resetTimer());
        }

        // Outside Click Handler
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    showHelpCenter() {
        const modal = document.createElement('div');
        modal.className = 'help-modal';
        modal.innerHTML = `
            <div class="help-modal-content">
                <div class="help-modal-header">
                    <h3>Help Center</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="help-modal-body">
                    <div class="help-section">
                        <h4>Quick Start Guide</h4>
                        <ul>
                            <li>Create and track your tasks</li>
                            <li>Use focus timer for productivity</li>
                            <li>Monitor your progress</li>
                            <li>Manage task priorities</li>
                        </ul>
                    </div>
                    <div class="help-section">
                        <h4>Need Help?</h4>
                        <p>Having trouble in learning? Contact our support team.</p>
                        <button class="contact-support-btn">Contact Support</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 10);

        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.classList.remove('show');
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.contact-support-btn').addEventListener('click', () => {
            this.showNotification('Support team will contact you shortly!');
        });
    }

    // Notifications
    initializeNotifications() {
        this.notifications = [
            { id: 1, message: 'Task deadline approaching', read: false },
            { id: 2, message: 'New task assigned', read: false },
            { id: 3, message: 'Progress update required', read: false }
        ];
        this.updateNotificationBadge();
    }

    toggleNotifications() {
        const panel = document.querySelector('.notifications-panel');
        if (!panel) {
            this.createNotificationsPanel();
        } else {
            panel.classList.toggle('show');
        }
    }

    createNotificationsPanel() {
        const panel = document.createElement('div');
        panel.className = 'notifications-panel';
        panel.innerHTML = `
            <div class="notifications-header">
                <h3>Notifications</h3>
                <button class="mark-all-read">Mark all as read</button>
            </div>
            <div class="notifications-list">
                ${this.notifications.map(notif => `
                    <div class="notification-item ${notif.read ? 'read' : ''}">
                        <span class="notification-message">${notif.message}</span>
                        <span class="notification-time">Just now</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.querySelector('.notifications').appendChild(panel);
        setTimeout(() => panel.classList.add('show'), 10);

        panel.querySelector('.mark-all-read').addEventListener('click', () => {
            this.markAllNotificationsAsRead();
        });
    }

    updateNotificationBadge() {
        const unreadCount = this.notifications.filter(n => !n.read).length;
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = unreadCount || '';
            badge.style.display = unreadCount ? 'block' : 'none';
        }
    }

    markAllNotificationsAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.updateNotificationBadge();
        document.querySelectorAll('.notification-item').forEach(item => {
            item.classList.add('read');
        });
    }

    // Focus Timer Functions - Keeping your existing implementation
    toggleTimer() {
        if (!this.timer.isRunning) {
            this.startTimer();
            this.timer.startBtn.textContent = 'Pause';
            this.timer.isRunning = true;
        } else {
            this.pauseTimer();
            this.timer.startBtn.textContent = 'Resume';
            this.timer.isRunning = false;
        }
    }

    startTimer() {
        this.timer.interval = setInterval(() => {
            this.timer.time--;
            this.updateTimerDisplay();
            if (this.timer.time <= 0) this.completeTimer();
        }, 1000);
    }

    pauseTimer() {
        clearInterval(this.timer.interval);
    }

    resetTimer() {
        this.pauseTimer();
        this.timer.time = 25 * 60;
        this.timer.isRunning = false;
        this.timer.startBtn.textContent = 'Start';
        this.updateTimerDisplay();
    }

    completeTimer() {
        this.pauseTimer();
        this.showNotification('Focus session completed!');
        this.resetTimer();
    }

    updateTimerDisplay() {
        if (!this.timer.display) return;
        const minutes = Math.floor(this.timer.time / 60);
        const seconds = this.timer.time % 60;
        this.timer.display.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Task Progress
    updateTaskProgress() {
        if (this.runningTaskProgress) {
            this.animateProgress(this.runningTaskProgress, 65);
        }
        if (this.upcomingTaskProgress) {
            this.upcomingTaskProgress.style.width = '0%';
        }
    }

    animateProgress(element, targetWidth) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= targetWidth) {
                clearInterval(interval);
            } else {
                width++;
                element.style.width = width + '%';
            }
        }, 10);
    }

    // Navigation and Sidebar
    handleNavigation(event) {
        event.preventDefault();
        this.navItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }

    toggleSidebar() {
        if (this.sidebar) {
            this.sidebar.classList.toggle('show');
        }
    }

    // Utility Functions
    handleOutsideClick(event) {
        const notificationsPanel = document.querySelector('.notifications-panel');
        const helpModal = document.querySelector('.help-modal');
        const userMenu = document.querySelector('.user-menu');

        if (notificationsPanel && 
            !event.target.closest('.notifications') && 
            !event.target.closest('.notifications-panel')) {
            notificationsPanel.classList.remove('show');
        }

        if (helpModal && 
            !event.target.closest('.help-modal-content') && 
            !event.target.closest('.help-btn')) {
            helpModal.classList.remove('show');
            setTimeout(() => helpModal.remove(), 300);
        }

        if (userMenu && 
            !event.target.closest('.user-profile') && 
            !event.target.closest('.user-menu')) {
            userMenu.classList.remove('show');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});