
const express = require('express');
const router = express.Router();
const grade = require('../models/grades');
const gradeModel = require('../models/grades');
const user = require('../models/user');
const school = require('../models/school');

// Get grades for a student (Student view)
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;

  if (!studentId) {
    return res.status(400).json({ message: 'Student ID is required' });
  }

  try {
    const grades = await gradeModel.find({ studentId }).sort({ lastUpdated: -1 });
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update grade (Teacher only)
router.post('/add', async (req, res) => {
  const { teacherId, studentId, className, subject, grade, percentage, comments } = req.body;

  if (!teacherId || !studentId || !className || !subject || !grade || !percentage) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Find the school that contains this teacher
    const schoolData = await school.findOne({ 'teachers.id': teacherId });
    if (!schoolData) {
      return res.status(404).json({ message: 'School or teacher not found' });
    }
    // Find teacher entry
    const teacher = (schoolData.teachers || []).find(t => t.id === teacherId);
    if (!teacher || !teacher.classes.includes(className)) {
      return res.status(403).json({ message: 'Teacher not authorized for this class' });
    }
    // Validate student exists and is in this class
    const student = (schoolData.students || []).find(s => s.id === studentId);
    if (!student || !student.classes.includes(className)) {
      return res.status(404).json({ message: 'Student not found or not enrolled in this class' });
    }
    // Determine status based on percentage
    let status;
    if (percentage >= 90) status = 'excellent';
    else if (percentage >= 80) status = 'good';
    else if (percentage >= 70) status = 'average';
    else if (percentage >= 60) status = 'below_average';
    else status = 'failing';
    // Check if grade already exists
      const existingGrade = await gradeModel.findOne({
      studentId,
      subject,
      className,
      schoolId: schoolData._id
    });
    if (existingGrade) {
      // Update existing grade
      existingGrade.grade = grade;
      existingGrade.percentage = percentage;
      existingGrade.status = status;
      existingGrade.comments = comments || existingGrade.comments;
      existingGrade.lastUpdated = new Date();
      await existingGrade.save();
      res.json({ message: 'Grade updated successfully', grade: existingGrade });
    } else {
      // Create new grade
        const newGrade = new gradeModel({
        studentId,
        teacherId,
        className,
        subject,
        grade,
        percentage,
        status,
        comments: comments || '',
        schoolId: schoolData._id
      });
      await newGrade.save();
      res.status(201).json({ message: 'Grade added successfully', grade: newGrade });
    }
  } catch (error) {
    console.error('Error adding/updating grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grades by teacher (Teacher view)
router.get('/teacher/:teacherId', async (req, res) => {
  const { teacherId } = req.params;

  if (!teacherId) {
    return res.status(400).json({ message: 'Teacher ID is required' });
  }

  try {
    const grades = await gradeModel.find({ teacherId }).sort({ lastUpdated: -1 });
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching teacher grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get grades by class (Teacher view)
router.get('/class/:className', async (req, res) => {
  const { className } = req.params;
  const { teacherId } = req.query;

  if (!className || !teacherId) {
    return res.status(400).json({ message: 'Class name and teacher ID are required' });
  }

  try {
    const grades = await gradeModel.find({ 
      className, 
      teacherId 
    }).sort({ lastUpdated: -1 });
    
    res.json({ success: true, grades });
  } catch (error) {
    console.error('Error fetching class grades:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete grade (Teacher only)
router.delete('/delete/:gradeId', async (req, res) => {
  const { gradeId } = req.params;
  const { teacherId } = req.body;

  if (!gradeId || !teacherId) {
    return res.status(400).json({ message: 'Grade ID and teacher ID are required' });
  }

  try {
    const gradeToDelete = await gradeModel.findById(gradeId);
    if (!gradeToDelete) {
      return res.status(404).json({ message: 'Grade not found' });
    }

    if (gradeToDelete.teacherId !== teacherId) {
      return res.status(403).json({ message: 'Not authorized to delete this grade' });
    }

    await gradeModel.findByIdAndDelete(gradeId);
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
