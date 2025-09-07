import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './schedule.module.css';
import StudentHeader from '../../components/StudentHeader';

const Schedule = () => {
    const [studentData, setStudentData] = useState(null);
    const [scheduleData, setScheduleData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        if (!studentId) {
            navigate('/login');
            return;
        }
        fetchStudentData();
    }, [studentId, navigate]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/school/student/${studentId}`);
            const data = await response.json();

            if (data.success) {
                const student = data.school.students.find(s => s.id === studentId);
                if (student) {
                    setStudentData(student);

                    // Fetch real schedule data from API
                    const scheduleResponse = await fetch(`http://localhost:3000/schedule/student/${studentId}`);
                    const scheduleData = await scheduleResponse.json();

                    if (scheduleData.success) {
                        setScheduleData(scheduleData.schedules);
                    } else {
                        setScheduleData([]);
                    }
                }
            } else {
                setError('Failed to fetch student data');
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
            setError('Failed to fetch student data');
        } finally {
            setLoading(false);
        }
    };

    const getDayColor = (day) => {
        const colors = {
            'Monday': '#3b82f6',
            'Tuesday': '#10b981',
            'Wednesday': '#f59e0b',
            'Thursday': '#8b5cf6',
            'Friday': '#ef4444'
        };
        return colors[day] || '#6b7280';
    };

    const formatTime = (time) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const groupScheduleByDay = () => {
        const grouped = {};
        scheduleData.forEach(item => {
            if (!grouped[item.day]) {
                grouped[item.day] = [];
            }
            grouped[item.day].push(item);
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your schedule...</p>
            </div>
        );
    }

    return (
        <>
            <StudentHeader />
            <div className={styles.container}>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1>My Class Schedule</h1>
                        <p>View your daily class schedule and timings</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    {studentData && (
                        <div className={styles.studentInfo}>
                            <h2>Welcome, {studentData.name}!</h2>
                            <p>You are enrolled in {studentData.classes.length} classes</p>
                        </div>
                    )}

                    {scheduleData.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h3>No Schedule Available</h3>
                            <p>Your class schedule will appear here once classes are assigned.</p>
                        </div>
                    ) : (
                        <div className={styles.scheduleContainer}>
                            {Object.entries(groupScheduleByDay()).map(([day, classes]) => (
                                <div key={day} className={styles.daySection}>
                                    <div className={styles.dayHeader} style={{ borderLeftColor: getDayColor(day) }}>
                                        <h3>{day}</h3>
                                        <span className={styles.classCount}>{classes.length} {classes.length === 1 ? 'Class' : 'Classes'}</span>
                                    </div>
                                    <div className={styles.classesList}>
                                        {classes.map((classItem, index) => (
                                            <div key={index} className={styles.classCard}>
                                                <div className={styles.classHeader}>
                                                    <h4>{classItem.subject}</h4>
                                                    <span className={styles.className}>{classItem.className}</span>
                                                </div>
                                                <div className={styles.classDetails}>
                                                    <div className={styles.timeSlot}>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <span>{formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}</span>
                                                    </div>
                                                    <div className={styles.classInfo}>
                                                        <span className={styles.subjectTag}>{classItem.subject}</span>
                                                        <span className={styles.classTag}>{classItem.className}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {scheduleData.length > 0 && (
                        <div className={styles.summarySection}>
                            <h3>Schedule Summary</h3>
                            <div className={styles.summaryGrid}>
                                <div className={styles.summaryCard}>
                                    <h4>Total Classes</h4>
                                    <span className={styles.summaryNumber}>{scheduleData.length}</span>
                                </div>
                                <div className={styles.summaryCard}>
                                    <h4>Enrolled Classes</h4>
                                    <span className={styles.summaryNumber}>{studentData?.classes.length || 0}</span>
                                </div>
                                <div className={styles.summaryCard}>
                                    <h4>Subjects</h4>
                                    <span className={styles.summaryNumber}>
                                        {new Set(scheduleData.map(item => item.subject)).size}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Schedule;
