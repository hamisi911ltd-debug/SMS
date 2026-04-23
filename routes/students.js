const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Student = require('../models/Student');
const router = express.Router();

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, class: classLevel, stream, status } = req.query;
        
        // Build query
        const query = { isActive: true };
        
        if (classLevel) query.currentClass = classLevel;
        if (stream) query.stream = stream;
        if (status) query.isActive = status === 'active';
        
        // Build user search query
        let userQuery = {};
        if (search) {
            userQuery = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get students with populated user data
        const students = await Student.find(query)
            .populate({
                path: 'user',
                match: userQuery,
                select: '-password'
            })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        // Filter out students where user didn't match search
        const filteredStudents = students.filter(student => student.user);

        // Get total count for pagination
        const total = await Student.countDocuments(query);

        res.json({
            success: true,
            data: {
                students: filteredStudents,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching students'
        });
    }
});

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('user', '-password')
            .populate('subjects');

        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check permissions
        if (req.user.role === 'student' && student.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: { student }
        });

    } catch (error) {
        console.error('Get student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student'
        });
    }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('kcpeIndex').notEmpty().withMessage('KCPE index is required'),
    body('kcpeMarks').isInt({ min: 0, max: 500 }).withMessage('KCPE marks must be between 0 and 500'),
    body('currentClass').isInt({ min: 1, max: 4 }).withMessage('Class must be between 1 and 4'),
    body('stream').isIn(['East', 'West', 'North', 'South']).withMessage('Invalid stream'),
    body('boardingStatus').isIn(['boarder', 'day_scholar']).withMessage('Invalid boarding status'),
    body('parentName').notEmpty().withMessage('Parent name is required'),
    body('parentPhone').notEmpty().withMessage('Parent phone is required')
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

        const {
            firstName, lastName, email, dateOfBirth, gender, phoneNumber,
            kcpeIndex, kcpeMarks, currentClass, stream, admissionClass,
            yearOfAdmission, boardingStatus, parentName, parentPhone,
            parentEmail, emergencyContactName, emergencyContactPhone,
            emergencyContactRelationship
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Generate username from name
        const username = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`.replace(/\s+/g, '');
        
        // Create user account
        const user = new User({
            username,
            email,
            password: 'student123', // Default password
            firstName,
            lastName,
            role: 'student',
            phoneNumber,
            dateOfBirth,
            gender,
            isActive: true
        });

        await user.save();

        // Create student record
        const student = new Student({
            user: user._id,
            kcpeIndex,
            kcpeMarks,
            currentClass,
            stream,
            admissionClass: admissionClass || currentClass,
            yearOfAdmission: yearOfAdmission || new Date().getFullYear(),
            boardingStatus,
            parentName,
            parentPhone,
            parentEmail,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelationship
        });

        await student.save();

        // Populate user data for response
        await student.populate('user', '-password');

        res.status(201).json({
            success: true,
            message: 'Student created successfully',
            data: { student }
        });

    } catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating student'
        });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin, Student - own record)
router.put('/:id', auth, async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && student.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            currentClass, stream, boardingStatus, parentName, parentPhone,
            parentEmail, emergencyContactName, emergencyContactPhone,
            emergencyContactRelationship, medicalConditions, allergies,
            medications, bloodGroup
        } = req.body;

        // Update student fields
        if (currentClass !== undefined) student.currentClass = currentClass;
        if (stream) student.stream = stream;
        if (boardingStatus) student.boardingStatus = boardingStatus;
        if (parentName) student.parentName = parentName;
        if (parentPhone) student.parentPhone = parentPhone;
        if (parentEmail) student.parentEmail = parentEmail;
        if (emergencyContactName) student.emergencyContactName = emergencyContactName;
        if (emergencyContactPhone) student.emergencyContactPhone = emergencyContactPhone;
        if (emergencyContactRelationship) student.emergencyContactRelationship = emergencyContactRelationship;
        if (medicalConditions) student.medicalConditions = medicalConditions;
        if (allergies) student.allergies = allergies;
        if (medications) student.medications = medications;
        if (bloodGroup) student.bloodGroup = bloodGroup;

        await student.save();
        await student.populate('user', '-password');

        res.json({
            success: true,
            message: 'Student updated successfully',
            data: { student }
        });

    } catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating student'
        });
    }
});

// @route   DELETE /api/students/:id
// @desc    Delete student (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        // Soft delete
        student.isActive = false;
        await student.save();

        // Also deactivate user account
        await User.findByIdAndUpdate(student.user, { isActive: false });

        res.json({
            success: true,
            message: 'Student deactivated successfully'
        });

    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
});

// @route   GET /api/students/class/:class/:stream
// @desc    Get students by class and stream
// @access  Private (Admin, Teacher)
router.get('/class/:class/:stream', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { class: classLevel, stream } = req.params;
        
        const students = await Student.find({
            currentClass: classLevel,
            stream: stream,
            isActive: true
        })
        .populate('user', 'firstName lastName email phoneNumber')
        .sort({ 'user.lastName': 1, 'user.firstName': 1 });

        res.json({
            success: true,
            data: { students }
        });

    } catch (error) {
        console.error('Get class students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class students'
        });
    }
});

// @route   GET /api/students/stats
// @desc    Get student statistics
// @access  Private (Admin, Teacher)
router.get('/stats/overview', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments({ isActive: true });
        
        const classCounts = await Student.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$currentClass', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const streamCounts = await Student.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$stream', count: { $sum: 1 } } }
        ]);

        const boardingCounts = await Student.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$boardingStatus', count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            data: {
                totalStudents,
                classCounts,
                streamCounts,
                boardingCounts
            }
        });

    } catch (error) {
        console.error('Get student stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student statistics'
        });
    }
});

module.exports = router;