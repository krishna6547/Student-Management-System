// routes/dashboardRoute.js
const express = require('express');
const router = express.Router();
const user = require('../models/user');
const school = require('../models/school');

// Get dashboard statistics
router.get('/stats/:userId', async (req, res) => {
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

    // Calculate statistics
    const stats = {
      teachers: schoolData.teachers ? schoolData.teachers.length : 0,
      students: schoolData.students ? schoolData.students.length : 0,
      classes: schoolData.classes ? schoolData.classes.length : 0,
      subjects: schoolData.subjects ? schoolData.subjects.length : 0
    };

    res.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 