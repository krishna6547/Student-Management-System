const express = require('express');
const router = express.Router();
const school = require('../models/school');
const user = require('../models/user');
const upload = require('../utils/multerSetup');

router.post('/add', upload.single("logo"), async (req, res)=> {
    try
    {
        const data = req.body;
        console.log(data);
        const emailExists = await user.findOne({email: data.email});
        const isSchool = await school.findOne({name: data.schoolName})
        if(emailExists)
            return res.send({success: false, message:'Email already registered'});
        if(isSchool)
            return res.send({success: false, message: "School already registered"});
        const School = new school({
            name: data.schoolName,
            logo: req.file.filename
        });
        schoolData = await School.save();
        const User = new user(
            {
                email: data.email,
                password: data.password,
                role: "admin",
                school: schoolData._id
            }
        )
        const userData = await User.save()
        return res.send({success: true, message:'school created successfully', data: userData});    
    }
    catch(err)
    {
        console.log(err);
        res.send({success: false, message:"Error", error: err})
    }
});



// Get school data by teacher ID
router.get('/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        
        // Find school that contains this teacher
        const schoolData = await school.findOne({
            'teachers.id': teacherId
        });

        if (!schoolData) {
            return res.status(404).json({ success: false, message: 'School not found for this teacher' });
        }

        res.json({ 
            success: true, 
            school: schoolData 
        });
    } catch (error) {
        console.error('Error fetching school data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get school data by student ID
router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        
        // Find school that contains this student
        const schoolData = await school.findOne({
            'students.id': studentId
        });

        if (!schoolData) {
            return res.status(404).json({ success: false, message: 'School not found for this student' });
        }

        res.json({ 
            success: true, 
            school: schoolData 
        });
    } catch (error) {
        console.error('Error fetching school data:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
