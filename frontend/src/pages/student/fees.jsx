import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './fees.module.css';
import StudentHeader from '../../components/StudentHeader';

const Fees = () => {
  const navigate = useNavigate();
  const [feesData, setFeesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFees, setSelectedFees] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'credit_card',
    notes: ''
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchFeesData();
  }, [userId, navigate]);

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:3000/fees/student/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFeesData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch fees data');
      }
    } catch (error) {
      console.error('Error fetching fees data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!selectedFees || !paymentForm.amount) return;

    setProcessingPayment(true);
    try {
      const response = await fetch('http://localhost:3000/fees/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          feesId: selectedFees._id,
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setSelectedReceipt(result.payment);
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        setPaymentForm({ amount: '', paymentMethod: 'credit_card', notes: '' });
        fetchFeesData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'overdue': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'partial': return 'Partial';
      case 'overdue': return 'Overdue';
      default: return 'Pending';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <StudentHeader />
        <div className={styles.loading}>Loading fees information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <StudentHeader />
        <div className={styles.error}>
          <h2>Error Loading Fees</h2>
          <p>{error}</p>
          <button onClick={fetchFeesData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!feesData || !feesData.summary) {
    return (
      <div className={styles.container}>
        <StudentHeader />
        <div className={styles.noData}>
          <h2>No Fees Data Available</h2>
          <p>No fees records found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <StudentHeader />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Fees Management</h1>
          <p>Manage your academic fees and payments</p>
        </div>

        {/* Summary Cards */}
        <div className={styles.summaryCards}>
          <div className={styles.summaryCard}>
            <h3>Total Fees</h3>
            <p className={styles.amount}>{formatCurrency(feesData.summary.totalFees || 0)}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Paid</h3>
            <p className={styles.amount}>{formatCurrency(feesData.summary.totalPaid || 0)}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Balance</h3>
            <p className={styles.amount}>{formatCurrency(feesData.summary.totalBalance || 0)}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Pending Fees</h3>
            <p className={styles.count}>{feesData.summary.pendingFees || 0}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Fees Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'payments' ? styles.active : ''}`}
            onClick={() => setActiveTab('payments')}
          >
            Payment History
          </button>
        </div>

        {/* Fees Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.feesList}>
            <h2>Current Fees</h2>
            {!feesData.feesRecords || feesData.feesRecords.length === 0 ? (
              <div className={styles.noData}>No fees records found.</div>
            ) : (
              feesData.feesRecords.map((fee) => (
                <div key={fee._id} className={styles.feeCard}>
                  <div className={styles.feeHeader}>
                    <div>
                      <h3>{fee.academicYear} - {fee.semester}</h3>
                      <p>Due: {formatDate(fee.dueDate)}</p>
                    </div>
                    <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(fee.status) }}>
                      {getStatusText(fee.status)}
                    </div>
                  </div>
                  
                  <div className={styles.feeDetails}>
                    <div className={styles.feeBreakdown}>
                      <h4>Fee Breakdown:</h4>
                      <div className={styles.breakdownGrid}>
                        {Object.entries(fee.feeStructure || {}).map(([key, value]) => (
                          value > 0 && (
                            <div key={key} className={styles.breakdownItem}>
                              <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>
                              <span>{formatCurrency(value || 0)}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles.feeSummary}>
                      <div className={styles.summaryRow}>
                        <span>Total Amount:</span>
                        <span>{formatCurrency(fee.totalAmount || 0)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Amount Paid:</span>
                        <span>{formatCurrency(fee.totalPaid || 0)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Balance:</span>
                        <span className={fee.balance > 0 ? styles.balance : ''}>
                          {formatCurrency(fee.balance || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {fee.balance > 0 && (
                    <div className={styles.feeActions}>
                      <button 
                        className={styles.payButton}
                        onClick={() => {
                          setSelectedFees(fee);
                          setPaymentForm({ ...paymentForm, amount: fee.balance.toString() });
                          setShowPaymentModal(true);
                        }}
                      >
                        Pay Now
                      </button>
                      <button 
                        className={styles.partialPayButton}
                        onClick={() => {
                          setSelectedFees(fee);
                          setPaymentForm({ ...paymentForm, amount: '' });
                          setShowPaymentModal(true);
                        }}
                      >
                        Partial Payment
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'payments' && (
          <PaymentHistory userId={userId} />
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedFees && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Make Payment</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handlePayment} className={styles.paymentForm}>
              <div className={styles.formGroup}>
                <label>Fees Period:</label>
                <p>{selectedFees.academicYear} - {selectedFees.semester}</p>
              </div>
              
              <div className={styles.formGroup}>
                <label>Available Balance:</label>
                <p>{formatCurrency(selectedFees.balance || 0)}</p>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="amount">Payment Amount *</label>
                <input
                  type="number"
                  id="amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                  min="0.01"
                  max={selectedFees.balance}
                  step="0.01"
                  required
                />
                {paymentForm.amount && (
                  <p className={styles.amountPreview}>
                    Amount: {formatCurrency(paymentForm.amount || 0)}
                  </p>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="paymentMethod">Payment Method *</label>
                <select
                  id="paymentMethod"
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  required
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="notes">Notes (Optional)</label>
                <textarea
                  id="notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  rows="3"
                />
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Process Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedReceipt && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Payment Receipt</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowReceiptModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.receipt}>
              <div className={styles.receiptHeader}>
                <h3>Payment Successful!</h3>
                <p>Receipt Number: {selectedReceipt.receiptNumber}</p>
              </div>
              
              <div className={styles.receiptDetails}>
                <div className={styles.receiptRow}>
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(selectedReceipt.amount || 0)}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Payment Method:</span>
                  <span>{selectedReceipt.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Transaction ID:</span>
                  <span>{selectedReceipt.transactionId}</span>
                </div>
                <div className={styles.receiptRow}>
                  <span>Payment Date:</span>
                  <span>{formatDate(selectedReceipt.paymentDate)}</span>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  className={styles.printButton}
                  onClick={() => window.print()}
                >
                  Print Receipt
                </button>
                <button 
                  className={styles.closeButton}
                  onClick={() => setShowReceiptModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Payment History Component
const PaymentHistory = ({ userId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:3000/fees/payments/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading payment history...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchPaymentHistory} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.paymentHistory}>
      <h2>Payment History</h2>
      {!payments || payments.length === 0 ? (
        <div className={styles.noData}>No payment history found.</div>
      ) : (
        <div className={styles.paymentsList}>
          {payments.map((payment) => (
            <div key={payment.paymentId} className={styles.paymentCard}>
              <div className={styles.paymentHeader}>
                <div>
                  <h4>Receipt: {payment.receiptNumber}</h4>
                  <p>{payment.academicYear} - {payment.semester}</p>
                </div>
                <div className={styles.paymentAmount}>
                  {formatCurrency(payment.amount || 0)}
                </div>
              </div>
              
              <div className={styles.paymentDetails}>
                <div className={styles.paymentRow}>
                  <span>Payment Method:</span>
                  <span>{payment.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Transaction ID:</span>
                  <span>{payment.transactionId}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Payment Date:</span>
                  <span>{formatDate(payment.paymentDate)}</span>
                </div>
                <div className={styles.paymentRow}>
                  <span>Status:</span>
                  <span className={styles.statusBadge} style={{ 
                    backgroundColor: payment.status === 'completed' ? '#10b981' : '#f59e0b' 
                  }}>
                    {payment.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Fees;
