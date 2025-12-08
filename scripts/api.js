// API Integration for Azuka Dashboard
class ApiService {
    constructor() {
        this.BASE_URL = 'https://jsonplaceholder.typicode.com'; // Mock API for development
        // In production: this.BASE_URL = 'https://api.azukadashboard.com';
    }

    // Mock productivity data
    async fetchProductivityData(userId) {
        try {
            // In a real app, this would be:
            // const response = await fetch(`${this.BASE_URL}/api/productivity/${userId}`);
            // const data = await response.json();
            
            // Mock data for development
            const mockData = {
                tasks: [
                    {
                        id: 1,
                        name: 'Complete project documentation',
                        description: 'Finish writing the project documentation',
                        timeSpent: 120,
                        goalName: 'Project Completion',
                        goalDescription: 'Complete the web development project',
                        progress: 75,
                        deadline: '2024-12-15',
                        priority: 'high',
                        completed: false
                    },
                    {
                        id: 2,
                        name: 'Study JavaScript',
                        description: 'Practice advanced JavaScript concepts',
                        timeSpent: 90,
                        goalName: 'Skill Development',
                        goalDescription: 'Improve programming skills',
                        progress: 60,
                        deadline: '2024-12-20',
                        priority: 'medium',
                        completed: false
                    }
                ],
                goals: [
                    {
                        id: 1,
                        name: 'Complete Web Development Course',
                        description: 'Finish the complete web development bootcamp',
                        progress: 65,
                        deadline: '2024-12-31',
                        priority: 'high',
                        category: 'education'
                    },
                    {
                        id: 2,
                        name: 'Lose 5kg',
                        description: 'Achieve weight loss goal through diet and exercise',
                        progress: 40,
                        deadline: '2025-01-31',
                        priority: 'medium',
                        category: 'health'
                    }
                ],
                productivityScore: 85,
                weeklyTrend: [65, 70, 75, 80, 85, 82, 85],
                recommendations: [
                    'Increase focus time in the morning',
                    'Break larger tasks into smaller chunks',
                    'Set specific deadlines for each task'
                ]
            };

            return new Promise(resolve => {
                setTimeout(() => resolve(mockData), 1000); // Simulate network delay
            });
        } catch (error) {
            console.error('Error fetching productivity data:', error);
            return this.getFallbackData();
        }
    }

    getFallbackData() {
        return {
            tasks: [],
            goals: [],
            productivityScore: 0,
            weeklyTrend: [0, 0, 0, 0, 0, 0, 0],
            recommendations: []
        };
    }

    // Fetch quotes for motivation
    async fetchMotivationalQuote() {
        try {
            // Using a free quotes API
            const response = await fetch('https://api.quotable.io/random');
            if (!response.ok) throw new Error('Failed to fetch quote');
            
            const data = await response.json();
            return {
                content: data.content,
                author: data.author
            };
        } catch (error) {
            console.error('Error fetching quote:', error);
            return {
                content: "The secret of getting ahead is getting started.",
                author: "Mark Twain"
            };
        }
    }

    // Submit task data (mock)
    async submitTaskData(task) {
        try {
            // Mock API call
            console.log('Submitting task:', task);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        taskId: 'task-' + Date.now(),
                        message: 'Task saved successfully'
                    });
                }, 500);
            });
        } catch (error) {
            console.error('Error submitting task:', error);
            return {
                success: false,
                message: 'Failed to save task'
            };
        }
    }

    // Submit goal data (mock)
    async submitGoalData(goal) {
        try {
            // Mock API call
            console.log('Submitting goal:', goal);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        goalId: 'goal-' + Date.now(),
                        message: 'Goal saved successfully'
                    });
                }, 500);
            });
        } catch (error) {
            console.error('Error submitting goal:', error);
            return {
                success: false,
                message: 'Failed to save goal'
            };
        }
    }

    // Get weather data (optional feature)
    async getWeatherData(location = 'auto') {
        try {
            // Using OpenWeatherMap API (you'll need an API key)
            const apiKey = 'YOUR_API_KEY'; // Replace with actual API key
            const response = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${apiKey}`
            );
            
            if (!response.ok) throw new Error('Failed to fetch weather');
            
            const data = await response.json();
            return {
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`,
                location: data.name
            };
        } catch (error) {
            console.error('Error fetching weather:', error);
            return null;
        }
    }

    // Sync data with server (mock)
    async syncData(userData) {
        try {
            console.log('Syncing data:', userData);
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        syncedAt: new Date().toISOString(),
                        message: 'Data synchronized successfully'
                    });
                }, 1000);
            });
        } catch (error) {
            console.error('Error syncing data:', error);
            return {
                success: false,
                message: 'Failed to sync data'
            };
        }
    }

    // Check for updates
    async checkForUpdates() {
        try {
            const response = await fetch(`${this.BASE_URL}/updates`);
            if (!response.ok) throw new Error('Failed to check updates');
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking updates:', error);
            return { hasUpdates: false };
        }
    }

    // Analytics data
    async getAnalyticsData(timeRange = 'week') {
        try {
            // Mock analytics data
            const mockAnalytics = {
                week: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    productivity: [65, 70, 75, 80, 85, 82, 85],
                    focusTime: [4, 5, 6, 5.5, 6.5, 3, 2],
                    tasksCompleted: [8, 10, 12, 9, 11, 5, 3]
                },
                month: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    productivity: [70, 75, 80, 85],
                    focusTime: [25, 28, 30, 32],
                    tasksCompleted: [40, 45, 50, 55]
                }
            };

            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockAnalytics[timeRange] || mockAnalytics.week);
                }, 800);
            });
        } catch (error) {
            console.error('Error fetching analytics:', error);
            return this.getFallbackAnalytics();
        }
    }

    getFallbackAnalytics() {
        return {
            labels: ['No data'],
            productivity: [0],
            focusTime: [0],
            tasksCompleted: [0]
        };
    }
}

// Initialize API service
const api = new ApiService();
window.api = api;

// Example usage:
// const data = await api.fetchProductivityData(userId);
// const quote = await api.fetchMotivationalQuote();
// const result = await api.submitTaskData(task);