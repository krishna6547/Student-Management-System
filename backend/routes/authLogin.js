const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const School = require('../models/school');
const User = require('../models/user');

// 🔐 LOGIN
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Email and password are required and must be strings' });
        }

        const school = await School.findOne({
            $or: [
                { 'teachers.email': email },
                { 'students.email': email }
            ]
        });

        let user = null, role = null, userId = null, schoolId = null;

        if (school) {
            const teacher = school.teachers.find(t => t.email === email);
            if (teacher && await bcrypt.compare(password, teacher.password)) {
                user = teacher;
                role = 'teacher';
                userId = teacher.id;
                schoolId = school._id;
            }

            const student = school.students.find(s => s.email === email);
            if (student && !user && await bcrypt.compare(password, student.password)) {
                user = student;
                role = 'student';
                userId = student.id;
                schoolId = school._id;
            }
        }

        // Check admin
        if (!user) {
            const adminUser = await User.findOne({ email });
            if (adminUser && adminUser.role === 'admin') {
                // 🚨 Use bcrypt for admin in real apps!
                if (await bcrypt.compare(password, adminUser.password)) {
                    user = adminUser;
                    role = 'admin';
                    userId = adminUser._id;
                }
            }
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found or invalid credentials' });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: userId,
                role,
                schoolId: role === 'admin' ? null : schoolId,
                name: user.name || 'Admin',
                email: user.email
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


// 🔍 GET USER ROLE BY ID
router.get('/me/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        let adminUser = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            adminUser = await User.findById(userId);
        }

        if (adminUser && adminUser.role === 'admin') {
            return res.json({ isAdmin: true, role: 'admin' });
        }

        const school = await School.findOne({
            $or: [
                { 'teachers.id': userId },
                { 'students.id': userId }
            ]
        });

        if (!school) {
            return res.status(404).json({ message: 'User not found' });
        }

        const teacher = school.teachers.find(t => t.id === userId);
        const student = school.students.find(s => s.id === userId);

        const role = teacher ? 'teacher' : student ? 'student' : null;

        if (!role) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.json({ isAdmin: false, role });

    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});


// 🔒 IS LOGGED IN
router.get('/isLoggedIn/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('🔍 Checking login status for userId:', userId);

        let adminUser = null;
        if (mongoose.Types.ObjectId.isValid(userId)) {
            adminUser = await User.findById(userId);
            if (adminUser && adminUser.role === 'admin') {
                console.log('✅ Admin user authenticated');
                return res.json({ isLoggedIn: true, role: 'admin', message: 'User is logged in' });
            }
        }

        const school = await School.findOne({
            $or: [
                { 'teachers.id': userId },
                { 'students.id': userId }
            ]
        });

        if (!school) {
            console.log('❌ No school found for userId:', userId);
            return res.status(401).json({ isLoggedIn: false, message: 'User not found' });
        }

        const teacher = school.teachers.find(t => t.id === userId);
        const student = school.students.find(s => s.id === userId);

        const role = teacher ? 'teacher' : student ? 'student' : null;

        if (!role) {
            console.log('❌ No role found for userId:', userId);
            return res.status(401).json({ isLoggedIn: false, message: 'User not found' });
        }

        console.log('✅ User authenticated with role:', role);
        res.json({ isLoggedIn: true, role, message: 'User is logged in' });

    } catch (error) {
        console.error('❌ Error checking login status:', error.message);
        res.status(500).json({ isLoggedIn: false, message: 'Server error' });
    }
});

module.exports = router;
