const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/finance/fees
// @desc    Get fee structure
// @access  Private
router.get('/fees', auth, async (req, res) => {
    try {
        // Mock fee structure
        const feeStructure = [
            {
                _id: '1',
                class: 'Form 1',
                boardingStatus: 'boarder',
                tuition: 45000,
                boarding: 25000,
                meals: 15000,
                transport: 0,
                activities: 5000,
                total: 90000
            },
            {
                _id: '2',
                class: 'Form 1',
                boardingStatus: 'day_scholar',
                tuition: 45000,
                boarding: 0,
                meals: 8000,
                transport: 12000,
                activities: 5000,
                total: 70000
            },
            {
                _id: '3',
                class: 'Form 2',
                boardingStatus: 'boarder',
                tuition: 48000,
                boarding: 25000,
                meals: 15000,
                transport: 0,
                activities: 5000,
                total: 93000
            },
            {
                _id: '4',
                class: 'Form 2',
                boardingStatus: 'day_scholar',
                tuition: 48000,
                boarding: 0,
                meals: 8000,
                transport: 12000,
                activities: 5000,
                total: 73000
            }
        ];

        res.json({
            success: true,
            data: { feeStructure }
        });

    } catch (error) {
        console.error('Get fee structure error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fee structure'
        });
    }
});

// @route   GET /api/finance/payments
// @desc    Get payment records
// @access  Private
router.get('/payments', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, studentId, status, term } = req.query;

        // Mock payment records
        const payments = [
            {
                _id: '1',
                student: { name: 'Jane Wanjiku', admissionNumber: 'ADM/2024/1E001' },
                amount: 25000,
                paymentMethod: 'M-Pesa',
                transactionId: 'QH12345678',
                term: 'Term 2',
                year: 2026,
                status: 'completed',
                paidAt: '2026-04-20T10:30:00Z'
            },
            {
                _id: '2',
                student: { name: 'John Mwangi', admissionNumber: 'ADM/2024/1W002' },
                amount: 30000,
                paymentMethod: 'Bank Transfer',
                transactionId: 'BT87654321',
                term: 'Term 2',
                year: 2026,
                status: 'completed',
                paidAt: '2026-04-19T14:15:00Z'
            }
        ];

        const total = payments.length;

        res.json({
            success: true,
            data: {
                payments,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(total / limit),
                    total
                }
            }
        });

    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payments'
        });
    }
});

// @route   GET /api/finance/student/:studentId/statement
// @desc    Get student fee statement
// @access  Private
router.get('/student/:studentId/statement', auth, async (req, res) => {
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

        // Mock fee statement
        const statement = {
            student: {
                name: 'Jane Wanjiku',
                admissionNumber: 'ADM/2024/1E001',
                class: 'Form 1 East',
                boardingStatus: 'day_scholar'
            },
            term: 'Term 2',
            year: 2026,
            feeStructure: {
                tuition: 45000,
                meals: 8000,
                transport: 12000,
                activities: 5000,
                total: 70000
            },
            payments: [
                {
                    date: '2026-04-20',
                    amount: 25000,
                    method: 'M-Pesa',
                    reference: 'QH12345678'
                },
                {
                    date: '2026-04-15',
                    amount: 20000,
                    method: 'Bank Transfer',
                    reference: 'BT11111111'
                }
            ],
            balance: {
                totalFees: 70000,
                totalPaid: 45000,
                balance: 25000,
                status: 'partial'
            }
        };

        res.json({
            success: true,
            data: { statement }
        });

    } catch (error) {
        console.error('Get fee statement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching fee statement'
        });
    }
});

// @route   POST /api/finance/payments
// @desc    Record a payment
// @access  Private (Admin, Accountant)
router.post('/payments', auth, authorize('admin', 'accountant'), [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('amount').isNumeric().withMessage('Amount must be numeric'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('transactionId').notEmpty().withMessage('Transaction ID is required')
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

        const { studentId, amount, paymentMethod, transactionId, term, year } = req.body;

        // Mock payment creation
        const payment = {
            _id: Date.now().toString(),
            student: studentId,
            amount: parseFloat(amount),
            paymentMethod,
            transactionId,
            term: term || 'Term 2',
            year: year || 2026,
            status: 'completed',
            recordedBy: req.user._id,
            paidAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: { payment }
        });

    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording payment'
        });
    }
});

// @route   GET /api/finance/reports/summary
// @desc    Get financial summary
// @access  Private (Admin, Accountant)
router.get('/reports/summary', auth, authorize('admin', 'accountant'), async (req, res) => {
    try {
        const { term, year } = req.query;

        // Mock financial summary
        const summary = {
            totalExpectedRevenue: 15000000,
            totalCollected: 12500000,
            totalOutstanding: 2500000,
            collectionRate: 83.33,
            totalStudents: 500,
            paidStudents: 420,
            partiallyPaidStudents: 65,
            unpaidStudents: 15,
            recentPayments: [
                { date: '2026-04-23', amount: 125000, count: 5 },
                { date: '2026-04-22', amount: 98000, count: 4 },
                { date: '2026-04-21', amount: 156000, count: 6 },
                { date: '2026-04-20', amount: 203000, count: 8 }
            ],
            paymentMethods: [
                { method: 'M-Pesa', amount: 8500000, percentage: 68 },
                { method: 'Bank Transfer', amount: 3200000, percentage: 25.6 },
                { method: 'Cash', amount: 800000, percentage: 6.4 }
            ]
        };

        res.json({
            success: true,
            data: { summary }
        });

    } catch (error) {
        console.error('Get financial summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial summary'
        });
    }
});

// @route   GET /api/finance/defaulters
// @desc    Get fee defaulters list
// @access  Private (Admin, Accountant)
router.get('/defaulters', auth, authorize('admin', 'accountant'), async (req, res) => {
    try {
        const { class: classLevel, stream, amount } = req.query;

        // Mock defaulters data
        const defaulters = [
            {
                student: {
                    name: 'Peter Kiprotich',
                    admissionNumber: 'ADM/2024/2N015',
                    class: 'Form 2 North',
                    parentPhone: '+254712345678'
                },
                totalFees: 93000,
                totalPaid: 30000,
                balance: 63000,
                lastPayment: '2026-03-15',
                daysOverdue: 39
            },
            {
                student: {
                    name: 'Mary Akinyi',
                    admissionNumber: 'ADM/2024/3S008',
                    class: 'Form 3 South',
                    parentPhone: '+254723456789'
                },
                totalFees: 96000,
                totalPaid: 20000,
                balance: 76000,
                lastPayment: '2026-02-28',
                daysOverdue: 54
            }
        ];

        res.json({
            success: true,
            data: { defaulters }
        });

    } catch (error) {
        console.error('Get defaulters error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching defaulters'
        });
    }
});

// @route   POST /api/finance/invoices
// @desc    Generate invoice
// @access  Private (Admin, Accountant)
router.post('/invoices', auth, authorize('admin', 'accountant'), [
    body('studentId').notEmpty().withMessage('Student ID is required'),
    body('term').notEmpty().withMessage('Term is required'),
    body('year').isNumeric().withMessage('Year must be numeric')
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

        const { studentId, term, year, additionalCharges } = req.body;

        // Mock invoice generation
        const invoice = {
            _id: Date.now().toString(),
            invoiceNumber: `INV/${year}/${term}/${Date.now()}`,
            student: studentId,
            term,
            year,
            items: [
                { description: 'Tuition Fees', amount: 45000 },
                { description: 'Meals', amount: 8000 },
                { description: 'Transport', amount: 12000 },
                { description: 'Activities', amount: 5000 }
            ],
            additionalCharges: additionalCharges || [],
            subtotal: 70000,
            total: 70000,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            status: 'pending',
            generatedBy: req.user._id,
            generatedAt: new Date()
        };

        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: { invoice }
        });

    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice'
        });
    }
});

module.exports = router;