const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');
const School = require('../models/school');

// Get all students for a specific class (for teachers to mark attendance)
router.get('/students/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { teacherId } = req.query;

        // Find school that contains this teacher
        const school = await School.findOne({
            'teachers.id': teacherId
        });

        if (!school) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Get students for the specified class
        const students = school.students.filter(student => 
            student.classes.includes(classId)
        ).map(student => ({
            _id: student.id,
            email: student.email,
            name: student.name
        }));

        res.json({ success: true, students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Mark attendance for students (teacher functionality)
router.post('/mark', async (req, res) => {
    try {
        const { classId, subject, date, attendanceData, teacherId } = req.body;

        // Find school that contains this teacher
        const school = await School.findOne({
            'teachers.id': teacherId
        });

        if (!school) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        console.log('📝 Marking attendance with data:', {
            classId,
            subject,
            date,
            teacherId,
            attendanceDataLength: attendanceData.length,
            schoolId: school._id
        });

        const attendanceRecords = [];
        const errors = [];

        for (const record of attendanceData) {
            try {
                console.log('📝 Processing record:', record);
                
                const attendance = new Attendance({
                    student: record.studentId,
                    class: classId,
                    subject: subject,
                    date: new Date(date),
                    status: record.status,
                    markedBy: teacherId,
                    school: school._id
                });

                console.log('📝 Saving attendance record:', attendance);
                await attendance.save();
                attendanceRecords.push(attendance);
                console.log('✅ Attendance record saved successfully');
            } catch (error) {
                console.error('❌ Error saving attendance record:', error);
                if (error.code === 11000) {
                    // Duplicate attendance record
                    errors.push(`Attendance already marked for student ${record.studentId} on ${date}`);
                } else {
                    errors.push(`Error marking attendance for student ${record.studentId}: ${error.message}`);
                }
            }
        }

        res.json({
            success: true,
            message: `Attendance marked successfully. ${attendanceRecords.length} records saved.`,
            savedRecords: attendanceRecords.length,
            errors: errors
        });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get attendance for a specific student (student view)
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { startDate, endDate, classId, subject } = req.query;

        // Find school that contains this student
        const school = await School.findOne({
            'students.id': studentId
        });

        if (!school) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        // Build query
        const query = { student: studentId };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        if (classId) query.class = classId;
        if (subject) query.subject = subject;

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });

        // Get teacher information for each attendance record
        const attendanceWithTeacherInfo = attendance.map(record => {
            const teacher = school.teachers.find(t => t.id === record.markedBy);
            return {
                ...record.toObject(),
                markedBy: teacher ? {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email
                } : {
                    id: record.markedBy,
                    name: 'Unknown Teacher',
                    email: process.env.DEFAULT_TEACHER_EMAIL || 'noreply@example.com'
                }
            };
        });

        // Calculate attendance statistics
        const totalDays = attendance.length;
        const presentDays = attendance.filter(a => a.status === 'present').length;
        const absentDays = attendance.filter(a => a.status === 'absent').length;
        const lateDays = attendance.filter(a => a.status === 'late').length;

        res.json({
            success: true,
            attendance: attendanceWithTeacherInfo,
            statistics: {
                totalDays,
                presentDays,
                absentDays,
                lateDays,
                attendancePercentage: totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0
            }
        });
    } catch (error) {
        console.error('Error fetching student attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get attendance summary for a class (teacher view)
router.get('/class/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { date, subject, teacherId } = req.query;

        // Find school that contains this teacher
        const school = await School.findOne({
            'teachers.id': teacherId
        });

        if (!school) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const query = { class: classId, school: school._id };
        if (date) query.date = new Date(date);
        if (subject) query.subject = subject;

        const attendance = await Attendance.find(query)
            .sort({ date: -1 });

        // Get teacher information for each attendance record
        const attendanceWithTeacherInfo = attendance.map(record => {
            const teacher = school.teachers.find(t => t.id === record.markedBy);
            return {
                ...record.toObject(),
                markedBy: teacher ? {
                    id: teacher.id,
                    name: teacher.name,
                    email: teacher.email
                } : {
                    id: record.markedBy,
                    name: 'Unknown Teacher',
                    email: process.env.DEFAULT_TEACHER_EMAIL || 'noreply@example.com'
                }
            };
        });

        res.json({ success: true, attendance: attendanceWithTeacherInfo });
    } catch (error) {
        console.error('Error fetching class attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Update attendance record
router.put('/update/:attendanceId', async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status, teacherId } = req.body;

        // Find school that contains this teacher
        const school = await School.findOne({
            'teachers.id': teacherId
        });

        if (!school) {
            return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance) {
            return res.status(404).json({ success: false, message: 'Attendance record not found' });
        }

        attendance.status = status;
        await attendance.save();

        res.json({ success: true, message: 'Attendance updated successfully', attendance });
    } catch (error) {
        console.error('Error updating attendance:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
