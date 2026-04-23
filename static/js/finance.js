/**
 * Finance.js - Financial management functionality
 * Handles fee calculations, payment processing, and financial reports
 */

// Finance management object
const FinanceManager = {
    init() {
        this.initializeFeeCalculator();
        this.initializePaymentForms();
        this.initializeMpesaIntegration();
        this.initializeReports();
        this.initializeInvoiceGeneration();
    },
    
    initializeFeeCalculator() {
        const feeForm = document.getElementById('fee-calculator-form');
        if (feeForm) {
            feeForm.addEventListener('change', () => {
                this.calculateFees();
            });
        }
        
        // Auto-calculate on page load
        this.calculateFees();
    },
    
    initializePaymentForms() {
        const paymentForms = document.querySelectorAll('.payment-form');
        paymentForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processPayment(form);
            });
        });
        
        // Payment method selection
        const paymentMethods = document.querySelectorAll('input[name="payment_method"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', (e) => {
                this.togglePaymentFields(e.target.value);
            });
        });
    },
    
    initializeMpesaIntegration() {
        const mpesaBtn = document.getElementById('mpesa-pay-btn');
        if (mpesaBtn) {
            mpesaBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.initiateMpesaPayment();
            });
        }
        
        // Phone number formatting
        const phoneInputs = document.querySelectorAll('input[name="phone_number"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        });
    },
    
    initializeReports() {
        const reportForms = document.querySelectorAll('.report-form');
        reportForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateReport(form);
            });
        });
        
        // Date range picker
        const dateRanges = document.querySelectorAll('.date-range');
        dateRanges.forEach(range => {
            range.addEventListener('change', () => {
                this.updateReportPreview();
            });
        });
    },
    
    initializeInvoiceGeneration() {
        const generateBtns = document.querySelectorAll('.generate-invoice-btn');
        generateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const studentId = btn.dataset.student;
                const termId = btn.dataset.term;
                this.generateInvoice(studentId, termId);
            });
        });
    },
    
    calculateFees() {
        const form = document.getElementById('fee-calculator-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const classLevel = formData.get('class_level');
        const term = formData.get('term');
        const boardingStatus = formData.get('boarding_status');
        
        if (!classLevel || !term) return;
        
        // Get fee structure
        this.getFeeStructure(classLevel, term)
            .then(feeStructure => {
                this.displayFeeBreakdown(feeStructure, boardingStatus);
            })
            .catch(error => {
                console.error('Error calculating fees:', error);
                this.showNotification('Error calculating fees', 'error');
            });
    },
    
    getFeeStructure(classLevel, term) {
        return fetch(`/finance/fee-structure/${classLevel}/${term}/`)
            .then(response => response.json());
    },
    
    displayFeeBreakdown(feeStructure, boardingStatus) {
        const breakdown = document.getElementById('fee-breakdown');
        if (!breakdown) return;
        
        let total = 0;
        let html = '<div class="fee-breakdown-table">';
        
        // Tuition fee
        html += `<div class="fee-item">
            <span>Tuition Fee</span>
            <span>KSh ${this.formatCurrency(feeStructure.tuition_fee)}</span>
        </div>`;
        total += feeStructure.tuition_fee;
        
        // Boarding fee (if applicable)
        if (boardingStatus === 'boarder') {
            html += `<div class="fee-item">
                <span>Boarding Fee</span>
                <span>KSh ${this.formatCurrency(feeStructure.boarding_fee)}</span>
            </div>`;
            total += feeStructure.boarding_fee;
        }
        
        // Other fees
        const otherFees = [
            { name: 'Transport Fee', amount: feeStructure.transport_fee },
            { name: 'Library Fee', amount: feeStructure.library_fee },
            { name: 'Sports Fee', amount: feeStructure.sports_fee },
            { name: 'Medical Fee', amount: feeStructure.medical_fee },
            { name: 'Development Fee', amount: feeStructure.development_fee }
        ];
        
        otherFees.forEach(fee => {
            if (fee.amount > 0) {
                html += `<div class="fee-item">
                    <span>${fee.name}</span>
                    <span>KSh ${this.formatCurrency(fee.amount)}</span>
                </div>`;
                total += fee.amount;
            }
        });
        
        // Total
        html += `<div class="fee-item total">
            <span><strong>Total Amount</strong></span>
            <span><strong>KSh ${this.formatCurrency(total)}</strong></span>
        </div>`;
        
        html += '</div>';
        breakdown.innerHTML = html;
        
        // Update hidden total field
        const totalField = document.getElementById('total_amount');
        if (totalField) {
            totalField.value = total;
        }
    },
    
    processPayment(form) {
        const formData = new FormData(form);
        const paymentMethod = formData.get('payment_method');
        
        // Show loading state
        this.showPaymentLoading(true);
        
        if (paymentMethod === 'mpesa') {
            this.processMpesaPayment(formData);
        } else {
            this.processRegularPayment(formData);
        }
    },
    
    processRegularPayment(formData) {
        fetch('/finance/process-payment/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': this.getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Payment processed successfully', 'success');
                this.redirectToReceipt(data.payment_id);
            } else {
                this.showNotification(data.message || 'Payment failed', 'error');
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            this.showNotification('Payment processing error', 'error');
        })
        .finally(() => {
            this.showPaymentLoading(false);
        });
    },
    
    processMpesaPayment(formData) {
        fetch('/finance/mpesa-payment/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': this.getCSRFToken()
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('M-Pesa payment initiated. Check your phone for the prompt.', 'info');
                this.pollPaymentStatus(data.checkout_request_id);
            } else {
                this.showNotification(data.message || 'M-Pesa payment failed', 'error');
            }
        })
        .catch(error => {
            console.error('M-Pesa error:', error);
            this.showNotification('M-Pesa processing error', 'error');
        })
        .finally(() => {
            this.showPaymentLoading(false);
        });
    },
    
    initiateMpesaPayment() {
        const phoneNumber = document.getElementById('mpesa_phone').value;
        const amount = document.getElementById('mpesa_amount').value;
        const invoiceId = document.getElementById('invoice_id').value;
        
        if (!phoneNumber || !amount) {
            this.showNotification('Please enter phone number and amount', 'warning');
            return;
        }
        
        const data = {
            phone_number: phoneNumber,
            amount: amount,
            invoice_id: invoiceId
        };
        
        fetch('/finance/mpesa-stk-push/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Payment request sent to your phone', 'success');
                this.pollPaymentStatus(data.checkout_request_id);
            } else {
                this.showNotification(data.message || 'Payment request failed', 'error');
            }
        })
        .catch(error => {
            console.error('M-Pesa STK Push error:', error);
            this.showNotification('Payment request error', 'error');
        });
    },
    
    pollPaymentStatus(checkoutRequestId) {
        const pollInterval = setInterval(() => {
            fetch(`/finance/mpesa-status/${checkoutRequestId}/`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'completed') {
                        clearInterval(pollInterval);
                        this.showNotification('Payment completed successfully!', 'success');
                        this.redirectToReceipt(data.payment_id);
                    } else if (data.status === 'failed') {
                        clearInterval(pollInterval);
                        this.showNotification('Payment failed or cancelled', 'error');
                    }
                    // Continue polling if status is 'pending'
                })
                .catch(error => {
                    console.error('Status polling error:', error);
                    clearInterval(pollInterval);
                });
        }, 3000); // Poll every 3 seconds
        
        // Stop polling after 2 minutes
        setTimeout(() => {
            clearInterval(pollInterval);
        }, 120000);
    },
    
    togglePaymentFields(paymentMethod) {
        const allFields = document.querySelectorAll('.payment-fields');
        allFields.forEach(field => field.style.display = 'none');
        
        const selectedFields = document.querySelector(`.${paymentMethod}-fields`);
        if (selectedFields) {
            selectedFields.style.display = 'block';
        }
    },
    
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        // Convert to Kenyan format
        if (value.startsWith('0')) {
            value = '254' + value.substring(1);
        } else if (!value.startsWith('254')) {
            value = '254' + value;
        }
        
        // Limit to 12 digits (254 + 9 digits)
        if (value.length > 12) {
            value = value.substring(0, 12);
        }
        
        input.value = value;
    },
    
    generateReport(form) {
        const formData = new FormData(form);
        const reportType = formData.get('report_type');
        
        this.showReportLoading(true);
        
        fetch('/finance/generate-report/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': this.getCSRFToken()
            }
        })
        .then(response => {
            if (response.headers.get('content-type').includes('application/pdf')) {
                return response.blob();
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data instanceof Blob) {
                // Download PDF
                const url = window.URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${reportType}_report.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            } else if (data.success) {
                this.displayReportData(data.report_data);
            } else {
                this.showNotification(data.message || 'Report generation failed', 'error');
            }
        })
        .catch(error => {
            console.error('Report generation error:', error);
            this.showNotification('Report generation error', 'error');
        })
        .finally(() => {
            this.showReportLoading(false);
        });
    },
    
    generateInvoice(studentId, termId) {
        const data = {
            student_id: studentId,
            term_id: termId
        };
        
        fetch('/finance/generate-invoice/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': this.getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                this.showNotification('Invoice generated successfully', 'success');
                // Redirect to invoice view or download
                window.open(`/finance/invoice/${data.invoice_id}/`, '_blank');
            } else {
                this.showNotification(data.message || 'Invoice generation failed', 'error');
            }
        })
        .catch(error => {
            console.error('Invoice generation error:', error);
            this.showNotification('Invoice generation error', 'error');
        });
    },
    
    displayReportData(reportData) {
        const reportContainer = document.getElementById('report-container');
        if (!reportContainer) return;
        
        // Display report data in a table or chart format
        let html = '<div class="report-results">';
        
        if (reportData.summary) {
            html += '<div class="report-summary">';
            Object.entries(reportData.summary).forEach(([key, value]) => {
                html += `<div class="summary-item">
                    <span class="label">${key}:</span>
                    <span class="value">KSh ${this.formatCurrency(value)}</span>
                </div>`;
            });
            html += '</div>';
        }
        
        if (reportData.details) {
            html += '<div class="report-details">';
            // Add table or other visualization
            html += '</div>';
        }
        
        html += '</div>';
        reportContainer.innerHTML = html;
    },
    
    updateReportPreview() {
        // Update report preview based on selected date range
        const startDate = document.getElementById('start_date')?.value;
        const endDate = document.getElementById('end_date')?.value;
        
        if (startDate && endDate) {
            // Fetch preview data
            fetch(`/finance/report-preview/?start=${startDate}&end=${endDate}`)
                .then(response => response.json())
                .then(data => {
                    this.displayReportPreview(data);
                })
                .catch(error => {
                    console.error('Preview error:', error);
                });
        }
    },
    
    displayReportPreview(data) {
        const preview = document.getElementById('report-preview');
        if (preview && data) {
            preview.innerHTML = `
                <div class="preview-stats">
                    <div class="stat">
                        <span class="label">Total Collections:</span>
                        <span class="value">KSh ${this.formatCurrency(data.total_collections || 0)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Outstanding:</span>
                        <span class="value">KSh ${this.formatCurrency(data.outstanding || 0)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Number of Payments:</span>
                        <span class="value">${data.payment_count || 0}</span>
                    </div>
                </div>
            `;
        }
    },
    
    redirectToReceipt(paymentId) {
        setTimeout(() => {
            window.location.href = `/finance/receipt/${paymentId}/`;
        }, 2000);
    },
    
    showPaymentLoading(show) {
        const btn = document.querySelector('.payment-submit-btn');
        if (btn) {
            if (show) {
                btn.disabled = true;
                btn.textContent = 'Processing...';
            } else {
                btn.disabled = false;
                btn.textContent = 'Process Payment';
            }
        }
    },
    
    showReportLoading(show) {
        const btn = document.querySelector('.generate-report-btn');
        if (btn) {
            if (show) {
                btn.disabled = true;
                btn.textContent = 'Generating...';
            } else {
                btn.disabled = false;
                btn.textContent = 'Generate Report';
            }
        }
    },
    
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-KE').format(amount);
    },
    
    getCSRFToken() {
        return document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    },
    
    showNotification(message, type = 'info') {
        if (window.GlotechApp && window.GlotechApp.showNotification) {
            window.GlotechApp.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    FinanceManager.init();
});

// Export for global use
window.FinanceManager = FinanceManager;

console.log('Finance.js loaded successfully');