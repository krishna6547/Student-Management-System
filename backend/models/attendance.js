const mongoose = require('mongoose');

const attendanceSchema = mongoose.Schema({
    student: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['present', 'absent', 'late'],
        default: 'present'
    },
    markedBy: {
        type: String,
        required: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'school',
        required: true
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate attendance records
attendanceSchema.index({ student: 1, class: 1, subject: 1, date: 1 }, { unique: true });

const attendanceModel = mongoose.model('attendance', attendanceSchema);
module.exports = attendanceModel;
