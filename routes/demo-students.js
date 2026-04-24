const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock student data
const mockStudents = [
    {
        _id: 'student1',
        admissionNumber: 'GHS001',
        firstName: 'Jane',
        lastName: 'Wanjiku',
        email: 'jane.student@glotechhigh.ac.ke',
        phone: '+254712345678',
        dateOfBirth: '2008-03-15',
        gender: 'Female',
        class: 'Form 2 East',
        stream: 'East',
        guardianName: 'Mary Wanjiku',
        guardianPhone: '+254723456789',
        address: 'Nairobi, Kenya',
        admissionDate: '2023-01-15',
        isActive: true,
        feeBalance: 15000,
        currentGPA: 3.2,
        classRank: 15
    },
    {
        _id: 'student2',
        admissionNumber: 'GHS002',
        firstName: 'John',
        lastName: 'Kamau',
        email: 'john.kamau@glotechhigh.ac.ke',
        phone: '+254787654321',
        dateOfBirth: '2007-08-22',
        gender: 'Male',
        class: 'Form 3 West',
        stream: 'West',
        guardianName: 'Peter Kamau',
        guardianPhone: '+254734567890',
        address: 'Kiambu, Kenya',
        admissionDate: '2022-01-10',
        isActive: true,
        feeBalance: 8000,
        currentGPA: 3.8,
        classRank: 5
    },
    {
        _id: 'student3',
        admissionNumber: 'GHS003',
        firstName: 'Grace',
        lastName: 'Achieng',
        email: 'grace.achieng@glotechhigh.ac.ke',
        phone: '+254798765432',
        dateOfBirth: '2009-01-10',
        gender: 'Female',
        class: 'Form 1 North',
        stream: 'North',
        guardianName: 'Susan Achieng',
        guardianPhone: '+254745678901',
        address: 'Kisumu, Kenya',
        admissionDate: '2024-01-08',
        isActive: true,
        feeBalance: 25000,
        currentGPA: 3.5,
        classRank: 8
    }
];

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', class: classFilter = '' } = req.query;
        
        let filteredStudents = [...mockStudents];
        
        // Apply search filter
        if (search) {
            filteredStudents = filteredStudents.filter(student => 
                student.firstName.toLowerCase().includes(search.toLowerCase()) ||
                student.lastName.toLowerCase().includes(search.toLowerCase()) ||
                student.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
                student.email.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Apply class filter
        if (classFilter) {
            filteredStudents = filteredStudents.filter(student => 
                student.class.toLowerCase().includes(classFilter.toLowerCase())
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                students: paginatedStudents,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredStudents.length / limit),
                    total: filteredStudents.length
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
// @desc    Get student by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const student = mockStudents.find(s => s._id === req.params.id);
        
        if (!student) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
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
// @desc    Add new student
// @access  Private (Admin)
router.post('/', auth, authorize('admin'), async (req, res) => {
    try {
        const newStudent = {
            _id: `student${mockStudents.length + 1}`,
            admissionNumber: `GHS${String(mockStudents.length + 1).padStart(3, '0')}`,
            ...req.body,
            admissionDate: new Date().toISOString(),
            isActive: true,
            feeBalance: 0,
            currentGPA: 0,
            classRank: 0
        };
        
        mockStudents.push(newStudent);
        
        res.status(201).json({
            success: true,
            message: 'Student added successfully',
            data: { student: newStudent }
        });
        
    } catch (error) {
        console.error('Add student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding student'
        });
    }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const studentIndex = mockStudents.findIndex(s => s._id === req.params.id);
        
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        mockStudents[studentIndex] = {
            ...mockStudents[studentIndex],
            ...req.body
        };
        
        res.json({
            success: true,
            message: 'Student updated successfully',
            data: { student: mockStudents[studentIndex] }
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
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
    try {
        const studentIndex = mockStudents.findIndex(s => s._id === req.params.id);
        
        if (studentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }
        
        mockStudents.splice(studentIndex, 1);
        
        res.json({
            success: true,
            message: 'Student deleted successfully'
        });
        
    } catch (error) {
        console.error('Delete student error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting student'
        });
    }
});

// @route   GET /api/students/class/:className
// @desc    Get students by class
// @access  Private
router.get('/class/:className', auth, async (req, res) => {
    try {
        const className = decodeURIComponent(req.params.className);
        const classStudents = mockStudents.filter(student => 
            student.class.toLowerCase() === className.toLowerCase()
        );
        
        res.json({
            success: true,
            data: { students: classStudents }
        });
        
    } catch (error) {
        console.error('Get class students error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class students'
        });
    }
});

module.exports = router;