// Storage Management for Azuka Dashboard
class StorageManager {
    constructor() {
        this.STORAGE_KEYS = {
            USER: 'azuka_user',
            USERS: 'azuka_users',
            GOALS: 'azuka_goals',
            TASKS: 'azuka_tasks',
            ACTIVITIES: 'azuka_activities',
            SETTINGS: 'azuka_settings',
            THEME: 'azuka_theme'
        };
    }

    // User Management
    saveUser(user) {
        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(user));
    }

    getUser() {
        const user = localStorage.getItem(this.STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    }

    clearUser() {
        localStorage.removeItem(this.STORAGE_KEYS.USER);
    }

    // Goals Management
    saveGoal(goal) {
        const goals = this.getGoals();
        goals.push(goal);
        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
        return goal;
    }

    getGoals(userId = null) {
        const goals = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.GOALS) || '[]');
        if (userId) {
            return goals.filter(goal => goal.userId === userId);
        }
        return goals;
    }

    updateGoal(goalId, updates) {
        const goals = this.getGoals();
        const index = goals.findIndex(g => g.id === goalId);
        if (index !== -1) {
            goals[index] = { ...goals[index], ...updates };
            localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(goals));
            return goals[index];
        }
        return null;
    }

    deleteGoal(goalId) {
        const goals = this.getGoals();
        const filteredGoals = goals.filter(g => g.id !== goalId);
        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(filteredGoals));
    }

    // Tasks Management
    saveTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
        return task;
    }

    getTasks(userId = null) {
        const tasks = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.TASKS) || '[]');
        if (userId) {
            return tasks.filter(task => task.userId === userId);
        }
        return tasks;
    }

    getTasksByDate(date, userId = null) {
        const tasks = this.getTasks(userId);
        return tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toDateString();
            return taskDate === date.toDateString();
        });
    }

    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
            return tasks[index];
        }
        return null;
    }

    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(t => t.id !== taskId);
        localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(filteredTasks));
    }

    // Activities Management
    saveActivity(activity) {
        const activities = this.getActivities();
        activities.push(activity);
        localStorage.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
        return activity;
    }

    getActivities(userId = null) {
        const activities = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.ACTIVITIES) || '[]');
        if (userId) {
            return activities.filter(activity => activity.userId === userId);
        }
        return activities;
    }

    // Settings Management
    saveSettings(settings) {
        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    }

    getSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEYS.SETTINGS);
        return settings ? JSON.parse(settings) : {};
    }

    // Theme Management
    saveTheme(theme) {
        localStorage.setItem(this.STORAGE_KEYS.THEME, theme);
    }

    getTheme() {
        return localStorage.getItem(this.STORAGE_KEYS.THEME) || 'light';
    }

    // Statistics
    getUserStats(userId) {
        const goals = this.getGoals(userId);
        const tasks = this.getTasks(userId);
        const activities = this.getActivities(userId);

        const completedGoals = goals.filter(g => g.progress === 100).length;
        const completedTasks = tasks.filter(t => t.completed).length;
        
        // Calculate streak (simplified - in real app, track daily completions)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const todayTasks = tasks.filter(t => {
            const taskDate = new Date(t.completedAt || t.createdAt);
            return taskDate.toDateString() === today.toDateString();
        });
        
        const yesterdayTasks = tasks.filter(t => {
            const taskDate = new Date(t.completedAt || t.createdAt);
            return taskDate.toDateString() === yesterday.toDateString();
        });
        
        const streak = todayTasks.length > 0 && yesterdayTasks.length > 0 ? 2 : 
                       todayTasks.length > 0 ? 1 : 0;

        return {
            totalGoals: goals.length,
            completedGoals,
            totalTasks: tasks.length,
            completedTasks,
            totalActivities: activities.length,
            streak,
            productivityScore: this.calculateProductivityScore(goals, tasks)
        };
    }

    calculateProductivityScore(goals, tasks) {
        // Simplified productivity score calculation
        const goalProgress = goals.reduce((sum, goal) => sum + (goal.progress || 0), 0) / Math.max(goals.length, 1);
        const taskCompletion = tasks.filter(t => t.completed).length / Math.max(tasks.length, 1);
        
        return Math.round((goalProgress * 0.6 + taskCompletion * 0.4) * 100);
    }

    // Export/Import
    exportData() {
        const data = {
            user: this.getUser(),
            goals: this.getGoals(),
            tasks: this.getTasks(),
            activities: this.getActivities(),
            settings: this.getSettings(),
            theme: this.getTheme(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `azuka-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate data structure
                    if (!data.exportDate) {
                        throw new Error('Invalid backup file format');
                    }
                    
                    // Import data
                    if (data.user) {
                        localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(data.user));
                    }
                    if (data.goals) {
                        localStorage.setItem(this.STORAGE_KEYS.GOALS, JSON.stringify(data.goals));
                    }
                    if (data.tasks) {
                        localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(data.tasks));
                    }
                    if (data.activities) {
                        localStorage.setItem(this.STORAGE_KEYS.ACTIVITIES, JSON.stringify(data.activities));
                    }
                    if (data.settings) {
                        localStorage.setItem(this.STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
                    }
                    if (data.theme) {
                        localStorage.setItem(this.STORAGE_KEYS.THEME, data.theme);
                    }
                    
                    resolve('Data imported successfully');
                } catch (error) {
                    reject('Failed to import data: ' + error.message);
                }
            };
            reader.onerror = () => reject('Failed to read file');
            reader.readAsText(file);
        });
    }

    // Clear all data
    clearAllData() {
        Object.values(this.STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    // Get storage usage
    getStorageUsage() {
        let total = 0;
        Object.values(this.STORAGE_KEYS).forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                total += item.length * 2; // Approximate bytes (2 bytes per character for UTF-16)
            }
        });
        return {
            bytes: total,
            kilobytes: (total / 1024).toFixed(2),
            megabytes: (total / (1024 * 1024)).toFixed(4)
        };
    }
}

// Initialize storage manager
const storage = new StorageManager();
window.storage = storage;

// Example usage:
// const user = storage.getUser();
// const goals = storage.getGoals(user.id);
// const newGoal = storage.saveGoal({ title: 'New Goal', userId: user.id });
// const stats = storage.getUserStats(user.id);