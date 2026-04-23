/**
 * Attendance.js - Attendance management functionality
 * Handles attendance marking, bulk operations, and real-time updates
 */

// Attendance management object
const AttendanceManager = {
    selectedStudents: new Set(),
    
    init() {
        this.initializeEventListeners();
        this.initializeBulkOperations();
        this.initializeAttendanceMarking();
        this.initializeFilters();
    },
    
    initializeEventListeners() {
        // Select all checkbox
        const selectAllCheckbox = document.getElementById('select-all-students');
        if (selectAllCheckbox) {
            selectAllCheckbox.addEventListener('change', (e) => {
                this.toggleAllStudents(e.target.checked);
            });
        }
        
        // Individual student checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('student-checkbox')) {
                this.toggleStudent(e.target.value, e.target.checked);
            }
        });
        
        // Attendance status buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('attendance-btn')) {
                e.preventDefault();
                this.markAttendance(e.target);
            }
        });
    },
    
    initializeBulkOperations() {
        const bulkActions = document.querySelectorAll('.bulk-action-btn');
        bulkActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.performBulkAction(action);
            });
        });
    },
    
    initializeAttendanceMarking() {
        // Quick mark buttons
        const quickMarkBtns = document.querySelectorAll('.quick-mark');
        quickMarkBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const status = btn.dataset.status;
                const studentId = btn.dataset.student;
                this.quickMarkAttendance(studentId, status);
            });
        });
        
        // Time picker for late arrivals
        const timePickers = document.querySelectorAll('.time-picker');
        timePickers.forEach(picker => {
            picker.addEventListener('change', (e) => {
                const studentId = picker.dataset.student;
                this.updateArrivalTime(studentId, e.target.value);
            });
        });
    },
    
    initializeFilters() {
        const classFilter = document.getElementById('class-filter');
        const streamFilter = document.getElementById('stream-filter');
        const statusFilter = document.getElementById('status-filter');
        
        [classFilter, streamFilter, statusFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => {
                    this.applyFilters();
                });
            }
        });
        
        // Search functionality
        const searchInput = document.getElementById('student-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchStudents(e.target.value);
            });
        }
    },
    
    toggleAllStudents(checked) {
        const checkboxes = document.querySelectorAll('.student-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            this.toggleStudent(checkbox.value, checked);
        });
        this.updateBulkActionButtons();
    },
    
    toggleStudent(studentId, checked) {
        if (checked) {
            this.selectedStudents.add(studentId);
        } else {
            this.selectedStudents.delete(studentId);
        }
        this.updateBulkActionButtons();
        this.updateSelectAllState();
    },
    
    updateBulkActionButtons() {
        const bulkActions = document.querySelector('.bulk-actions');
        const selectedCount = document.querySelector('.selected-count');
        
        if (bulkActions) {
            if (this.selectedStudents.size > 0) {
                bulkActions.style.display = 'block';
                if (selectedCount) {
                    selectedCount.textContent = `${this.selectedStudents.size} selected`;
                }
            } else {
                bulkActions.style.display = 'none';
            }
        }
    },
    
    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('select-all-students');
        const totalCheckboxes = document.querySelectorAll('.student-checkbox').length;
        
        if (selectAllCheckbox) {
            if (this.selectedStudents.size === 0) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = false;
            } else if (this.selectedStudents.size === totalCheckboxes) {
                selectAllCheckbox.indeterminate = false;
                selectAllCheckbox.checked = true;
            } else {
                selectAllCheckbox.indeterminate = true;
            }
        }
    },
    
    markAttendance(button) {
        const studentId = button.dataset.student;
        const status = button.dataset.status;
        const row = button.closest('.student-row');
        
        // Update UI immediately
        this.updateAttendanceUI(row, status);
        
        // Send to server
        this.saveAttendance(studentId, status)
            .then(response => {
                if (response.success) {
                    this.showNotification('Attendance marked successfully', 'success');
                } else {
                    this.showNotification('Failed to mark attendance', 'error');
                    // Revert UI changes
                    this.revertAttendanceUI(row);
                }
            })
            .catch(error => {
                console.error('Error marking attendance:', error);
                this.showNotification('Error marking attendance', 'error');
                this.revertAttendanceUI(row);
            });
    },
    
    quickMarkAttendance(studentId, status) {
        const data = {
            student_id: studentId,
            status: status,
            date: new Date().toISOString().split('T')[0],
            session: this.getCurrentSession()
        };
        
        if (status === 'late') {
            data.check_in_time = new Date().toTimeString().split(' ')[0];
        }
        
        this.saveAttendance(studentId, status, data);
    },
    
    updateArrivalTime(studentId, time) {
        const data = {
            student_id: studentId,
            check_in_time: time,
            status: 'late'
        };
        
        this.saveAttendance(studentId, 'late', data);
    },
    
    performBulkAction(action) {
        if (this.selectedStudents.size === 0) {
            this.showNotification('Please select students first', 'warning');
            return;
        }
        
        const studentIds = Array.from(this.selectedStudents);
        
        switch (action) {
            case 'mark-present':
                this.bulkMarkAttendance(studentIds, 'present');
                break;
            case 'mark-absent':
                this.bulkMarkAttendance(studentIds, 'absent');
                break;
            case 'mark-late':
                this.bulkMarkAttendance(studentIds, 'late');
                break;
            case 'mark-excused':
                this.bulkMarkAttendance(studentIds, 'excused');
                break;
            default:
                console.warn('Unknown bulk action:', action);
        }
    },
    
    bulkMarkAttendance(studentIds, status) {
        const data = {
            student_ids: studentIds,
            status: status,
            date: new Date().toISOString().split('T')[0],
            session: this.getCurrentSession()
        };
        
        // Show loading state
        this.showBulkLoading(true);
        
        fetch('/attendance/bulk-mark/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification(`Marked ${studentIds.length} students as ${status}`, 'success');
                this.refreshAttendanceTable();
                this.clearSelection();
            } else {
                this.showNotification('Failed to mark bulk attendance', 'error');
            }
        })
        .catch(error => {
            console.error('Error with bulk attendance:', error);
            this.showNotification('Error marking bulk attendance', 'error');
        })
        .finally(() => {
            this.showBulkLoading(false);
        });
    },
    
    saveAttendance(studentId, status, additionalData = {}) {
        const data = {
            student_id: studentId,
            status: status,
            date: new Date().toISOString().split('T')[0],
            session: this.getCurrentSession(),
            ...additionalData
        };
        
        return fetch('/attendance/mark/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json());
    },
    
    updateAttendanceUI(row, status) {
        const statusCell = row.querySelector('.status-cell');
        const buttons = row.querySelectorAll('.attendance-btn');
        
        // Update status display
        if (statusCell) {
            statusCell.className = `status-cell status-${status}`;
            statusCell.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        }
        
        // Update button states
        buttons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.status === status) {
                btn.classList.add('active');
            }
        });
    },
    
    revertAttendanceUI(row) {
        // Implementation to revert UI changes if server request fails
        const statusCell = row.querySelector('.status-cell');
        if (statusCell) {
            statusCell.className = 'status-cell status-unmarked';
            statusCell.textContent = 'Not Marked';
        }
    },
    
    applyFilters() {
        const classFilter = document.getElementById('class-filter')?.value;
        const streamFilter = document.getElementById('stream-filter')?.value;
        const statusFilter = document.getElementById('status-filter')?.value;
        
        const rows = document.querySelectorAll('.student-row');
        
        rows.forEach(row => {
            let show = true;
            
            if (classFilter && row.dataset.class !== classFilter) {
                show = false;
            }
            
            if (streamFilter && row.dataset.stream !== streamFilter) {
                show = false;
            }
            
            if (statusFilter && row.dataset.status !== statusFilter) {
                show = false;
            }
            
            row.style.display = show ? '' : 'none';
        });
        
        this.updateFilteredCount();
    },
    
    searchStudents(query) {
        const rows = document.querySelectorAll('.student-row');
        const searchTerm = query.toLowerCase();
        
        rows.forEach(row => {
            const studentName = row.dataset.name?.toLowerCase() || '';
            const admissionNumber = row.dataset.admission?.toLowerCase() || '';
            
            const matches = studentName.includes(searchTerm) || 
                          admissionNumber.includes(searchTerm);
            
            row.style.display = matches ? '' : 'none';
        });
    },
    
    updateFilteredCount() {
        const visibleRows = document.querySelectorAll('.student-row:not([style*="display: none"])');
        const countElement = document.querySelector('.filtered-count');
        
        if (countElement) {
            countElement.textContent = `Showing ${visibleRows.length} students`;
        }
    },
    
    refreshAttendanceTable() {
        // Refresh the attendance table via HTMX or page reload
        const tableContainer = document.getElementById('attendance-table-container');
        if (tableContainer && window.htmx) {
            htmx.ajax('GET', window.location.href, tableContainer);
        } else {
            window.location.reload();
        }
    },
    
    clearSelection() {
        this.selectedStudents.clear();
        document.querySelectorAll('.student-checkbox').forEach(cb => cb.checked = false);
        this.updateBulkActionButtons();
        this.updateSelectAllState();
    },
    
    showBulkLoading(show) {
        const bulkActions = document.querySelector('.bulk-actions');
        if (bulkActions) {
            if (show) {
                bulkActions.classList.add('loading');
            } else {
                bulkActions.classList.remove('loading');
            }
        }
    },
    
    getCurrentSession() {
        const sessionSelect = document.getElementById('session-select');
        return sessionSelect ? sessionSelect.value : 'morning';
    },
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    },
    
    showNotification(message, type = 'info') {
        // Use the global notification system
        if (window.GlotechApp && window.GlotechApp.showNotification) {
            window.GlotechApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    AttendanceManager.init();
});

// Export for global use
window.AttendanceManager = AttendanceManager;

console.log('Attendance.js loaded successfully');