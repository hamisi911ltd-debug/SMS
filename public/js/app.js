// Main Application JavaScript
class GlotechApp {
    constructor() {
        this.currentUser = null;
        this.socket = null;
        this.apiBase = '/api';
        this.init();
    }

    async init() {
        try {
            // Initialize Socket.IO
            this.initSocket();
            
            // Initialize UI first
            this.initUI();
            
            // Check authentication (but don't fail if no token)
            try {
                await this.checkAuth();
            } catch (error) {
                console.log('No authentication token found, showing login');
                this.showLogin();
            }
            
            // Hide loading screen
            this.hideLoading();
            
        } catch (error) {
            console.error('App initialization error:', error);
            this.showLogin();
            this.hideLoading();
        }
    }

    initSocket() {
        // Only initialize socket if not already connected
        if (this.socket && this.socket.connected) {
            return;
        }

        try {
            this.socket = io({
                autoConnect: false, // Don't auto-connect
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionAttempts: 5,
                timeout: 20000
            });
            
            this.socket.on('connect', () => {
                console.log('Connected to server');
                if (this.currentUser) {
                    this.socket.emit('join-room', `user-${this.currentUser._id}`);
                }
            });

            this.socket.on('notification', (data) => {
                this.showToast(data.message, data.type || 'info');
                this.updateNotificationCount();
            });

            this.socket.on('disconnect', (reason) => {
                console.log('Disconnected from server:', reason);
                // Only try to reconnect if it wasn't intentional
                if (reason === 'io server disconnect') {
                    this.socket.connect();
                }
            });

            this.socket.on('connect_error', (error) => {
                console.log('Socket connection error:', error);
            });

            // Connect only after user is authenticated
            if (this.currentUser) {
                this.socket.connect();
            }
        } catch (error) {
            console.error('Socket initialization error:', error);
        }
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            return false; // Don't throw error, just return false
        }

        try {
            const response = await this.apiCall('/auth/me', 'GET');
            if (response.success) {
                this.currentUser = response.data.user;
                this.updateUserUI();
                return true;
            } else {
                localStorage.removeItem('token');
                return false;
            }
        } catch (error) {
            localStorage.removeItem('token');
            return false;
        }
    }

    initUI() {
        // Initialize basic UI elements
        this.initEventListeners();
        
        // Check if user is authenticated
        if (this.currentUser) {
            // Show main app
            document.getElementById('app').classList.remove('hidden');
            document.getElementById('login-modal').classList.add('hidden');
            
            // Initialize navigation
            this.initNavigation();
            
            // Load dashboard
            this.loadPage('dashboard');
        } else {
            // Show login
            this.showLogin();
        }
    }

    initNavigation() {
        const navigation = document.getElementById('navigation');
        const navItems = this.getNavigationItems();

        navigation.innerHTML = navItems.map(item => `
            <a href="#" data-page="${item.page}" class="nav-item flex items-center px-4 py-3 text-white hover:bg-white hover:bg-opacity-10 rounded-lg mb-2 transition-all">
                <i class="${item.icon} mr-3"></i>
                <span>${item.label}</span>
            </a>
        `).join('');

        // Add click listeners
        navigation.addEventListener('click', (e) => {
            e.preventDefault();
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const page = navItem.dataset.page;
                this.loadPage(page);
                this.setActiveNav(navItem);
            }
        });
    }

    getNavigationItems() {
        const baseItems = [
            { page: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' }
        ];

        const roleItems = {
            admin: [
                { page: 'students', label: 'Students', icon: 'fas fa-user-graduate' },
                { page: 'teachers', label: 'Teachers', icon: 'fas fa-chalkboard-teacher' },
                { page: 'academics', label: 'Academics', icon: 'fas fa-book-open' },
                { page: 'finance', label: 'Finance', icon: 'fas fa-coins' },
                { page: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
                { page: 'messaging', label: 'Messaging', icon: 'fas fa-envelope' },
                { page: 'reports', label: 'Reports', icon: 'fas fa-chart-bar' },
                { page: 'settings', label: 'Settings', icon: 'fas fa-cog' }
            ],
            teacher: [
                { page: 'my-classes', label: 'My Classes', icon: 'fas fa-users' },
                { page: 'attendance', label: 'Attendance', icon: 'fas fa-calendar-check' },
                { page: 'grades', label: 'Grades', icon: 'fas fa-graduation-cap' },
                { page: 'messaging', label: 'Messages', icon: 'fas fa-envelope' }
            ],
            student: [
                { page: 'my-results', label: 'My Results', icon: 'fas fa-chart-line' },
                { page: 'my-attendance', label: 'My Attendance', icon: 'fas fa-calendar' },
                { page: 'assignments', label: 'Assignments', icon: 'fas fa-tasks' },
                { page: 'fees', label: 'Fee Statement', icon: 'fas fa-receipt' }
            ]
        };

        return [...baseItems, ...(roleItems[this.currentUser?.role] || [])];
    }

    initEventListeners() {
        // Sidebar toggle
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // User menu toggle
        document.getElementById('user-menu-btn').addEventListener('click', () => {
            document.getElementById('user-menu').classList.toggle('hidden');
        });

        // Logout
        document.getElementById('logout-btn').addEventListener('click', (e) => {
            e.preventDefault();
            this.logout();
        });

        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        // Close user menu when clicking outside
        document.addEventListener('click', (e) => {
            const userMenu = document.getElementById('user-menu');
            const userMenuBtn = document.getElementById('user-menu-btn');
            
            if (!userMenuBtn.contains(e.target)) {
                userMenu.classList.add('hidden');
            }
        });
    }

    async loadPage(page) {
        try {
            document.getElementById('page-content').innerHTML = '<div class="flex justify-center items-center h-64"><div class="spinner"></div></div>';
            
            // Update page title
            document.getElementById('page-title').textContent = this.getPageTitle(page);

            // Load page content
            const content = await this.getPageContent(page);
            document.getElementById('page-content').innerHTML = content;

            // Initialize page-specific functionality
            this.initPageFunctionality(page);

        } catch (error) {
            console.error('Error loading page:', error);
            this.showToast('Error loading page', 'error');
        }
    }

    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            students: 'Student Management',
            teachers: 'Teacher Management',
            academics: 'Academic Management',
            finance: 'Financial Management',
            attendance: 'Attendance Management',
            messaging: 'Messaging',
            reports: 'Reports',
            settings: 'Settings'
        };
        return titles[page] || 'Glotech High School';
    }

    async getPageContent(page) {
        // This would typically load from templates or make API calls
        switch (page) {
            case 'dashboard':
                return await this.getDashboardContent();
            case 'students':
                return await this.getStudentsContent();
            case 'teachers':
                return await this.getTeachersContent();
            default:
                return `<div class="card p-6"><h3 class="text-white text-xl mb-4">${this.getPageTitle(page)}</h3><p class="text-gray-300">This page is under development.</p></div>`;
        }
    }

    async getDashboardContent() {
        try {
            const stats = await this.apiCall('/dashboard/stats', 'GET');
            
            return `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-blue-500 bg-opacity-20 mr-4">
                                <i class="fas fa-user-graduate text-blue-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-gray-300 text-sm">Total Students</p>
                                <p class="text-white text-2xl font-bold">${stats.data?.totalStudents || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-green-500 bg-opacity-20 mr-4">
                                <i class="fas fa-chalkboard-teacher text-green-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-gray-300 text-sm">Total Teachers</p>
                                <p class="text-white text-2xl font-bold">${stats.data?.totalTeachers || 0}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-yellow-500 bg-opacity-20 mr-4">
                                <i class="fas fa-calendar-check text-yellow-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-gray-300 text-sm">Attendance Today</p>
                                <p class="text-white text-2xl font-bold">${stats.data?.attendanceToday || 0}%</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <div class="flex items-center">
                            <div class="p-3 rounded-full bg-purple-500 bg-opacity-20 mr-4">
                                <i class="fas fa-coins text-purple-400 text-xl"></i>
                            </div>
                            <div>
                                <p class="text-gray-300 text-sm">Fee Collection</p>
                                <p class="text-white text-2xl font-bold">KSh ${(stats.data?.feeCollection || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Recent Activities</h3>
                        <div id="recent-activities">
                            <p class="text-gray-300">Loading activities...</p>
                        </div>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Quick Actions</h3>
                        <div class="grid grid-cols-2 gap-4">
                            <button class="btn-primary p-4 rounded-lg text-center" onclick="app.loadPage('students')">
                                <i class="fas fa-user-plus text-2xl mb-2"></i>
                                <p>Add Student</p>
                            </button>
                            <button class="btn-primary p-4 rounded-lg text-center" onclick="app.loadPage('attendance')">
                                <i class="fas fa-calendar-check text-2xl mb-2"></i>
                                <p>Mark Attendance</p>
                            </button>
                            <button class="btn-primary p-4 rounded-lg text-center" onclick="app.loadPage('finance')">
                                <i class="fas fa-receipt text-2xl mb-2"></i>
                                <p>Generate Invoice</p>
                            </button>
                            <button class="btn-primary p-4 rounded-lg text-center" onclick="app.loadPage('reports')">
                                <i class="fas fa-chart-bar text-2xl mb-2"></i>
                                <p>View Reports</p>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading dashboard:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading dashboard data</p></div>';
        }
    }

    async getStudentsContent() {
        return `
            <div class="card p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-white text-xl font-semibold">Student Management</h3>
                    <button class="btn-primary px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Student
                    </button>
                </div>
                
                <div class="mb-4">
                    <input type="text" placeholder="Search students..." 
                           class="w-full px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300">
                </div>
                
                <div class="overflow-x-auto">
                    <table class="w-full text-white">
                        <thead>
                            <tr class="border-b border-gray-600">
                                <th class="text-left py-3">Admission No.</th>
                                <th class="text-left py-3">Name</th>
                                <th class="text-left py-3">Class</th>
                                <th class="text-left py-3">Status</th>
                                <th class="text-left py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="students-table-body">
                            <tr>
                                <td colspan="5" class="text-center py-8 text-gray-400">Loading students...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    async getTeachersContent() {
        return `
            <div class="card p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-white text-xl font-semibold">Teacher Management</h3>
                    <button class="btn-primary px-4 py-2 rounded-lg">
                        <i class="fas fa-plus mr-2"></i>Add Teacher
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="card p-4">
                        <div class="text-center">
                            <img src="/images/default-avatar.png" alt="Teacher" class="w-16 h-16 rounded-full mx-auto mb-3">
                            <h4 class="text-white font-semibold">John Kamau</h4>
                            <p class="text-gray-300 text-sm">Mathematics Teacher</p>
                            <p class="text-gray-400 text-xs">TSC: 123456</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    initPageFunctionality(page) {
        // Initialize page-specific JavaScript functionality
        switch (page) {
            case 'dashboard':
                this.loadRecentActivities();
                break;
            case 'students':
                this.loadStudentsData();
                break;
            case 'teachers':
                this.loadTeachersData();
                break;
        }
    }

    async loadRecentActivities() {
        try {
            const activities = await this.apiCall('/dashboard/activities', 'GET');
            const container = document.getElementById('recent-activities');
            
            if (activities.success && activities.data.length > 0) {
                container.innerHTML = activities.data.map(activity => `
                    <div class="flex items-center py-2 border-b border-gray-600 last:border-b-0">
                        <i class="${activity.icon} text-blue-400 mr-3"></i>
                        <div>
                            <p class="text-white text-sm">${activity.message}</p>
                            <p class="text-gray-400 text-xs">${new Date(activity.createdAt).toLocaleString()}</p>
                        </div>
                    </div>
                `).join('');
            } else {
                container.innerHTML = '<p class="text-gray-400">No recent activities</p>';
            }
        } catch (error) {
            console.error('Error loading activities:', error);
        }
    }

    async loadStudentsData() {
        // Implementation for loading students data
    }

    async loadTeachersData() {
        // Implementation for loading teachers data
    }

    setActiveNav(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('bg-white', 'bg-opacity-20');
        });
        activeItem.classList.add('bg-white', 'bg-opacity-20');
    }

    updateUserUI() {
        if (this.currentUser) {
            document.getElementById('user-name').textContent = this.currentUser.fullName || this.currentUser.username;
            if (this.currentUser.profileImage) {
                document.getElementById('user-avatar').src = this.currentUser.profileImage;
            }
        }
    }

    async handleLogin(e) {
        const formData = new FormData(e.target);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing In...';
        submitBtn.disabled = true;

        try {
            const response = await this.apiCall('/auth/login', 'POST', loginData);
            
            if (response.success) {
                localStorage.setItem('token', response.data.token);
                this.currentUser = response.data.user;
                
                // Connect socket after successful login
                if (this.socket) {
                    this.socket.connect();
                }
                
                // Hide login modal and show main app
                document.getElementById('login-modal').classList.add('hidden');
                document.getElementById('app').classList.remove('hidden');
                
                // Initialize navigation and load dashboard
                this.initNavigation();
                this.loadPage('dashboard');
                
                this.showToast('Login successful!', 'success');
            } else {
                this.showLoginError(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showLoginError('Login failed. Please check your connection and try again.');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    showLogin() {
        document.getElementById('app').classList.add('hidden');
        document.getElementById('login-modal').classList.remove('hidden');
    }

    showLoginError(message) {
        const errorDiv = document.getElementById('login-error');
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    }

    async logout() {
        try {
            await this.apiCall('/auth/logout', 'POST');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            this.currentUser = null;
            this.showLogin();
            this.showToast('Logged out successfully', 'info');
        }
    }

    hideLoading() {
        document.getElementById('loading-screen').classList.add('hidden');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `glass p-4 rounded-lg mb-2 text-white ${type === 'error' ? 'bg-red-500 bg-opacity-20' : type === 'success' ? 'bg-green-500 bg-opacity-20' : 'bg-blue-500 bg-opacity-20'}`;
        toast.innerHTML = `
            <div class="flex items-center justify-between">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    async apiCall(endpoint, method = 'GET', data = null) {
        const token = localStorage.getItem('token');
        const config = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        // Only add auth header if we have a token AND it's not a login/register request
        if (token && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (data && method !== 'GET') {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, config);
            
            // Handle different response types
            if (response.status === 401) {
                if (endpoint.includes('/auth/login')) {
                    // Login failed - let the login handler deal with it
                    // Don't throw here, just continue to parse the response
                } else {
                    // Unauthorized for other endpoints - clear token and show login
                    localStorage.removeItem('token');
                    this.currentUser = null;
                    this.showLogin();
                    throw new Error('Authentication required');
                }
            }
            
            if (response.status === 502) {
                throw new Error('Server temporarily unavailable. Please try again.');
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || `HTTP ${response.status}: ${response.statusText}`;
                } catch {
                    errorMessage = `HTTP ${response.status}: ${response.statusText}`;
                }
                
                // For login endpoints, return the parsed response instead of throwing
                if (endpoint.includes('/auth/login') && response.status === 401) {
                    try {
                        return JSON.parse(errorText);
                    } catch {
                        return {
                            success: false,
                            message: errorMessage
                        };
                    }
                }
                
                throw new Error(errorMessage);
            }
            
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('API call error:', error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error. Please check your connection.');
            }
            
            throw error;
        }
    }

    async updateNotificationCount() {
        try {
            const response = await this.apiCall('/notifications/count', 'GET');
            const count = response.data?.count || 0;
            const badge = document.getElementById('notification-count');
            
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        } catch (error) {
            console.error('Error updating notification count:', error);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GlotechApp();
});

// Export for global use
window.GlotechApp = GlotechApp;