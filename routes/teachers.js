const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department, status } = req.query;
        
        // Build query
        const query = { role: 'teacher' };
        
        if (status) query.isActive = status === 'active';
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } }
            ];
        }

        const teachers = await User.find(query)
            .select('-password')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                teachers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get teachers error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teachers'
        });
    }
});

// @route   GET /api/teachers/:id
// @desc    Get single teacher
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select('-password');

        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.json({
            success: true,
            data: { teacher }
        });

    } catch (error) {
        console.error('Get teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher'
        });
    }
});

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    body('tscNumber').notEmpty().withMessage('TSC number is required'),
    body('subjects').isArray().withMessage('Subjects must be an array')
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
            firstName, lastName, email, phoneNumber, dateOfBirth, gender,
            tscNumber, subjects, department, qualification, experience
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
        
        // Create teacher account
        const teacher = new User({
            username,
            email,
            password: 'teacher123', // Default password
            firstName,
            lastName,
            role: 'teacher',
            phoneNumber,
            dateOfBirth,
            gender,
            isActive: true,
            // Additional teacher fields can be stored in a separate Teacher model
            teacherProfile: {
                tscNumber,
                subjects,
                department,
                qualification,
                experience
            }
        });

        await teacher.save();

        res.status(201).json({
            success: true,
            message: 'Teacher created successfully',
            data: { teacher }
        });

    } catch (error) {
        console.error('Create teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating teacher'
        });
    }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin, Teacher - own record)
router.put('/:id', auth, async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Check permissions
        if (req.user.role !== 'admin' && teacher._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const {
            firstName, lastName, phoneNumber, dateOfBirth, gender,
            tscNumber, subjects, department, qualification, experience
        } = req.body;

        // Update fields
        if (firstName) teacher.firstName = firstName;
        if (lastName) teacher.lastName = lastName;
        if (phoneNumber) teacher.phoneNumber = phoneNumber;
        if (dateOfBirth) teacher.dateOfBirth = dateOfBirth;
        if (gender) teacher.gender = gender;

        // Update teacher profile
        if (!teacher.teacherProfile) teacher.teacherProfile = {};
        if (tscNumber) teacher.teacherProfile.tscNumber = tscNumber;
        if (subjects) teacher.teacherProfile.subjects = subjects;
        if (department) teacher.teacherProfile.department = department;
        if (qualification) teacher.teacherProfile.qualification = qualification;
        if (experience) teacher.teacherProfile.experience = experience;

        await teacher.save();

        res.json({
            success: true,
            message: 'Teacher updated successfully',
            data: { teacher }
        });

    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating teacher'
        });
    }
});

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher (soft delete)
// @access  Private (Admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id);
        
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Soft delete
        teacher.isActive = false;
        await teacher.save();

        res.json({
            success: true,
            message: 'Teacher deactivated successfully'
        });

    } catch (error) {
        console.error('Delete teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting teacher'
        });
    }
});

module.exports = router;