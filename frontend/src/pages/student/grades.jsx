import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './grades.module.css';
import StudentHeader from '../../components/StudentHeader';

const Grades = () => {
    const [studentData, setStudentData] = useState(null);
    const [gradesData, setGradesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');
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
                    
                    // Fetch real grades from API
                    const gradesResponse = await fetch(`http://localhost:3000/grades/student/${studentId}`);
                    const gradesData = await gradesResponse.json();
                    
                    if (gradesData.success) {
                        setGradesData(gradesData.grades);
                    } else {
                        setGradesData([]);
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

    const getStatusColor = (status) => {
        const colors = {
            'excellent': '#10b981',
            'good': '#3b82f6',
            'average': '#f59e0b',
            'below_average': '#f97316',
            'failing': '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const getStatusText = (status) => {
        const texts = {
            'excellent': 'Excellent',
            'good': 'Good',
            'average': 'Average',
            'below_average': 'Below Average',
            'failing': 'Failing'
        };
        return texts[status] || 'Unknown';
    };

    const filteredGrades = selectedClass === 'all' 
        ? gradesData 
        : gradesData.filter(grade => grade.className === selectedClass);

    const calculateOverallGPA = () => {
        if (gradesData.length === 0) return 0;
        
        const gradePoints = {
            'A': 4.0, 'B': 3.0, 'C': 2.0, 'D': 1.0, 'F': 0.0
        };
        
        const totalPoints = gradesData.reduce((sum, grade) => {
            return sum + (gradePoints[grade.grade] || 0);
        }, 0);
        
        return (totalPoints / gradesData.length).toFixed(2);
    };

    const calculateAveragePercentage = () => {
        if (gradesData.length === 0) return 0;
        
        const totalPercentage = gradesData.reduce((sum, grade) => {
            return sum + grade.percentage;
        }, 0);
        
        return (totalPercentage / gradesData.length).toFixed(1);
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your grades...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <StudentHeader />

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>My Grades & Reports</h1>
                    <p>Track your academic performance and progress</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {studentData && (
                    <div className={styles.studentInfo}>
                        <h2>Welcome, {studentData.name}!</h2>
                        <p>View your academic performance across all enrolled classes</p>
                    </div>
                )}

                {gradesData.length > 0 && (
                    <div className={styles.overviewSection}>
                        <h3>Academic Overview</h3>
                        <div className={styles.overviewGrid}>
                            <div className={styles.overviewCard}>
                                <h4>Overall GPA</h4>
                                <span className={styles.overviewNumber}>{calculateOverallGPA()}</span>
                            </div>
                            <div className={styles.overviewCard}>
                                <h4>Average Score</h4>
                                <span className={styles.overviewNumber}>{calculateAveragePercentage()}%</span>
                            </div>
                            <div className={styles.overviewCard}>
                                <h4>Total Subjects</h4>
                                <span className={styles.overviewNumber}>{gradesData.length}</span>
                            </div>
                            <div className={styles.overviewCard}>
                                <h4>Enrolled Classes</h4>
                                <span className={styles.overviewNumber}>{studentData?.classes.length || 0}</span>
                            </div>
                        </div>
                    </div>
                )}

                {gradesData.length > 0 && (
                    <div className={styles.filtersSection}>
                        <div className={styles.filterGroup}>
                            <label htmlFor="classFilter">Filter by Class</label>
                            <select
                                id="classFilter"
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className={styles.select}
                            >
                                <option value="all">All Classes</option>
                                {studentData?.classes.map(className => (
                                    <option key={className} value={className}>
                                        {className}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {filteredGrades.length === 0 ? (
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
                        <h3>No Grades Available</h3>
                        <p>Your grades will appear here once they are published by your teachers.</p>
                    </div>
                ) : (
                    <div className={styles.gradesContainer}>
                        <h3>Subject Grades</h3>
                        <div className={styles.gradesGrid}>
                            {filteredGrades.map((grade, index) => (
                                <div key={index} className={styles.gradeCard}>
                                    <div className={styles.gradeHeader}>
                                        <h4>{grade.subject}</h4>
                                        <span className={styles.className}>{grade.className}</span>
                                    </div>
                                    
                                    <div className={styles.gradeDetails}>
                                        <div className={styles.gradeInfo}>
                                            <div className={styles.gradeScore}>
                                                <span className={styles.gradeLetter} style={{ color: getStatusColor(grade.status) }}>
                                                    {grade.grade}
                                                </span>
                                                <span className={styles.gradePercentage}>
                                                    {grade.percentage}%
                                                </span>
                                            </div>
                                            <div className={styles.gradeStatus}>
                                                <span 
                                                    className={styles.statusTag}
                                                    style={{ 
                                                        backgroundColor: `${getStatusColor(grade.status)}20`,
                                                        color: getStatusColor(grade.status),
                                                        borderColor: `${getStatusColor(grade.status)}40`
                                                    }}
                                                >
                                                    {getStatusText(grade.status)}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className={styles.gradeMeta}>
                                            <span className={styles.lastUpdated}>
                                                Last updated: {new Date(grade.lastUpdated).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Grades;
