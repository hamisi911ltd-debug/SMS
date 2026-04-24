const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock teacher data
const mockTeachers = [
    {
        _id: 'teacher1',
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Kamau',
        email: 'john.teacher@glotechhigh.ac.ke',
        phone: '+254712345678',
        dateOfBirth: '1985-06-15',
        gender: 'Male',
        subjects: ['Mathematics', 'Physics'],
        classes: ['Form 2 East', 'Form 3 West'],
        tscNumber: 'TSC123456',
        qualification: 'Bachelor of Education (Mathematics)',
        experience: 8,
        joinDate: '2020-01-15',
        isActive: true,
        salary: 65000,
        department: 'Mathematics & Sciences'
    },
    {
        _id: 'teacher2',
        employeeNumber: 'EMP002',
        firstName: 'Mary',
        lastName: 'Wanjiku',
        email: 'mary.wanjiku@glotechhigh.ac.ke',
        phone: '+254723456789',
        dateOfBirth: '1982-03-22',
        gender: 'Female',
        subjects: ['English', 'Literature'],
        classes: ['Form 1 North', 'Form 4 South'],
        tscNumber: 'TSC234567',
        qualification: 'Master of Arts (English Literature)',
        experience: 12,
        joinDate: '2018-08-20',
        isActive: true,
        salary: 75000,
        department: 'Languages'
    },
    {
        _id: 'teacher3',
        employeeNumber: 'EMP003',
        firstName: 'Peter',
        lastName: 'Ochieng',
        email: 'peter.ochieng@glotechhigh.ac.ke',
        phone: '+254734567890',
        dateOfBirth: '1988-11-10',
        gender: 'Male',
        subjects: ['Chemistry', 'Biology'],
        classes: ['Form 2 West', 'Form 3 East'],
        tscNumber: 'TSC345678',
        qualification: 'Bachelor of Science (Chemistry)',
        experience: 6,
        joinDate: '2021-01-10',
        isActive: true,
        salary: 60000,
        department: 'Sciences'
    }
];

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', department = '' } = req.query;
        
        let filteredTeachers = [...mockTeachers];
        
        // Apply search filter
        if (search) {
            filteredTeachers = filteredTeachers.filter(teacher => 
                teacher.firstName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.lastName.toLowerCase().includes(search.toLowerCase()) ||
                teacher.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
                teacher.email.toLowerCase().includes(search.toLowerCase()) ||
                teacher.subjects.some(subject => subject.toLowerCase().includes(search.toLowerCase()))
            );
        }
        
        // Apply department filter
        if (department) {
            filteredTeachers = filteredTeachers.filter(teacher => 
                teacher.department.toLowerCase().includes(department.toLowerCase())
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedTeachers = filteredTeachers.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                teachers: paginatedTeachers,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredTeachers.length / limit),
                    total: filteredTeachers.length
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
// @desc    Get teacher by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const teacher = mockTeachers.find(t => t._id === req.params.id);
        
        if (!teacher) {
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
// @desc    Add new teacher
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const newTeacher = {
            _id: `teacher${mockTeachers.length + 1}`,
            employeeNumber: `EMP${String(mockTeachers.length + 1).padStart(3, '0')}`,
            ...req.body,
            joinDate: new Date().toISOString(),
            isActive: true
        };
        
        mockTeachers.push(newTeacher);
        
        res.status(201).json({
            success: true,
            message: 'Teacher added successfully',
            data: { teacher: newTeacher }
        });
        
    } catch (error) {
        console.error('Add teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding teacher'
        });
    }
});

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const teacherIndex = mockTeachers.findIndex(t => t._id === req.params.id);
        
        if (teacherIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
        
        mockTeachers[teacherIndex] = {
            ...mockTeachers[teacherIndex],
            ...req.body
        };
        
        res.json({
            success: true,
            message: 'Teacher updated successfully',
            data: { teacher: mockTeachers[teacherIndex] }
        });
        
    } catch (error) {
        console.error('Update teacher error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating teacher'
        });
    }
});

// @route   GET /api/teachers/my/classes
// @desc    Get teacher's classes
// @access  Private (Teacher)
router.get('/my/classes', auth, authorize('teacher'), async (req, res) => {
    try {
        // In demo mode, return mock classes for the current teacher
        const teacherClasses = [
            {
                _id: 'class1',
                name: 'Form 2 East',
                subject: 'Mathematics',
                students: 35,
                schedule: [
                    { day: 'Monday', time: '08:00-09:00' },
                    { day: 'Wednesday', time: '10:00-11:00' },
                    { day: 'Friday', time: '14:00-15:00' }
                ]
            },
            {
                _id: 'class2',
                name: 'Form 3 West',
                subject: 'Physics',
                students: 32,
                schedule: [
                    { day: 'Tuesday', time: '09:00-10:00' },
                    { day: 'Thursday', time: '11:00-12:00' }
                ]
            }
        ];
        
        res.json({
            success: true,
            data: { classes: teacherClasses }
        });
        
    } catch (error) {
        console.error('Get teacher classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher classes'
        });
    }
});

module.exports = router;