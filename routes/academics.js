const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/academics/subjects
// @desc    Get all subjects
// @access  Private
router.get('/subjects', auth, async (req, res) => {
    try {
        // Mock subjects data - replace with actual Subject model
        const subjects = [
            { _id: '1', name: 'Mathematics', code: 'MATH', department: 'Sciences' },
            { _id: '2', name: 'English', code: 'ENG', department: 'Languages' },
            { _id: '3', name: 'Kiswahili', code: 'KIS', department: 'Languages' },
            { _id: '4', name: 'Biology', code: 'BIO', department: 'Sciences' },
            { _id: '5', name: 'Chemistry', code: 'CHEM', department: 'Sciences' },
            { _id: '6', name: 'Physics', code: 'PHY', department: 'Sciences' },
            { _id: '7', name: 'History', code: 'HIST', department: 'Humanities' },
            { _id: '8', name: 'Geography', code: 'GEO', department: 'Humanities' },
            { _id: '9', name: 'Business Studies', code: 'BUS', department: 'Commerce' },
            { _id: '10', name: 'Computer Studies', code: 'COMP', department: 'Sciences' }
        ];

        res.json({
            success: true,
            data: { subjects }
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
        // Mock classes data
        const classes = [
            { _id: '1', level: 1, stream: 'East', students: 35, classTeacher: 'John Kamau' },
            { _id: '2', level: 1, stream: 'West', students: 33, classTeacher: 'Mary Njeri' },
            { _id: '3', level: 1, stream: 'North', students: 34, classTeacher: 'Peter Mwangi' },
            { _id: '4', level: 1, stream: 'South', students: 32, classTeacher: 'Grace Wanjiku' },
            { _id: '5', level: 2, stream: 'East', students: 30, classTeacher: 'James Kiprotich' },
            { _id: '6', level: 2, stream: 'West', students: 31, classTeacher: 'Susan Achieng' },
            { _id: '7', level: 2, stream: 'North', students: 29, classTeacher: 'David Mutua' },
            { _id: '8', level: 2, stream: 'South', students: 33, classTeacher: 'Faith Nyambura' }
        ];

        res.json({
            success: true,
            data: { classes }
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
// @desc    Get exam schedules
// @access  Private
router.get('/exams', auth, async (req, res) => {
    try {
        // Mock exam data
        const exams = [
            {
                _id: '1',
                name: 'Mid-Term Examination',
                startDate: '2026-05-15',
                endDate: '2026-05-22',
                status: 'upcoming',
                classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4']
            },
            {
                _id: '2',
                name: 'End of Term Examination',
                startDate: '2026-07-20',
                endDate: '2026-07-30',
                status: 'scheduled',
                classes: ['Form 1', 'Form 2', 'Form 3', 'Form 4']
            }
        ];

        res.json({
            success: true,
            data: { exams }
        });

    } catch (error) {
        console.error('Get exams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching exams'
        });
    }
});

// @route   GET /api/academics/timetable
// @desc    Get class timetables
// @access  Private
router.get('/timetable', auth, async (req, res) => {
    try {
        const { class: classLevel, stream } = req.query;
        
        // Mock timetable data
        const timetable = {
            class: `Form ${classLevel} ${stream}`,
            schedule: {
                Monday: [
                    { time: '8:00-8:40', subject: 'Mathematics', teacher: 'John Kamau' },
                    { time: '8:40-9:20', subject: 'English', teacher: 'Mary Njeri' },
                    { time: '9:20-10:00', subject: 'Kiswahili', teacher: 'Peter Mwangi' },
                    { time: '10:00-10:20', subject: 'Break', teacher: '' },
                    { time: '10:20-11:00', subject: 'Biology', teacher: 'Grace Wanjiku' },
                    { time: '11:00-11:40', subject: 'Chemistry', teacher: 'James Kiprotich' },
                    { time: '11:40-12:20', subject: 'Physics', teacher: 'Susan Achieng' }
                ],
                Tuesday: [
                    { time: '8:00-8:40', subject: 'History', teacher: 'David Mutua' },
                    { time: '8:40-9:20', subject: 'Geography', teacher: 'Faith Nyambura' },
                    { time: '9:20-10:00', subject: 'Business Studies', teacher: 'John Kamau' },
                    { time: '10:00-10:20', subject: 'Break', teacher: '' },
                    { time: '10:20-11:00', subject: 'Computer Studies', teacher: 'Mary Njeri' },
                    { time: '11:00-11:40', subject: 'Mathematics', teacher: 'Peter Mwangi' },
                    { time: '11:40-12:20', subject: 'English', teacher: 'Grace Wanjiku' }
                ]
            }
        };

        res.json({
            success: true,
            data: { timetable }
        });

    } catch (error) {
        console.error('Get timetable error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching timetable'
        });
    }
});

// @route   POST /api/academics/grades
// @desc    Submit grades
// @access  Private (Teacher, Admin)
router.post('/grades', auth, authorize('teacher', 'admin'), [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('subjectId').notEmpty().withMessage('Subject ID is required'),
    body('examType').notEmpty().withMessage('Exam type is required'),
    body('marks').isNumeric().withMessage('Marks must be numeric')
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

        const { studentId, subjectId, examType, marks, maxMarks = 100 } = req.body;

        // Mock grade submission - replace with actual Grade model
        const grade = {
            _id: Date.now().toString(),
            student: studentId,
            subject: subjectId,
            examType,
            marks,
            maxMarks,
            percentage: (marks / maxMarks) * 100,
            grade: calculateGrade(marks, maxMarks),
            teacher: req.user._id,
            submittedAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'Grade submitted successfully',
            data: { grade }
        });

    } catch (error) {
        console.error('Submit grade error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting grade'
        });
    }
});

// @route   GET /api/academics/results/:studentId
// @desc    Get student results
// @access  Private
router.get('/results/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { term, year } = req.query;

        // Check permissions
        if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Mock results data
        const results = [
            { subject: 'Mathematics', marks: 85, maxMarks: 100, grade: 'A-', position: 3 },
            { subject: 'English', marks: 78, maxMarks: 100, grade: 'B+', position: 5 },
            { subject: 'Kiswahili', marks: 82, maxMarks: 100, grade: 'A-', position: 2 },
            { subject: 'Biology', marks: 88, maxMarks: 100, grade: 'A', position: 1 },
            { subject: 'Chemistry', marks: 75, maxMarks: 100, grade: 'B+', position: 8 },
            { subject: 'Physics', marks: 80, maxMarks: 100, grade: 'A-', position: 4 }
        ];

        const summary = {
            totalMarks: results.reduce((sum, r) => sum + r.marks, 0),
            totalMaxMarks: results.reduce((sum, r) => sum + r.maxMarks, 0),
            averagePercentage: results.reduce((sum, r) => sum + (r.marks / r.maxMarks * 100), 0) / results.length,
            overallGrade: 'A-',
            classPosition: 3,
            streamPosition: 2
        };

        res.json({
            success: true,
            data: { results, summary }
        });

    } catch (error) {
        console.error('Get results error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching results'
        });
    }
});

// Helper function to calculate grade
function calculateGrade(marks, maxMarks) {
    const percentage = (marks / maxMarks) * 100;
    
    if (percentage >= 80) return 'A';
    if (percentage >= 75) return 'A-';
    if (percentage >= 70) return 'B+';
    if (percentage >= 65) return 'B';
    if (percentage >= 60) return 'B-';
    if (percentage >= 55) return 'C+';
    if (percentage >= 50) return 'C';
    if (percentage >= 45) return 'C-';
    if (percentage >= 40) return 'D+';
    if (percentage >= 35) return 'D';
    if (percentage >= 30) return 'D-';
    return 'E';
}

module.exports = router;