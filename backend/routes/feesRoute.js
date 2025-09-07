const express = require('express');
const router = express.Router();
const fees = require('../models/fees');
const user = require('../models/user');
const school = require('../models/school');
const crypto = require('crypto');

// Generate receipt number
const generateReceiptNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RCP-${timestamp.slice(-6)}-${random}`;
};

// Generate payment ID
const generatePaymentId = () => {
  return `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

// Get student fees overview
router.get('/student/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // For students/teachers, userId is a hex string stored in school.students/teachers
    // First, find the school that contains this student
    const schoolData = await school.findOne({
      'students.id': userId
    });

    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found in any school' });
    }

    // Find the specific student
    const student = schoolData.students.find(s => s.id === userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get all fees records for the student
    const feesRecords = await fees.find({ 
      school: schoolData._id, 
      studentId: student.id 
    }).sort({ createdAt: -1 });

    // Calculate summary
    const summary = {
      totalFees: 0,
      totalPaid: 0,
      totalBalance: 0,
      pendingFees: 0,
      overdueFees: 0
    };

    feesRecords.forEach(record => {
      summary.totalFees += record.totalAmount;
      summary.totalPaid += record.totalPaid;
      summary.totalBalance += record.balance;
      
      if (record.status === 'pending') summary.pendingFees++;
      if (record.status === 'overdue') summary.overdueFees++;
    });

    res.json({
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        classes: student.classes
      },
      feesRecords,
      summary
    });
  } catch (error) {
    console.error('Error fetching student fees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get specific fees record
router.get('/record/:feesId', async (req, res) => {
  const { feesId } = req.params;
  
  try {
    const feesRecord = await fees.findById(feesId);
    if (!feesRecord) {
      return res.status(404).json({ message: 'Fees record not found' });
    }

    res.json(feesRecord);
  } catch (error) {
    console.error('Error fetching fees record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new fees record (Admin function)
router.post('/create', async (req, res) => {
  const { 
    userId, 
    studentId, 
    feeStructure, 
    totalAmount, 
    academicYear, 
    semester, 
    dueDate 
  } = req.body;

  if (!userId || !studentId || !totalAmount || !academicYear || !semester || !dueDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newFees = new fees({
      school: userData.school,
      studentId,
      feeStructure: feeStructure || {},
      totalAmount,
      academicYear,
      semester,
      dueDate: new Date(dueDate),
      balance: totalAmount
    });

    await newFees.save();
    res.status(201).json({ message: 'Fees record created successfully', fees: newFees });
  } catch (error) {
    console.error('Error creating fees record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create common fees for all students (Admin function)
router.post('/create-common', async (req, res) => {
  const { 
    userId, 
    studentIds, 
    feeStructure, 
    totalAmount, 
    academicYear, 
    semester, 
    dueDate 
  } = req.body;

  if (!userId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0 || !totalAmount || !academicYear || !semester || !dueDate) {
    return res.status(400).json({ message: 'All fields are required and studentIds must be an array' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const createdFees = [];
    let createdCount = 0;

    for (const studentId of studentIds) {
      // Check if fees already exist for this student for the same academic year and semester
      const existingFees = await fees.findOne({
        school: userData.school,
        studentId,
        academicYear,
        semester
      });

      if (!existingFees) {
        const newFees = new fees({
          school: userData.school,
          studentId,
          feeStructure: feeStructure || {},
          totalAmount,
          academicYear,
          semester,
          dueDate: new Date(dueDate),
          balance: totalAmount
        });

        await newFees.save();
        createdFees.push(newFees);
        createdCount++;
      }
    }

    res.status(201).json({ 
      message: `Common fees created successfully for ${createdCount} students`, 
      createdCount,
      fees: createdFees 
    });
  } catch (error) {
    console.error('Error creating common fees:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment
router.post('/payment', async (req, res) => {
  const { 
    userId, 
    feesId, 
    amount, 
    paymentMethod, 
    notes 
  } = req.body;

  if (!userId || !feesId || !amount || !paymentMethod) {
    return res.status(400).json({ message: 'All payment fields are required' });
  }

  try {
    // For students/teachers, userId is a hex string stored in school.students/teachers
    const schoolData = await school.findOne({
      'students.id': userId
    });

    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found in any school' });
    }

    // Find the specific student
    const student = schoolData.students.find(s => s.id === userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feesRecord = await fees.findById(feesId);
    if (!feesRecord) {
      return res.status(404).json({ message: 'Fees record not found' });
    }

    // Verify student owns this fees record
    if (feesRecord.studentId !== student.id) {
      return res.status(403).json({ message: 'Unauthorized access to fees record' });
    }

    // Validate payment amount
    if (amount <= 0 || amount > feesRecord.balance) {
      return res.status(400).json({ message: 'Invalid payment amount' });
    }

    // Mock payment processing
    const paymentId = generatePaymentId();
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const receiptNumber = generateReceiptNumber();

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create payment record
    const payment = {
      paymentId,
      amount,
      paymentMethod,
      transactionId,
      paymentDate: new Date(),
      receiptNumber,
      status: 'completed',
      notes: notes || ''
    };

    // Update fees record
    feesRecord.payments.push(payment);
    feesRecord.totalPaid += amount;
    feesRecord.balance = feesRecord.totalAmount - feesRecord.totalPaid;

    // Update status
    if (feesRecord.balance === 0) {
      feesRecord.status = 'paid';
    } else if (feesRecord.totalPaid > 0) {
      feesRecord.status = 'partial';
    }

    await feesRecord.save();

    res.json({
      message: 'Payment processed successfully',
      payment,
      updatedFees: feesRecord
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment receipt
router.get('/receipt/:paymentId', async (req, res) => {
  const { paymentId } = req.params;
  const { userId } = req.query;

  try {
    // For students/teachers, userId is a hex string stored in school.students/teachers
    const schoolData = await school.findOne({
      'students.id': userId
    });

    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found in any school' });
    }

    const feesRecord = await fees.findOne({
      'payments.paymentId': paymentId,
      school: schoolData._id
    });

    if (!feesRecord) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const payment = feesRecord.payments.find(p => p.paymentId === paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Get student details
    const student = schoolData.students.find(s => s.id === feesRecord.studentId);

    const receipt = {
      receiptNumber: payment.receiptNumber,
      studentName: student.name,
      studentId: student.id,
      paymentDate: payment.paymentDate,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      academicYear: feesRecord.academicYear,
      semester: feesRecord.semester,
      schoolName: schoolData.name,
      balance: feesRecord.balance
    };

    res.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment history
router.get('/payments/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // For students/teachers, userId is a hex string stored in school.students/teachers
    const schoolData = await school.findOne({
      'students.id': userId
    });

    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found in any school' });
    }

    // Find the specific student
    const student = schoolData.students.find(s => s.id === userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feesRecords = await fees.find({ 
      school: schoolData._id, 
      studentId: student.id 
    });

    const allPayments = [];
    feesRecords.forEach(record => {
      record.payments.forEach(payment => {
        allPayments.push({
          ...payment.toObject(),
          academicYear: record.academicYear,
          semester: record.semester,
          feesId: record._id
        });
      });
    });

    // Sort by payment date (newest first)
    allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    res.json(allPayments);
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get fees statistics for student
router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // For students/teachers, userId is a hex string stored in school.students/teachers
    const schoolData = await school.findOne({
      'students.id': userId
    });

    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found in any school' });
    }

    // Find the specific student
    const student = schoolData.students.find(s => s.id === userId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const feesRecords = await fees.find({ 
      school: schoolData._id, 
      studentId: student.id 
    });

    const stats = {
      totalRecords: feesRecords.length,
      totalAmount: 0,
      totalPaid: 0,
      totalBalance: 0,
      pendingCount: 0,
      partialCount: 0,
      paidCount: 0,
      overdueCount: 0,
      monthlyPayments: {},
      paymentMethods: {}
    };

    feesRecords.forEach(record => {
      stats.totalAmount += record.totalAmount;
      stats.totalPaid += record.totalPaid;
      stats.totalBalance += record.balance;

      switch (record.status) {
        case 'pending': stats.pendingCount++; break;
        case 'partial': stats.partialCount++; break;
        case 'paid': stats.paidCount++; break;
        case 'overdue': stats.overdueCount++; break;
      }

      record.payments.forEach(payment => {
        const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
        stats.monthlyPayments[month] = (stats.monthlyPayments[month] || 0) + payment.amount;
        
        stats.paymentMethods[payment.paymentMethod] = (stats.paymentMethods[payment.paymentMethod] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching fees statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all fees records for admin
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const feesRecords = await fees.find({ school: userData.school }).sort({ createdAt: -1 });
    res.json(feesRecords);
  } catch (error) {
    console.error('Error fetching all fees records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get admin statistics
router.get('/admin-stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const feesRecords = await fees.find({ school: userData.school });

    const stats = {
      totalRecords: feesRecords.length,
      totalAmount: 0,
      totalPaid: 0,
      totalBalance: 0,
      pendingCount: 0,
      partialCount: 0,
      paidCount: 0,
      overdueCount: 0,
      monthlyPayments: {},
      paymentMethods: {}
    };

    feesRecords.forEach(record => {
      stats.totalAmount += record.totalAmount;
      stats.totalPaid += record.totalPaid;
      stats.totalBalance += record.balance;

      switch (record.status) {
        case 'pending': stats.pendingCount++; break;
        case 'partial': stats.partialCount++; break;
        case 'paid': stats.paidCount++; break;
        case 'overdue': stats.overdueCount++; break;
      }

      record.payments.forEach(payment => {
        const month = new Date(payment.paymentDate).toISOString().slice(0, 7);
        stats.monthlyPayments[month] = (stats.monthlyPayments[month] || 0) + payment.amount;
        
        stats.paymentMethods[payment.paymentMethod] = (stats.paymentMethods[payment.paymentMethod] || 0) + 1;
      });
    });

    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin fees statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
