const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const School = require('../models/school');
const User = require('../models/user');
const emailConfig = require('../config/email');

// Generate OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Email transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Send OTP via email
const sendOTPEmail = async (email, otp, userName) => {
    const mailOptions = {
        from: emailConfig.user,
        to: email,
        subject: 'Password Reset OTP - School Management System',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                    <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
                </div>
                <div style="padding: 20px; background: #f9f9f9;">
                    <p>Hello ${userName || 'User'},</p>
                    <p>You have requested to reset your password for the School Management System.</p>
                    <p>Your OTP (One-Time Password) is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <div style="background: #667eea; color: white; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; display: inline-block;">
                            ${otp}
                        </div>
                    </div>
                    <p><strong>Important:</strong></p>
                    <ul>
                        <li>This OTP is valid for 10 minutes only</li>
                        <li>Do not share this OTP with anyone</li>
                        <li>If you didn't request this password reset, please ignore this email</li>
                    </ul>
                    <p>If you have any questions, please contact the school administration.</p>
                    <p>Best regards,<br>School Management System</p>
                </div>
                <div style="text-align: center; padding: 15px; background: #f0f0f0; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email sending error:', error);
        return false;
    }
};

// Request password reset (send OTP)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required and must be a string' 
            });
        }

        // Check if user exists (admin, teacher, or student)
        let user = null;
        let userType = null;
        let schoolId = null;

        // Check admin users
        const adminUser = await User.findOne({ email });
        if (adminUser) {
            user = adminUser;
            userType = 'admin';
        }

        // Check teachers and students in schools
        if (!user) {
            const school = await School.findOne({
                $or: [
                    { 'teachers.email': email },
                    { 'students.email': email }
                ]
            });

            if (school) {
                const teacher = school.teachers.find(t => t.email === email);
                if (teacher) {
                    user = teacher;
                    userType = 'teacher';
                    schoolId = school._id;
                }

                const student = school.students.find(s => s.email === email);
                if (student && !user) {
                    user = student;
                    userType = 'student';
                    schoolId = school._id;
                }
            }
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email address' 
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save OTP for admin users
        if (userType === 'admin') {
            // Use findByIdAndUpdate for admin users to ensure proper update
            const updatedAdmin = await User.findByIdAndUpdate(
                user._id,
                {
                    resetPasswordOtp: otp,
                    resetPasswordExpires: otpExpiry
                },
                { new: true }
            );
            
            if (!updatedAdmin) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to save OTP. Please try again.'
                });
            }
        } else {
            // For teachers and students, we need to update the school document
            const school = await School.findById(schoolId);
            if (userType === 'teacher') {
                const teacherIndex = school.teachers.findIndex(t => t.email === email);
                if (teacherIndex !== -1) {
                    school.teachers[teacherIndex].resetPasswordOtp = otp;
                    school.teachers[teacherIndex].resetPasswordExpires = otpExpiry;
                }
            } else if (userType === 'student') {
                const studentIndex = school.students.findIndex(s => s.email === email);
                if (studentIndex !== -1) {
                    school.students[studentIndex].resetPasswordOtp = otp;
                    school.students[studentIndex].resetPasswordExpires = otpExpiry;
                }
            }
            await school.save();
        }

        // Send OTP email
        const emailSent = await sendOTPEmail(email, otp, user.name || 'User');

        if (!emailSent) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP email. Please try again.' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully to your email address',
            userType: userType
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Verify OTP and reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email, OTP, and new password are required' 
            });
        }

        if (typeof newPassword !== 'string' || newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }

        // Check if user exists and verify OTP
        let user = null;
        let userType = null;
        let schoolId = null;

        // Check admin users
        const adminUser = await User.findOne({ email });
        if (adminUser) {
            user = adminUser;
            userType = 'admin';
        }

        // Check teachers and students in schools
        if (!user) {
            const school = await School.findOne({
                $or: [
                    { 'teachers.email': email },
                    { 'students.email': email }
                ]
            });

            if (school) {
                const teacher = school.teachers.find(t => t.email === email);
                if (teacher) {
                    user = teacher;
                    userType = 'teacher';
                    schoolId = school._id;
                }

                const student = school.students.find(s => s.email === email);
                if (student && !user) {
                    user = student;
                    userType = 'student';
                    schoolId = school._id;
                }
            }
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email address' 
            });
        }

        // Verify OTP
        let storedOtp = null;
        let otpExpiry = null;

        if (userType === 'admin') {
            storedOtp = user.resetPasswordOtp;
            otpExpiry = user.resetPasswordExpires;
        } else {
            const school = await School.findById(schoolId);
            if (userType === 'teacher') {
                const teacher = school.teachers.find(t => t.email === email);
                if (teacher) {
                    storedOtp = teacher.resetPasswordOtp;
                    otpExpiry = teacher.resetPasswordExpires;
                }
            } else if (userType === 'student') {
                const student = school.students.find(s => s.email === email);
                if (student) {
                    storedOtp = student.resetPasswordOtp;
                    otpExpiry = student.resetPasswordExpires;
                }
            }
        }

        if (!storedOtp || !otpExpiry) {
            return res.status(400).json({ 
                success: false, 
                message: 'No OTP found. Please request a new password reset.' 
            });
        }

        if (storedOtp !== otp) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid OTP. Please check and try again.' 
            });
        }

        if (new Date() > otpExpiry) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP has expired. Please request a new password reset.' 
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        if (userType === 'admin') {
            // Use findByIdAndUpdate for admin users to ensure proper update
            const updatedAdmin = await User.findByIdAndUpdate(
                user._id,
                {
                    password: hashedPassword,
                    resetPasswordOtp: null,
                    resetPasswordExpires: null
                },
                { new: true }
            );
            
            if (!updatedAdmin) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update password. Please try again.'
                });
            }
        } else {
            const school = await School.findById(schoolId);
            if (userType === 'teacher') {
                const teacherIndex = school.teachers.findIndex(t => t.email === email);
                if (teacherIndex !== -1) {
                    school.teachers[teacherIndex].password = hashedPassword;
                    school.teachers[teacherIndex].resetPasswordOtp = null;
                    school.teachers[teacherIndex].resetPasswordExpires = null;
                }
            } else if (userType === 'student') {
                const studentIndex = school.students.findIndex(s => s.email === email);
                if (studentIndex !== -1) {
                    school.students[studentIndex].password = hashedPassword;
                    school.students[studentIndex].resetPasswordOtp = null;
                    school.students[studentIndex].resetPasswordExpires = null;
                }
            }
            await school.save();
        }

        res.status(200).json({
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== 'string') {
            return res.status(400).json({ 
                success: false, 
                message: 'Email is required and must be a string' 
            });
        }

        // Check if user exists
        let user = null;
        let userType = null;
        let schoolId = null;

        // Check admin users
        const adminUser = await User.findOne({ email });
        if (adminUser) {
            user = adminUser;
            userType = 'admin';
        }

        // Check teachers and students in schools
        if (!user) {
            const school = await School.findOne({
                $or: [
                    { 'teachers.email': email },
                    { 'students.email': email }
                ]
            });

            if (school) {
                const teacher = school.teachers.find(t => t.email === email);
                if (teacher) {
                    user = teacher;
                    userType = 'teacher';
                    schoolId = school._id;
                }

                const student = school.students.find(s => s.email === email);
                if (student && !user) {
                    user = student;
                    userType = 'student';
                    schoolId = school._id;
                }
            }
        }

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'No account found with this email address' 
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Update OTP
        if (userType === 'admin') {
            // Use findByIdAndUpdate for admin users to ensure proper update
            const updatedAdmin = await User.findByIdAndUpdate(
                user._id,
                {
                    resetPasswordOtp: otp,
                    resetPasswordExpires: otpExpiry
                },
                { new: true }
            );
            
            if (!updatedAdmin) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update OTP. Please try again.'
                });
            }
        } else {
            const school = await School.findById(schoolId);
            if (userType === 'teacher') {
                const teacherIndex = school.teachers.findIndex(t => t.email === email);
                if (teacherIndex !== -1) {
                    school.teachers[teacherIndex].resetPasswordOtp = otp;
                    school.teachers[teacherIndex].resetPasswordExpires = otpExpiry;
                }
            } else if (userType === 'student') {
                const studentIndex = school.students.findIndex(s => s.email === email);
                if (studentIndex !== -1) {
                    school.students[studentIndex].resetPasswordOtp = otp;
                    school.students[studentIndex].resetPasswordExpires = otpExpiry;
                }
            }
            await school.save();
        }

        // Send new OTP email
        const emailSent = await sendOTPEmail(email, otp, user.name || 'User');

        if (!emailSent) {
            return res.status(500).json({ 
                success: false, 
                message: 'Failed to send OTP email. Please try again.' 
            });
        }

        res.status(200).json({
            success: true,
            message: 'New OTP sent successfully to your email address'
        });

    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error. Please try again.' 
        });
    }
});

module.exports = router;
