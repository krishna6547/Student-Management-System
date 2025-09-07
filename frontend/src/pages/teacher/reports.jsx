import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './reports.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const Reports = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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
            const response = await fetch(`http://localhost:3000/school/${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
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

    const fetchAttendanceReport = async () => {
        if (!selectedClass || !selectedSubject) {
            setError('Please select both class and subject');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch(`http://localhost:3000/attendance/class/${selectedClass}?teacherId=${teacherId}&subject=${selectedSubject}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
            const data = await response.json();

            if (data.success) {
                setAttendanceData(data.attendance);
            } else {
                setError('Failed to fetch attendance data');
            }
        } catch (error) {
            console.error('Error fetching attendance report:', error);
            setError('Failed to fetch attendance data');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReport = () => {
        fetchAttendanceReport();
    };

    const calculateStats = () => {
        if (attendanceData.length === 0) return null;

        const totalRecords = attendanceData.length;
        const presentCount = attendanceData.filter(record => record.status === 'present').length;
        const absentCount = attendanceData.filter(record => record.status === 'absent').length;
        const lateCount = attendanceData.filter(record => record.status === 'late').length;

        return {
            total: totalRecords,
            present: presentCount,
            absent: absentCount,
            late: lateCount,
            attendanceRate: totalRecords > 0 ? ((presentCount + lateCount) / totalRecords * 100).toFixed(1) : 0
        };
    };

    const stats = calculateStats();

    return (
        <div className={styles.container}>
            <TeacherHeader />

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>Attendance Reports</h1>
                    <p>Generate and view detailed attendance reports</p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label htmlFor="class">Class</label>
                        <select
                            id="class"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
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

                    <div className={styles.filterGroup}>
                        <label htmlFor="subject">Subject</label>
                        <select
                            id="subject"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
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

                    <div className={styles.filterGroup}>
                        <label htmlFor="startDate">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={dateRange.startDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <label htmlFor="endDate">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={dateRange.endDate}
                            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                            className={styles.input}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <button
                            onClick={handleGenerateReport}
                            disabled={loading || !selectedClass || !selectedSubject}
                            className={styles.generateBtn}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {stats && (
                    <div className={styles.statsSection}>
                        <h3>Attendance Summary</h3>
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <h4>Total Records</h4>
                                <span className={styles.statNumber}>{stats.total}</span>
                            </div>
                            <div className={styles.statCard}>
                                <h4>Present</h4>
                                <span className={`${styles.statNumber} ${styles.present}`}>{stats.present}</span>
                            </div>
                            <div className={styles.statCard}>
                                <h4>Absent</h4>
                                <span className={`${styles.statNumber} ${styles.absent}`}>{stats.absent}</span>
                            </div>
                            <div className={styles.statCard}>
                                <h4>Late</h4>
                                <span className={`${styles.statNumber} ${styles.late}`}>{stats.late}</span>
                            </div>
                            <div className={styles.statCard}>
                                <h4>Attendance Rate</h4>
                                <span className={`${styles.statNumber} ${styles.rate}`}>{stats.attendanceRate}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {attendanceData.length > 0 && (
                    <div className={styles.tableSection}>
                        <h3>Detailed Records</h3>
                        <div className={styles.tableContainer}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Student</th>
                                        <th>Status</th>
                                        <th>Class</th>
                                        <th>Subject</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceData.map((record, index) => (
                                        <tr key={index}>
                                            <td>{new Date(record.date).toLocaleDateString()}</td>
                                            <td>{record.student}</td>
                                            <td>
                                                <span className={`${styles.status} ${styles[record.status]}`}>
                                                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>{record.class}</td>
                                            <td>{record.subject}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && attendanceData.length === 0 && selectedClass && selectedSubject && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>No Attendance Records</h3>
                        <p>No attendance records found for the selected criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
