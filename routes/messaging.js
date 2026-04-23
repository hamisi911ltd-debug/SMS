const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/messaging/conversations
// @desc    Get user conversations
// @access  Private
router.get('/conversations', auth, async (req, res) => {
    try {
        // Mock conversations data
        const conversations = [
            {
                _id: '1',
                participants: [
                    { _id: req.user._id, name: req.user.fullName, role: req.user.role },
                    { _id: '2', name: 'John Kamau', role: 'teacher' }
                ],
                lastMessage: {
                    content: 'Thank you for the update on Jane\'s progress.',
                    sender: req.user._id,
                    timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
                },
                unreadCount: 0,
                updatedAt: new Date(Date.now() - 1000 * 60 * 30)
            },
            {
                _id: '2',
                participants: [
                    { _id: req.user._id, name: req.user.fullName, role: req.user.role },
                    { _id: '3', name: 'Mary Njeri', role: 'teacher' }
                ],
                lastMessage: {
                    content: 'The mathematics assignment has been submitted.',
                    sender: '3',
                    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
                },
                unreadCount: 1,
                updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
            }
        ];

        res.json({
            success: true,
            data: { conversations }
        });

    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching conversations'
        });
    }
});

// @route   GET /api/messaging/conversations/:id/messages
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 20 } = req.query;

        // Mock messages data
        const messages = [
            {
                _id: '1',
                conversation: id,
                sender: {
                    _id: '2',
                    name: 'John Kamau',
                    role: 'teacher'
                },
                content: 'Good morning! I wanted to discuss Jane\'s performance in mathematics.',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
                read: true
            },
            {
                _id: '2',
                conversation: id,
                sender: {
                    _id: req.user._id,
                    name: req.user.fullName,
                    role: req.user.role
                },
                content: 'Good morning Mr. Kamau. I\'m interested to hear about her progress.',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2.5), // 2.5 hours ago
                read: true
            },
            {
                _id: '3',
                conversation: id,
                sender: {
                    _id: '2',
                    name: 'John Kamau',
                    role: 'teacher'
                },
                content: 'She has shown significant improvement this term. Her test scores have increased from 65% to 85%.',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
                read: true
            },
            {
                _id: '4',
                conversation: id,
                sender: {
                    _id: req.user._id,
                    name: req.user.fullName,
                    role: req.user.role
                },
                content: 'That\'s wonderful news! Thank you for the extra attention you\'ve given her.',
                type: 'text',
                timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
                read: true
            }
        ];

        res.json({
            success: true,
            data: { messages }
        });

    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

// @route   POST /api/messaging/conversations/:id/messages
// @desc    Send a message
// @access  Private
router.post('/conversations/:id/messages', auth, [
    body('content').notEmpty().withMessage('Message content is required'),
    body('type').optional().isIn(['text', 'image', 'file']).withMessage('Invalid message type')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { id } = req.params;
        const { content, type = 'text' } = req.body;

        // Mock message creation
        const message = {
            _id: Date.now().toString(),
            conversation: id,
            sender: {
                _id: req.user._id,
                name: req.user.fullName,
                role: req.user.role
            },
            content,
            type,
            timestamp: new Date(),
            read: false
        };

        // Emit real-time message via Socket.IO
        const io = req.app.get('io');
        io.to(`conversation-${id}`).emit('new-message', message);

        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { message }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// @route   POST /api/messaging/conversations
// @desc    Start a new conversation
// @access  Private
router.post('/conversations', auth, [
    body('participantId').notEmpty().withMessage('Participant ID is required'),
    body('initialMessage').notEmpty().withMessage('Initial message is required')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { participantId, initialMessage } = req.body;

        // Mock conversation creation
        const conversation = {
            _id: Date.now().toString(),
            participants: [
                { _id: req.user._id, name: req.user.fullName, role: req.user.role },
                { _id: participantId, name: 'Other User', role: 'user' } // Would fetch from database
            ],
            createdBy: req.user._id,
            createdAt: new Date()
        };

        // Create initial message
        const message = {
            _id: (Date.now() + 1).toString(),
            conversation: conversation._id,
            sender: {
                _id: req.user._id,
                name: req.user.fullName,
                role: req.user.role
            },
            content: initialMessage,
            type: 'text',
            timestamp: new Date(),
            read: false
        };

        res.status(201).json({
            success: true,
            message: 'Conversation started successfully',
            data: { conversation, initialMessage: message }
        });

    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting conversation'
        });
    }
});

// @route   GET /api/messaging/announcements
// @desc    Get school announcements
// @access  Private
router.get('/announcements', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, priority } = req.query;

        // Mock announcements data
        const announcements = [
            {
                _id: '1',
                title: 'Mid-Term Examination Schedule',
                content: 'The mid-term examinations will commence on May 15th, 2026. All students are expected to report by 7:30 AM.',
                category: 'academic',
                priority: 'high',
                targetAudience: ['student', 'parent', 'teacher'],
                author: {
                    name: 'Principal',
                    role: 'admin'
                },
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) // 30 days from now
            },
            {
                _id: '2',
                title: 'Parent-Teacher Meeting',
                content: 'The quarterly parent-teacher meeting is scheduled for April 30th, 2026 from 2:00 PM to 5:00 PM.',
                category: 'event',
                priority: 'medium',
                targetAudience: ['parent', 'teacher'],
                author: {
                    name: 'Deputy Principal',
                    role: 'admin'
                },
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days from now
            },
            {
                _id: '3',
                title: 'Fee Payment Reminder',
                content: 'This is a reminder that Term 2 fees are due by the end of this week. Please ensure timely payment.',
                category: 'finance',
                priority: 'high',
                targetAudience: ['parent'],
                author: {
                    name: 'Accounts Office',
                    role: 'accountant'
                },
                publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5) // 5 days from now
            }
        ];

        // Filter by user role
        const filteredAnnouncements = announcements.filter(announcement => 
            announcement.targetAudience.includes(req.user.role)
        );

        res.json({
            success: true,
            data: { 
                announcements: filteredAnnouncements,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredAnnouncements.length / limit),
                    total: filteredAnnouncements.length
                }
            }
        });

    } catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching announcements'
        });
    }
});

// @route   POST /api/messaging/announcements
// @desc    Create a new announcement
// @access  Private (Admin, Teacher)
router.post('/announcements', auth, authorize('admin', 'teacher'), [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('category').isIn(['academic', 'event', 'finance', 'general']).withMessage('Invalid category'),
    body('priority').isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('targetAudience').isArray().withMessage('Target audience must be an array')
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { title, content, category, priority, targetAudience, expiresAt } = req.body;

        // Mock announcement creation
        const announcement = {
            _id: Date.now().toString(),
            title,
            content,
            category,
            priority,
            targetAudience,
            author: {
                _id: req.user._id,
                name: req.user.fullName,
                role: req.user.role
            },
            publishedAt: new Date(),
            expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
        };

        // Emit real-time notification via Socket.IO
        const io = req.app.get('io');
        targetAudience.forEach(role => {
            io.to(`role-${role}`).emit('new-announcement', announcement);
        });

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: { announcement }
        });

    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating announcement'
        });
    }
});

// @route   PUT /api/messaging/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:id/read', auth, async (req, res) => {
    try {
        const { id } = req.params;

        // Mock message read update
        const message = {
            _id: id,
            read: true,
            readAt: new Date()
        };

        res.json({
            success: true,
            message: 'Message marked as read',
            data: { message }
        });

    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read'
        });
    }
});

// @route   GET /api/messaging/unread-count
// @desc    Get unread messages count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        // Mock unread count
        const unreadCount = {
            messages: 3,
            announcements: 1,
            total: 4
        };

        res.json({
            success: true,
            data: unreadCount
        });

    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching unread count'
        });
    }
});

module.exports = router;