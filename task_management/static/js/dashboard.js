// dashboard.js

class DashboardManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeNotifications();
        this.initializeFocusTimer();
    }

    initializeElements() {
        // Header Elements
        this.searchInput = document.querySelector('.search-input');
        this.notificationIcon = document.querySelector('.notification-icon');
        this.userProfile = document.querySelector('.user-profile');
        
        // Sidebar Elements
        this.sidebarToggle = document.querySelector('.sidebar-toggle');
        this.sidebar = document.querySelector('.sidebar');
        this.navItems = document.querySelectorAll('.nav-item');

        // Focus Timer Elements
        this.timer = {
            display: document.querySelector('.timer-display'),
            startBtn: document.querySelector('#startTimer'),
            resetBtn: document.querySelector('#resetTimer'),
            time: 25 * 60, // 25 minutes in seconds
            interval: null,
            isRunning: false
        };

        // Stats Elements
        this.statCards = document.querySelectorAll('.stat-card');
    }

    attachEventListeners() {
        // Header Events
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e));
        }

        if (this.notificationIcon) {
            this.notificationIcon.addEventListener('click', () => this.toggleNotifications());
        }

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

        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    // Search Functionality
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();
        // Implement search functionality
        console.log('Searching for:', searchTerm);
    }

    // Notifications
    initializeNotifications() {
        this.notifications = [];
        this.unreadCount = 0;
        this.updateNotificationBadge();
    }

    toggleNotifications() {
        const notificationPanel = document.querySelector('.notifications-panel');
        if (notificationPanel) {
            notificationPanel.classList.toggle('show');
            if (notificationPanel.classList.contains('show')) {
                this.markNotificationsAsRead();
            }
        }
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = this.unreadCount || '';
            badge.style.display = this.unreadCount ? 'block' : 'none';
        }
    }

    // Focus Timer Functions
    initializeFocusTimer() {
        if (this.timer.display) {
            this.updateTimerDisplay();
        }
    }

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

            if (this.timer.time <= 0) {
                this.completeTimer();
            }
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
        this.timer.isRunning = false;
        this.timer.startBtn.textContent = 'Start';
        // Play notification sound or show alert
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.time / 60);
        const seconds = this.timer.time % 60;
        this.timer.display.textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Navigation
    handleNavigation(event) {
        event.preventDefault();
        this.navItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }

    // Sidebar Toggle for Mobile
    toggleSidebar() {
        this.sidebar.classList.toggle('show');
    }

    // Utility Functions
    handleOutsideClick(event) {
        // Close notifications panel if clicking outside
        if (!event.target.closest('.notifications') && 
            !event.target.closest('.notifications-panel')) {
            const notificationPanel = document.querySelector('.notifications-panel');
            if (notificationPanel?.classList.contains('show')) {
                notificationPanel.classList.remove('show');
            }
        }

        // Close user menu if clicking outside
        if (!event.target.closest('.user-profile') && 
            !event.target.closest('.user-menu')) {
            const userMenu = document.querySelector('.user-menu');
            if (userMenu?.classList.contains('show')) {
                userMenu.classList.remove('show');
            }
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardManager();
});