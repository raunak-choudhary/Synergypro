// notifications.js
class NotificationsComponent {
    constructor() {
        this.container = this.createContainer();
        document.body.appendChild(this.container);
    }

    createContainer() {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        return container;
    }

    show({ type, message, duration = 3000 }) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} slide-in`;
        notification.textContent = message;

        this.container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, duration);
    }
}