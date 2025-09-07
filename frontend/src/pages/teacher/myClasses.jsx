import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './myClasses.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const MyClasses = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
            const response = await fetch(`http://localhost:3000/school/${teacherId}`);
            const data = await response.json();
            
            if (data.success) {
                const teacher = data.school.teachers.find(t => t.id === teacherId);
                if (teacher) {
                    const teacherClasses = data.school.classes.filter(cls => 
                        teacher.classes.includes(cls.className)
                    );
                    
                    // Get student count for each class
                    const classesWithStudents = teacherClasses.map(cls => {
                        const studentsInClass = data.school.students.filter(student => 
                            student.classes.includes(cls.className)
                        );
                        return {
                            ...cls,
                            studentCount: studentsInClass.length,
                            students: studentsInClass
                        };
                    });
                    
                    setClasses(classesWithStudents);
                }
            } else {
                setError('Failed to fetch classes');
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            setError('Failed to fetch classes');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading your classes...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <TeacherHeader />

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>My Classes</h1>
                    <p>Manage and view your assigned classes</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {classes.length === 0 ? (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 14L9 11L12 8M12 8L15 11L12 14M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                        <h3>No Classes Assigned</h3>
                        <p>You haven't been assigned to any classes yet.</p>
                    </div>
                ) : (
                    <div className={styles.classesGrid}>
                        {classes.map((cls) => (
                            <div key={cls._id} className={styles.classCard}>
                                <div className={styles.classHeader}>
                                    <h3>{cls.className}</h3>
                                    <span className={styles.studentCount}>
                                        {cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}
                                    </span>
                                </div>
                                
                                <div className={styles.subjectsSection}>
                                    <h4>Subjects</h4>
                                    <div className={styles.subjectsList}>
                                        {cls.subjects.map((subject, index) => (
                                            <span key={index} className={styles.subjectTag}>
                                                {subject}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.studentsSection}>
                                    <h4>Enrolled Students</h4>
                                    <div className={styles.studentsList}>
                                        {cls.students.length === 0 ? (
                                            <p className={styles.noStudents}>No students enrolled</p>
                                        ) : (
                                            cls.students.map((student) => (
                                                <div key={student.id} className={styles.studentItem}>
                                                    <div className={styles.studentInfo}>
                                                        <span className={styles.studentName}>{student.name}</span>
                                                        <span className={styles.studentEmail}>{student.email}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                <div className={styles.actions}>
                                    <button 
                                        className={styles.actionBtn}
                                        onClick={() => navigate('/teacher/attendance')}
                                    >
                                        Mark Attendance
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyClasses;
