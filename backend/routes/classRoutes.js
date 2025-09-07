const express = require('express');
const router = express.Router();
const user = require('../models/user'); // Assuming you have a user model
const school = require('../models/school'); // Assuming you have a school model

// Add a new class
router.post('/add', async (req, res) => {
    const { className, subjects, userId } = req.body;
    if (!className || !userId || !subjects || !Array.isArray(subjects)) {
        return res.status(400).json({ message: 'Class name, subjects array, and User ID are required' });
    }
    
    // Validate className
    if (typeof className !== 'string' || className.trim() === '') {
        return res.status(400).json({ message: 'Invalid class name' });
    }
    
    // Only alphanumeric characters, spaces, and common class indicators allowed
    const classNameRegex = /^[a-zA-Z0-9\s\-]+$/;
    if (!classNameRegex.test(className)) {
        return res.status(400).json({ message: 'Class name can only contain alphanumeric characters, spaces, and hyphens' });
    }
    
    // Validate subjects array
    if (subjects.length === 0) {
        return res.status(400).json({ message: 'At least one subject must be assigned to the class' });
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
        
        // Check if class already exists (case-insensitive)
        const classExists = schoolData.classes.some(
            classItem => classItem.className.toLowerCase() === className.toLowerCase()
        );
        
        if (classExists) {
            return res.status(400).json({ message: 'Class already exists' });
        }
        
        // Validate that all subjects exist in the school
        const schoolSubjects = schoolData.subjects.map(subject => subject.name);
        const invalidSubjects = subjects.filter(subject => !schoolSubjects.includes(subject));
        
        if (invalidSubjects.length > 0) {
            return res.status(400).json({ 
                message: `Invalid subjects: ${invalidSubjects.join(', ')}. Please ensure all subjects exist in the school.` 
            });
        }
        
        // Create new class object
        const newClass = {
            className: className.trim(),
            subjects: subjects,
            students: 0,
            teachers: 0,
            createdAt: new Date()
        };
        
        schoolData.classes.push(newClass);
        await schoolData.save();
        
        // Return the class with an ID for frontend handling
        const savedClass = schoolData.classes[schoolData.classes.length - 1];
        const classWithId = {
            id: savedClass._id || schoolData.classes.length,
            className: savedClass.className,
            subjects: savedClass.subjects,
            students: savedClass.students || 0,
            teachers: savedClass.teachers || 0
        };
        
        res.status(201).json({ 
            message: 'Class added successfully', 
            class: classWithId 
        });
    } catch (error) {
        console.error('Error adding class:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Fetch all classes for a school
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
        
        // Map classes to include IDs for frontend handling
        const classes = schoolData.classes.map((classItem, index) => ({
            id: classItem._id || index + 1,
            className: classItem.className,
            subjects: classItem.subjects || [],
            students: classItem.students || 0,
            teachers: classItem.teachers || 0
        }));
        
        res.status(200).json({ 
            message: 'Classes fetched successfully', 
            classes 
        });
    } catch (error) {
        console.error('Error fetching classes:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a class
router.put('/update', async (req, res) => {
    const { classId, className, subjects, userId } = req.body;
    
    if (!classId || !className || !subjects || !Array.isArray(subjects) || !userId) {
        return res.status(400).json({ message: 'Class ID, name, subjects array, and User ID are required' });
    }
    
    // Validate className
    if (typeof className !== 'string' || className.trim() === '') {
        return res.status(400).json({ message: 'Invalid class name' });
    }
    
    const classNameRegex = /^[a-zA-Z0-9\s\-]+$/;
    if (!classNameRegex.test(className)) {
        return res.status(400).json({ message: 'Class name can only contain alphanumeric characters, spaces, and hyphens' });
    }
    
    if (subjects.length === 0) {
        return res.status(400).json({ message: 'At least one subject must be assigned to the class' });
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
        
        // Find the class by ID
        const classIndex = schoolData.classes.findIndex(
            classItem => classItem._id && classItem._id.toString() === classId.toString()
        );
        
        if (classIndex === -1) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        // Check if another class with the same name exists (excluding current class)
        const duplicateClass = schoolData.classes.find(
            (classItem, index) => 
                index !== classIndex && 
                classItem.className.toLowerCase() === className.toLowerCase()
        );
        
        if (duplicateClass) {
            return res.status(400).json({ message: 'A class with this name already exists' });
        }
        
        // Validate that all subjects exist in the school
        const schoolSubjects = schoolData.subjects.map(subject => subject.name);
        const invalidSubjects = subjects.filter(subject => !schoolSubjects.includes(subject));
        
        if (invalidSubjects.length > 0) {
            return res.status(400).json({ 
                message: `Invalid subjects: ${invalidSubjects.join(', ')}. Please ensure all subjects exist in the school.` 
            });
        }
        
        // Update the class
        schoolData.classes[classIndex].className = className.trim();
        schoolData.classes[classIndex].subjects = subjects;
        schoolData.classes[classIndex].updatedAt = new Date();
        
        // Mark the classes array as modified (crucial for MongoDB)
        schoolData.markModified('classes');
        
        await schoolData.save();
        
        res.status(200).json({ 
            message: 'Class updated successfully',
            class: {
                id: schoolData.classes[classIndex]._id,
                className: schoolData.classes[classIndex].className,
                subjects: schoolData.classes[classIndex].subjects,
                students: schoolData.classes[classIndex].students || 0,
                teachers: schoolData.classes[classIndex].teachers || 0
            }
        });
    } catch (error) {
        console.error('Error updating class:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove a class
router.delete('/remove', async (req, res) => {
    const { classId, userId } = req.body;
    
    if (!classId || !userId) {
        return res.status(400).json({ message: 'Class ID and User ID are required' });
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
        
        // Find the class by ID
        const classIndex = schoolData.classes.findIndex(
            classItem => classItem._id && classItem._id.toString() === classId.toString()
        );
        
        if (classIndex === -1) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        const removedClass = schoolData.classes[classIndex];
        schoolData.classes.splice(classIndex, 1);
        await schoolData.save();
        
        res.status(200).json({ 
            message: 'Class removed successfully',
            removedClass: {
                id: removedClass._id,
                className: removedClass.className
            }
        });
    } catch (error) {
        console.error('Error removing class:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get classes by subject
router.post('/bySubject', async (req, res) => {
    const { subjectName, userId } = req.body;
    
    if (!subjectName || !userId) {
        return res.status(400).json({ message: 'Subject name and User ID are required' });
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
        
        // Filter classes that include the specified subject
        const classesWithSubject = schoolData.classes
            .filter(classItem => 
                classItem.subjects && classItem.subjects.includes(subjectName)
            )
            .map((classItem, index) => ({
                id: classItem._id || index + 1,
                className: classItem.className,
                subjects: classItem.subjects,
                students: classItem.students || 0,
                teachers: classItem.teachers || 0
            }));
        
        res.status(200).json({ 
            message: 'Classes fetched successfully', 
            classes: classesWithSubject 
        });
    } catch (error) {
        console.error('Error fetching classes by subject:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update class statistics (students and teachers count)
router.put('/updateStats', async (req, res) => {
    const { classId, students, teachers, userId } = req.body;
    
    if (!classId || !userId) {
        return res.status(400).json({ message: 'Class ID and User ID are required' });
    }
    
    // Validate counts
    if (students !== undefined && students < 0) {
        return res.status(400).json({ message: 'Student count cannot be negative' });
    }
    
    if (teachers !== undefined && teachers < 0) {
        return res.status(400).json({ message: 'Teacher count cannot be negative' });
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
        
        // Find the class by ID
        const classIndex = schoolData.classes.findIndex(
            classItem => classItem._id && classItem._id.toString() === classId.toString()
        );
        
        if (classIndex === -1) {
            return res.status(404).json({ message: 'Class not found' });
        }
        
        // Update the statistics
        if (students !== undefined) {
            schoolData.classes[classIndex].students = parseInt(students) || 0;
        }
        
        if (teachers !== undefined) {
            schoolData.classes[classIndex].teachers = parseInt(teachers) || 0;
        }
        
        schoolData.classes[classIndex].updatedAt = new Date();
        
        // Mark the classes array as modified (crucial for MongoDB)
        schoolData.markModified('classes');
        
        await schoolData.save();
        
        res.status(200).json({ 
            message: 'Class statistics updated successfully',
            class: {
                id: schoolData.classes[classIndex]._id,
                className: schoolData.classes[classIndex].className,
                subjects: schoolData.classes[classIndex].subjects,
                students: schoolData.classes[classIndex].students,
                teachers: schoolData.classes[classIndex].teachers
            }
        });
    } catch (error) {
        console.error('Error updating class statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;