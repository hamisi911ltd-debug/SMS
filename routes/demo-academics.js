const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock academic data
const mockSubjects = [
    { _id: 'sub1', name: 'Mathematics', code: 'MATH', department: 'Sciences' },
    { _id: 'sub2', name: 'English', code: 'ENG', department: 'Languages' },
    { _id: 'sub3', name: 'Physics', code: 'PHY', department: 'Sciences' },
    { _id: 'sub4', name: 'Chemistry', code: 'CHEM', department: 'Sciences' },
    { _id: 'sub5', name: 'Biology', code: 'BIO', department: 'Sciences' },
    { _id: 'sub6', name: 'History', code: 'HIST', department: 'Humanities' },
    { _id: 'sub7', name: 'Geography', code: 'GEO', department: 'Humanities' },
    { _id: 'sub8', name: 'Kiswahili', code: 'KIS', department: 'Languages' }
];

const mockClasses = [
    { _id: 'class1', name: 'Form 1 North', level: 'Form 1', stream: 'North', capacity: 40, currentStudents: 38 },
    { _id: 'class2', name: 'Form 1 South', level: 'Form 1', stream: 'South', capacity: 40, currentStudents: 35 },
    { _id: 'class3', name: 'Form 2 East', level: 'Form 2', stream: 'East', capacity: 40, currentStudents: 37 },
    { _id: 'class4', name: 'Form 2 West', level: 'Form 2', stream: 'West', capacity: 40, currentStudents: 39 },
    { _id: 'class5', name: 'Form 3 East', level: 'Form 3', stream: 'East', capacity: 35, currentStudents: 32 },
    { _id: 'class6', name: 'Form 3 West', level: 'Form 3', stream: 'West', capacity: 35, currentStudents: 34 },
    { _id: 'class7', name: 'Form 4 North', level: 'Form 4', stream: 'North', capacity: 30, currentStudents: 28 },
    { _id: 'class8', name: 'Form 4 South', level: 'Form 4', stream: 'South', capacity: 30, currentStudents: 30 }
];

const mockExams = [
    {
        _id: 'exam1',
        name: 'Mid-Term Exam - Term 2',
        type: 'Mid-Term',
        term: 'Term 2',
        year: 2024,
        startDate: '2024-05-15',
        endDate: '2024-05-22',
        status: 'Completed',
        classes: ['Form 1 North', 'Form 1 South', 'Form 2 East', 'Form 2 West']
    },
    {
        _id: 'exam2',
        name: 'End Term Exam - Term 2',
        type: 'End Term',
        term: 'Term 2',
        year: 2024,
        startDate: '2024-07-20',
        endDate: '2024-07-30',
        status: 'Upcoming',
        classes: ['Form 3 East', 'Form 3 West', 'Form 4 North', 'Form 4 South']
    }
];

const mockGrades = [
    {
        _id: 'grade1',
        studentId: 'student1',
        studentName: 'Jane Wanjiku',
        class: 'Form 2 East',
        exam: 'Mid-Term Exam - Term 2',
        subjects: [
            { subject: 'Mathematics', score: 78, grade: 'B+', points: 8 },
            { subject: 'English', score: 82, grade: 'A-', points: 9 },
            { subject: 'Physics', score: 75, grade: 'B', points: 7 },
            { subject: 'Chemistry', score: 80, grade: 'B+', points: 8 },
            { subject: 'Biology', score: 85, grade: 'A-', points: 9 }
        ],
        totalPoints: 41,
        meanGrade: 'B+',
        position: 15
    },
    {
        _id: 'grade2',
        studentId: 'student2',
        studentName: 'John Kamau',
        class: 'Form 3 West',
        exam: 'Mid-Term Exam - Term 2',
        subjects: [
            { subject: 'Mathematics', score: 88, grade: 'A-', points: 9 },
            { subject: 'English', score: 85, grade: 'A-', points: 9 },
            { subject: 'Physics', score: 90, grade: 'A', points: 10 },
            { subject: 'Chemistry', score: 87, grade: 'A-', points: 9 },
            { subject: 'Biology', score: 89, grade: 'A-', points: 9 }
        ],
        totalPoints: 46,
        meanGrade: 'A-',
        position: 5
    }
];

// @route   GET /api/academics/subjects
// @desc    Get all subjects
// @access  Private
router.get('/subjects', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: { subjects: mockSubjects }
        });
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subjects'
        });
    }
});

// @route   GET /api/academics/classes
// @desc    Get all classes
// @access  Private
router.get('/classes', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: { classes: mockClasses }
        });
    } catch (error) {
        console.error('Get classes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching classes'
        });
    }
});

// @route   GET /api/academics/exams
// @desc    Get all exams
// @access  Private
router.get('/exams', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: { exams: mockExams }
        });
    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exams'
        });
    }
});

// @route   GET /api/academics/grades
// @desc    Get grades
// @access  Private
router.get('/grades', auth, async (req, res) => {
    try {
        const { class: classFilter, exam, student } = req.query;
        let filteredGrades = [...mockGrades];
        
        if (classFilter) {
            filteredGrades = filteredGrades.filter(grade => 
                grade.class.toLowerCase().includes(classFilter.toLowerCase())
            );
        }
        
        if (exam) {
            filteredGrades = filteredGrades.filter(grade => 
                grade.exam.toLowerCase().includes(exam.toLowerCase())
            );
        }
        
        if (student) {
            filteredGrades = filteredGrades.filter(grade => 
                grade.studentName.toLowerCase().includes(student.toLowerCase())
            );
        }
        
        res.json({
            success: true,
            data: { grades: filteredGrades }
        });
    } catch (error) {
        console.error('Get grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching grades'
        });
    }
});

// @route   POST /api/academics/subjects
// @desc    Add new subject
// @access  Private (Admin)
router.post('/subjects', auth, authorize('admin'), async (req, res) => {
    try {
        const newSubject = {
            _id: `sub${mockSubjects.length + 1}`,
            ...req.body
        };
        
        mockSubjects.push(newSubject);
        
        res.status(201).json({
            success: true,
            message: 'Subject added successfully',
            data: { subject: newSubject }
        });
    } catch (error) {
        console.error('Add subject error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding subject'
        });
    }
});

// @route   POST /api/academics/classes
// @desc    Add new class
// @access  Private (Admin)
router.post('/classes', auth, authorize('admin'), async (req, res) => {
    try {
        const newClass = {
            _id: `class${mockClasses.length + 1}`,
            currentStudents: 0,
            ...req.body
        };
        
        mockClasses.push(newClass);
        
        res.status(201).json({
            success: true,
            message: 'Class added successfully',
            data: { class: newClass }
        });
    } catch (error) {
        console.error('Add class error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding class'
        });
    }
});

// @route   POST /api/academics/exams
// @desc    Create new exam
// @access  Private (Admin, Teacher)
router.post('/exams', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const newExam = {
            _id: `exam${mockExams.length + 1}`,
            status: 'Upcoming',
            ...req.body
        };
        
        mockExams.push(newExam);
        
        res.status(201).json({
            success: true,
            message: 'Exam created successfully',
            data: { exam: newExam }
        });
    } catch (error) {
        console.error('Create exam error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating exam'
        });
    }
});

// @route   POST /api/academics/grades
// @desc    Submit grades
// @access  Private (Teacher, Admin)
router.post('/grades', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const newGrade = {
            _id: `grade${mockGrades.length + 1}`,
            ...req.body
        };
        
        mockGrades.push(newGrade);
        
        res.status(201).json({
            success: true,
            message: 'Grades submitted successfully',
            data: { grade: newGrade }
        });
    } catch (error) {
        console.error('Submit grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting grades'
        });
    }
});

// @route   GET /api/academics/student/:id/grades
// @desc    Get student grades
// @access  Private
router.get('/student/:id/grades', auth, async (req, res) => {
    try {
        const studentGrades = mockGrades.filter(grade => 
            grade.studentId === req.params.id
        );
        
        res.json({
            success: true,
            data: { grades: studentGrades }
        });
    } catch (error) {
        console.error('Get student grades error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student grades'
        });
    }
});

module.exports = router;