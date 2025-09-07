// routes/teacher.js
const express = require('express');
const router = express.Router();
const user = require('../models/user');
const school = require('../models/school');
const crypto = require('crypto');
const upload = require('../utils/multerSetup');
const bcrypt = require('bcrypt');

// Add a teacher
router.post('/add', upload.single('pfp'), async (req, res) => {
  const { name, email, password, classNames, userId } = req.body;
  let parsedClassNames;
  try {
    parsedClassNames = JSON.parse(classNames);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid classNames format, must be a JSON array' });
  }
  const pfp = req.file ? req.file.filename : null;

  if (!name || !email || !password || !Array.isArray(parsedClassNames) || parsedClassNames.length === 0 || !userId) {
    return res.status(400).json({ message: 'Name, email, password, at least one class, and User ID are required' });
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
    const emailExists = schoolData.teachers.some(t => t.email && t.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Prevent duplicate (same name teaching same classes)
    const duplicate = schoolData.teachers.find(
      t => t.name && t.name.trim().toLowerCase() === name.trim().toLowerCase() &&
      (t.classes || []).some(c => parsedClassNames.includes(c))
    );
    if (duplicate) {
      return res.status(400).json({ message: 'Teacher already assigned to one or more of these classes' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const teacherId = crypto.randomBytes(8).toString('hex');
    const teacher = {
      id: teacherId,
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      pfp,
      classes: parsedClassNames
    };

    schoolData.teachers.push(teacher);
    await schoolData.save();

    // Remove password from response
    const { password: _, ...teacherResponse } = teacher;
    res.status(201).json({ message: 'Teacher added successfully', teacher: teacherResponse });
  } catch (error) {
    console.error('Error adding teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher
router.put('/update', upload.single('pfp'), async (req, res) => {
  const { teacherId, name, email, password, classNames, userId } = req.body;
  let parsedClassNames;
  try {
    parsedClassNames = JSON.parse(classNames);
  } catch (error) {
    return res.status(400).json({ message: 'Invalid classNames format, must be a JSON array' });
  }
  const pfp = req.file ? req.file.filename : null;

  if (!teacherId || !name || !email || !Array.isArray(parsedClassNames) || parsedClassNames.length === 0 || !userId) {
    return res.status(400).json({ message: 'Missing required field(s)' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) return res.status(404).json({ message: 'User not found' });

    const schoolData = await school.findById(userData.school);
    if (!schoolData) return res.status(404).json({ message: 'School not found' });

    const teacher = schoolData.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check for email conflict with other teachers
    const emailExists = schoolData.teachers.some(
      t => t.id !== teacherId && t.email && t.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use by another teacher' });
    }

    teacher.name = name.trim();
    teacher.email = email.toLowerCase();
    if (password) {
      teacher.password = await bcrypt.hash(password, 10);
    }
    if (pfp) {
      teacher.pfp = pfp;
    }
    teacher.classes = parsedClassNames;
    schoolData.markModified('teachers');
    await schoolData.save();

    // Remove password from response
    const { password: _, ...teacherResponse } = teacher;
    res.json({ message: 'Teacher updated successfully', teacher: teacherResponse });
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get teachers by class or all
router.post('/byClass', async (req, res) => {
  const { className, userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) return res.status(404).json({ message: 'User not found' });

    const schoolData = await school.findById(userData.school);
    if (!schoolData) return res.status(404).json({ message: 'School not found' });

    let teachers;
    if (!className || className.toLowerCase() === 'all') {
      teachers = schoolData.teachers.map(({ password, ...rest }) => rest); // Remove password from response
    } else {
      teachers = schoolData.teachers
        .filter(t => (t.classes || []).includes(className))
        .map(({ password, ...rest }) => rest); // Remove password from response
    }
    res.json({ teachers });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update teacher profile (for teacher's own profile)
router.post('/updateProfile', upload.single('pfp'), async (req, res) => {
  const { teacherId, name, email, password } = req.body;
  const pfp = req.file ? req.file.filename : null;

  if (!teacherId || !name || !email) {
    return res.status(400).json({ message: 'Teacher ID, name, and email are required' });
  }

  try {
    // Find school that contains this teacher
    const schoolData = await school.findOne({ 'teachers.id': teacherId });
    if (!schoolData) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    const teacher = schoolData.teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check for email conflict with other teachers
    const emailExists = schoolData.teachers.some(
      t => t.id !== teacherId && t.email && t.email.toLowerCase() === email.toLowerCase()
    );
    if (emailExists) {
      return res.status(400).json({ message: 'Email already in use by another teacher' });
    }

    // Update teacher data
    teacher.name = name.trim();
    teacher.email = email.toLowerCase();
    if (password) {
      teacher.password = await bcrypt.hash(password, 10);
    }
    if (pfp) {
      teacher.pfp = pfp;
    }

    schoolData.markModified('teachers');
    await schoolData.save();

    // Remove password from response
    const { password: _, ...teacherResponse } = teacher;
    res.json({ message: 'Profile updated successfully', teacher: teacherResponse });
  } catch (error) {
    console.error('Error updating teacher profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove a teacher
router.delete('/remove', async (req, res) => {
  const { teacherId, userId } = req.body;
  if (!teacherId || !userId) {
    return res.status(400).json({ message: 'Missing required field(s)' });
  }

  try {
    const userData = await user.findById(userId);
    if (!userData) return res.status(404).json({ message: 'User not found' });

    const schoolData = await school.findById(userData.school);
    if (!schoolData) return res.status(404).json({ message: 'School not found' });

    const before = schoolData.teachers.length;
    schoolData.teachers = schoolData.teachers.filter(t => t.id !== teacherId);
    schoolData.markModified('teachers');
    await schoolData.save();

    if (schoolData.teachers.length === before) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher removed successfully' });
  } catch (error) {
    console.error('Error removing teacher:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;