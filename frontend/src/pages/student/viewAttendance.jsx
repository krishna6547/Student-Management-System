import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './viewAttendance.module.css';
import StudentHeader from '../../components/StudentHeader';

const ViewAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        classId: '',
        subject: ''
    });
    const [statistics, setStatistics] = useState({
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        attendancePercentage: 0
    });
    const [studentData, setStudentData] = useState(null);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const navigate = useNavigate();

    const studentId = localStorage.getItem('userId');

    useEffect(() => {
        if (!studentId) {
            navigate('/login');
            return;
        }
        fetchStudentData();
        fetchAttendance();
    }, [studentId, navigate, filters]);

    const fetchStudentData = async () => {
        try {
            const response = await fetch(`http://localhost:3000/school/student/${studentId}`);
            const data = await response.json();

            if (data.success) {
                const student = data.school.students.find(s => s.id === studentId);
                if (student) {
                    setStudentData(student);
                    setClasses(student.classes || []);

                    // Get unique subjects from student's classes
                    const allSubjects = new Set();
                    student.classes.forEach(className => {
                        const classData = data.school.classes.find(cls => cls.className === className);
                        if (classData && classData.subjects) {
                            classData.subjects.forEach(subject => allSubjects.add(subject));
                        }
                    });
                    setSubjects(Array.from(allSubjects));
                }
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();

            if (filters.startDate) queryParams.append('startDate', filters.startDate);
            if (filters.endDate) queryParams.append('endDate', filters.endDate);
            if (filters.classId) queryParams.append('classId', filters.classId);
            if (filters.subject) queryParams.append('subject', filters.subject);

            const response = await fetch(`http://localhost:3000/attendance/student/${studentId}?${queryParams}`);
            const data = await response.json();

            if (data.success) {
                setAttendance(data.attendance);
                setStatistics(data.statistics);
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            classId: '',
            subject: ''
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return '#10b981';
            case 'absent': return '#ef4444';
            case 'late': return '#f59e0b';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'present':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'absent':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            case 'late':
                return (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading attendance records...</p>
            </div>
        );
    }

    return (
        <>
            <StudentHeader />

            <div className={styles.container}>

                <div className={styles.content}>
                    <div className={styles.statsOverview}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <h3>Overall Attendance</h3>
                                <div className={styles.percentageCircle}>
                                    <span>{statistics.attendancePercentage}%</span>
                                </div>
                            </div>
                            <div className={styles.statGrid}>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Present</span>
                                    <span className={`${styles.statValue} ${styles.present}`}>{statistics.presentDays}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Absent</span>
                                    <span className={`${styles.statValue} ${styles.absent}`}>{statistics.absentDays}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Late</span>
                                    <span className={`${styles.statValue} ${styles.late}`}>{statistics.lateDays}</span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>Total Days</span>
                                    <span className={`${styles.statValue} ${styles.total}`}>{statistics.totalDays}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.filtersSection}>
                        <h3>Filter Records</h3>
                        <div className={styles.filtersForm}>
                            <div className={styles.filterGroup}>
                                <label htmlFor="startDate">Start Date</label>
                                <input
                                    type="date"
                                    id="startDate"
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                    className={styles.filterInput}
                                />
                            </div>
                            <div className={styles.filterGroup}>
                                <label htmlFor="endDate">End Date</label>
                                <input
                                    type="date"
                                    id="endDate"
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                    className={styles.filterInput}
                                />
                            </div>
                            <div className={styles.filterGroup}>
                                <label htmlFor="classId">Class</label>
                                <select
                                    id="classId"
                                    name="classId"
                                    value={filters.classId}
                                    onChange={handleFilterChange}
                                    className={styles.filterSelect}
                                >
                                    <option value="">All Classes</option>
                                    {classes.map((className) => (
                                        <option key={className} value={className}>{className}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={styles.filterGroup}>
                                <label htmlFor="subject">Subject</label>
                                <select
                                    id="subject"
                                    name="subject"
                                    value={filters.subject}
                                    onChange={handleFilterChange}
                                    className={styles.filterSelect}
                                >
                                    <option value="">All Subjects</option>
                                    {subjects.map((subject) => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>
                            <button onClick={clearFilters} className={styles.clearBtn}>
                                Clear Filters
                            </button>
                        </div>
                    </div>

                    <div className={styles.attendanceList}>
                        <h3>Attendance Records ({attendance.length})</h3>
                        {attendance.length === 0 ? (
                            <div className={styles.emptyState}>
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <h4>No attendance records found</h4>
                                <p>Try adjusting your filters or check back later for new records.</p>
                            </div>
                        ) : (
                            <div className={styles.recordsList}>
                                {attendance.map((record, index) => (
                                    <div key={index} className={styles.recordItem}>
                                        <div className={styles.recordHeader}>
                                            <div className={styles.recordDate}>
                                                <span className={styles.dateText}>{formatDate(record.date)}</span>
                                                <span className={styles.timeText}>
                                                    {new Date(record.date).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div
                                                className={styles.statusBadge}
                                                style={{ backgroundColor: getStatusColor(record.status) }}
                                            >
                                                {getStatusIcon(record.status)}
                                                <span>{record.status.charAt(0).toUpperCase() + record.status.slice(1)}</span>
                                            </div>
                                        </div>
                                        <div className={styles.recordDetails}>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Class:</span>
                                                <span className={styles.detailValue}>{record.class}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Subject:</span>
                                                <span className={styles.detailValue}>{record.subject}</span>
                                            </div>
                                            <div className={styles.detailItem}>
                                                <span className={styles.detailLabel}>Marked by:</span>
                                                <span className={styles.detailValue}>{record.markedBy?.name || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};


export default ViewAttendance;
