// routes/studentRoute.js
const express = require('express');
const router = express.Router();
const user = require('../models/user');
const school = require('../models/school');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const upload = require('../utils/multerSetup');

// Add a student
router.post('/add', async (req, res) => {
  const { name, fatherName, email, password, classes, userId } = req.body;
  let parsedClasses;
  
  try {
    parsedClasses = JSON.parse(classes);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid classes format, must be a JSON array' });
  }

  if (!name || !fatherName || !email || !password || !Array.isArray(parsedClasses) || parsedClasses.length === 0 || !userId) {
    return res.status(400).json({ message: 'Name, father name, email, password, at least one class, and User ID are required' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const schoolData = await school.findById(userData.school);
    if (!schoolData) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Check for duplicate email
    const emailExists = schoolData.students.some(s => s.email && s.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate that all classes exist in the school
    const schoolClasses = schoolData.classes.map(classItem => classItem.className);
    const invalidClasses = parsedClasses.filter(className => !schoolClasses.includes(className));
    
    if (invalidClasses.length > 0) {
      return res.status(400).json({ 
        message: `Invalid classes: ${invalidClasses.join(', ')}. Please ensure all classes exist in the school.` 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = crypto.randomBytes(8).toString('hex');
    const student = {
      id: studentId,
      name: name.trim(),
      fatherName: fatherName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      classes: parsedClasses,
      createdAt: new Date()
    };

    schoolData.students.push(student);
    await schoolData.save();

    // Remove password from response
    const { password: _, ...studentResponse } = student;
    res.status(201).json({ message: 'Student added successfully', student: studentResponse });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Fetch all students for a school
router.get('/all/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const schoolData = await school.findById(userData.school);
    if (!schoolData) {
      return res.status(404).json({ message: 'School not found' });
    }

    // Remove passwords from response
    const students = schoolData.students.map(student => {
      const { password, ...studentWithoutPassword } = student;
      return studentWithoutPassword;
    });

    res.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/update', async (req, res) => {
  const { studentId, name, fatherName, email, password, classes, userId } = req.body;
  let parsedClasses;
  
  try {
    parsedClasses = JSON.parse(classes);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid classes format, must be a JSON array' });
  }

  if (!studentId || !name || !fatherName || !email || !Array.isArray(parsedClasses) || parsedClasses.length === 0 || !userId) {
    return res.status(400).json({ message: 'Missing required field(s)' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) return res.status(404).json({ message: 'User not found' });

    const schoolData = await school.findById(userData.school);
    if (!schoolData) return res.status(404).json({ message: 'School not found' });

    const student = schoolData.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for duplicate email (excluding current student)
    const emailExists = schoolData.students.some(s => 
      s.id !== studentId && s.email && s.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Validate that all classes exist in the school
    const schoolClasses = schoolData.classes.map(classItem => classItem.className);
    const invalidClasses = parsedClasses.filter(className => !schoolClasses.includes(className));
    
    if (invalidClasses.length > 0) {
      return res.status(400).json({ 
        message: `Invalid classes: ${invalidClasses.join(', ')}. Please ensure all classes exist in the school.` 
      });
    }

    // Update student fields
    student.name = name.trim();
    student.fatherName = fatherName.trim();
    student.email = email.toLowerCase();
    student.classes = parsedClasses;

    // Update password if provided
    if (password && password.length >= 6) {
      student.password = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    await schoolData.save();

    // Remove password from response
    const { password: _, ...studentResponse } = student;
    res.json({ message: 'Student updated successfully', student: studentResponse });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove student
router.delete('/remove', async (req, res) => {
  const { studentId, userId } = req.body;

  if (!studentId || !userId) {
    return res.status(400).json({ message: 'Student ID and User ID are required' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const schoolData = await school.findById(userData.school);
    if (!schoolData) {
      return res.status(404).json({ message: 'School not found' });
    }

    const studentIndex = schoolData.students.findIndex(s => s.id === studentId);
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove student from school
    schoolData.students.splice(studentIndex, 1);
    await schoolData.save();

    res.json({ message: 'Student removed successfully' });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile (for student's own profile)
router.post('/updateProfile', upload.single('pfp'), async (req, res) => {
  const { studentId, name, email, fatherName, password } = req.body;
  const pfp = req.file ? req.file.filename : null;

  if (!studentId || !name || !email) {
    return res.status(400).json({ message: 'Student ID, name, and email are required' });
  }

  try {
    // Find school that contains this student
    const schoolData = await school.findOne({ 'students.id': studentId });
    if (!schoolData) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const student = schoolData.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check for email conflict with other students
    const emailExists = schoolData.students.some(
      s => s.id !== studentId && s.email && s.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use by another student' });
    }

    // Update student data
    student.name = name.trim();
    student.email = email.toLowerCase();
    if (fatherName) {
      student.fatherName = fatherName.trim();
    }
    if (password) {
      student.password = await bcrypt.hash(password, 10);
    }
    if (pfp) {
      student.pfp = pfp;
    }

    schoolData.markModified('students');
    await schoolData.save();

    // Remove password from response
    const { password: _, ...studentResponse } = student;
    res.json({ message: 'Profile updated successfully', student: studentResponse });
  } catch (error) {
    console.error('Error updating student profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/:studentId/:userId', async (req, res) => {
  const { studentId, userId } = req.params;

  try {
    const userData = await user.findById(userId);
    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    const schoolData = await school.findById(userData.school);
    if (!schoolData) {
      return res.status(404).json({ message: 'School not found' });
    }

    const student = schoolData.students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove password from response
    const { password, ...studentWithoutPassword } = student;
    res.json({ student: studentWithoutPassword });
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 