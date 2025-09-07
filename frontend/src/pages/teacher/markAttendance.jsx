import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './markAttendance.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const MarkAttendance = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const navigate = useNavigate();

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        if (!teacherId) {
            navigate('/login');
            return;
        }
        fetchClasses();
    }, [teacherId, navigate]);

    const fetchClasses = async () => {
        try {
            // Fetch real classes from the school database
            const response = await fetch(`http://localhost:3000/school/${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
                // Get teacher's classes
                const teacher = data.school.teachers.find(t => t.id === teacherId);
                if (teacher) {
                    const teacherClasses = data.school.classes.filter(cls => 
                        teacher.classes.includes(cls.className)
                    );
                    
                    setClasses(teacherClasses.map(cls => ({
                        id: cls.className,
                        name: cls.className,
                        subjects: cls.subjects
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
        }
    };

    const fetchStudents = async (classId) => {
        try {
            setLoading(true);
            
            // Fetch real students from the school database
            const response = await fetch(`http://localhost:3000/school/${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
                // Get students who are enrolled in this class
                const classStudents = data.school.students.filter(student => 
                    student.classes.includes(classId)
                );
                
                const students = classStudents.map(student => ({
                    _id: student.id,
                    email: student.email,
                    name: student.name
                }));
                
                setStudents(students);
                
                // Initialize attendance data
                const initialAttendance = {};
                students.forEach(student => {
                    initialAttendance[student._id] = 'present';
                });
                setAttendanceData(initialAttendance);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClass(classId);
        setSelectedSubject('');
        if (classId) {
            fetchStudents(classId);
        } else {
            setStudents([]);
            setAttendanceData({});
        }
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedClass || !selectedSubject) {
            setMessage({ type: 'error', text: 'Please select both class and subject' });
            return;
        }

        if (Object.keys(attendanceData).length === 0) {
            setMessage({ type: 'error', text: 'No students found for attendance' });
            return;
        } 

        setLoading(true);
        setMessage('');

        try {
            const attendanceRecords = Object.entries(attendanceData).map(([studentId, status]) => ({
                studentId,
                status
            }));

            const response = await fetch('http://localhost:3000/attendance/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    classId: selectedClass,
                    subject: selectedSubject,
                    date: currentDate,
                    attendanceData: attendanceRecords,
                    teacherId: teacherId
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessage({ type: 'success', text: data.message });
                // Reset form after successful submission
                setTimeout(() => {
                    setSelectedClass('');
                    setSelectedSubject('');
                    setStudents([]);
                    setAttendanceData({});
                    setMessage('');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: data.message });
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
            setMessage({ type: 'error', text: 'Failed to mark attendance. Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#10b981';
            case 'absent': return '#ef4444';
            case 'late': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    return (
        <>
            <TeacherHeader />
            <div className={styles.container}>
                <div className={styles.content}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="class">Class</label>
                                <select
                                    id="class"
                                    value={selectedClass}
                                    onChange={handleClassChange}
                                    required
                                    className={styles.select}
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="subject">Subject</label>
                                <select
                                    id="subject"
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                    required
                                    disabled={!selectedClass}
                                    className={styles.select}
                                >
                                    <option value="">Select Subject</option>
                                    {selectedClass && classes.find(c => c.id === selectedClass)?.subjects.map(subject => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className={styles.formGroup}>
                                <label htmlFor="date">Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={currentDate}
                                    onChange={(e) => setCurrentDate(e.target.value)}
                                    required
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {message && (
                            <div className={`${styles.message} ${styles[message.type]}`}>
                                {message.text}
                            </div>
                        )}

                        {students.length > 0 && (
                            <div className={styles.studentsSection}>
                                <h3>Student Attendance</h3>
                                <div className={styles.studentsList}>
                                    {students.map(student => (
                                        <div key={student._id} className={styles.studentRow}>
                                            <div className={styles.studentInfo}>
                                                <span className={styles.studentName}>{student.name}</span>
                                                <span className={styles.studentEmail}>{student.email}</span>
                                            </div>
                                            <div className={styles.attendanceButtons}>
                                                {['present', 'absent', 'late'].map(status => (
                                                    <button
                                                        key={status}
                                                        type="button"
                                                        onClick={() => handleAttendanceChange(student._id, status)}
                                                        className={`${styles.statusBtn} ${
                                                            attendanceData[student._id] === status ? styles.active : ''
                                                        }`}
                                                        style={{
                                                            backgroundColor: attendanceData[student._id] === status 
                                                                ? getStatusColor(status) 
                                                                : 'transparent',
                                                            color: attendanceData[student._id] === status ? 'white' : getStatusColor(status),
                                                            borderColor: getStatusColor(status)
                                                        }}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {students.length > 0 && (
                            <div className={styles.submitSection}>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedClass || !selectedSubject}
                                    className={styles.submitBtn}
                                >
                                    {loading ? 'Marking Attendance...' : 'Mark Attendance'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </>
    );
};

export default MarkAttendance;