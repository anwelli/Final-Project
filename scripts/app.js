// Main Application Script for Azuka Dashboard
class AzukaDashboard {
    constructor() {
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.theme = 'light';
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadTheme();
        this.updateDate();
    }

    checkAuth() {
        const user = localStorage.getItem('azuka_user');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showApp();
            this.loadPage('dashboard');
        } else {
            this.showAuth();
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
            });
        });

        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.add('active');
        });

        document.getElementById('closeMobileMenu')?.addEventListener('click', () => {
            document.getElementById('mobileMenu').classList.remove('active');
        });

        // Mobile menu items
        document.querySelectorAll('.mobile-menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.page;
                this.loadPage(page);
                document.getElementById('mobileMenu').classList.remove('active');
            });
        });

        // Theme toggle
        document.getElementById('themeToggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Notifications
        document.getElementById('notificationsBtn')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        document.querySelector('.close-notifications')?.addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.getElementById('modalOverlay')?.addEventListener('click', () => {
            this.closeAllModals();
        });

        // Quick actions
        document.getElementById('quickAddTask')?.addEventListener('click', () => {
            this.showModal('createTaskModal');
        });

        document.getElementById('quickAddGoal')?.addEventListener('click', () => {
            this.showModal('createGoalModal');
        });

        // Form submissions
        document.getElementById('goalForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createGoal();
        });

        document.getElementById('taskForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.createTask();
        });

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
    }

    showAuth() {
        document.getElementById('authSection').classList.remove('hidden');
        document.getElementById('appSection').classList.add('hidden');
    }

    showApp() {
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('appSection').classList.remove('hidden');
        this.updateUserInfo();
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        const userName = document.getElementById('userName');
        const userAvatar = document.getElementById('userAvatar');
        const greetingName = document.querySelector('#greetingName');

        if (userName) {
            userName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
        }

        if (userAvatar) {
            const initials = (this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '');
            userAvatar.textContent = initials.toUpperCase();
        }

        if (greetingName) {
            greetingName.textContent = this.currentUser.firstName;
        }
    }

    loadPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link, .mobile-menu-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Hide all pages
        document.querySelectorAll('.page').forEach(pageEl => {
            pageEl.classList.remove('active');
        });

        // Show current page
        const pageEl = document.getElementById(page + 'Page');
        if (pageEl) {
            pageEl.classList.add('active');
            this.currentPage = page;
            this.loadPageContent(page);
        }
    }

    loadPageContent(page) {
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'goals':
                this.loadGoals();
                break;
            case 'tasks':
                this.loadTasks();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    loadDashboard() {
        const dashboardPage = document.getElementById('dashboardPage');
        if (!dashboardPage) return;

        const today = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        dashboardPage.innerHTML = `
            <div class="page-header">
                <h2>Dashboard</h2>
                <p>Welcome back! Here's your productivity overview for today</p>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Today's Summary</h3>
                    </div>
                    <div class="today-summary">
                        <div class="summary-item">
                            <span class="summary-label">Date:</span>
                            <span class="summary-value">${today}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Productivity Score:</span>
                            <span class="summary-value" id="productivityScore">85</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Focus Streak:</span>
                            <span class="summary-value" id="focusStreak">7 days</span>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card wide">
                    <div class="card-header">
                        <h3>Today's Tasks</h3>
                        <button class="card-action" id="addTodayTask">+ Add</button>
                    </div>
                    <div class="activity-list" id="todayTasksList">
                        <div class="empty-state">
                            <i class="fas fa-tasks"></i>
                            <h3>No tasks for today</h3>
                            <p>Add your first task to get started</p>
                            <button class="btn btn-primary" id="addFirstTask">Add Task</button>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Active Goals</h3>
                        <button class="card-action" id="viewAllGoals">View All</button>
                    </div>
                    <div id="activeGoalsList">
                        <div class="empty-state">
                            <i class="fas fa-bullseye"></i>
                            <h3>No active goals</h3>
                            <p>Set a goal to track your progress</p>
                            <button class="btn btn-primary" id="addFirstGoal">Set Goal</button>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Quick Stats</h3>
                    </div>
                    <div class="quick-stats">
                        <div class="stat-item">
                            <span class="stat-label">Tasks Completed</span>
                            <span class="stat-value">8/12</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Focus Time</span>
                            <span class="stat-value">4h 30m</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Goals Progress</span>
                            <span class="stat-value">65%</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Productivity</span>
                            <span class="stat-value">+12%</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for dashboard buttons
        setTimeout(() => {
            document.getElementById('addTodayTask')?.addEventListener('click', () => {
                this.showModal('createTaskModal');
            });

            document.getElementById('addFirstTask')?.addEventListener('click', () => {
                this.showModal('createTaskModal');
            });

            document.getElementById('addFirstGoal')?.addEventListener('click', () => {
                this.showModal('createGoalModal');
            });

            document.getElementById('viewAllGoals')?.addEventListener('click', () => {
                this.loadPage('goals');
            });
        }, 100);
    }

    loadGoals() {
        const goalsPage = document.getElementById('goalsPage');
        if (!goalsPage) return;

        goalsPage.innerHTML = `
            <div class="page-header">
                <h2>Goals</h2>
                <p>Set and track your personal and professional goals</p>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>My Goals</h3>
                    <button class="btn btn-primary" id="createNewGoal">
                        <i class="fas fa-plus"></i> New Goal
                    </button>
                </div>
                <div class="goals-grid" id="goalsList">
                    <div class="empty-state">
                        <i class="fas fa-bullseye"></i>
                        <h3>No goals yet</h3>
                        <p>Create your first goal to start tracking progress</p>
                        <button class="btn btn-primary" id="createFirstGoal">Create Goal</button>
                    </div>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Goal Statistics</h3>
                </div>
                <div class="goal-stats">
                    <div class="stat-row">
                        <div class="stat-col">
                            <div class="stat-number">0</div>
                            <div class="stat-label">Total Goals</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-number">0</div>
                            <div class="stat-label">Active</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-number">0</div>
                            <div class="stat-label">Completed</div>
                        </div>
                        <div class="stat-col">
                            <div class="stat-number">0%</div>
                            <div class="stat-label">Avg. Progress</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load goals from storage
        this.loadGoalsFromStorage();

        // Add event listeners
        setTimeout(() => {
            document.getElementById('createNewGoal')?.addEventListener('click', () => {
                this.showModal('createGoalModal');
            });

            document.getElementById('createFirstGoal')?.addEventListener('click', () => {
                this.showModal('createGoalModal');
            });
        }, 100);
    }

    loadTasks() {
        const tasksPage = document.getElementById('tasksPage');
        if (!tasksPage) return;

        tasksPage.innerHTML = `
            <div class="page-header">
                <h2>Tasks</h2>
                <p>Manage your daily tasks and to-do lists</p>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Task Management</h3>
                    <button class="btn btn-primary" id="createNewTask">
                        <i class="fas fa-plus"></i> New Task
                    </button>
                </div>
                <div class="task-filters">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="today">Today</button>
                        <button class="filter-tab" data-filter="upcoming">Upcoming</button>
                        <button class="filter-tab" data-filter="overdue">Overdue</button>
                        <button class="filter-tab" data-filter="completed">Completed</button>
                    </div>
                </div>
                <div class="task-list" id="tasksList">
                    <div class="empty-state">
                        <i class="fas fa-tasks"></i>
                        <h3>No tasks yet</h3>
                        <p>Add your first task to get started</p>
                        <button class="btn btn-primary" id="createFirstTask">Add Task</button>
                    </div>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Task Statistics</h3>
                </div>
                <div class="task-stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">0</div>
                            <div class="stat-label">Completed Today</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">0h</div>
                            <div class="stat-label">Total Time</div>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="stat-content">
                            <div class="stat-value">0%</div>
                            <div class="stat-label">Completion Rate</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Load tasks from storage
        this.loadTasksFromStorage();

        // Add event listeners
        setTimeout(() => {
            document.getElementById('createNewTask')?.addEventListener('click', () => {
                this.showModal('createTaskModal');
            });

            document.getElementById('createFirstTask')?.addEventListener('click', () => {
                this.showModal('createTaskModal');
            });

            // Filter tabs
            document.querySelectorAll('.filter-tab').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    const filter = e.currentTarget.dataset.filter;
                    this.filterTasks(filter);
                });
            });
        }, 100);
    }

    loadAnalytics() {
        const analyticsPage = document.getElementById('analyticsPage');
        if (!analyticsPage) return;

        analyticsPage.innerHTML = `
            <div class="page-header">
                <h2>Analytics</h2>
                <p>Track your productivity trends and gain insights</p>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Productivity Trends</h3>
                    <select class="time-range" id="analyticsRange">
                        <option value="week">Last 7 days</option>
                        <option value="month" selected>Last 30 days</option>
                        <option value="quarter">Last 90 days</option>
                    </select>
                </div>
                <div class="chart-container">
                    <canvas id="productivityChart"></canvas>
                </div>
            </div>

            <div class="dashboard-grid">
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Goal Progress</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="goalProgressChart"></canvas>
                    </div>
                </div>

                <div class="dashboard-card">
                    <div class="card-header">
                        <h3>Task Completion</h3>
                    </div>
                    <div class="chart-container">
                        <canvas id="taskCompletionChart"></canvas>
                    </div>
                </div>
            </div>

            <div class="dashboard-card">
                <div class="card-header">
                    <h3>Insights & Recommendations</h3>
                </div>
                <div class="insights-list">
                    <div class="insight-item">
                        <div class="insight-icon success">
                            <i class="fas fa-chart-line"></i>
                        </div>
                        <div class="insight-content">
                            <h4>Productivity Increasing</h4>
                            <p>Your productivity has increased by 15% this week compared to last week.</p>
                        </div>
                    </div>
                    <div class="insight-item">
                        <div class="insight-icon warning">
                            <i class="fas fa-clock"></i>
                        </div>
                        <div class="insight-content">
                            <h4>Focus Time Needed</h4>
                            <p>Your focus time has decreased. Try scheduling uninterrupted work blocks.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize charts
        setTimeout(() => {
            this.initCharts();
        }, 100);
    }

    loadProfile() {
        const profilePage = document.getElementById('profilePage');
        if (!profilePage || !this.currentUser) return;

        profilePage.innerHTML = `
            <div class="page-header">
                <h2>Profile</h2>
                <p>Manage your account and preferences</p>
            </div>

            <div class="dashboard-card">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <div class="avatar-large" id="profileAvatar">
                            ${(this.currentUser.firstName?.[0] || '') + (this.currentUser.lastName?.[0] || '')}
                        </div>
                        <button class="avatar-change">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <div class="profile-info">
                        <h3>${this.currentUser.firstName} ${this.currentUser.lastName}</h3>
                        <p class="user-email">${this.currentUser.email}</p>
                        <p class="user-role">Premium Member</p>
                        <div class="profile-stats">
                            <div class="profile-stat">
                                <span class="stat-value">${this.currentUser.stats?.goals || 0}</span>
                                <span class="stat-label">Goals</span>
                            </div>
                            <div class="profile-stat">
                                <span class="stat-value">${this.currentUser.stats?.tasks || 0}</span>
                                <span class="stat-label">Tasks</span>
                            </div>
                            <div class="profile-stat">
                                <span class="stat-value">${this.currentUser.stats?.streak || 0}</span>
                                <span class="stat-label">Day Streak</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-sections">
                    <div class="profile-section">
                        <h4>Account Settings</h4>
                        <div class="settings-list">
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h5>Personal Information</h5>
                                    <p>Update your name, email, and contact details</p>
                                </div>
                                <button class="btn btn-secondary">Edit</button>
                            </div>
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h5>Password & Security</h5>
                                    <p>Change password and manage security settings</p>
                                </div>
                                <button class="btn btn-secondary">Edit</button>
                            </div>
                            <div class="setting-item">
                                <div class="setting-info">
                                    <h5>Notification Preferences</h5>
                                    <p>Manage email and push notifications</p>
                                </div>
                                <button class="btn btn-secondary">Edit</button>
                            </div>
                        </div>
                    </div>

                    <div class="profile-section">
                        <h4>Preferences</h4>
                        <div class="preferences-list">
                            <div class="preference-item">
                                <div class="preference-info">
                                    <h5>Theme</h5>
                                    <p>Switch between light and dark mode</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="themeSwitch" ${this.theme === 'dark' ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <div class="preference-item">
                                <div class="preference-info">
                                    <h5>Daily Reminders</h5>
                                    <p>Receive daily task reminders</p>
                                </div>
                                <label class="switch">
                                    <input type="checkbox" id="dailyReminders" checked>
                                    <span class="slider"></span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for profile
        setTimeout(() => {
            document.getElementById('themeSwitch')?.addEventListener('change', (e) => {
                this.theme = e.target.checked ? 'dark' : 'light';
                this.applyTheme();
            });
        }, 100);
    }

    loadGoalsFromStorage() {
        const goals = JSON.parse(localStorage.getItem('azuka_goals') || '[]');
        const goalsList = document.getElementById('goalsList');
        
        if (!goalsList || goals.length === 0) return;

        goalsList.innerHTML = '';
        goals.forEach(goal => {
            const goalCard = this.createGoalCard(goal);
            goalsList.appendChild(goalCard);
        });
    }

    loadTasksFromStorage() {
        const tasks = JSON.parse(localStorage.getItem('azuka_tasks') || '[]');
        const tasksList = document.getElementById('tasksList');
        
        if (!tasksList || tasks.length === 0) return;

        tasksList.innerHTML = '';
        tasks.forEach(task => {
            const taskItem = this.createTaskItem(task);
            tasksList.appendChild(taskItem);
        });
    }

    createGoalCard(goal) {
        const div = document.createElement('div');
        div.className = 'goal-card';
        div.innerHTML = `
            <div class="goal-header">
                <h4 class="goal-title">${goal.title}</h4>
                <span class="goal-priority ${goal.priority}">${goal.priority}</span>
            </div>
            <p class="goal-description">${goal.description}</p>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress || 0}%"></div>
                </div>
                <div class="progress-info">
                    <span class="progress-percentage">${goal.progress || 0}%</span>
                    <span class="progress-days">${this.getDaysRemaining(goal.deadline)} days left</span>
                </div>
            </div>
            <div class="goal-actions">
                <button class="btn-icon" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-icon" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        return div;
    }

    createTaskItem(task) {
        const div = document.createElement('div');
        div.className = 'task-item';
        div.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''}>
            </div>
            <div class="task-content">
                <h4 class="task-title ${task.completed ? 'completed' : ''}">${task.title}</h4>
                <p class="task-description">${task.description}</p>
                <div class="task-tags">
                    <span class="tag ${task.category}">${task.category}</span>
                    <span class="tag ${task.priority}">${task.priority}</span>
                </div>
            </div>
            <div class="task-meta">
                <span class="task-date">${task.dueDate || 'No deadline'}</span>
                <span class="task-time">${task.estimatedTime || '1'}h</span>
            </div>
        `;
        return div;
    }

    createGoal() {
        const title = document.getElementById('goalTitle').value;
        const description = document.getElementById('goalDescription').value;
        const category = document.getElementById('goalCategory').value;
        const priority = document.getElementById('goalPriority').value;
        const deadline = document.getElementById('goalDeadline').value;
        const target = document.getElementById('goalTarget').value;

        const goal = {
            id: 'goal-' + Date.now(),
            title,
            description,
            category,
            priority,
            deadline,
            target,
            progress: 0,
            createdAt: new Date().toISOString(),
            userId: this.currentUser?.id
        };

        // Save to localStorage
        const goals = JSON.parse(localStorage.getItem('azuka_goals') || '[]');
        goals.push(goal);
        localStorage.setItem('azuka_goals', JSON.stringify(goals));

        // Close modal and refresh
        this.closeAllModals();
        this.loadPageContent(this.currentPage);
    }

    createTask() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;
        const category = document.getElementById('taskCategory').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;
        const estimatedTime = document.getElementById('taskEstimatedTime').value;

        const task = {
            id: 'task-' + Date.now(),
            title,
            description,
            category,
            priority,
            dueDate,
            estimatedTime,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: this.currentUser?.id
        };

        // Save to localStorage
        const tasks = JSON.parse(localStorage.getItem('azuka_tasks') || '[]');
        tasks.push(task);
        localStorage.setItem('azuka_tasks', JSON.stringify(tasks));

        // Close modal and refresh
        this.closeAllModals();
        this.loadPageContent(this.currentPage);
    }

    showModal(modalId) {
        document.getElementById('modalOverlay').classList.add('active');
        document.getElementById(modalId).classList.add('active');
    }

    closeAllModals() {
        document.getElementById('modalOverlay').classList.remove('active');
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.querySelectorAll('.modal form').forEach(form => {
            form.reset();
        });
    }

    toggleNotifications() {
        document.getElementById('notificationsPanel').classList.toggle('active');
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('azuka_theme', this.theme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('azuka_theme') || 'light';
        this.theme = savedTheme;
        this.applyTheme();
    }

    applyTheme() {
        if (this.theme === 'dark') {
            document.body.classList.add('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-theme');
            document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    updateDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
    }

    getDaysRemaining(deadline) {
        if (!deadline) return 'N/A';
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    filterTasks(filter) {
        // Implement task filtering logic
        console.log(`Filtering tasks by: ${filter}`);
    }

    initCharts() {
        // Initialize Chart.js charts for analytics
        // This is a placeholder - you'll need to implement actual chart creation
        console.log('Initializing charts...');
    }

    logout() {
        if (confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('azuka_user');
            this.currentUser = null;
            this.showAuth();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.azukaApp = new AzukaDashboard();
});