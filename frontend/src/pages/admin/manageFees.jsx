import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './manageFees.module.css';
import AdminHeader from '../../components/AdminHeader';

const ManageFees = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [feesRecords, setFeesRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommonFeesModal, setShowCommonFeesModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeForm, setFeeForm] = useState({
    studentId: '',
    academicYear: '',
    semester: '',
    dueDate: '',
    tuitionFee: '',
    libraryFee: '',
    laboratoryFee: '',
    sportsFee: '',
    transportFee: '',
    examinationFee: '',
    otherFees: ''
  });
  const [commonFeesForm, setCommonFeesForm] = useState({
    academicYear: '',
    semester: '',
    dueDate: '',
    tuitionFee: '',
    libraryFee: '',
    laboratoryFee: '',
    sportsFee: '',
    transportFee: '',
    examinationFee: '',
    otherFees: ''
  });
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [userId, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch students
      const studentsResponse = await fetch(`http://localhost:3000/student/all/${userId}`);
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json();
        setStudents(studentsData.students || []);
      } else {
        const errorData = await studentsResponse.json();
        console.error('Failed to fetch students:', errorData.message);
      }

      // Fetch fees records
      const feesResponse = await fetch(`http://localhost:3000/fees/all/${userId}`);
      if (feesResponse.ok) {
        const feesData = await feesResponse.json();
        setFeesRecords(feesData || []);
      } else {
        const errorData = await feesResponse.json();
        console.error('Failed to fetch fees records:', errorData.message);
      }

      // Fetch statistics
      const statsResponse = await fetch(`http://localhost:3000/fees/admin-stats/${userId}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      } else {
        const errorData = await statsResponse.json();
        console.error('Failed to fetch statistics:', errorData.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFee = async (e) => {
    e.preventDefault();
    
    const totalAmount = Object.keys(feeForm)
      .filter(key => key !== 'studentId' && key !== 'academicYear' && key !== 'semester' && key !== 'dueDate')
      .reduce((sum, key) => sum + (parseFloat(feeForm[key]) || 0), 0);

    if (totalAmount <= 0) {
      alert('Please enter at least one fee amount greater than 0.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/fees/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          studentId: feeForm.studentId,
          feeStructure: {
            tuitionFee: parseFloat(feeForm.tuitionFee) || 0,
            libraryFee: parseFloat(feeForm.libraryFee) || 0,
            laboratoryFee: parseFloat(feeForm.laboratoryFee) || 0,
            sportsFee: parseFloat(feeForm.sportsFee) || 0,
            transportFee: parseFloat(feeForm.transportFee) || 0,
            examinationFee: parseFloat(feeForm.examinationFee) || 0,
            otherFees: parseFloat(feeForm.otherFees) || 0
          },
          totalAmount,
          academicYear: feeForm.academicYear,
          semester: feeForm.semester,
          dueDate: feeForm.dueDate
        }),
      });

      if (response.ok) {
        alert('Fee record created successfully!');
        setShowCreateModal(false);
        setFeeForm({
          studentId: '',
          academicYear: '',
          semester: '',
          dueDate: '',
          tuitionFee: '',
          libraryFee: '',
          laboratoryFee: '',
          sportsFee: '',
          transportFee: '',
          examinationFee: '',
          otherFees: ''
        });
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create fee record');
      }
    } catch (error) {
      console.error('Error creating fee record:', error);
      alert('Failed to create fee record. Please try again.');
    }
  };

  const handleCreateCommonFees = async (e) => {
    e.preventDefault();
    
    const totalAmount = Object.keys(commonFeesForm)
      .filter(key => key !== 'academicYear' && key !== 'semester' && key !== 'dueDate')
      .reduce((sum, key) => sum + (parseFloat(commonFeesForm[key]) || 0), 0);

    if (totalAmount <= 0) {
      alert('Please enter at least one fee amount greater than 0.');
      return;
    }

    if (students.length === 0) {
      alert('No students found to create fees for.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/fees/create-common', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          studentIds: students.map(s => s.id),
          feeStructure: {
            tuitionFee: parseFloat(commonFeesForm.tuitionFee) || 0,
            libraryFee: parseFloat(commonFeesForm.libraryFee) || 0,
            laboratoryFee: parseFloat(commonFeesForm.laboratoryFee) || 0,
            sportsFee: parseFloat(commonFeesForm.sportsFee) || 0,
            transportFee: parseFloat(commonFeesForm.transportFee) || 0,
            examinationFee: parseFloat(commonFeesForm.examinationFee) || 0,
            otherFees: parseFloat(commonFeesForm.otherFees) || 0
          },
          totalAmount,
          academicYear: commonFeesForm.academicYear,
          semester: commonFeesForm.semester,
          dueDate: commonFeesForm.dueDate
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Common fees created successfully for ${result.createdCount} students!`);
        setShowCommonFeesModal(false);
        setCommonFeesForm({
          academicYear: '',
          semester: '',
          dueDate: '',
          tuitionFee: '',
          libraryFee: '',
          laboratoryFee: '',
          sportsFee: '',
          transportFee: '',
          examinationFee: '',
          otherFees: ''
        });
        fetchData(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create common fees');
      }
    } catch (error) {
      console.error('Error creating common fees:', error);
      alert('Failed to create common fees. Please try again.');
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

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Unknown Student';
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <AdminHeader />
        <div className={styles.loading}>Loading fees management...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <AdminHeader />
        <div className={styles.error}>
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={fetchData} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <AdminHeader />
      
      <div className={styles.content}>
        <div className={styles.header}>
          <h1>Fees Management</h1>
          <p>Manage student fees and payment records</p>
        </div>

        {/* Summary Cards */}
        {stats && (
          <div className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <h3>Total Records</h3>
              <p className={styles.count}>{stats.totalRecords || 0}</p>
            </div>
            <div className={styles.summaryCard}>
              <h3>Total Amount</h3>
              <p className={styles.amount}>{formatCurrency(stats.totalAmount || 0)}</p>
            </div>
            <div className={styles.summaryCard}>
              <h3>Total Collected</h3>
              <p className={styles.amount}>{formatCurrency(stats.totalPaid || 0)}</p>
            </div>
            <div className={styles.summaryCard}>
              <h3>Outstanding</h3>
              <p className={styles.amount}>{formatCurrency(stats.totalBalance || 0)}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.createButton}
            onClick={() => setShowCreateModal(true)}
            disabled={students.length === 0}
          >
            {students.length === 0 ? 'No Students Available' : 'Create Fee Record'}
          </button>
          <button 
            className={styles.commonFeesButton}
            onClick={() => setShowCommonFeesModal(true)}
            disabled={students.length === 0}
          >
            {students.length === 0 ? 'No Students Available' : 'Create Common Fees'}
          </button>
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
            className={`${styles.tab} ${activeTab === 'statistics' ? styles.active : ''}`}
            onClick={() => setActiveTab('statistics')}
          >
            Statistics
          </button>
        </div>

        {/* Fees Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.feesList}>
            <h2>All Fee Records</h2>
            {!feesRecords || feesRecords.length === 0 ? (
              <div className={styles.noData}>No fees records found.</div>
            ) : (
              <div className={styles.feesGrid}>
                {feesRecords.map((fee) => (
                  <div key={fee._id} className={styles.feeCard}>
                    <div className={styles.feeHeader}>
                      <div>
                        <h3>{getStudentName(fee.studentId)}</h3>
                        <p>{fee.academicYear} - {fee.semester}</p>
                      </div>
                      <div className={styles.statusBadge} style={{ backgroundColor: getStatusColor(fee.status) }}>
                        {getStatusText(fee.status)}
                      </div>
                    </div>
                    
                    <div className={styles.feeDetails}>
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
                        <div className={styles.summaryRow}>
                          <span>Due Date:</span>
                          <span>{formatDate(fee.dueDate)}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.feeActions}>
                      <button 
                        className={styles.viewButton}
                        onClick={() => {
                          setSelectedStudent(fee);
                          // You can add a view details modal here
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && stats && (
          <div className={styles.statistics}>
            <h2>Payment Statistics</h2>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Payment Status</h3>
                <div className={styles.statItems}>
                  <div className={styles.statItem}>
                    <span>Paid:</span>
                    <span className={styles.paid}>{stats.paidCount || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Partial:</span>
                    <span className={styles.partial}>{stats.partialCount || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Pending:</span>
                    <span className={styles.pending}>{stats.pendingCount || 0}</span>
                  </div>
                  <div className={styles.statItem}>
                    <span>Overdue:</span>
                    <span className={styles.overdue}>{stats.overdueCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className={styles.statCard}>
                <h3>Payment Methods</h3>
                <div className={styles.statItems}>
                  {Object.entries(stats.paymentMethods || {}).map(([method, count]) => (
                    <div key={method} className={styles.statItem}>
                      <span>{method.replace('_', ' ').toUpperCase()}:</span>
                      <span>{count}</span>
                    </div>
                  ))}
                  {Object.keys(stats.paymentMethods || {}).length === 0 && (
                    <div className={styles.statItem}>
                      <span>No payments yet</span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.statCard}>
                <h3>Monthly Collections</h3>
                <div className={styles.statItems}>
                  {Object.entries(stats.monthlyPayments || {})
                    .sort(([a], [b]) => b.localeCompare(a))
                    .slice(0, 6)
                    .map(([month, amount]) => (
                      <div key={month} className={styles.statItem}>
                        <span>{new Date(month).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}:</span>
                        <span>{formatCurrency(amount || 0)}</span>
                      </div>
                    ))}
                  {Object.keys(stats.monthlyPayments || {}).length === 0 && (
                    <div className={styles.statItem}>
                      <span>No monthly data available</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Fee Modal */}
      {showCreateModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Fee Record</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateFee} className={styles.feeForm}>
              <div className={styles.formGroup}>
                <label htmlFor="studentId">Student *</label>
                <select
                  id="studentId"
                  value={feeForm.studentId}
                  onChange={(e) => setFeeForm({ ...feeForm, studentId: e.target.value })}
                  required
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="academicYear">Academic Year *</label>
                  <input
                    type="text"
                    id="academicYear"
                    value={feeForm.academicYear}
                    onChange={(e) => setFeeForm({ ...feeForm, academicYear: e.target.value })}
                    placeholder="e.g., 2024-2025"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="semester">Semester *</label>
                  <select
                    id="semester"
                    value={feeForm.semester}
                    onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    required
                  >
                    <option value="">Select semester</option>
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  value={feeForm.dueDate}
                  onChange={(e) => setFeeForm({ ...feeForm, dueDate: e.target.value })}
                  required
                />
              </div>
              
              <div className={styles.feeBreakdown}>
                <h3>Fee Breakdown</h3>
                <div className={styles.feeInputs}>
                  <div className={styles.formGroup}>
                    <label htmlFor="tuitionFee">Tuition Fee</label>
                    <input
                      type="number"
                      id="tuitionFee"
                      value={feeForm.tuitionFee}
                      onChange={(e) => setFeeForm({ ...feeForm, tuitionFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="libraryFee">Library Fee</label>
                    <input
                      type="number"
                      id="libraryFee"
                      value={feeForm.libraryFee}
                      onChange={(e) => setFeeForm({ ...feeForm, libraryFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="laboratoryFee">Laboratory Fee</label>
                    <input
                      type="number"
                      id="laboratoryFee"
                      value={feeForm.laboratoryFee}
                      onChange={(e) => setFeeForm({ ...feeForm, laboratoryFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="sportsFee">Sports Fee</label>
                    <input
                      type="number"
                      id="sportsFee"
                      value={feeForm.sportsFee}
                      onChange={(e) => setFeeForm({ ...feeForm, sportsFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="transportFee">Transport Fee</label>
                    <input
                      type="number"
                      id="transportFee"
                      value={feeForm.transportFee}
                      onChange={(e) => setFeeForm({ ...feeForm, transportFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="examinationFee">Examination Fee</label>
                    <input
                      type="number"
                      id="examinationFee"
                      value={feeForm.examinationFee}
                      onChange={(e) => setFeeForm({ ...feeForm, examinationFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="otherFees">Other Fees</label>
                    <input
                      type="number"
                      id="otherFees"
                      value={feeForm.otherFees}
                      onChange={(e) => setFeeForm({ ...feeForm, otherFees: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                >
                  Create Fee Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Common Fees Modal */}
      {showCommonFeesModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create Common Fees for All Students</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCommonFeesModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateCommonFees}>
              <div className={styles.modalBody}>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="commonAcademicYear">Academic Year</label>
                    <input
                      type="text"
                      id="commonAcademicYear"
                      value={commonFeesForm.academicYear}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, academicYear: e.target.value })}
                      placeholder="e.g., 2024-2025"
                      required
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonSemester">Semester</label>
                    <select
                      id="commonSemester"
                      value={commonFeesForm.semester}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, semester: e.target.value })}
                      required
                    >
                      <option value="">Select Semester</option>
                      <option value="Fall">Fall</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonDueDate">Due Date</label>
                    <input
                      type="date"
                      id="commonDueDate"
                      value={commonFeesForm.dueDate}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="commonTuitionFee">Tuition Fee</label>
                    <input
                      type="number"
                      id="commonTuitionFee"
                      value={commonFeesForm.tuitionFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, tuitionFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonLibraryFee">Library Fee</label>
                    <input
                      type="number"
                      id="commonLibraryFee"
                      value={commonFeesForm.libraryFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, libraryFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonLaboratoryFee">Laboratory Fee</label>
                    <input
                      type="number"
                      id="commonLaboratoryFee"
                      value={commonFeesForm.laboratoryFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, laboratoryFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="commonSportsFee">Sports Fee</label>
                    <input
                      type="number"
                      id="commonSportsFee"
                      value={commonFeesForm.sportsFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, sportsFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonTransportFee">Transport Fee</label>
                    <input
                      type="number"
                      id="commonTransportFee"
                      value={commonFeesForm.transportFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, transportFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label htmlFor="commonExaminationFee">Examination Fee</label>
                    <input
                      type="number"
                      id="commonExaminationFee"
                      value={commonFeesForm.examinationFee}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, examinationFee: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="commonOtherFees">Other Fees</label>
                    <input
                      type="number"
                      id="commonOtherFees"
                      value={commonFeesForm.otherFees}
                      onChange={(e) => setCommonFeesForm({ ...commonFeesForm, otherFees: e.target.value })}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className={styles.infoBox}>
                  <p><strong>Note:</strong> This will create fee records for all {students.length} students with the same fee structure.</p>
                </div>
              </div>
              
              <div className={styles.modalActions}>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={() => setShowCommonFeesModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                >
                  Create Common Fees
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFees;
