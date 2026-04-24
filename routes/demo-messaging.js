const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock messaging data
const mockMessages = [
    {
        _id: 'msg1',
        from: {
            id: 'teacher1',
            name: 'John Kamau',
            role: 'teacher',
            email: 'john.teacher@glotechhigh.ac.ke'
        },
        to: {
            id: 'admin',
            name: 'System Administrator',
            role: 'admin',
            email: 'admin@glotechhigh.ac.ke'
        },
        subject: 'Form 2 East Mathematics Progress Report',
        message: 'I would like to discuss the mathematics performance of Form 2 East students. The class average has improved significantly this term.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        priority: 'normal',
        attachments: []
    },
    {
        _id: 'msg2',
        from: {
            id: 'admin',
            name: 'System Administrator',
            role: 'admin',
            email: 'admin@glotechhigh.ac.ke'
        },
        to: {
            id: 'teacher1',
            name: 'John Kamau',
            role: 'teacher',
            email: 'john.teacher@glotechhigh.ac.ke'
        },
        subject: 'Re: Form 2 East Mathematics Progress Report',
        message: 'Thank you for the update. Please schedule a meeting to discuss the detailed performance analysis.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: true,
        priority: 'normal',
        attachments: []
    },
    {
        _id: 'msg3',
        from: {
            id: 'admin',
            name: 'System Administrator',
            role: 'admin',
            email: 'admin@glotechhigh.ac.ke'
        },
        to: 'all_teachers',
        subject: 'Staff Meeting - End of Term Preparations',
        message: 'All teaching staff are required to attend the end of term meeting scheduled for Friday, 2:00 PM in the conference room.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        priority: 'high',
        attachments: [
            { name: 'meeting_agenda.pdf', size: '245KB' }
        ]
    }
];

const mockAnnouncements = [
    {
        _id: 'ann1',
        title: 'Mid-Term Break Schedule',
        content: 'The mid-term break will commence on Friday, June 28th at 4:00 PM. Students are expected to return on Monday, July 8th by 6:00 AM.',
        author: {
            id: 'admin',
            name: 'System Administrator',
            role: 'admin'
        },
        targetAudience: 'all',
        priority: 'high',
        publishDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
        isActive: true,
        views: 245
    },
    {
        _id: 'ann2',
        title: 'Sports Day Registration',
        content: 'Registration for the annual sports day is now open. Students interested in participating should register with their respective class teachers by Friday.',
        author: {
            id: 'teacher1',
            name: 'John Kamau',
            role: 'teacher'
        },
        targetAudience: 'students',
        priority: 'normal',
        publishDate: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
        expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5), // 5 days from now
        isActive: true,
        views: 189
    }
];

// @route   GET /api/messaging/messages
// @desc    Get user messages
// @access  Private
router.get('/messages', auth, async (req, res) => {
    try {
        const { type = 'inbox', page = 1, limit = 10 } = req.query;
        const userId = req.user._id;
        
        let filteredMessages = [];
        
        if (type === 'inbox') {
            filteredMessages = mockMessages.filter(msg => 
                msg.to.id === userId || msg.to === `all_${req.user.role}s` || msg.to === 'all'
            );
        } else if (type === 'sent') {
            filteredMessages = mockMessages.filter(msg => msg.from.id === userId);
        }
        
        // Sort by timestamp (newest first)
        filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedMessages = filteredMessages.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                messages: paginatedMessages,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredMessages.length / limit),
                    total: filteredMessages.length
                }
            }
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching messages'
        });
    }
});

// @route   GET /api/messaging/messages/:id
// @desc    Get specific message
// @access  Private
router.get('/messages/:id', auth, async (req, res) => {
    try {
        const message = mockMessages.find(msg => msg._id === req.params.id);
        
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        // Mark as read if user is recipient
        if (message.to.id === req.user._id || message.to === `all_${req.user.role}s` || message.to === 'all') {
            message.read = true;
        }
        
        res.json({
            success: true,
            data: { message }
        });
    } catch (error) {
        console.error('Get message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching message'
        });
    }
});

// @route   POST /api/messaging/messages
// @desc    Send new message
// @access  Private
router.post('/messages', auth, async (req, res) => {
    try {
        const newMessage = {
            _id: `msg${mockMessages.length + 1}`,
            from: {
                id: req.user._id,
                name: req.user.fullName || req.user.username,
                role: req.user.role,
                email: req.user.email
            },
            timestamp: new Date(),
            read: false,
            attachments: [],
            ...req.body
        };
        
        mockMessages.push(newMessage);
        
        res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: { message: newMessage }
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message'
        });
    }
});

// @route   PUT /api/messaging/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/messages/:id/read', auth, async (req, res) => {
    try {
        const messageIndex = mockMessages.findIndex(msg => msg._id === req.params.id);
        
        if (messageIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Message not found'
            });
        }
        
        mockMessages[messageIndex].read = true;
        
        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark message read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking message as read'
        });
    }
});

// @route   GET /api/messaging/announcements
// @desc    Get announcements
// @access  Private
router.get('/announcements', auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        
        let filteredAnnouncements = mockAnnouncements.filter(ann => 
            ann.isActive && 
            (ann.targetAudience === 'all' || 
             ann.targetAudience === userRole || 
             ann.targetAudience === `${userRole}s`)
        );
        
        // Sort by publish date (newest first)
        filteredAnnouncements.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        res.json({
            success: true,
            data: { announcements: filteredAnnouncements }
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
// @desc    Create new announcement
// @access  Private (Admin, Teacher)
router.post('/announcements', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const newAnnouncement = {
            _id: `ann${mockAnnouncements.length + 1}`,
            author: {
                id: req.user._id,
                name: req.user.fullName || req.user.username,
                role: req.user.role
            },
            publishDate: new Date(),
            isActive: true,
            views: 0,
            ...req.body
        };
        
        mockAnnouncements.push(newAnnouncement);
        
        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: { announcement: newAnnouncement }
        });
    } catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating announcement'
        });
    }
});

// @route   GET /api/messaging/contacts
// @desc    Get messaging contacts
// @access  Private
router.get('/contacts', auth, async (req, res) => {
    try {
        const { role } = req.query;
        
        // Mock contacts based on user role
        let contacts = [];
        
        if (req.user.role === 'admin') {
            contacts = [
                { id: 'teacher1', name: 'John Kamau', role: 'teacher', email: 'john.teacher@glotechhigh.ac.ke' },
                { id: 'teacher2', name: 'Mary Wanjiku', role: 'teacher', email: 'mary.wanjiku@glotechhigh.ac.ke' },
                { id: 'all_teachers', name: 'All Teachers', role: 'group', email: '' },
                { id: 'all_students', name: 'All Students', role: 'group', email: '' }
            ];
        } else if (req.user.role === 'teacher') {
            contacts = [
                { id: 'admin', name: 'System Administrator', role: 'admin', email: 'admin@glotechhigh.ac.ke' },
                { id: 'teacher2', name: 'Mary Wanjiku', role: 'teacher', email: 'mary.wanjiku@glotechhigh.ac.ke' }
            ];
        } else if (req.user.role === 'student') {
            contacts = [
                { id: 'teacher1', name: 'John Kamau', role: 'teacher', email: 'john.teacher@glotechhigh.ac.ke' },
                { id: 'admin', name: 'System Administrator', role: 'admin', email: 'admin@glotechhigh.ac.ke' }
            ];
        }
        
        // Filter by role if specified
        if (role) {
            contacts = contacts.filter(contact => contact.role === role);
        }
        
        res.json({
            success: true,
            data: { contacts }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
});

// @route   GET /api/messaging/unread-count
// @desc    Get unread message count
// @access  Private
router.get('/unread-count', auth, async (req, res) => {
    try {
        const userId = req.user._id;
        
        const unreadCount = mockMessages.filter(msg => 
            !msg.read && 
            (msg.to.id === userId || msg.to === `all_${req.user.role}s` || msg.to === 'all')
        ).length;
        
        res.json({
            success: true,
            data: { count: unreadCount }
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