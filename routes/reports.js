const express = require('express');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/reports/academic
// @desc    Get academic performance reports
// @access  Private (Admin, Teacher)
router.get('/academic', auth, authorize('admin', 'teacher'), async (req, res) => {
    try {
        const { class: classLevel, stream, subject, term, year } = req.query;

        // Mock academic report data
        const report = {
            summary: {
                totalStudents: 35,
                averageScore: 78.5,
                passRate: 91.4,
                topPerformer: {
                    name: 'Jane Wanjiku',
                    admissionNumber: 'ADM/2024/1E001',
                    averageScore: 92.3
                },
                subjectPerformance: [
                    { subject: 'Mathematics', average: 82.1, passRate: 94.3 },
                    { subject: 'English', average: 79.8, passRate: 88.6 },
                    { subject: 'Kiswahili', average: 81.5, passRate: 91.4 },
                    { subject: 'Biology', average: 76.2, passRate: 85.7 },
                    { subject: 'Chemistry', average: 74.8, passRate: 82.9 },
                    { subject: 'Physics', average: 77.3, passRate: 88.6 }
                ]
            },
            trends: [
                { term: 'Term 1', average: 75.2, passRate: 88.6 },
                { term: 'Term 2', average: 78.5, passRate: 91.4 }
            ],
            gradeDistribution: [
                { grade: 'A', count: 8, percentage: 22.9 },
                { grade: 'A-', count: 6, percentage: 17.1 },
                { grade: 'B+', count: 9, percentage: 25.7 },
                { grade: 'B', count: 7, percentage: 20.0 },
                { grade: 'B-', count: 3, percentage: 8.6 },
                { grade: 'C+', count: 2, percentage: 5.7 }
            ]
        };

        res.json({
            success: true,
            data: { report }
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
        const { class: classLevel, stream, period, startDate, endDate } = req.query;

        // Mock attendance report data
        const report = {
            summary: {
                totalStudents: 35,
                averageAttendanceRate: 92.5,
                totalSchoolDays: 20,
                perfectAttendanceStudents: 8,
                chronicAbsentees: 2
            },
            classComparison: [
                { class: 'Form 1 East', attendanceRate: 94.3, rank: 1 },
                { class: 'Form 1 West', attendanceRate: 93.9, rank: 2 },
                { class: 'Form 1 North', attendanceRate: 91.2, rank: 4 },
                { class: 'Form 1 South', attendanceRate: 96.9, rank: 1 }
            ],
            dailyTrends: [
                { date: '2026-04-23', rate: 94.2 },
                { date: '2026-04-22', rate: 93.8 },
                { date: '2026-04-21', rate: 91.5 },
                { date: '2026-04-20', rate: 92.1 },
                { date: '2026-04-19', rate: 90.8 }
            ],
            absenteeism: {
                frequentAbsentees: [
                    { 
                        student: 'Peter Kiprotich', 
                        admissionNumber: 'ADM/2024/2N015',
                        absentDays: 8, 
                        attendanceRate: 60.0,
                        reasons: ['Sick', 'Family emergency', 'Transport issues']
                    },
                    { 
                        student: 'Mary Akinyi', 
                        admissionNumber: 'ADM/2024/3S008',
                        absentDays: 6, 
                        attendanceRate: 70.0,
                        reasons: ['Sick', 'Personal reasons']
                    }
                ],
                reasonsBreakdown: [
                    { reason: 'Sick', count: 45, percentage: 52.3 },
                    { reason: 'Family emergency', count: 18, percentage: 20.9 },
                    { reason: 'Transport issues', count: 12, percentage: 14.0 },
                    { reason: 'Personal reasons', count: 11, percentage: 12.8 }
                ]
            }
        };

        res.json({
            success: true,
            data: { report }
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
// @access  Private (Admin, Accountant)
router.get('/financial', auth, authorize('admin', 'accountant'), async (req, res) => {
    try {
        const { term, year, class: classLevel, reportType } = req.query;

        // Mock financial report data
        const report = {
            summary: {
                totalExpectedRevenue: 15000000,
                totalCollected: 12500000,
                totalOutstanding: 2500000,
                collectionRate: 83.33,
                totalStudents: 500
            },
            collectionTrends: [
                { month: 'January', collected: 3200000, target: 3750000, rate: 85.3 },
                { month: 'February', collected: 2800000, target: 3750000, rate: 74.7 },
                { month: 'March', collected: 3500000, target: 3750000, rate: 93.3 },
                { month: 'April', collected: 3000000, target: 3750000, rate: 80.0 }
            ],
            paymentMethods: [
                { method: 'M-Pesa', amount: 8500000, percentage: 68.0, transactions: 1250 },
                { method: 'Bank Transfer', amount: 3200000, percentage: 25.6, transactions: 180 },
                { method: 'Cash', amount: 800000, percentage: 6.4, transactions: 95 }
            ],
            classWiseCollection: [
                { class: 'Form 1', expected: 3500000, collected: 3150000, rate: 90.0 },
                { class: 'Form 2', expected: 3720000, collected: 3100000, rate: 83.3 },
                { class: 'Form 3', expected: 3840000, collected: 3200000, rate: 83.3 },
                { class: 'Form 4', expected: 3940000, collected: 3050000, rate: 77.4 }
            ],
            defaulters: {
                total: 85,
                byAmount: [
                    { range: '0-25,000', count: 25, percentage: 29.4 },
                    { range: '25,001-50,000', count: 35, percentage: 41.2 },
                    { range: '50,001-75,000', count: 20, percentage: 23.5 },
                    { range: '75,001+', count: 5, percentage: 5.9 }
                ]
            }
        };

        res.json({
            success: true,
            data: { report }
        });

    } catch (error) {
        console.error('Get financial report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial report'
        });
    }
});

// @route   GET /api/reports/student/:studentId
// @desc    Get individual student report
// @access  Private
router.get('/student/:studentId', auth, async (req, res) => {
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

        // Mock student report data
        const report = {
            student: {
                name: 'Jane Wanjiku',
                admissionNumber: 'ADM/2024/1E001',
                class: 'Form 1 East',
                boardingStatus: 'day_scholar'
            },
            academic: {
                currentGPA: 3.8,
                classRank: 3,
                streamRank: 2,
                overallRank: 15,
                subjects: [
                    { name: 'Mathematics', marks: 85, grade: 'A-', position: 3 },
                    { name: 'English', marks: 78, grade: 'B+', position: 5 },
                    { name: 'Kiswahili', marks: 82, grade: 'A-', position: 2 },
                    { name: 'Biology', marks: 88, grade: 'A', position: 1 },
                    { name: 'Chemistry', marks: 75, grade: 'B+', position: 8 },
                    { name: 'Physics', marks: 80, grade: 'A-', position: 4 }
                ],
                trends: [
                    { term: 'Term 1', gpa: 3.6, rank: 5 },
                    { term: 'Term 2', gpa: 3.8, rank: 3 }
                ]
            },
            attendance: {
                rate: 94.5,
                totalDays: 20,
                presentDays: 19,
                absentDays: 1,
                lateDays: 2,
                trends: [
                    { week: 'Week 1', rate: 100 },
                    { week: 'Week 2', rate: 90 },
                    { week: 'Week 3', rate: 95 },
                    { week: 'Week 4', rate: 92 }
                ]
            },
            financial: {
                totalFees: 70000,
                totalPaid: 45000,
                balance: 25000,
                status: 'partial',
                payments: [
                    { date: '2026-04-20', amount: 25000, method: 'M-Pesa' },
                    { date: '2026-04-15', amount: 20000, method: 'Bank Transfer' }
                ]
            },
            disciplinary: {
                totalIncidents: 0,
                currentStatus: 'Good Standing',
                records: []
            },
            extracurricular: {
                clubs: ['Mathematics Club', 'Debate Society'],
                sports: ['Basketball'],
                achievements: ['Best Speaker - Inter-house Debate 2026']
            }
        };

        res.json({
            success: true,
            data: { report }
        });

    } catch (error) {
        console.error('Get student report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student report'
        });
    }
});

// @route   GET /api/reports/teacher/:teacherId
// @desc    Get teacher performance report
// @access  Private (Admin, Teacher - own report)
router.get('/teacher/:teacherId', auth, async (req, res) => {
    try {
        const { teacherId } = req.params;

        // Check permissions
        if (req.user.role !== 'admin' && req.user._id.toString() !== teacherId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Mock teacher report data
        const report = {
            teacher: {
                name: 'John Kamau',
                tscNumber: 'TSC123456',
                subjects: ['Mathematics', 'Physics'],
                classes: ['Form 1 East', 'Form 2 West', 'Form 3 North']
            },
            performance: {
                totalStudents: 105,
                averageClassPerformance: 78.5,
                subjectPerformance: [
                    { subject: 'Mathematics', classes: 3, averageScore: 82.1, passRate: 94.3 },
                    { subject: 'Physics', classes: 2, averageScore: 77.3, passRate: 88.6 }
                ],
                trends: [
                    { term: 'Term 1', average: 75.2 },
                    { term: 'Term 2', average: 78.5 }
                ]
            },
            attendance: {
                teachingDays: 95,
                daysPresent: 93,
                attendanceRate: 97.9,
                lessonsDelivered: 380,
                plannedLessons: 400,
                deliveryRate: 95.0
            },
            professional: {
                qualifications: ['B.Ed Mathematics', 'Diploma in Education'],
                experience: '8 years',
                trainingAttended: [
                    { name: 'CBC Training Workshop', date: '2026-03-15' },
                    { name: 'Digital Learning Seminar', date: '2026-02-20' }
                ],
                evaluationScore: 4.2,
                studentFeedback: 4.1
            }
        };

        res.json({
            success: true,
            data: { report }
        });

    } catch (error) {
        console.error('Get teacher report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teacher report'
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
        const reportId = Date.now().toString();
        const report = {
            _id: reportId,
            type: reportType,
            parameters,
            format,
            status: 'generating',
            requestedBy: req.user._id,
            requestedAt: new Date(),
            estimatedCompletion: new Date(Date.now() + 1000 * 60 * 5) // 5 minutes
        };

        // Simulate async report generation
        setTimeout(() => {
            // In real implementation, this would update the database
            console.log(`Report ${reportId} generation completed`);
        }, 5000);

        res.status(202).json({
            success: true,
            message: 'Report generation started',
            data: { report }
        });

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating report'
        });
    }
});

// @route   GET /api/reports/export/:reportId
// @desc    Export/download generated report
// @access  Private
router.get('/export/:reportId', auth, async (req, res) => {
    try {
        const { reportId } = req.params;
        const { format = 'pdf' } = req.query;

        // Mock report export
        // In real implementation, this would generate and serve the actual file
        res.json({
            success: true,
            message: 'Report export ready',
            data: {
                downloadUrl: `/api/reports/download/${reportId}`,
                format,
                size: '2.5MB',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // 24 hours
            }
        });

    } catch (error) {
        console.error('Export report error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting report'
        });
    }
});

module.exports = router;