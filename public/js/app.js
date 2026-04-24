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
        // Load content for different pages
        switch (page) {
            case 'dashboard':
                return await this.getDashboardContent();
            case 'students':
                return await this.getStudentsContent();
            case 'teachers':
                return await this.getTeachersContent();
            case 'academics':
                return await this.getAcademicsContent();
            case 'finance':
                return await this.getFinanceContent();
            case 'attendance':
                return await this.getAttendanceContent();
            case 'messaging':
                return await this.getMessagingContent();
            case 'reports':
                return await this.getReportsContent();
            case 'settings':
                return await this.getSettingsContent();
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
        try {
            const students = await this.apiCall('/students', 'GET');
            
            return `
                <div class="card p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-white text-xl font-semibold">Student Management</h3>
                        <button onclick="app.showAddStudentModal()" class="btn-primary px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>Add Student
                        </button>
                    </div>
                    
                    <div class="mb-4 flex gap-4">
                        <input type="text" id="student-search" placeholder="Search students..." 
                               class="flex-1 px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-gray-300">
                        <select id="class-filter" class="px-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white">
                            <option value="">All Classes</option>
                            <option value="Form 1">Form 1</option>
                            <option value="Form 2">Form 2</option>
                            <option value="Form 3">Form 3</option>
                            <option value="Form 4">Form 4</option>
                        </select>
                    </div>
                    
                    <div class="overflow-x-auto">
                        <table class="w-full text-white">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="text-left py-3">Admission No.</th>
                                    <th class="text-left py-3">Name</th>
                                    <th class="text-left py-3">Class</th>
                                    <th class="text-left py-3">Contact</th>
                                    <th class="text-left py-3">Fee Balance</th>
                                    <th class="text-left py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="students-table-body">
                                ${students.success ? students.data.students.map(student => `
                                    <tr class="border-b border-gray-700">
                                        <td class="py-3">${student.admissionNumber}</td>
                                        <td class="py-3">${student.firstName} ${student.lastName}</td>
                                        <td class="py-3">${student.class}</td>
                                        <td class="py-3">${student.phone}</td>
                                        <td class="py-3">KSh ${student.feeBalance?.toLocaleString() || 0}</td>
                                        <td class="py-3">
                                            <button onclick="app.viewStudent('${student._id}')" class="text-blue-400 hover:text-blue-300 mr-2">
                                                <i class="fas fa-eye"></i>
                                            </button>
                                            <button onclick="app.editStudent('${student._id}')" class="text-green-400 hover:text-green-300 mr-2">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="app.deleteStudent('${student._id}')" class="text-red-400 hover:text-red-300">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </td>
                                    </tr>
                                `).join('') : '<tr><td colspan="6" class="text-center py-8 text-gray-400">No students found</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading students:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading students data</p></div>';
        }
    }

    async getTeachersContent() {
        try {
            const teachers = await this.apiCall('/teachers', 'GET');
            
            return `
                <div class="card p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h3 class="text-white text-xl font-semibold">Teacher Management</h3>
                        <button onclick="app.showAddTeacherModal()" class="btn-primary px-4 py-2 rounded-lg">
                            <i class="fas fa-plus mr-2"></i>Add Teacher
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${teachers.success ? teachers.data.teachers.map(teacher => `
                            <div class="card p-4">
                                <div class="text-center">
                                    <img src="/images/default-avatar.png" alt="Teacher" class="w-16 h-16 rounded-full mx-auto mb-3">
                                    <h4 class="text-white font-semibold">${teacher.firstName} ${teacher.lastName}</h4>
                                    <p class="text-gray-300 text-sm">${teacher.subjects?.join(', ') || 'No subjects assigned'}</p>
                                    <p class="text-gray-400 text-xs">TSC: ${teacher.tscNumber}</p>
                                    <p class="text-gray-400 text-xs">${teacher.experience} years experience</p>
                                    <div class="mt-3 flex justify-center gap-2">
                                        <button onclick="app.viewTeacher('${teacher._id}')" class="text-blue-400 hover:text-blue-300">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button onclick="app.editTeacher('${teacher._id}')" class="text-green-400 hover:text-green-300">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        `).join('') : '<div class="col-span-full text-center text-gray-400">No teachers found</div>'}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading teachers:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading teachers data</p></div>';
        }
    }

    async getAcademicsContent() {
        try {
            const [subjects, classes, exams] = await Promise.all([
                this.apiCall('/academics/subjects', 'GET'),
                this.apiCall('/academics/classes', 'GET'),
                this.apiCall('/academics/exams', 'GET')
            ]);
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Subjects Management -->
                    <div class="card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white text-lg font-semibold">Subjects</h3>
                            <button onclick="app.showAddSubjectModal()" class="btn-primary px-3 py-1 rounded text-sm">
                                <i class="fas fa-plus mr-1"></i>Add Subject
                            </button>
                        </div>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            ${subjects.success ? subjects.data.subjects.map(subject => `
                                <div class="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                                    <div>
                                        <span class="text-white font-medium">${subject.name}</span>
                                        <span class="text-gray-300 text-sm ml-2">(${subject.code})</span>
                                    </div>
                                    <span class="text-gray-400 text-sm">${subject.department}</span>
                                </div>
                            `).join('') : '<p class="text-gray-400">No subjects found</p>'}
                        </div>
                    </div>

                    <!-- Classes Management -->
                    <div class="card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white text-lg font-semibold">Classes</h3>
                            <button onclick="app.showAddClassModal()" class="btn-primary px-3 py-1 rounded text-sm">
                                <i class="fas fa-plus mr-1"></i>Add Class
                            </button>
                        </div>
                        <div class="space-y-2 max-h-64 overflow-y-auto">
                            ${classes.success ? classes.data.classes.map(cls => `
                                <div class="flex justify-between items-center p-2 bg-white bg-opacity-10 rounded">
                                    <div>
                                        <span class="text-white font-medium">${cls.name}</span>
                                        <span class="text-gray-300 text-sm ml-2">${cls.currentStudents}/${cls.capacity}</span>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-400">${cls.level}</div>
                                        <div class="text-xs text-gray-500">${((cls.currentStudents/cls.capacity)*100).toFixed(1)}% full</div>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-gray-400">No classes found</p>'}
                        </div>
                    </div>

                    <!-- Exams Management -->
                    <div class="card p-6 lg:col-span-2">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white text-lg font-semibold">Examinations</h3>
                            <button onclick="app.showAddExamModal()" class="btn-primary px-3 py-1 rounded text-sm">
                                <i class="fas fa-plus mr-1"></i>Create Exam
                            </button>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="w-full text-white">
                                <thead>
                                    <tr class="border-b border-gray-600">
                                        <th class="text-left py-2">Exam Name</th>
                                        <th class="text-left py-2">Type</th>
                                        <th class="text-left py-2">Period</th>
                                        <th class="text-left py-2">Status</th>
                                        <th class="text-left py-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${exams.success ? exams.data.exams.map(exam => `
                                        <tr class="border-b border-gray-700">
                                            <td class="py-2">${exam.name}</td>
                                            <td class="py-2">${exam.type}</td>
                                            <td class="py-2">${exam.term} ${exam.year}</td>
                                            <td class="py-2">
                                                <span class="px-2 py-1 rounded text-xs ${exam.status === 'Completed' ? 'bg-green-500' : exam.status === 'Upcoming' ? 'bg-blue-500' : 'bg-yellow-500'}">
                                                    ${exam.status}
                                                </span>
                                            </td>
                                            <td class="py-2">
                                                <button onclick="app.viewExam('${exam._id}')" class="text-blue-400 hover:text-blue-300 mr-2">
                                                    <i class="fas fa-eye"></i>
                                                </button>
                                                <button onclick="app.manageGrades('${exam._id}')" class="text-green-400 hover:text-green-300">
                                                    <i class="fas fa-graduation-cap"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" class="text-center py-4 text-gray-400">No exams found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading academics:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading academics data</p></div>';
        }
    }

    async getFinanceContent() {
        try {
            const [payments, invoices, feeStructure] = await Promise.all([
                this.apiCall('/finance/payments', 'GET'),
                this.apiCall('/finance/invoices', 'GET'),
                this.apiCall('/finance/fee-structure', 'GET')
            ]);
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Fee Collection Summary -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Collection Summary</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">Total Collected</span>
                                <span class="text-green-400 font-semibold">KSh 19.86M</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">Outstanding</span>
                                <span class="text-red-400 font-semibold">KSh 4.13M</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">Collection Rate</span>
                                <span class="text-blue-400 font-semibold">82.8%</span>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Quick Actions</h3>
                        <div class="space-y-2">
                            <button onclick="app.showRecordPaymentModal()" class="w-full btn-primary py-2 rounded text-sm">
                                <i class="fas fa-plus mr-2"></i>Record Payment
                            </button>
                            <button onclick="app.showGenerateInvoiceModal()" class="w-full btn-primary py-2 rounded text-sm">
                                <i class="fas fa-file-invoice mr-2"></i>Generate Invoice
                            </button>
                            <button onclick="app.loadPage('reports')" class="w-full btn-primary py-2 rounded text-sm">
                                <i class="fas fa-chart-bar mr-2"></i>Financial Reports
                            </button>
                        </div>
                    </div>

                    <!-- Fee Structure -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Fee Structure</h3>
                        <div class="space-y-2 text-sm">
                            ${feeStructure.success ? feeStructure.data.feeStructure.map(fee => `
                                <div class="flex justify-between">
                                    <span class="text-gray-300">${fee.class}</span>
                                    <span class="text-white">KSh ${fee.total.toLocaleString()}</span>
                                </div>
                            `).join('') : '<p class="text-gray-400">No fee structure found</p>'}
                        </div>
                    </div>

                    <!-- Recent Payments -->
                    <div class="card p-6 lg:col-span-3">
                        <h3 class="text-white text-lg font-semibold mb-4">Recent Payments</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-white text-sm">
                                <thead>
                                    <tr class="border-b border-gray-600">
                                        <th class="text-left py-2">Student</th>
                                        <th class="text-left py-2">Amount</th>
                                        <th class="text-left py-2">Method</th>
                                        <th class="text-left py-2">Date</th>
                                        <th class="text-left py-2">Receipt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${payments.success ? payments.data.payments.map(payment => `
                                        <tr class="border-b border-gray-700">
                                            <td class="py-2">${payment.studentName}</td>
                                            <td class="py-2">KSh ${payment.amount.toLocaleString()}</td>
                                            <td class="py-2">${payment.paymentMethod}</td>
                                            <td class="py-2">${new Date(payment.paymentDate).toLocaleDateString()}</td>
                                            <td class="py-2">
                                                <button onclick="app.printReceipt('${payment._id}')" class="text-blue-400 hover:text-blue-300">
                                                    ${payment.receiptNumber}
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" class="text-center py-4 text-gray-400">No payments found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading finance:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading finance data</p></div>';
        }
    }

    async getAttendanceContent() {
        try {
            const [stats, todayAttendance] = await Promise.all([
                this.apiCall('/attendance/stats', 'GET'),
                this.apiCall('/attendance?date=' + new Date().toISOString().split('T')[0], 'GET')
            ]);
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                    <!-- Attendance Stats -->
                    <div class="card p-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-green-400">${stats.data?.today?.present || 0}</div>
                            <div class="text-sm text-gray-300">Present Today</div>
                        </div>
                    </div>
                    <div class="card p-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-400">${stats.data?.today?.absent || 0}</div>
                            <div class="text-sm text-gray-300">Absent Today</div>
                        </div>
                    </div>
                    <div class="card p-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-400">${stats.data?.today?.late || 0}</div>
                            <div class="text-sm text-gray-300">Late Today</div>
                        </div>
                    </div>
                    <div class="card p-4">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-blue-400">${stats.data?.today?.attendanceRate || 0}%</div>
                            <div class="text-sm text-gray-300">Attendance Rate</div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Mark Attendance -->
                    <div class="card p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-white text-lg font-semibold">Mark Attendance</h3>
                            <button onclick="app.showMarkAttendanceModal()" class="btn-primary px-3 py-1 rounded text-sm">
                                <i class="fas fa-check mr-1"></i>Mark Attendance
                            </button>
                        </div>
                        <div class="space-y-2">
                            <select id="attendance-class" class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white">
                                <option value="">Select Class</option>
                                <option value="Form 1 North">Form 1 North</option>
                                <option value="Form 1 South">Form 1 South</option>
                                <option value="Form 2 East">Form 2 East</option>
                                <option value="Form 2 West">Form 2 West</option>
                                <option value="Form 3 East">Form 3 East</option>
                                <option value="Form 3 West">Form 3 West</option>
                                <option value="Form 4 North">Form 4 North</option>
                                <option value="Form 4 South">Form 4 South</option>
                            </select>
                            <input type="date" id="attendance-date" value="${new Date().toISOString().split('T')[0]}" 
                                   class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white">
                        </div>
                    </div>

                    <!-- Attendance Reports -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Attendance Reports</h3>
                        <div class="space-y-2">
                            <button onclick="app.generateAttendanceReport('daily')" class="w-full btn-primary py-2 rounded text-sm text-left px-3">
                                <i class="fas fa-calendar-day mr-2"></i>Daily Report
                            </button>
                            <button onclick="app.generateAttendanceReport('weekly')" class="w-full btn-primary py-2 rounded text-sm text-left px-3">
                                <i class="fas fa-calendar-week mr-2"></i>Weekly Report
                            </button>
                            <button onclick="app.generateAttendanceReport('monthly')" class="w-full btn-primary py-2 rounded text-sm text-left px-3">
                                <i class="fas fa-calendar-alt mr-2"></i>Monthly Report
                            </button>
                            <button onclick="app.generateAttendanceReport('student')" class="w-full btn-primary py-2 rounded text-sm text-left px-3">
                                <i class="fas fa-user mr-2"></i>Student Report
                            </button>
                        </div>
                    </div>

                    <!-- Today's Attendance -->
                    <div class="card p-6 lg:col-span-2">
                        <h3 class="text-white text-lg font-semibold mb-4">Today's Attendance</h3>
                        <div class="overflow-x-auto">
                            <table class="w-full text-white text-sm">
                                <thead>
                                    <tr class="border-b border-gray-600">
                                        <th class="text-left py-2">Student</th>
                                        <th class="text-left py-2">Class</th>
                                        <th class="text-left py-2">Status</th>
                                        <th class="text-left py-2">Time In</th>
                                        <th class="text-left py-2">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${todayAttendance.success ? todayAttendance.data.attendance.slice(0, 10).map(record => `
                                        <tr class="border-b border-gray-700">
                                            <td class="py-2">${record.studentName}</td>
                                            <td class="py-2">${record.class}</td>
                                            <td class="py-2">
                                                <span class="px-2 py-1 rounded text-xs ${
                                                    record.status === 'Present' ? 'bg-green-500' : 
                                                    record.status === 'Absent' ? 'bg-red-500' : 'bg-yellow-500'
                                                }">
                                                    ${record.status}
                                                </span>
                                            </td>
                                            <td class="py-2">${record.timeIn || '-'}</td>
                                            <td class="py-2">${record.remarks || '-'}</td>
                                        </tr>
                                    `).join('') : '<tr><td colspan="5" class="text-center py-4 text-gray-400">No attendance records found</td></tr>'}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading attendance:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading attendance data</p></div>';
        }
    }

    async getMessagingContent() {
        try {
            const [messages, announcements, unreadCount] = await Promise.all([
                this.apiCall('/messaging/messages', 'GET'),
                this.apiCall('/messaging/announcements', 'GET'),
                this.apiCall('/messaging/unread-count', 'GET')
            ]);
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- Compose Message -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Quick Actions</h3>
                        <div class="space-y-2">
                            <button onclick="app.showComposeMessageModal()" class="w-full btn-primary py-2 rounded text-sm">
                                <i class="fas fa-edit mr-2"></i>Compose Message
                            </button>
                            <button onclick="app.showCreateAnnouncementModal()" class="w-full btn-primary py-2 rounded text-sm">
                                <i class="fas fa-bullhorn mr-2"></i>Create Announcement
                            </button>
                            <div class="text-center mt-4">
                                <div class="text-2xl font-bold text-blue-400">${unreadCount.data?.count || 0}</div>
                                <div class="text-sm text-gray-300">Unread Messages</div>
                            </div>
                        </div>
                    </div>

                    <!-- Recent Messages -->
                    <div class="card p-6 lg:col-span-2">
                        <h3 class="text-white text-lg font-semibold mb-4">Recent Messages</h3>
                        <div class="space-y-3 max-h-64 overflow-y-auto">
                            ${messages.success ? messages.data.messages.map(message => `
                                <div class="p-3 bg-white bg-opacity-10 rounded cursor-pointer hover:bg-opacity-20" onclick="app.viewMessage('${message._id}')">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2">
                                                <span class="font-medium text-white">${message.from.name}</span>
                                                ${!message.read ? '<span class="w-2 h-2 bg-blue-400 rounded-full"></span>' : ''}
                                            </div>
                                            <div class="text-sm text-gray-300 mt-1">${message.subject}</div>
                                            <div class="text-xs text-gray-400 mt-1">${new Date(message.timestamp).toLocaleString()}</div>
                                        </div>
                                        <div class="text-xs text-gray-500">${message.priority}</div>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-gray-400">No messages found</p>'}
                        </div>
                    </div>

                    <!-- Announcements -->
                    <div class="card p-6 lg:col-span-3">
                        <h3 class="text-white text-lg font-semibold mb-4">Recent Announcements</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${announcements.success ? announcements.data.announcements.map(announcement => `
                                <div class="p-4 bg-white bg-opacity-10 rounded">
                                    <div class="flex justify-between items-start mb-2">
                                        <h4 class="font-medium text-white">${announcement.title}</h4>
                                        <span class="px-2 py-1 rounded text-xs ${
                                            announcement.priority === 'high' ? 'bg-red-500' : 
                                            announcement.priority === 'normal' ? 'bg-blue-500' : 'bg-gray-500'
                                        }">
                                            ${announcement.priority}
                                        </span>
                                    </div>
                                    <p class="text-sm text-gray-300 mb-2">${announcement.content}</p>
                                    <div class="flex justify-between text-xs text-gray-400">
                                        <span>By ${announcement.author.name}</span>
                                        <span>${new Date(announcement.publishDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            `).join('') : '<p class="text-gray-400">No announcements found</p>'}
                        </div>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading messaging:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading messaging data</p></div>';
        }
    }

    async getReportsContent() {
        try {
            const [academicReport, attendanceReport, financialReport] = await Promise.all([
                this.apiCall('/reports/academic', 'GET'),
                this.apiCall('/reports/attendance', 'GET'),
                this.apiCall('/reports/financial', 'GET')
            ]);
            
            return `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <!-- Report Categories -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Report Categories</h3>
                        <div class="grid grid-cols-2 gap-3">
                            <button onclick="app.generateReport('academic')" class="btn-primary p-3 rounded text-center">
                                <i class="fas fa-graduation-cap text-xl mb-2"></i>
                                <div class="text-sm">Academic</div>
                            </button>
                            <button onclick="app.generateReport('attendance')" class="btn-primary p-3 rounded text-center">
                                <i class="fas fa-calendar-check text-xl mb-2"></i>
                                <div class="text-sm">Attendance</div>
                            </button>
                            <button onclick="app.generateReport('financial')" class="btn-primary p-3 rounded text-center">
                                <i class="fas fa-coins text-xl mb-2"></i>
                                <div class="text-sm">Financial</div>
                            </button>
                            <button onclick="app.generateReport('enrollment')" class="btn-primary p-3 rounded text-center">
                                <i class="fas fa-users text-xl mb-2"></i>
                                <div class="text-sm">Enrollment</div>
                            </button>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="card p-6">
                        <h3 class="text-white text-lg font-semibold mb-4">Quick Statistics</h3>
                        <div class="space-y-3">
                            <div class="flex justify-between">
                                <span class="text-gray-300">Overall Pass Rate</span>
                                <span class="text-green-400 font-semibold">${academicReport.data?.summary?.overallPassRate || 0}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">Attendance Rate</span>
                                <span class="text-blue-400 font-semibold">${attendanceReport.data?.summary?.currentRate || 0}%</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-300">Fee Collection</span>
                                <span class="text-yellow-400 font-semibold">${financialReport.data?.summary?.collectionRate || 0}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Academic Performance -->
                <div class="card p-6 mb-6">
                    <h3 class="text-white text-lg font-semibold mb-4">Class Performance Overview</h3>
                    <div class="overflow-x-auto">
                        <table class="w-full text-white text-sm">
                            <thead>
                                <tr class="border-b border-gray-600">
                                    <th class="text-left py-2">Class</th>
                                    <th class="text-left py-2">Students</th>
                                    <th class="text-left py-2">Average Grade</th>
                                    <th class="text-left py-2">Pass Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${academicReport.success ? academicReport.data.classPerformance.map(cls => `
                                    <tr class="border-b border-gray-700">
                                        <td class="py-2">${cls.class}</td>
                                        <td class="py-2">${cls.students}</td>
                                        <td class="py-2">${cls.averageGrade}</td>
                                        <td class="py-2">${cls.passRate}%</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4" class="text-center py-4 text-gray-400">No data available</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Attendance Trends -->
                <div class="card p-6">
                    <h3 class="text-white text-lg font-semibold mb-4">Monthly Attendance Trends</h3>
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
                        ${attendanceReport.success ? attendanceReport.data.monthly.map(month => `
                            <div class="text-center">
                                <div class="text-lg font-bold text-blue-400">${month.rate}%</div>
                                <div class="text-sm text-gray-300">${month.month}</div>
                                <div class="text-xs text-gray-400">${month.present} present</div>
                            </div>
                        `).join('') : '<p class="text-gray-400">No attendance data available</p>'}
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Error loading reports:', error);
            return '<div class="card p-6"><p class="text-red-400">Error loading reports data</p></div>';
        }
    }

    async getSettingsContent() {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- System Settings -->
                <div class="card p-6">
                    <h3 class="text-white text-lg font-semibold mb-4">System Settings</h3>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-gray-300 text-sm mb-2">School Name</label>
                            <input type="text" value="Glotech High School" class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white">
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm mb-2">Academic Year</label>
                            <select class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white">
                                <option>2024</option>
                                <option>2025</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-gray-300 text-sm mb-2">Current Term</label>
                            <select class="w-full px-3 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded text-white">
                                <option>Term 1</option>
                                <option selected>Term 2</option>
                                <option>Term 3</option>
                            </select>
                        </div>
                        <button class="btn-primary px-4 py-2 rounded">Save Settings</button>
                    </div>
                </div>

                <!-- User Management -->
                <div class="card p-6">
                    <h3 class="text-white text-lg font-semibold mb-4">User Management</h3>
                    <div class="space-y-3">
                        <button onclick="app.showCreateUserModal()" class="w-full btn-primary py-2 rounded text-sm">
                            <i class="fas fa-user-plus mr-2"></i>Create New User
                        </button>
                        <button onclick="app.showManageRolesModal()" class="w-full btn-primary py-2 rounded text-sm">
                            <i class="fas fa-users-cog mr-2"></i>Manage Roles
                        </button>
                        <button onclick="app.showSystemLogsModal()" class="w-full btn-primary py-2 rounded text-sm">
                            <i class="fas fa-list mr-2"></i>System Logs
                        </button>
                        <button onclick="app.showBackupModal()" class="w-full btn-primary py-2 rounded text-sm">
                            <i class="fas fa-database mr-2"></i>Backup & Restore
                        </button>
                    </div>
                </div>

                <!-- Demo Mode Notice -->
                <div class="card p-6 lg:col-span-2">
                    <div class="flex items-center mb-4">
                        <i class="fas fa-flask text-yellow-400 text-xl mr-3"></i>
                        <h3 class="text-white text-lg font-semibold">Demo Mode Active</h3>
                    </div>
                    <div class="bg-yellow-500 bg-opacity-20 border border-yellow-400 border-opacity-30 rounded p-4">
                        <p class="text-yellow-200 mb-2">
                            <strong>You are currently using the demo version of Glotech School Management System.</strong>
                        </p>
                        <p class="text-yellow-300 text-sm mb-3">
                            All data shown is mock data for demonstration purposes. Changes made will not be permanently saved.
                        </p>
                        <div class="text-yellow-300 text-sm">
                            <p><strong>Demo Features:</strong></p>
                            <ul class="list-disc list-inside mt-1 space-y-1">
                                <li>Student and teacher management</li>
                                <li>Academic records and grading</li>
                                <li>Fee management and payments</li>
                                <li>Attendance tracking</li>
                                <li>Messaging and announcements</li>
                                <li>Comprehensive reporting</li>
                            </ul>
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