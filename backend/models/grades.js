const mongoose = require("mongoose");

const gradeSchema = mongoose.Schema({
  studentId: { type: String, required: true },
  teacherId: { type: String, required: true },
  className: { type: String, required: true },
  subject: { type: String, required: true },
  grade: { type: String, required: true }, // A, B, C, D, F
  percentage: { type: Number, required: true, min: 0, max: 100 },
  status: { type: String, enum: ['excellent', 'good', 'average', 'below_average', 'failing'], required: true },
  comments: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'school', required: true }
});

// Compound index to ensure unique grades per student-subject combination
gradeSchema.index({ studentId: 1, subject: 1, className: 1, schoolId: 1 }, { unique: true });

const gradeModel = mongoose.model("grade", gradeSchema);
module.exports = gradeModel;
