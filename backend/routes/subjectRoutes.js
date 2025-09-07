const express = require('express');
const router = express.Router();
const user = require('../models/user'); // Assuming you have a user model
const school = require('../models/school'); // Assuming you have a school model

// Helper function to calculate real counts for a subject
const calculateSubjectCounts = (schoolData, subjectName) => {
    // Count teachers teaching this subject
    const teachersCount = schoolData.teachers.filter(teacher => 
        teacher.classes && teacher.classes.some(className => {
            const classData = schoolData.classes.find(c => c.className === className);
            return classData && classData.subjects && classData.subjects.includes(subjectName);
        })
    ).length;
    
    // Count students enrolled in classes that have this subject
    const studentsCount = schoolData.students.filter(student => 
        student.classes && student.classes.some(className => {
            const classData = schoolData.classes.find(c => c.className === className);
            return classData && classData.subjects && classData.subjects.includes(subjectName);
        })
    ).length;
    
    return { studentsCount, teachersCount };
};

// Add a new subject
router.post('/add', async (req, res) => {
    const { name, userId } = req.body;
    if (!name || !userId) {
        return res.status(400).json({ message: 'Name and User ID are required' });
    }
    // Validate name
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ message: 'Invalid subject name' });
    }
    // only alpahnumeric characters and spaces allowed
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(name)) {
        return res.status(400).json({ message: 'Subject name can only contain alphanumeric characters and spaces' });
    }
    try {
        const userData = await user.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Fixed typo: finddById -> findById
        const schoolData = await school.findById(userData.school);
        if (!schoolData) {
            return res.status(404).json({ message: 'School not found' });
        }
        
        // Check if subject already exists (case-insensitive)
        const subjectExists = schoolData.subjects.some(
            subject => subject.name.toLowerCase() === name.toLowerCase()
        );
        
        if (subjectExists) {
            return res.status(400).json({ message: 'Subject already exists' });
        }
        
        // Create new subject object with default values
        const newSubject = {
            name: name.trim(),
            students: 0,
            teachers: 0,
            createdAt: new Date()
        };
        
        schoolData.subjects.push(newSubject);
        await schoolData.save();
        
        // Calculate real counts for the new subject (will be 0 initially)
        const { studentsCount, teachersCount } = calculateSubjectCounts(schoolData, newSubject.name);
        
        res.status(201).json({ 
            message: 'Subject added successfully', 
            subject: {
                ...newSubject,
                students: studentsCount,
                teachers: teachersCount
            }
        });
    } catch (error) {
        console.error('Error adding subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch all subjects for a school
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
        
        // Calculate real counts for each subject
        const subjectsWithRealCounts = schoolData.subjects.map((subject, index) => {
            const { studentsCount, teachersCount } = calculateSubjectCounts(schoolData, subject.name);
            
            return {
                id: subject._id || index + 1,
                name: subject.name,
                students: studentsCount,
                teachers: teachersCount
            };
        });
        
        res.status(200).json({ 
            message: 'Subjects fetched successfully', 
            subjects: subjectsWithRealCounts
        });
    } catch (error) {
        console.error('Error fetching subjects:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove a subject
router.delete('/remove', async (req, res) => {
    const { subjectName, userId } = req.body;
    try {
        const userData = await user.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const schoolData = await school.findById(userData.school);
        if (!schoolData) {
            return res.status(404).json({ message: 'School not found' });
        }
        
        // Find and remove the subject
        const subjectIndex = schoolData.subjects.findIndex(
            subject => subject.name === subjectName
        );
        
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        schoolData.subjects.splice(subjectIndex, 1);
        await schoolData.save();
        
        res.status(200).json({ 
            message: 'Subject removed successfully',
            removedSubject: subjectName 
        });
    } catch (error) {
        console.error('Error removing subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Update a subject (students and teachers count)
router.put('/update', async (req, res) => {
    const { subjectId, subjectName, students, teachers, userId } = req.body;
    
    try {
        const userData = await user.findById(userId);
        if (!userData) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        const schoolData = await school.findById(userData.school);
        if (!schoolData) {
            return res.status(404).json({ message: 'School not found' });
        }
        
        // Find the subject by name
        const subjectIndex = schoolData.subjects.findIndex(
            subject => subject.name.toLowerCase() === subjectName.toLowerCase()
        );
        
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Validate input
        if (students < 0 || teachers < 0) {
            return res.status(400).json({ message: 'Student and teacher counts cannot be negative' });
        }
        
        // Update the subject - IMPORTANT: Use direct array modification
        schoolData.subjects[subjectIndex].students = parseInt(students) || 0;
        schoolData.subjects[subjectIndex].teachers = parseInt(teachers) || 0;
        schoolData.subjects[subjectIndex].updatedAt = new Date();
        
        // Mark the subjects array as modified (crucial for MongoDB)
        schoolData.markModified('subjects');
        
        await schoolData.save();
        
        res.status(200).json({ 
            message: 'Subject updated successfully',
            subject: {
                name: schoolData.subjects[subjectIndex].name,
                students: schoolData.subjects[subjectIndex].students,
                teachers: schoolData.subjects[subjectIndex].teachers
            }
        });
    } catch (error) {
        console.error('Error updating subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update subject name
router.put('/updateName', async (req, res) => {
    const { oldName, newName, userId } = req.body;
    
    if (!oldName || !newName || !userId) {
        return res.status(400).json({ message: 'Old name, new name, and User ID are required' });
    }
    
    // Validate new name
    if (typeof newName !== 'string' || newName.trim() === '') {
        return res.status(400).json({ message: 'Invalid subject name' });
    }
    
    // Only alphanumeric characters and spaces allowed
    const nameRegex = /^[a-zA-Z0-9\s]+$/;
    if (!nameRegex.test(newName)) {
        return res.status(400).json({ message: 'Subject name can only contain alphanumeric characters and spaces' });
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
        
        // Find the subject by old name
        const subjectIndex = schoolData.subjects.findIndex(
            subject => subject.name.toLowerCase() === oldName.toLowerCase()
        );
        
        if (subjectIndex === -1) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        
        // Check if new name already exists (case-insensitive)
        const nameExists = schoolData.subjects.some(
            subject => subject.name.toLowerCase() === newName.trim().toLowerCase() && 
                      subject.name.toLowerCase() !== oldName.toLowerCase()
        );
        
        if (nameExists) {
            return res.status(400).json({ message: 'Subject name already exists' });
        }
        
        // Update the subject name
        schoolData.subjects[subjectIndex].name = newName.trim();
        schoolData.subjects[subjectIndex].updatedAt = new Date();
        
        // Mark the subjects array as modified
        schoolData.markModified('subjects');
        
        await schoolData.save();
        
        // Calculate real counts for the updated subject
        const { studentsCount, teachersCount } = calculateSubjectCounts(schoolData, schoolData.subjects[subjectIndex].name);
        
        res.status(200).json({ 
            message: 'Subject name updated successfully',
            subject: {
                name: schoolData.subjects[subjectIndex].name,
                students: studentsCount,
                teachers: teachersCount
            }
        });
    } catch (error) {
        console.error('Error updating subject name:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;