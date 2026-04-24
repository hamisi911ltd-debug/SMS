const express = require('express');
const { auth, authorize } = require('../middleware/demo-auth');
const router = express.Router();

// Mock finance data
const mockFeeStructure = [
    { _id: 'fee1', class: 'Form 1', tuition: 45000, boarding: 25000, transport: 8000, activities: 5000, total: 83000 },
    { _id: 'fee2', class: 'Form 2', tuition: 47000, boarding: 25000, transport: 8000, activities: 5000, total: 85000 },
    { _id: 'fee3', class: 'Form 3', tuition: 49000, boarding: 27000, transport: 8000, activities: 5000, total: 89000 },
    { _id: 'fee4', class: 'Form 4', tuition: 51000, boarding: 27000, transport: 8000, activities: 5000, total: 91000 }
];

const mockPayments = [
    {
        _id: 'pay1',
        studentId: 'student1',
        studentName: 'Jane Wanjiku',
        admissionNumber: 'GHS001',
        class: 'Form 2 East',
        amount: 25000,
        paymentMethod: 'M-Pesa',
        transactionId: 'MP240515001',
        paymentDate: '2024-05-15',
        term: 'Term 2',
        year: 2024,
        status: 'Completed',
        receiptNumber: 'RCP001'
    },
    {
        _id: 'pay2',
        studentId: 'student2',
        studentName: 'John Kamau',
        admissionNumber: 'GHS002',
        class: 'Form 3 West',
        amount: 30000,
        paymentMethod: 'Bank Transfer',
        transactionId: 'BT240520002',
        paymentDate: '2024-05-20',
        term: 'Term 2',
        year: 2024,
        status: 'Completed',
        receiptNumber: 'RCP002'
    },
    {
        _id: 'pay3',
        studentId: 'student3',
        studentName: 'Grace Achieng',
        admissionNumber: 'GHS003',
        class: 'Form 1 North',
        amount: 15000,
        paymentMethod: 'Cash',
        transactionId: 'CSH240525003',
        paymentDate: '2024-05-25',
        term: 'Term 2',
        year: 2024,
        status: 'Completed',
        receiptNumber: 'RCP003'
    }
];

const mockInvoices = [
    {
        _id: 'inv1',
        studentId: 'student1',
        studentName: 'Jane Wanjiku',
        admissionNumber: 'GHS001',
        class: 'Form 2 East',
        term: 'Term 2',
        year: 2024,
        items: [
            { description: 'Tuition Fee', amount: 47000 },
            { description: 'Boarding Fee', amount: 25000 },
            { description: 'Transport Fee', amount: 8000 },
            { description: 'Activities Fee', amount: 5000 }
        ],
        totalAmount: 85000,
        paidAmount: 70000,
        balance: 15000,
        dueDate: '2024-06-30',
        status: 'Partially Paid',
        invoiceNumber: 'INV2024001'
    },
    {
        _id: 'inv2',
        studentId: 'student2',
        studentName: 'John Kamau',
        admissionNumber: 'GHS002',
        class: 'Form 3 West',
        term: 'Term 2',
        year: 2024,
        items: [
            { description: 'Tuition Fee', amount: 49000 },
            { description: 'Boarding Fee', amount: 27000 },
            { description: 'Transport Fee', amount: 8000 },
            { description: 'Activities Fee', amount: 5000 }
        ],
        totalAmount: 89000,
        paidAmount: 81000,
        balance: 8000,
        dueDate: '2024-06-30',
        status: 'Partially Paid',
        invoiceNumber: 'INV2024002'
    }
];

// @route   GET /api/finance/fee-structure
// @desc    Get fee structure
// @access  Private
router.get('/fee-structure', auth, async (req, res) => {
    try {
        res.json({
            success: true,
            data: { feeStructure: mockFeeStructure }
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
// @desc    Get all payments
// @access  Private (Admin)
router.get('/payments', auth, authorize('admin'), async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', status = '', method = '' } = req.query;
        
        let filteredPayments = [...mockPayments];
        
        // Apply filters
        if (search) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.studentName.toLowerCase().includes(search.toLowerCase()) ||
                payment.admissionNumber.toLowerCase().includes(search.toLowerCase()) ||
                payment.transactionId.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (status) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.status.toLowerCase() === status.toLowerCase()
            );
        }
        
        if (method) {
            filteredPayments = filteredPayments.filter(payment => 
                payment.paymentMethod.toLowerCase() === method.toLowerCase()
            );
        }
        
        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            data: {
                payments: paginatedPayments,
                pagination: {
                    current: parseInt(page),
                    pages: Math.ceil(filteredPayments.length / limit),
                    total: filteredPayments.length
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

// @route   GET /api/finance/invoices
// @desc    Get all invoices
// @access  Private
router.get('/invoices', auth, async (req, res) => {
    try {
        const { studentId } = req.query;
        let filteredInvoices = [...mockInvoices];
        
        if (studentId) {
            filteredInvoices = filteredInvoices.filter(invoice => 
                invoice.studentId === studentId
            );
        }
        
        res.json({
            success: true,
            data: { invoices: filteredInvoices }
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching invoices'
        });
    }
});

// @route   POST /api/finance/payments
// @desc    Record new payment
// @access  Private (Admin)
router.post('/payments', auth, authorize('admin'), async (req, res) => {
    try {
        const newPayment = {
            _id: `pay${mockPayments.length + 1}`,
            receiptNumber: `RCP${String(mockPayments.length + 1).padStart(3, '0')}`,
            paymentDate: new Date().toISOString().split('T')[0],
            status: 'Completed',
            ...req.body
        };
        
        mockPayments.push(newPayment);
        
        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            data: { payment: newPayment }
        });
    } catch (error) {
        console.error('Record payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error recording payment'
        });
    }
});

// @route   POST /api/finance/invoices
// @desc    Generate new invoice
// @access  Private (Admin)
router.post('/invoices', auth, authorize('admin'), async (req, res) => {
    try {
        const newInvoice = {
            _id: `inv${mockInvoices.length + 1}`,
            invoiceNumber: `INV2024${String(mockInvoices.length + 1).padStart(3, '0')}`,
            paidAmount: 0,
            status: 'Unpaid',
            ...req.body
        };
        
        newInvoice.balance = newInvoice.totalAmount - newInvoice.paidAmount;
        
        mockInvoices.push(newInvoice);
        
        res.status(201).json({
            success: true,
            message: 'Invoice generated successfully',
            data: { invoice: newInvoice }
        });
    } catch (error) {
        console.error('Generate invoice error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating invoice'
        });
    }
});

// @route   GET /api/finance/student/:id/statement
// @desc    Get student fee statement
// @access  Private
router.get('/student/:id/statement', auth, async (req, res) => {
    try {
        const studentPayments = mockPayments.filter(payment => 
            payment.studentId === req.params.id
        );
        
        const studentInvoices = mockInvoices.filter(invoice => 
            invoice.studentId === req.params.id
        );
        
        const totalPaid = studentPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalOwed = studentInvoices.reduce((sum, invoice) => sum + invoice.balance, 0);
        
        res.json({
            success: true,
            data: {
                payments: studentPayments,
                invoices: studentInvoices,
                summary: {
                    totalPaid,
                    totalOwed,
                    balance: totalOwed
                }
            }
        });
    } catch (error) {
        console.error('Get student statement error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching student statement'
        });
    }
});

// @route   GET /api/finance/reports/summary
// @desc    Get financial summary
// @access  Private (Admin)
router.get('/reports/summary', auth, authorize('admin'), async (req, res) => {
    try {
        const totalCollected = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const totalOutstanding = mockInvoices.reduce((sum, invoice) => sum + invoice.balance, 0);
        const totalExpected = mockInvoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
        
        const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected * 100).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: {
                totalCollected,
                totalOutstanding,
                totalExpected,
                collectionRate: parseFloat(collectionRate),
                paymentsCount: mockPayments.length,
                outstandingInvoices: mockInvoices.filter(inv => inv.balance > 0).length
            }
        });
    } catch (error) {
        console.error('Get financial summary error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching financial summary'
        });
    }
});

module.exports = router;