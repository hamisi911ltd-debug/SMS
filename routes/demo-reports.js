const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock report data
const mockReportData = {
    academic: {
        classPerformance: [
            { class: 'Form 1 North', students: 38, averageGrade: 'B', passRate: 89.5 },
            { class: 'Form 1 South', students: 35, averageGrade: 'B+', passRate: 91.4 },
            { class: 'Form 2 East', students: 37, averageGrade: 'B', passRate: 86.5 },
            { class: 'Form 2 West', students: 39, averageGrade: 'B+', passRate: 92.3 },
            { class: 'Form 3 East', students: 32, averageGrade: 'B-', passRate: 84.4 },
            { class: 'Form 3 West', students: 34, averageGrade: 'B', passRate: 88.2 },
            { class: 'Form 4 North', students: 28, averageGrade: 'B+', passRate: 92.9 },
            { class: 'Form 4 South', students: 30, averageGrade: 'A-', passRate: 96.7 }
        ],
        subjectPerformance: [
            { subject: 'Mathematics', averageScore: 76.5, passRate: 85.2, difficulty: 'Medium' },
            { subject: 'English', averageScore: 78.2, passRate: 88.7, difficulty: 'Easy' },
            { subject: 'Physics', averageScore: 72.8, passRate: 79.3, difficulty: 'Hard' },
            { subject: 'Chemistry', averageScore: 74.1, passRate: 82.1, difficulty: 'Medium' },
            { subject: 'Biology', averageScore: 79.6, passRate: 90.4, difficulty: 'Easy' },
            { subject: 'History', averageScore: 77.3, passRate: 86.8, difficulty: 'Easy' },
            { subject: 'Geography', averageScore: 75.9, passRate: 84.6, difficulty: 'Medium' },
            { subject: 'Kiswahili', averageScore: 80.1, passRate: 91.2, difficulty: 'Easy' }
        ]
    },
    attendance: {
        monthly: [
            { month: 'January', rate: 94.2, present: 4235, absent: 265 },
            { month: 'February', rate: 92.8, present: 3948, absent: 302 },
            { month: 'March', rate: 93.5, present: 4207, absent: 293 },
            { month: 'April', rate: 91.7, present: 4128, absent: 372 },
            { month: 'May', rate: 93.1, present: 4189, absent: 311 }
        ],
        byClass: [
            { class: 'Form 1 North', rate: 95.2, avgDaily: 36 },
            { class: 'Form 1 South', rate: 93.8, avgDaily: 33 },
            { class: 'Form 2 East', rate: 92.4, avgDaily: 34 },
            { class: 'Form 2 West', rate: 94.6, avgDaily: 37 },
            { class: 'Form 3 East', rate: 90.8, avgDaily: 29 },
            { class: 'Form 3 West', rate: 92.1, avgDaily: 31 },
            { class: 'Form 4 North', rate: 96.4, avgDaily: 27 },
            { class: 'Form 4 South', rate: 97.2, avgDaily: 29 }
        ]
    },
    financial: {
        feeCollection: [
            { month: 'January', collected: 3850000, expected: 4200000, rate: 91.7 },
            { month: 'February', collected: 4120000, expected: 4200000, rate: 98.1 },
            { month: 'March', collected: 3950000, expected: 4200000, rate: 94.0 },
            { month: 'April', collected: 4050000, expected: 4200000, rate: 96.4 },
            { month: 'May', collected: 3890000, expected: 4200000, rate: 92.6 }
        ],
        outstanding: [
            { class: 'Form 1', students: 73, totalOwed: 1250000, avgOwed: 17123 },
            { class: 'Form 2', students: 76, totalOwed: 980000, avgOwed: 12895 },
            { class: 'Form 3', students: 66, totalOwed: 1150000, avgOwed: 17424 },
            { class: 'Form 4', students: 58, totalOwed: 750000, avgOwed: 12931 }
        ]
    },
    enrollment: {
        byGender: [
            { category: 'Male', count: 235, percentage: 52.2 },
            { category: 'Female', count: 215, percentage: 47.8 }
        ],
        byClass: [
            { class: 'Form 1', male: 38, female: 35, total: 73 },
            { class: 'Form 2', male: 40, female: 36, total: 76 },
            { class: 'Form 3', male: 34, female: 32, total: 66 },
            { class: 'Form 4', male: 30, female: 28, total: 58 }
        ],
        trends: [
            { year: 2020, enrollment: 420 },
            { year: 2021, enrollment: 435 },
            { year: 2022, enrollment: 442 },
            { year: 2023, enrollment: 448 },
            { year: 2024, enrollment: 450 }
        ]
    }
};

// @route   GET /api/reports/academic
// @desc    Get academic performance reports
// @access  Private (Admin, Teacher)
router.get('/academic', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { type = 'overview', class: classFilter, subject } = req.query;
        
        let reportData = {};
        
        if (type === 'overview') {
            reportData = {
                classPerformance: mockReportData.academic.classPerformance,
                subjectPerformance: mockReportData.academic.subjectPerformance,
                summary: {
                    totalStudents: 273,
                    overallPassRate: 88.7,
                    averageGrade: 'B+',
                    topPerformingClass: 'Form 4 South',
                    topPerformingSubject: 'Kiswahili'
                }
            };
        } else if (type === 'class' && classFilter) {
            const classData = mockReportData.academic.classPerformance.find(c => 
                c.class.toLowerCase() === classFilter.toLowerCase()
            );
            reportData = { classData };
        } else if (type === 'subject' && subject) {
            const subjectData = mockReportData.academic.subjectPerformance.find(s => 
                s.subject.toLowerCase() === subject.toLowerCase()
            );
            reportData = { subjectData };
        }
        
        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Get academic report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching academic report'
        });
    }
});

// @route   GET /api/reports/attendance
// @desc    Get attendance reports
// @access  Private (Admin, Teacher)
router.get('/attendance', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { type = 'overview', period = 'monthly' } = req.query;
        
        let reportData = {};
        
        if (type === 'overview') {
            reportData = {
                monthly: mockReportData.attendance.monthly,
                byClass: mockReportData.attendance.byClass,
                summary: {
                    currentRate: 93.1,
                    trend: 'stable',
                    bestMonth: 'January',
                    worstMonth: 'April',
                    totalDaysTracked: 110
                }
            };
        }
        
        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Get attendance report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attendance report'
        });
    }
});

// @route   GET /api/reports/financial
// @desc    Get financial reports
// @access  Private (Admin)
router.get('/financial', auth, authorize('admin'), async (req, res) => {
    try {
        const { type = 'overview' } = req.query;
        
        let reportData = {};
        
        if (type === 'overview') {
            const totalCollected = mockReportData.financial.feeCollection.reduce((sum, month) => sum + month.collected, 0);
            const totalExpected = mockReportData.financial.feeCollection.reduce((sum, month) => sum + month.expected, 0);
            const totalOutstanding = mockReportData.financial.outstanding.reduce((sum, cls) => sum + cls.totalOwed, 0);
            
            reportData = {
                feeCollection: mockReportData.financial.feeCollection,
                outstanding: mockReportData.financial.outstanding,
                summary: {
                    totalCollected,
                    totalExpected,
                    totalOutstanding,
                    collectionRate: ((totalCollected / totalExpected) * 100).toFixed(2),
                    studentsWithBalance: mockReportData.financial.outstanding.reduce((sum, cls) => sum + cls.students, 0)
                }
            };
        }
        
        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Get financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial report'
        });
    }
});

// @route   GET /api/reports/enrollment
// @desc    Get enrollment reports
// @access  Private (Admin)
router.get('/enrollment', auth, authorize('admin'), async (req, res) => {
    try {
        reportData = {
            byGender: mockReportData.enrollment.byGender,
            byClass: mockReportData.enrollment.byClass,
            trends: mockReportData.enrollment.trends,
            summary: {
                totalStudents: 450,
                malePercentage: 52.2,
                femalePercentage: 47.8,
                growthRate: 0.4, // percentage growth from last year
                capacityUtilization: 90.0 // assuming 500 total capacity
            }
        };
        
        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Get enrollment report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching enrollment report'
        });
    }
});

// @route   GET /api/reports/summary
// @desc    Get executive summary report
// @access  Private (Admin)
router.get('/summary', auth, authorize('admin'), async (req, res) => {
    try {
        const reportData = {
            academic: {
                overallPassRate: 88.7,
                averageGrade: 'B+',
                topPerformingClass: 'Form 4 South',
                improvementNeeded: 'Form 3 East'
            },
            attendance: {
                currentRate: 93.1,
                trend: 'stable',
                classesAbove95: 2,
                classesBelow90: 1
            },
            financial: {
                collectionRate: 94.6,
                totalCollected: 19860000,
                totalOutstanding: 4130000,
                studentsWithBalance: 273
            },
            enrollment: {
                totalStudents: 450,
                capacityUtilization: 90.0,
                genderBalance: 'Balanced',
                yearOverYearGrowth: 0.4
            },
            alerts: [
                {
                    type: 'warning',
                    category: 'Academic',
                    message: 'Form 3 East performance below school average',
                    priority: 'medium'
                },
                {
                    type: 'info',
                    category: 'Financial',
                    message: '273 students have outstanding fee balances',
                    priority: 'low'
                },
                {
                    type: 'success',
                    category: 'Attendance',
                    message: 'Overall attendance rate above target (93.1%)',
                    priority: 'low'
                }
            ]
        };
        
        res.json({
            success: true,
            data: reportData
        });
    } catch (error) {
        console.error('Get summary report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching summary report'
        });
    }
});

// @route   POST /api/reports/generate
// @desc    Generate custom report
// @access  Private (Admin)
router.post('/generate', auth, authorize('admin'), async (req, res) => {
    try {
        const { reportType, parameters, format = 'json' } = req.body;
        
        // Mock report generation
        const reportId = `RPT${Date.now()}`;
        const generatedReport = {
            id: reportId,
            type: reportType,
            parameters,
            format,
            status: 'completed',
            generatedAt: new Date(),
            downloadUrl: `/api/reports/download/${reportId}`,
            size: '2.5MB'
        };
        
        res.status(201).json({
            success: true,
            message: 'Report generated successfully',
            data: { report: generatedReport }
        });
    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report'
        });
    }
});

// @route   GET /api/reports/templates
// @desc    Get available report templates
// @access  Private (Admin, Teacher)
router.get('/templates', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const templates = [
            {
                id: 'academic_performance',
                name: 'Academic Performance Report',
                description: 'Detailed analysis of student academic performance by class and subject',
                category: 'Academic',
                parameters: ['class', 'subject', 'term', 'year']
            },
            {
                id: 'attendance_summary',
                name: 'Attendance Summary Report',
                description: 'Comprehensive attendance tracking and analysis',
                category: 'Attendance',
                parameters: ['class', 'dateRange', 'includeReasons']
            },
            {
                id: 'fee_collection',
                name: 'Fee Collection Report',
                description: 'Financial overview of fee collection and outstanding balances',
                category: 'Financial',
                parameters: ['term', 'class', 'paymentMethod']
            },
            {
                id: 'student_progress',
                name: 'Individual Student Progress Report',
                description: 'Detailed progress report for individual students',
                category: 'Academic',
                parameters: ['studentId', 'subjects', 'includeAttendance']
            }
        ];
        
        res.json({
            success: true,
            data: { templates }
        });
    } catch (error) {
        console.error('Get report templates error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching report templates'
        });
    }
});

module.exports = router;