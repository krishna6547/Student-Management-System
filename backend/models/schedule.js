const mongoose = require("mongoose");

const scheduleSchema = mongoose.Schema({
  className: { type: String, required: true },
  subject: { type: String, required: true },
  teacherId: { type: String, required: true },
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
  startTime: { type: String, required: true }, // Format: "HH:MM"
  endTime: { type: String, required: true }, // Format: "HH:MM"
  room: { type: String, default: '' },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'school', required: true }
});

// Compound index to ensure unique schedule per class-subject-day combination
scheduleSchema.index({ className: 1, subject: 1, day: 1, schoolId: 1 }, { unique: true });

const scheduleModel = mongoose.model("schedule", scheduleSchema);
module.exports = scheduleModel;
