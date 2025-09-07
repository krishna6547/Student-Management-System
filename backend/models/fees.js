const mongoose = require('mongoose');

const feesSchema = mongoose.Schema({
  school: { type: mongoose.Schema.Types.ObjectId, ref: 'school', required: true },
  studentId: { type: String, required: true },
  feeStructure: {
    tuitionFee: { type: Number, default: 0 },
    libraryFee: { type: Number, default: 0 },
    laboratoryFee: { type: Number, default: 0 },
    sportsFee: { type: Number, default: 0 },
    transportFee: { type: Number, default: 0 },
    examinationFee: { type: Number, default: 0 },
    otherFees: { type: Number, default: 0 }
  },
  totalAmount: { type: Number, required: true },
  academicYear: { type: String, required: true },
  semester: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'partial', 'paid', 'overdue'], 
    default: 'pending' 
  },
  payments: [{
    paymentId: { type: String, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ['credit_card', 'debit_card', 'bank_transfer', 'cash', 'online'], 
      required: true 
    },
    transactionId: { type: String },
    paymentDate: { type: Date, default: Date.now },
    receiptNumber: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'refunded'], 
      default: 'pending' 
    },
    notes: { type: String }
  }],
  totalPaid: { type: Number, default: 0 },
  balance: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Calculate balance before saving
feesSchema.pre('save', function(next) {
  this.balance = this.totalAmount - this.totalPaid;
  
  // Update status based on payment
  if (this.balance === 0) {
    this.status = 'paid';
  } else if (this.totalPaid > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  } else {
    this.status = 'pending';
  }
  
  this.updatedAt = new Date();
  next();
});

const feesModel = mongoose.model('fees', feesSchema);
module.exports = feesModel;
