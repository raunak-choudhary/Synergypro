// sidebar.js
class SidebarComponent {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.toggleButton = document.querySelector('.sidebar-toggle');
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => this.toggleSidebar());
        }

        // Handle active menu items
        const menuItems = document.querySelectorAll('.nav-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }

    handleMenuClick(event) {
        const menuItems = document.querySelectorAll('.nav-item');
        menuItems.forEach(item => item.classList.remove('active'));
        event.currentTarget.classList.add('active');
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardCore();
});