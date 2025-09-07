import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './dashboard.module.css';
import StudentHeader from '../../components/StudentHeader';

const StudentDashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [studentData, setStudentData] = useState(null);
    const [attendanceStats, setAttendanceStats] = useState({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0
    });
    const [recentAttendance, setRecentAttendance] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            navigate('/login');
            return;
        }

        // Fetch user details and attendance stats
        const fetchUserDetails = async () => {
            try {
                const response = await fetch(`http://localhost:3000/auth/me/${userId}`);
                const data = await response.json();
                setUser(data);
                
                // Fetch student data from school
                const schoolResponse = await fetch(`http://localhost:3000/school/student/${userId}`);
                const schoolData = await schoolResponse.json();
                
                if (schoolData.success) {
                    const student = schoolData.school.students.find(s => s.id === userId);
                    if (student) {
                        setStudentData(student);
                    }
                }
                
                // Fetch attendance statistics and recent records
                await fetchAttendanceStats(userId);
                await fetchRecentAttendance(userId);
            } catch (error) {
                console.error('Error fetching user details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    const fetchAttendanceStats = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/attendance/student/${userId}`);
            const data = await response.json();
            if (data.success) {
                setAttendanceStats(data.statistics);
            }
        } catch (error) {
            console.error('Error fetching attendance stats:', error);
        }
    };

    const fetchRecentAttendance = async (userId) => {
        try {
            const response = await fetch(`http://localhost:3000/attendance/student/${userId}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.attendance)) {
                // Sort by date descending and take the 3 most recent
                const sorted = data.attendance.sort((a, b) => new Date(b.date) - new Date(a.date));
                setRecentAttendance(sorted.slice(0, 3));
            }
        } catch (error) {
            console.error('Error fetching recent attendance:', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

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
            <StudentHeader />
            <main className={styles.mainContent}>
                <div className={styles.welcomeSection}>
                    <h2>Welcome to Your Student Portal</h2>
                    <p>Track your attendance and stay updated with your academic progress.</p>
                </div>

                <div className={styles.attendanceOverview}>
                    <div className={styles.overviewCard}>
                        <div className={styles.overviewHeader}>
                            <h3>Attendance Overview</h3>
                            <div className={styles.percentageCircle}>
                                <span className={styles.percentage}>{attendanceStats.attendancePercentage}%</span>
                            </div>
                        </div>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Present</span>
                                <span className={`${styles.statValue} ${styles.present}`}>{attendanceStats.presentDays}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Absent</span>
                                <span className={`${styles.statValue} ${styles.absent}`}>{attendanceStats.absentDays}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Late</span>
                                <span className={`${styles.statValue} ${styles.late}`}>{attendanceStats.lateDays}</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statLabel}>Total Days</span>
                                <span className={`${styles.statValue} ${styles.total}`}>{attendanceStats.totalDays}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.cardsGrid}>
                    <Link to="/student/attendance" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>View Attendance</h3>
                        <p>Check your detailed attendance records</p>
                    </Link>

                    <Link to="/student/schedule" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Class Schedule</h3>
                        <p>View your daily class schedule</p>
                    </Link>

                    <Link to="/student/grades" className={styles.card}>
                        <div className={styles.cardIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>Grades & Reports</h3>
                        <p>Check your academic performance</p>
                    </Link>

                    <Link to="/student/profile" className={styles.card}>
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

                <div className={styles.recentActivity}>
                    <h3>Recent Activity</h3>
                    <div className={styles.activityList}>
                        {recentAttendance.length === 0 ? (
                            <div className={styles.emptyState}>
                                <p>No recent attendance records found.</p>
                            </div>
                        ) : (
                            recentAttendance.map((record, idx) => (
                                <div key={idx} className={styles.activityItem}>
                                    <div className={`${styles.activityIcon} ${styles[record.status]}`}>
                                        {/* Status icon */}
                                        {record.status === 'present' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : record.status === 'late' ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div className={styles.activityContent}>
                                        <span className={styles.activityText}>{record.status.charAt(0).toUpperCase() + record.status.slice(1)} in {record.subject} ({record.class})</span>
                                        <span className={styles.activityTime}>{new Date(record.date).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StudentDashboard;
