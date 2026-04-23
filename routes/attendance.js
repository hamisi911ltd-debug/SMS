const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/attendance/today
// @desc    Get today's attendance
// @access  Private (Admin, Teacher)
router.get('/today', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { class: classLevel, stream } = req.query;
        const today = new Date().toISOString().split('T')[0];

        // Mock attendance data
        const attendance = [
            {
                student: {
                    _id: '1',
                    name: 'Jane Wanjiku',
                    admissionNumber: 'ADM/2024/1E001'
                },
                status: 'present',
                timeIn: '07:45',
                remarks: ''
            },
            {
                student: {
                    _id: '2',
                    name: 'John Mwangi',
                    admissionNumber: 'ADM/2024/1E002'
                },
                status: 'absent',
                timeIn: null,
                remarks: 'Sick'
            },
            {
                student: {
                    _id: '3',
                    name: 'Mary Akinyi',
                    admissionNumber: 'ADM/2024/1E003'
                },
                status: 'late',
                timeIn: '08:15',
                remarks: 'Transport delay'
            }
        ];

        const summary = {
            totalStudents: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length,
            attendanceRate: (attendance.filter(a => a.status === 'present' || a.status === 'late').length / attendance.length * 100).toFixed(1)
        };

        res.json({
            success: true,
            data: { attendance, summary, date: today }
        });

    } catch (error) {
        console.error('Get today attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching today\'s attendance'
        });
    }
});

// @route   POST /api/attendance/mark
// @desc    Mark attendance
// @access  Private (Admin, Teacher)
router.post('/mark', auth, authorize('admin', 'teacher'), [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('class').isNumeric().withMessage('Class level is required'),
    body('stream').notEmpty().withMessage('Stream is required'),
    body('attendance').isArray().withMessage('Attendance data must be an array')
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

        const { date, class: classLevel, stream, attendance } = req.body;

        // Mock attendance marking
        const attendanceRecord = {
            _id: Date.now().toString(),
            date,
            class: classLevel,
            stream,
            attendance,
            markedBy: req.user._id,
            markedAt: new Date()
        };

        // Calculate summary
        const summary = {
            totalStudents: attendance.length,
            present: attendance.filter(a => a.status === 'present').length,
            absent: attendance.filter(a => a.status === 'absent').length,
            late: attendance.filter(a => a.status === 'late').length
        };

        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: { attendanceRecord, summary }
        });

    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
});

// @route   GET /api/attendance/student/:studentId
// @desc    Get student attendance history
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, month, year } = req.query;

        // Check permissions
        if (req.user.role === 'student' && req.user._id.toString() !== studentId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Mock student attendance history
        const attendanceHistory = [
            { date: '2026-04-23', status: 'present', timeIn: '07:45', remarks: '' },
            { date: '2026-04-22', status: 'present', timeIn: '07:50', remarks: '' },
            { date: '2026-04-21', status: 'late', timeIn: '08:10', remarks: 'Transport delay' },
            { date: '2026-04-20', status: 'present', timeIn: '07:40', remarks: '' },
            { date: '2026-04-19', status: 'absent', timeIn: null, remarks: 'Sick' },
            { date: '2026-04-18', status: 'present', timeIn: '07:55', remarks: '' },
            { date: '2026-04-17', status: 'present', timeIn: '07:45', remarks: '' }
        ];

        const summary = {
            totalDays: attendanceHistory.length,
            presentDays: attendanceHistory.filter(a => a.status === 'present').length,
            absentDays: attendanceHistory.filter(a => a.status === 'absent').length,
            lateDays: attendanceHistory.filter(a => a.status === 'late').length,
            attendanceRate: ((attendanceHistory.filter(a => a.status === 'present' || a.status === 'late').length / attendanceHistory.length) * 100).toFixed(1)
        };

        res.json({
            success: true,
            data: { attendanceHistory, summary }
        });

    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student attendance'
        });
    }
});

// @route   GET /api/attendance/class/:class/:stream
// @desc    Get class attendance history
// @access  Private (Admin, Teacher)
router.get('/class/:class/:stream', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { class: classLevel, stream } = req.params;
        const { startDate, endDate, month, year } = req.query;

        // Mock class attendance data
        const classAttendance = [
            {
                date: '2026-04-23',
                totalStudents: 35,
                present: 33,
                absent: 1,
                late: 1,
                attendanceRate: 97.1
            },
            {
                date: '2026-04-22',
                totalStudents: 35,
                present: 34,
                absent: 1,
                late: 0,
                attendanceRate: 97.1
            },
            {
                date: '2026-04-21',
                totalStudents: 35,
                present: 32,
                absent: 2,
                late: 1,
                attendanceRate: 94.3
            }
        ];

        const summary = {
            averageAttendanceRate: (classAttendance.reduce((sum, day) => sum + day.attendanceRate, 0) / classAttendance.length).toFixed(1),
            totalDays: classAttendance.length,
            bestDay: classAttendance.reduce((best, day) => day.attendanceRate > best.attendanceRate ? day : best),
            worstDay: classAttendance.reduce((worst, day) => day.attendanceRate < worst.attendanceRate ? day : worst)
        };

        res.json({
            success: true,
            data: { classAttendance, summary }
        });

    } catch (error) {
        console.error('Get class attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class attendance'
        });
    }
});

// @route   GET /api/attendance/reports/summary
// @desc    Get attendance summary report
// @access  Private (Admin, Teacher)
router.get('/reports/summary', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { period = 'week', class: classLevel, stream } = req.query;

        // Mock attendance summary
        const summary = {
            schoolWide: {
                totalStudents: 500,
                averageAttendanceRate: 92.5,
                totalPresent: 463,
                totalAbsent: 25,
                totalLate: 12
            },
            byClass: [
                { class: 'Form 1 East', students: 35, attendanceRate: 94.3, present: 33, absent: 1, late: 1 },
                { class: 'Form 1 West', students: 33, attendanceRate: 93.9, present: 31, absent: 1, late: 1 },
                { class: 'Form 1 North', students: 34, attendanceRate: 91.2, present: 31, absent: 2, late: 1 },
                { class: 'Form 1 South', students: 32, attendanceRate: 96.9, present: 31, absent: 0, late: 1 }
            ],
            trends: [
                { date: '2026-04-23', rate: 94.2 },
                { date: '2026-04-22', rate: 93.8 },
                { date: '2026-04-21', rate: 91.5 },
                { date: '2026-04-20', rate: 92.1 },
                { date: '2026-04-19', rate: 90.8 }
            ],
            frequentAbsentees: [
                { student: 'Peter Kiprotich', class: 'Form 2 North', absentDays: 8, attendanceRate: 76.9 },
                { student: 'Mary Akinyi', class: 'Form 3 South', absentDays: 6, attendanceRate: 81.8 }
            ]
        };

        res.json({
            success: true,
            data: { summary }
        });

    } catch (error) {
        console.error('Get attendance summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance summary'
        });
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Admin, Teacher)
router.put('/:id', auth, authorize('admin', 'teacher'), [
    body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status'),
    body('remarks').optional().isString().withMessage('Remarks must be a string')
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
        const { status, timeIn, remarks } = req.body;

        // Mock attendance update
        const updatedAttendance = {
            _id: id,
            status,
            timeIn,
            remarks,
            updatedBy: req.user._id,
            updatedAt: new Date()
        };

        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: { attendance: updatedAttendance }
        });

    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating attendance'
        });
    }
});

module.exports = router;