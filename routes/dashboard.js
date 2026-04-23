const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        const stats = {};

        // Get total counts based on user role
        if (req.user.role === 'admin' || req.user.role === 'teacher') {
            stats.totalStudents = await Student.countDocuments({ isActive: true });
            stats.totalTeachers = await User.countDocuments({ role: 'teacher', isActive: true });
            
            // Mock data for now - replace with actual calculations
            stats.attendanceToday = 85;
            stats.feeCollection = 2500000;
        }

        // Role-specific stats
        if (req.user.role === 'student') {
            // Student-specific stats
            const student = await Student.findOne({ user: req.user._id });
            if (student) {
                stats.currentGPA = student.currentGPA || 0;
                stats.classRank = student.classRank || 0;
                stats.attendanceRate = 90; // Mock data
                stats.pendingFees = 25000; // Mock data
            }
        }

        if (req.user.role === 'teacher') {
            // Teacher-specific stats
            stats.myClasses = 3; // Mock data
            stats.studentsCount = 120; // Mock data
            stats.pendingGrades = 15; // Mock data
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard statistics'
        });
    }
});

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Private
router.get('/activities', auth, async (req, res) => {
    try {
        // Mock activities data - replace with actual activity logging
        const activities = [
            {
                icon: 'fas fa-user-plus',
                message: 'New student Jane Doe admitted to Form 1 East',
                createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
            },
            {
                icon: 'fas fa-calendar-check',
                message: 'Attendance marked for Form 2 West',
                createdAt: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
            },
            {
                icon: 'fas fa-coins',
                message: 'Fee payment received from John Smith - KSh 25,000',
                createdAt: new Date(Date.now() - 1000 * 60 * 90) // 1.5 hours ago
            },
            {
                icon: 'fas fa-graduation-cap',
                message: 'Mathematics exam results published for Form 3',
                createdAt: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
            },
            {
                icon: 'fas fa-envelope',
                message: 'New message from parent regarding student performance',
                createdAt: new Date(Date.now() - 1000 * 60 * 180) // 3 hours ago
            }
        ];

        // Filter activities based on user role
        let filteredActivities = activities;
        
        if (req.user.role === 'student') {
            // Show only student-relevant activities
            filteredActivities = activities.filter(activity => 
                activity.message.includes('exam') || 
                activity.message.includes('result') ||
                activity.message.includes('attendance')
            );
        }

        if (req.user.role === 'teacher') {
            // Show teacher-relevant activities
            filteredActivities = activities.filter(activity => 
                activity.message.includes('attendance') || 
                activity.message.includes('exam') ||
                activity.message.includes('message')
            );
        }

        res.json({
            success: true,
            data: filteredActivities.slice(0, 5) // Limit to 5 recent activities
        });

    } catch (error) {
        console.error('Dashboard activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activities'
        });
    }
});

// @route   GET /api/dashboard/notifications
// @desc    Get user notifications
// @access  Private
router.get('/notifications', auth, async (req, res) => {
    try {
        // Mock notifications - replace with actual notification system
        const notifications = [
            {
                id: 1,
                title: 'Fee Payment Reminder',
                message: 'Term 2 fees are due by end of this week',
                type: 'warning',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
            },
            {
                id: 2,
                title: 'Exam Schedule Released',
                message: 'Mid-term examination timetable is now available',
                type: 'info',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
            },
            {
                id: 3,
                title: 'Parent-Teacher Meeting',
                message: 'Scheduled for next Friday at 2:00 PM',
                type: 'info',
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48) // 2 days ago
            }
        ];

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Dashboard notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// @route   GET /api/dashboard/quick-stats
// @desc    Get quick statistics for widgets
// @access  Private
router.get('/quick-stats', auth, async (req, res) => {
    try {
        const stats = {};

        // Common stats for all roles
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        if (req.user.role === 'admin') {
            // Admin gets all system stats
            stats.studentsPresent = 450; // Mock data
            stats.studentsAbsent = 50;
            stats.teachersPresent = 28;
            stats.pendingPayments = 15;
            stats.totalRevenue = 2500000;
            stats.newAdmissions = 5;
        }

        if (req.user.role === 'teacher') {
            // Teacher gets class-specific stats
            stats.myStudents = 35;
            stats.presentToday = 32;
            stats.absentToday = 3;
            stats.pendingGrades = 12;
            stats.assignmentsDue = 8;
        }

        if (req.user.role === 'student') {
            // Student gets personal stats
            const student = await Student.findOne({ user: req.user._id });
            if (student) {
                stats.attendanceRate = 92;
                stats.currentGPA = student.currentGPA || 0;
                stats.rank = student.classRank || 0;
                stats.pendingAssignments = 3;
                stats.upcomingExams = 2;
            }
        }

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Quick stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quick statistics'
        });
    }
});

module.exports = router;