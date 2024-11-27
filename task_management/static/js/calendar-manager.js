class CalendarManager {
    constructor() {
        this.currentDate = new Date();
        this.currentView = 'month';

        // Make sure DOM is loaded before initializing
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeCalendar();
                this.initializeHeaderComponents();
                this.initializeTaskModal();
            });
        } else {
            this.initializeCalendar();
            this.initializeHeaderComponents();
            this.initializeTaskModal();
        }
    }

    initializeCalendar() {
        this.updateCalendarHeader();
        this.renderMonthView();
        this.attachCalendarEventListeners();
    }

    changeView(newView) {
        this.currentView = newView;
        this.updateCalendarHeader();
        this.updateCalendarView();
    }

    // Calendar-specific methods from your original calendar.js
    updateCalendarHeader() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthDisplay = document.getElementById('currentMonth');
        
        if (!monthDisplay) return;

        if (this.currentView === 'month') {
            // Month view header
            monthDisplay.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else {
            // Week view header
            const weekStart = new Date(this.currentDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get Sunday
            
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // Get Saturday
            
            // Format dates
            const formatDate = (date) => {
                const month = monthNames[date.getMonth()].substring(0, 3); // Abbreviated month
                return `${month} ${date.getDate()}`;
            };
            
            // If week spans two months
            if (weekStart.getMonth() !== weekEnd.getMonth()) {
                monthDisplay.textContent = `${formatDate(weekStart)} - ${formatDate(weekEnd)}, ${weekEnd.getFullYear()}`;
            } 
            // If week spans two years
            else if (weekStart.getFullYear() !== weekEnd.getFullYear()) {
                monthDisplay.textContent = `${formatDate(weekStart)}, ${weekStart.getFullYear()} - ${formatDate(weekEnd)}, ${weekEnd.getFullYear()}`;
            }
            // Same month
            else {
                monthDisplay.textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
            }
        }
    }

    updateCalendarView() {
        const calendarGrid = document.getElementById('calendarGrid');
        const daysHeader = document.querySelector('.calendar-days-header');
        if (!calendarGrid) return;
    
        if (this.currentView === 'month') {
            // Show days header and render month view
            if (daysHeader) daysHeader.style.display = 'grid';
            calendarGrid.classList.remove('week-view');
            this.renderMonthView();
        } else {
            // Hide days header and render week view
            if (daysHeader) daysHeader.style.display = 'none';
            calendarGrid.classList.add('week-view');
            this.renderWeekView();
        }
    }

    initializeTaskModal() {
          const modal = document.getElementById('taskModal');
          const span = document.getElementsByClassName('close')[0];
          const taskForm = document.getElementById('taskForm');

          document.getElementById('calendarGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('calendar-cell')) {
              const date = e.target.dataset.date;
              document.getElementById('taskStartDate').value = date;
              document.getElementById('taskEndDate').min = date;
              modal.style.display = 'block';
            }
          });

          span.onclick = () => {
            modal.style.display = 'none';
          };

          window.onclick = (event) => {
            if (event.target == modal) {
              modal.style.display = 'none';
            }
          };

          taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(taskForm);
            fetch('/api/tasks/create/', {
              method: 'POST',
              body: formData,
              headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
              }
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                alert('Task created successfully!');
                modal.style.display = 'none';
                taskForm.reset();
                this.renderMonthView(); // Refresh the calendar
              } else {
                alert('Error creating task: ' + data.error);
              }
            })
            .catch(error => {
              console.error('Error:', error);
              alert('An error occurred while creating the task.');
            });
          });
    }

    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    renderMonthView() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();

        // Get first and last date of the month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Get the first day of the week (0 = Sunday)
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();

        // Get number of days from previous month to show
        const prevMonthLastDate = new Date(year, month, 0).getDate();

        // Previous month's days
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const day = prevMonthLastDate - i;
            const dayElement = this.createDayElement(day, 'other-month');
            calendarGrid.appendChild(dayElement);
        }

        // Current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = this.createDayElement(day, this.isToday(day) ? 'today' : '');
            calendarGrid.appendChild(dayElement);
        }

        // Calculate remaining cells to fill
        const totalCells = 42; // 6 rows × 7 days
        const remainingCells = totalCells - (firstDayOfWeek + daysInMonth);

        // Next month's days
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = this.createDayElement(day, 'other-month');
            calendarGrid.appendChild(dayElement);
        }

        this.attachCalendarCellListeners();

    }

    attachCalendarCellListeners() {
        const calendarCells = document.querySelectorAll('.calendar-cell');
        calendarCells.forEach(cell => {
            cell.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                this.openTaskModal(date);
            });
        });
    }

    openTaskModal(date) {
        const modal = document.getElementById('taskModal');
        document.getElementById('taskStartDate').value = date;
        document.getElementById('taskEndDate').min = date;
        modal.style.display = 'block';
    }

    renderWeekView() {
        const calendarGrid = document.getElementById('calendarGrid');
        if (!calendarGrid) return;
        
        calendarGrid.innerHTML = '';
        calendarGrid.style.height = 'calc(100vh - 300px)';
        
        // Create main container
        const weekContainer = document.createElement('div');
        weekContainer.className = 'week-grid-container';
        
        // Time column
        const timeColumn = this.createTimeColumn();
        weekContainer.appendChild(timeColumn);
        
        // Create day columns
        const startOfWeek = new Date(this.currentDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startOfWeek);
            currentDate.setDate(startOfWeek.getDate() + i);
            weekContainer.appendChild(this.createDayColumn(currentDate));
        }
        
        calendarGrid.appendChild(weekContainer);
    }

    createTimeColumn() {
        const timeColumn = document.createElement('div');
        timeColumn.className = 'time-column';
        
        // Empty header cell
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'week-day-header empty';
        timeColumn.appendChild(emptyHeader);
        
        // Time slots
        for (let hour = 0; hour < 24; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = `${hour.toString().padStart(2, '0')}:00`;
            timeColumn.appendChild(timeSlot);
        }
        
        return timeColumn;
    }

    createDayColumn(date) {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const isToday = this.isCurrentDay(date);
        
        // Merge header content into the main header
        const header = document.createElement('div');
        header.className = `week-day-header ${isToday ? 'today' : ''}`;
        header.innerHTML = `
            <div class="day-header-content">
                <span class="weekday">${days[date.getDay()]}</span>
                <span class="date">${date.getDate()}</span>
            </div>
        `;
        dayColumn.appendChild(header);
        
        // Hour slots
        for (let hour = 0; hour < 24; hour++) {
            const hourSlot = document.createElement('div');
            hourSlot.className = 'hour-slot';
            if (isToday && new Date().getHours() === hour) {
                hourSlot.classList.add('current-hour');
            }
            dayColumn.appendChild(hourSlot);
        }
        
        return dayColumn;
    }

    isCurrentDay(date) {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    }

    createDayElement(day, additionalClass = '') {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-cell ${additionalClass}`;
        dayElement.dataset.date = this.formatDate(new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day));
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'date';
        dateSpan.textContent = day;
        
        const tasksDiv = document.createElement('div');
        tasksDiv.className = 'tasks';

        dayElement.appendChild(dateSpan);
        dayElement.appendChild(tasksDiv);

        return dayElement;
    }

    isToday(day) {
        const today = new Date();
        return day === today.getDate() && 
                this.currentDate.getMonth() === today.getMonth() && 
                this.currentDate.getFullYear() === today.getFullYear();
    }

    navigateCalendar(direction) {
        if (this.currentView === 'month') {
            this.navigateMonth(direction);
        } else {
            this.navigateWeek(direction);
        }
    }

    navigateMonth(direction) {
        const newDate = new Date(this.currentDate);
        
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        
        this.currentDate = newDate;
        
        requestAnimationFrame(() => {
            this.updateCalendarHeader();
            this.renderMonthView();
        });
    }

    navigateWeek(direction) {
        const newDate = new Date(this.currentDate);
        newDate.setDate(newDate.getDate() + (direction === 'prev' ? -7 : 7));
        this.currentDate = newDate;
        this.updateCalendarHeader();
        this.renderWeekView();
    }

    attachCalendarEventListeners() {
        const prevButton = document.querySelector('.nav-btn.prev-month');
        const nextButton = document.querySelector('.nav-btn.next-month');

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentView === 'month') {
                    console.log('Previous month clicked');
                    this.navigateMonth('prev');
                } else {
                    console.log('Previous week clicked');
                    this.navigateWeek('prev');
                }
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.currentView === 'month') {
                    console.log('Next month clicked');
                    this.navigateMonth('next');
                } else {
                    console.log('Next week clicked');
                    this.navigateWeek('next');
                }
            });
        }
    }

    // Header Component methods
    initializeHeaderComponents() {
        // Profile Dropdown initialization
        this.profileDropdown = document.getElementById('profileDropdown');
        this.dropdownMenu = this.profileDropdown?.querySelector('.profile-dropdown-menu');
    
        if (this.profileDropdown) {
            this.profileDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleProfileMenu();
            });
    
            // Profile link handling
            const profileLink = this.dropdownMenu?.querySelector('a[href*="profile"]');
            if (profileLink) {
                profileLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const profileUrl = profileLink.getAttribute('href');
                    if (profileUrl) {
                        window.location.href = profileUrl;
                    }
                });
            }
        }
    
        // View Dropdown initialization
        const viewDropdown = document.getElementById('viewDropdown');
        const viewDropdownMenu = viewDropdown?.querySelector('.profile-dropdown-menu');
        const currentView = viewDropdown?.querySelector('.current-view');
    
        if (viewDropdown && viewDropdownMenu) {
            viewDropdown.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // Close profile dropdown if open
                if (this.dropdownMenu?.classList.contains('show')) {
                    this.dropdownMenu.classList.remove('show');
                }
                viewDropdown.classList.toggle('show');
                viewDropdownMenu.classList.toggle('show');
            });
    
            // View options handling
            const viewOptions = viewDropdownMenu.querySelectorAll('.dropdown-item');
            viewOptions.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    viewOptions.forEach(opt => opt.classList.remove('active'));
                    e.target.classList.add('active');
                    
                    if (currentView) {
                        currentView.querySelector('.view-text').textContent = e.target.textContent;
                    }
                    
                    this.changeView(e.target.textContent.toLowerCase());
                    
                    viewDropdown.classList.remove('show');
                    viewDropdownMenu.classList.remove('show');
                });
            });
        }
    
        // Global click handler for dropdowns
        document.addEventListener('click', (e) => {
            // Close profile dropdown
            if (!e.target.closest('#profileDropdown') && 
                this.dropdownMenu?.classList.contains('show')) {
                this.dropdownMenu.classList.remove('show');
            }
            
            // Close view dropdown
            if (!e.target.closest('#viewDropdown') && 
                viewDropdownMenu?.classList.contains('show')) {
                viewDropdown?.classList.remove('show');
                viewDropdownMenu.classList.remove('show');
            }
        });
    
        this.initializeNotifications();
        this.initializeLogout();
    }

    // Update the navigateMonth method to be more robust
    navigateMonth(direction) {
        if (this.currentView !== 'month') return;
        
        const newDate = new Date(this.currentDate);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        this.currentDate = newDate;
        this.updateCalendarHeader();
        this.renderMonthView();
    }

    navigateWeek(direction) {
        if (this.currentView !== 'week') return;

        const newDate = new Date(this.currentDate);
        if (direction === 'prev') {
            newDate.setDate(newDate.getDate() - 7);
        } else {
            newDate.setDate(newDate.getDate() + 7);
        }
        this.currentDate = newDate;
        this.updateCalendarHeader();
        this.renderWeekView();
    }

    initializeNotifications() {
        const notificationTrigger = document.querySelector('.notification-trigger');
        const notificationsPanel = document.querySelector('.notifications-panel');
        
        if (notificationTrigger && notificationsPanel) {
            notificationTrigger.addEventListener('click', (e) => {
                e.stopPropagation();
                notificationsPanel.classList.toggle('show');
            });
    
            // Close on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.notifications') && 
                    notificationsPanel.classList.contains('show')) {
                    notificationsPanel.classList.remove('show');
                }
            });
        }
    
        // Initialize NotificationManager
        if (typeof NotificationManager !== 'undefined') {
            this.notificationManager = new NotificationManager();
        }
    }

    toggleProfileMenu() {
        if (this.dropdownMenu) {
            const viewDropdown = document.getElementById('viewDropdown');
            const viewDropdownMenu = viewDropdown?.querySelector('.profile-dropdown-menu');
            
            // Close view dropdown if open
            if (viewDropdownMenu?.classList.contains('show')) {
                viewDropdown?.classList.remove('show');
                viewDropdownMenu.classList.remove('show');
            }
            
            // Toggle profile dropdown
            const isShowing = this.dropdownMenu.classList.contains('show');
            document.querySelectorAll('.profile-dropdown-menu.show').forEach(menu => {
                menu.classList.remove('show');
            });
            
            if (!isShowing) {
                this.dropdownMenu.classList.add('show');
            }
        }
    }

    initializeLogout() {
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.calendarManager = new CalendarManager();
});