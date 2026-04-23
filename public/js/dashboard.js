// Dashboard specific JavaScript functions

class DashboardManager {
    constructor() {
        this.charts = {};
        this.refreshInterval = null;
    }

    async loadDashboardData() {
        try {
            const [stats, activities, notifications] = await Promise.all([
                this.fetchStats(),
                this.fetchActivities(),
                this.fetchNotifications()
            ]);

            this.updateStatsCards(stats);
            this.updateActivitiesList(activities);
            this.updateNotificationsBadge(notifications);
            this.initializeCharts(stats);

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async fetchStats() {
        const response = await fetch('/api/dashboard/stats', {
            headers: window.authManager.getAuthHeaders()
        });
        const data = await response.json();
        return data.success ? data.data : {};
    }

    async fetchActivities() {
        const response = await fetch('/api/dashboard/activities', {
            headers: window.authManager.getAuthHeaders()
        });
        const data = await response.json();
        return data.success ? data.data : [];
    }

    async fetchNotifications() {
        const response = await fetch('/api/dashboard/notifications', {
            headers: window.authManager.getAuthHeaders()
        });
        const data = await response.json();
        return data.success ? data.data : [];
    }

    updateStatsCards(stats) {
        // Update stat cards based on user role
        const user = window.authManager.user;
        
        if (user.role === 'admin' || user.role === 'teacher') {
            this.updateElement('total-students', stats.totalStudents || 0);
            this.updateElement('total-teachers', stats.totalTeachers || 0);
            this.updateElement('attendance-today', `${stats.attendanceToday || 0}%`);
            this.updateElement('fee-collection', `KSh ${(stats.feeCollection || 0).toLocaleString()}`);
        }

        if (user.role === 'student') {
            this.updateElement('current-gpa', stats.currentGPA || '0.0');
            this.updateElement('class-rank', stats.classRank || 'N/A');
            this.updateElement('attendance-rate', `${stats.attendanceRate || 0}%`);
            this.updateElement('pending-fees', `KSh ${(stats.pendingFees || 0).toLocaleString()}`);
        }

        if (user.role === 'teacher') {
            this.updateElement('my-classes', stats.myClasses || 0);
            this.updateElement('students-count', stats.studentsCount || 0);
            this.updateElement('pending-grades', stats.pendingGrades || 0);
        }
    }

    updateActivitiesList(activities) {
        const container = document.getElementById('recent-activities');
        if (!container) return;

        if (activities.length === 0) {
            container.innerHTML = '<p class="text-gray-400">No recent activities</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="flex items-center py-3 border-b border-gray-600 last:border-b-0">
                <div class="flex-shrink-0 mr-3">
                    <i class="${activity.icon} text-blue-400"></i>
                </div>
                <div class="flex-1">
                    <p class="text-white text-sm">${activity.message}</p>
                    <p class="text-gray-400 text-xs">${this.formatDate(activity.createdAt)}</p>
                </div>
            </div>
        `).join('');
    }

    updateNotificationsBadge(notifications) {
        const badge = document.getElementById('notification-count');
        if (!badge) return;

        const unreadCount = notifications.filter(n => !n.read).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    }

    initializeCharts(stats) {
        // Initialize attendance chart
        this.initAttendanceChart(stats);
        
        // Initialize performance chart for students
        if (window.authManager.user.role === 'student') {
            this.initPerformanceChart(stats);
        }
        
        // Initialize financial chart for admin
        if (window.authManager.user.role === 'admin') {
            this.initFinancialChart(stats);
        }
    }

    initAttendanceChart(stats) {
        const ctx = document.getElementById('attendanceChart');
        if (!ctx) return;

        if (this.charts.attendance) {
            this.charts.attendance.destroy();
        }

        this.charts.attendance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    data: [
                        stats.attendancePresent || 85,
                        stats.attendanceAbsent || 10,
                        stats.attendanceLate || 5
                    ],
                    backgroundColor: [
                        '#4facfe',
                        '#ff6b6b',
                        '#feca57'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    initPerformanceChart(stats) {
        const ctx = document.getElementById('performanceChart');
        if (!ctx) return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Term 1', 'Term 2', 'Term 3'],
                datasets: [{
                    label: 'GPA',
                    data: [3.2, 3.5, stats.currentGPA || 3.8],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    initFinancialChart(stats) {
        const ctx = document.getElementById('financialChart');
        if (!ctx) return;

        if (this.charts.financial) {
            this.charts.financial.destroy();
        }

        this.charts.financial = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr'],
                datasets: [{
                    label: 'Collections (KSh)',
                    data: [2800000, 3200000, 2900000, 3100000],
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: '#667eea',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: 'white' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: 'white',
                            callback: function(value) {
                                return 'KSh ' + (value / 1000000).toFixed(1) + 'M';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    showError(message) {
        window.app.showToast(message, 'error');
    }

    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    destroy() {
        this.stopAutoRefresh();
        
        // Destroy all charts
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        
        this.charts = {};
    }
}

// Initialize dashboard manager
window.dashboardManager = new DashboardManager();