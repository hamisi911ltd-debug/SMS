const express = require('express');
const { auth } = require('../middleware/demo-auth');
const router = express.Router();

// @route   GET /api/notifications/count
// @desc    Get notification count (Demo Mode)
// @access  Private
router.get('/count', auth, async (req, res) => {
    try {
        // Mock notification count based on user role
        let count = 0;
        
        if (req.user.role === 'admin') {
            count = 5; // Admin has more notifications
        } else if (req.user.role === 'teacher') {
            count = 3; // Teachers have moderate notifications
        } else if (req.user.role === 'student') {
            count = 2; // Students have fewer notifications
        }

        res.json({
            success: true,
            data: { count }
        });

    } catch (error) {
        console.error('Demo notification count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notification count'
        });
    }
});

// @route   GET /api/notifications
// @desc    Get all notifications (Demo Mode)
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const notifications = [
            {
                id: 1,
                title: 'Fee Payment Reminder',
                message: 'Term 2 fees are due by end of this week',
                type: 'warning',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
            },
            {
                id: 2,
                title: 'Exam Schedule Released',
                message: 'Mid-term examination timetable is now available',
                type: 'info',
                read: false,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24)
            },
            {
                id: 3,
                title: 'Parent-Teacher Meeting',
                message: 'Scheduled for next Friday at 2:00 PM',
                type: 'info',
                read: true,
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48)
            }
        ];

        res.json({
            success: true,
            data: notifications
        });

    } catch (error) {
        console.error('Demo notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

module.exports = router;