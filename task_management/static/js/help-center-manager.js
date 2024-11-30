class HelpCenterManager {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.initializeSearch();
    }

    initializeElements() {
        // Search elements
        this.searchInput = document.querySelector('.help-search-input');
        this.learningPaths = document.querySelectorAll('.learning-path-card');
        this.articles = document.querySelectorAll('.article-card');
        this.tools = document.querySelectorAll('.tool-card');

        // Category filters
        this.categories = new Set();
        document.querySelectorAll('.article-category').forEach(category => {
            this.categories.add(category.textContent);
        });

        // Progress elements
        this.progressBars = document.querySelectorAll('.progress-bar');
    }

    attachEventListeners() {
        // Search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Article link tracking
        document.querySelectorAll('.article-link').forEach(link => {
            link.addEventListener('click', (e) => this.trackArticleClick(e));
        });

        // Tool download tracking
        document.querySelectorAll('.tool-download').forEach(link => {
            link.addEventListener('click', (e) => this.trackToolDownload(e));
        });
    }

    initializeSearch() {
        // Initialize search index
        this.searchIndex = {
            articles: Array.from(this.articles).map(article => ({
                element: article,
                title: article.querySelector('h3').textContent.toLowerCase(),
                description: article.querySelector('p').textContent.toLowerCase(),
                category: article.querySelector('.article-category').textContent.toLowerCase()
            })),
            learningPaths: Array.from(this.learningPaths).map(path => ({
                element: path,
                title: path.querySelector('h3').textContent.toLowerCase(),
                description: path.querySelector('p').textContent.toLowerCase()
            })),
            tools: Array.from(this.tools).map(tool => ({
                element: tool,
                title: tool.querySelector('h3').textContent.toLowerCase(),
                description: tool.querySelector('p').textContent.toLowerCase()
            }))
        };
    }

    handleSearch(query) {
        query = query.toLowerCase();

        // Search in articles
        this.searchIndex.articles.forEach(item => {
            const matches = item.title.includes(query) || 
                          item.description.includes(query) || 
                          item.category.includes(query);
            item.element.style.display = matches ? 'block' : 'none';
        });

        // Search in learning paths
        this.searchIndex.learningPaths.forEach(item => {
            const matches = item.title.includes(query) || 
                          item.description.includes(query);
            item.element.style.display = matches ? 'block' : 'none';
        });

        // Search in tools
        this.searchIndex.tools.forEach(item => {
            const matches = item.title.includes(query) || 
                          item.description.includes(query);
            item.element.style.display = matches ? 'block' : 'none';
        });

        // Update sections visibility
        this.updateSectionsVisibility();
    }

    updateSectionsVisibility() {
        // Hide section headers if no visible items
        ['learning-paths-section', 'articles-section', 'tools-section'].forEach(sectionClass => {
            const section = document.querySelector(`.${sectionClass}`);
            const visibleItems = section.querySelectorAll('[style="display: block"]').length;
            section.style.display = visibleItems ? 'block' : 'none';
        });
    }

    trackArticleClick(event) {
        const article = event.target.closest('.article-card');
        const articleTitle = article.querySelector('h3').textContent;
        
        // Send tracking data to backend
        this.sendAnalytics('article_click', {
            title: articleTitle,
            timestamp: new Date().toISOString()
        });
    }

    trackToolDownload(event) {
        const tool = event.target.closest('.tool-card');
        const toolTitle = tool.querySelector('h3').textContent;
        
        // Send tracking data to backend
        this.sendAnalytics('tool_download', {
            title: toolTitle,
            timestamp: new Date().toISOString()
        });
    }

    sendAnalytics(action, data) {
        // Send analytics data to your backend
        fetch('/api/help-center/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCsrfToken()
            },
            body: JSON.stringify({
                action,
                data
            })
        }).catch(error => console.error('Analytics error:', error));
    }

    getCsrfToken() {
        // Get CSRF token from cookies
        return document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    }

    // Helper method to animate progress bars
    animateProgressBars() {
        this.progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('aria-valuenow');
            let width = 0;
            const interval = setInterval(() => {
                if (width >= targetWidth) {
                    clearInterval(interval);
                } else {
                    width++;
                    bar.style.width = width + '%';
                }
            }, 10);
        });
    }

    // Method to show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        // Trigger animation
        requestAnimationFrame(() => notification.classList.add('show'));

        // Remove notification after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize Help Center
document.addEventListener('DOMContentLoaded', () => {
    window.helpCenter = new HelpCenterManager();
});