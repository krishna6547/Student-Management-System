const express = require('express');
const app = express();
const dbcon = require('./db/connection');
const router = require('./routes/schoolRoute');
const cors = require('cors');
const path = require('path');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json()); // <-- THIS is needed to parse JSON body

app.use(cors());

dbcon();
app.use('/subject', require('./routes/subjectRoutes'));
app.use('/school',router);
app.use('/auth', require('./routes/authLogin'));
app.use('/teacher', require('./routes/teacherRoute'));
app.use('/class', require('./routes/classRoutes'));
app.use('/student', require('./routes/studentRoute'));
app.use('/dashboard', require('./routes/dashboardRoute'));
app.use('/attendance', require('./routes/attendanceRoute'));
app.use('/grades', require('./routes/gradeRoutes'));
app.use('/schedule', require('./routes/scheduleRoutes'));
app.use('/fees', require('./routes/feesRoute'));
app.use('/password', require('./routes/passwordReset'));

// Contact form route
app.use('/api', require('./routes/contactRoute'));


app.get("/", (req, res) => {
    res.send('server is running');
});
app.listen(3000,()=>{
    console.log('server running at port: 3000');
});
