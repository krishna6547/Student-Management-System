import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const TeacherDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [teacherData, setTeacherData] = useState(null);
    const [stats, setStats] = useState({
        classes: 0,
        students: 0,
        attendanceRate: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }

        // Fetch user details and teacher data
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/auth/me/${userId}`);
                const data = await response.json();
                setUser(data);
                
                // Fetch teacher data from school
                const schoolResponse = await fetch(`http://localhost:3000/school/${userId}`);
                const schoolData = await schoolResponse.json();
                
                if (schoolData.success) {
                    const teacher = schoolData.school.teachers.find(t => t.id === userId);
                    if (teacher) {
                        setTeacherData(teacher);
                        
                        // Calculate stats
                        const teacherClasses = schoolData.school.classes.filter(cls => 
                            teacher.classes.includes(cls.className)
                        );
                        
                        const totalStudents = schoolData.school.students.filter(student => 
                            student.classes.some(cls => teacher.classes.includes(cls))
                        ).length;
                        
                        setStats({
                            classes: teacherClasses.length,
                            students: totalStudents,
                            attendanceRate: 95 // Default for now
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.dashboardContainer}>
            <TeacherHeader />

            <main className={styles.mainContent}>
                <div className={styles.welcomeSection}>
                    <h2>Welcome to Your Teaching Portal</h2>
                    <p>Manage your classes and track student attendance efficiently.</p>
                </div>

                <div className={styles.cardsGrid}>
                    <Link to="/teacher/attendance" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Mark Attendance</h3>
                        <p>Mark daily attendance for your students</p>
                    </Link>

                    <Link to="/teacher/classes" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 14L9 11L12 8M12 8L15 11L12 14M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>My Classes</h3>
                        <p>View and manage your assigned classes</p>
                    </Link>

                    <Link to="/teacher/reports" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Attendance Reports</h3>
                        <p>Generate and view attendance reports</p>
                    </Link>

                    <Link to="/teacher/grades" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Manage Grades</h3>
                        <p>Add and manage student grades</p>
                    </Link>

                    <Link to="/teacher/schedule" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Manage Schedule</h3>
                        <p>Create and manage class schedules</p>
                    </Link>

                    <Link to="/teacher/profile" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Profile</h3>
                        <p>Update your profile information</p>
                    </Link>
                </div>

                <div className={styles.quickStats}>
                    <div className={styles.statCard}>
                        <h4>My Classes</h4>
                        <span className={styles.statNumber}>{stats.classes}</span>
                    </div>
                    <div className={styles.statCard}>
                        <h4>Total Students</h4>
                        <span className={styles.statNumber}>{stats.students}</span>
                    </div>
                    <div className={styles.statCard}>
                        <h4>Attendance Rate</h4>
                        <span className={styles.statNumber}>{stats.attendanceRate}%</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
