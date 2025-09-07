const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const schedule = require('../models/schedule');
const school = require('../models/school');

const { isValidObjectId, Types } = mongoose;

// Helper: validate an id that must be ObjectId format
function requireValidObjectId(id, name, res) {
  if (!id) {
    res.status(400).json({ message: `${name} is required` });
    return null;
  }
  if (!isValidObjectId(id)) {
    res.status(400).json({ message: `Invalid ${name} format` });
    return null;
  }
  return new Types.ObjectId(id);
}

// Helper: normalize possible ObjectId/string to string for equality checks
function idToString(val) {
  if (!val) return '';
  try {
    return val.toString();
  } catch {
    return String(val);
  }
}

// Add/Update schedule (Teacher only)
router.post('/add', async (req, res) => {
  const { teacherId, className, subject, day, startTime, endTime, room } = req.body;

  if (!teacherId || !className || !subject || !day || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Find the school that contains this teacher
    const schoolData = await school.findOne({ 'teachers.id': teacherId });
    if (!schoolData) {
      return res.status(404).json({ message: 'School or teacher not found' });
    }
    // Find teacher entry
    const teacherEntry = (schoolData.teachers || []).find(t => t.id === teacherId);
    if (!teacherEntry) {
      return res.status(404).json({ message: 'Teacher not found in school' });
    }
    // Authorize: teacher must include className
    if (!Array.isArray(teacherEntry.classes) || !teacherEntry.classes.includes(className)) {
      return res.status(403).json({ message: 'Teacher not authorized for this class' });
    }
    // Upsert schedule for className+subject+day within the same school
    const existingSchedule = await schedule.findOne({
      className,
      subject,
      day,
      schoolId: schoolData._id,
    });
    if (existingSchedule) {
      existingSchedule.teacherId = teacherId;
      existingSchedule.startTime = startTime;
      existingSchedule.endTime = endTime;
      if (typeof room === 'string') existingSchedule.room = room;
      await existingSchedule.save();
      return res.json({ message: 'Schedule updated successfully', schedule: existingSchedule });
    } else {
      const newSchedule = new schedule({
        className,
        subject,
        teacherId,
        day,
        startTime,
        endTime,
        room: typeof room === 'string' ? room : '',
        schoolId: schoolData._id,
      });
      await newSchedule.save();
      return res.status(201).json({ message: 'Schedule added successfully', schedule: newSchedule });
    }
  } catch (error) {
    console.error('Error adding/updating schedule:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule for a student (Student view)
// Get schedule for a student (Student view)
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    // Find the school that contains this student
    const schoolData = await school.findOne({ 'students.id': studentId });
    if (!schoolData) {
      return res.status(404).json({ message: 'School or student not found' });
    }
    // Find the student entry in school.students by id (string compare)
    const studentEntry = (schoolData.students || []).find(s => s.id === studentId);
    if (!studentEntry) {
      return res.status(404).json({ message: 'Student not found in school' });
    }
    // Get schedules for student's classes
    const studentClasses = Array.isArray(studentEntry.classes) ? studentEntry.classes : [];
    const schedules = await schedule.find({
      className: { $in: studentClasses },
      schoolId: schoolData._id
    }).sort({ day: 1, startTime: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule by teacher (Teacher view)
router.get('/teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;


  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required' });
  }

  try {
    // teacherId in schedule schema is String, so compare as string
    const schedules = await schedule.find({ teacherId }).sort({ day: 1, startTime: 1 });
    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get schedule by class (Teacher view)
router.get('/class/:className', async (req, res) => {
  const { className } = req.params;
  const { teacherId } = req.query;

  if (!className || !teacherId) {
    return res.status(400).json({ message: 'Class name and teacher ID are required' });
  }

  try {
    const schedules = await schedule.find({ 
      className, 
      teacherId 
    }).sort({ day: 1, startTime: 1 });
    
    res.json({ success: true, schedules });
  } catch (error) {
    console.error('Error fetching class schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete schedule (Teacher only)
router.delete('/delete/:scheduleId', async (req, res) => {
  const { scheduleId } = req.params;
  const { teacherId } = req.body;

  if (!scheduleId || !teacherId) {
    return res.status(400).json({ message: 'Schedule ID and teacher ID are required' });
  }

  // Validate scheduleId for findById
  const scheduleObjId = requireValidObjectId(scheduleId, 'scheduleId', res);
  if (!scheduleObjId) return;

  // Validate teacherId format
  if (!isValidObjectId(teacherId)) {
    return res.status(400).json({ message: 'Invalid teacher ID format' });
  }

  try {
    const scheduleToDelete = await schedule.findById(scheduleObjId);
    if (!scheduleToDelete) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Compare as strings since teacherId in schedule is String
    if (scheduleToDelete.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to delete this schedule' });
    }

    await schedule.findByIdAndDelete(scheduleObjId);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
