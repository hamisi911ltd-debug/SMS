const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock attendance data
const mockAttendance = [
    {
        _id: 'att1',
        studentId: 'student1',
        studentName: 'Jane Wanjiku',
        admissionNumber: 'GHS001',
        class: 'Form 2 East',
        date: '2024-05-20',
        status: 'Present',
        timeIn: '07:45',
        timeOut: '16:30',
        remarks: ''
    },
    {
        _id: 'att2',
        studentId: 'student2',
        studentName: 'John Kamau',
        admissionNumber: 'GHS002',
        class: 'Form 3 West',
        date: '2024-05-20',
        status: 'Present',
        timeIn: '07:50',
        timeOut: '16:25',
        remarks: ''
    },
    {
        _id: 'att3',
        studentId: 'student3',
        studentName: 'Grace Achieng',
        admissionNumber: 'GHS003',
        class: 'Form 1 North',
        date: '2024-05-20',
        status: 'Absent',
        timeIn: '',
        timeOut: '',
        remarks: 'Sick leave'
    },
    {
        _id: 'att4',
        studentId: 'student1',
        studentName: 'Jane Wanjiku',
        admissionNumber: 'GHS001',
        class: 'Form 2 East',
        date: '2024-05-21',
        status: 'Late',
        timeIn: '08:15',
        timeOut: '16:30',
        remarks: 'Traffic jam'
    }
];

const mockAttendanceStats = {
    today: {
        totalStudents: 450,
        present: 425,
        absent: 15,
        late: 10,
        attendanceRate: 94.4
    },
    thisWeek: {
        averageAttendance: 92.8,
        totalDays: 5,
        bestDay: { day: 'Monday', rate: 96.2 },
        worstDay: { day: 'Friday', rate: 89.1 }
    },
    thisMonth: {
        averageAttendance: 91.5,
        totalDays: 22,
        trends: [
            { week: 'Week 1', rate: 93.2 },
            { week: 'Week 2', rate: 91.8 },
            { week: 'Week 3', rate: 90.5 },
            { week: 'Week 4', rate: 90.5 }
        ]
    }
};

// @route   GET /api/attendance
// @desc    Get attendance records
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const { date, class: classFilter, status, studentId } = req.query;
        let filteredAttendance = [...mockAttendance];
        
        // Apply filters
        if (date) {
            filteredAttendance = filteredAttendance.filter(record => 
                record.date === date
            );
        }
        
        if (classFilter) {
            filteredAttendance = filteredAttendance.filter(record => 
                record.class.toLowerCase().includes(classFilter.toLowerCase())
            );
        }
        
        if (status) {
            filteredAttendance = filteredAttendance.filter(record => 
                record.status.toLowerCase() === status.toLowerCase()
            );
        }
        
        if (studentId) {
            filteredAttendance = filteredAttendance.filter(record => 
                record.studentId === studentId
            );
        }
        
        res.json({
            success: true,
            data: { attendance: filteredAttendance }
        });
    } catch (error) {
        console.error('Get attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance records'
        });
    }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Teacher, Admin)
router.post('/', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const attendanceRecords = req.body.records || [req.body];
        const newRecords = [];
        
        attendanceRecords.forEach((record, index) => {
            const newRecord = {
                _id: `att${mockAttendance.length + index + 1}`,
                date: new Date().toISOString().split('T')[0],
                ...record
            };
            
            mockAttendance.push(newRecord);
            newRecords.push(newRecord);
        });
        
        res.status(201).json({
            success: true,
            message: 'Attendance marked successfully',
            data: { records: newRecords }
        });
    } catch (error) {
        console.error('Mark attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking attendance'
        });
    }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teacher, Admin)
router.put('/:id', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const recordIndex = mockAttendance.findIndex(record => record._id === req.params.id);
        
        if (recordIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Attendance record not found'
            });
        }
        
        mockAttendance[recordIndex] = {
            ...mockAttendance[recordIndex],
            ...req.body
        };
        
        res.json({
            success: true,
            message: 'Attendance updated successfully',
            data: { record: mockAttendance[recordIndex] }
        });
    } catch (error) {
        console.error('Update attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating attendance'
        });
    }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: mockAttendanceStats
        });
    } catch (error) {
        console.error('Get attendance stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance statistics'
        });
    }
});

// @route   GET /api/attendance/student/:id
// @desc    Get student attendance history
// @access  Private
router.get('/student/:id', auth, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let studentAttendance = mockAttendance.filter(record => 
            record.studentId === req.params.id
        );
        
        // Apply date filters if provided
        if (startDate) {
            studentAttendance = studentAttendance.filter(record => 
                record.date >= startDate
            );
        }
        
        if (endDate) {
            studentAttendance = studentAttendance.filter(record => 
                record.date <= endDate
            );
        }
        
        // Calculate statistics
        const totalDays = studentAttendance.length;
        const presentDays = studentAttendance.filter(record => 
            record.status === 'Present' || record.status === 'Late'
        ).length;
        const absentDays = studentAttendance.filter(record => 
            record.status === 'Absent'
        ).length;
        const lateDays = studentAttendance.filter(record => 
            record.status === 'Late'
        ).length;
        
        const attendanceRate = totalDays > 0 ? (presentDays / totalDays * 100).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                records: studentAttendance,
                statistics: {
                    totalDays,
                    presentDays,
                    absentDays,
                    lateDays,
                    attendanceRate: parseFloat(attendanceRate)
                }
            }
        });
    } catch (error) {
        console.error('Get student attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student attendance'
        });
    }
});

// @route   GET /api/attendance/class/:className
// @desc    Get class attendance for a specific date
// @access  Private (Teacher, Admin)
router.get('/class/:className', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        const className = decodeURIComponent(req.params.className);
        
        const classAttendance = mockAttendance.filter(record => 
            record.class.toLowerCase() === className.toLowerCase() && 
            record.date === date
        );
        
        // Calculate class statistics
        const totalStudents = classAttendance.length;
        const present = classAttendance.filter(record => record.status === 'Present').length;
        const absent = classAttendance.filter(record => record.status === 'Absent').length;
        const late = classAttendance.filter(record => record.status === 'Late').length;
        const attendanceRate = totalStudents > 0 ? ((present + late) / totalStudents * 100).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                records: classAttendance,
                statistics: {
                    totalStudents,
                    present,
                    absent,
                    late,
                    attendanceRate: parseFloat(attendanceRate)
                },
                date,
                className
            }
        });
    } catch (error) {
        console.error('Get class attendance error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching class attendance'
        });
    }
});

// @route   GET /api/attendance/reports/daily
// @desc    Get daily attendance report
// @access  Private (Admin)
router.get('/reports/daily', auth, authorize('admin'), async (req, res) => {
    try {
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        const dailyAttendance = mockAttendance.filter(record => record.date === date);
        
        // Group by class
        const classSummary = {};
        dailyAttendance.forEach(record => {
            if (!classSummary[record.class]) {
                classSummary[record.class] = {
                    className: record.class,
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0
                };
            }
            
            classSummary[record.class].total++;
            if (record.status === 'Present') classSummary[record.class].present++;
            if (record.status === 'Absent') classSummary[record.class].absent++;
            if (record.status === 'Late') classSummary[record.class].late++;
        });
        
        // Calculate rates
        Object.values(classSummary).forEach(classData => {
            classData.attendanceRate = classData.total > 0 ? 
                ((classData.present + classData.late) / classData.total * 100).toFixed(2) : 0;
        });
        
        res.json({
            success: true,
            data: {
                date,
                summary: Object.values(classSummary),
                totalRecords: dailyAttendance.length
            }
        });
    } catch (error) {
        console.error('Get daily attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching daily attendance report'
        });
    }
});

module.exports = router;