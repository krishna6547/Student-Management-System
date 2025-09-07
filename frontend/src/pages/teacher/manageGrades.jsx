import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './manageGrades.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const ManageGrades = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showGradeForm, setShowGradeForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [gradeForm, setGradeForm] = useState({
        grade: '',
        percentage: '',
        comments: ''
    });
    const navigate = useNavigate();

    const teacherId = localStorage.getItem('userId');

    useEffect(() => {
        if (!teacherId) {
            navigate('/login');
            return;
        }
        fetchTeacherData();
    }, [teacherId, navigate]);

    const fetchTeacherData = async () => {
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
                    setClasses(teacherClasses);

                    if (teacherClasses.length > 0) {
                        setSelectedClass(teacherClasses[0].className);
                    }
                }
            } else {
                setError('Failed to fetch teacher data');
            }
        } catch (error) {
            console.error('Error fetching teacher data:', error);
            setError('Failed to fetch teacher data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClass) {
            fetchStudentsAndGrades();
        }
    }, [selectedClass]);

    const fetchStudentsAndGrades = async () => {
        try {
            // Fetch students in the selected class
            const schoolResponse = await fetch(`http://localhost:3000/school/${teacherId}`);
            const schoolData = await schoolResponse.json();

            if (schoolData.success) {
                const studentsInClass = schoolData.school.students.filter(student =>
                    student.classes.includes(selectedClass)
                );
                setStudents(studentsInClass);

                // Fetch grades for this class
                const gradesResponse = await fetch(`http://localhost:3000/grades/class/${selectedClass}?teacherId=${teacherId}`);
                const gradesData = await gradesResponse.json();

                if (gradesData.success) {
                    setGrades(gradesData.grades);
                }
            }
        } catch (error) {
            console.error('Error fetching students and grades:', error);
            setError('Failed to fetch students and grades');
        }
    };

    const handleAddGrade = (student) => {
        setSelectedStudent(student);
        setShowGradeForm(true);
        setGradeForm({
            grade: '',
            percentage: '',
            comments: ''
        });
    };

    const handleEditGrade = (grade) => {
        setSelectedStudent({ id: grade.studentId, name: grade.studentName });
        setSelectedSubject(grade.subject);
        setShowGradeForm(true);
        setGradeForm({
            grade: grade.grade,
            percentage: grade.percentage.toString(),
            comments: grade.comments || ''
        });
    };

    const handleSubmitGrade = async (e) => {
        e.preventDefault();

        if (!gradeForm.grade || !gradeForm.percentage || !selectedSubject) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/grades/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherId,
                    studentId: selectedStudent.id,
                    className: selectedClass,
                    subject: selectedSubject,
                    grade: gradeForm.grade,
                    percentage: parseInt(gradeForm.percentage),
                    comments: gradeForm.comments
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowGradeForm(false);
                setSelectedStudent(null);
                setSelectedSubject('');
                setGradeForm({ grade: '', percentage: '', comments: '' });
                fetchStudentsAndGrades(); // Refresh the data
            } else {
                setError(data.message || 'Failed to save grade');
            }
        } catch (error) {
            console.error('Error saving grade:', error);
            setError('Failed to save grade');
        }
    };

    const getGradeForStudent = (studentId, subject) => {
        return grades.find(g => g.studentId === studentId && g.subject === subject);
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

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading grade management...</p>
            </div>
        );
    }

    return (
        <>
            <TeacherHeader />
            <div className={styles.container}>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1>Manage Grades</h1>
                        <p>Add and manage grades for your students</p>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            {error}
                        </div>
                    )}

                    <div className={styles.classSelector}>
                        <label htmlFor="classSelect">Select Class:</label>
                        <select
                            id="classSelect"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                            className={styles.select}
                        >
                            {classes.map((cls) => (
                                <option key={cls.className} value={cls.className}>
                                    {cls.className}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedClass && students.length > 0 && (
                        <div className={styles.gradesSection}>
                            <div className={styles.sectionHeader}>
                                <h2>Grades for {selectedClass}</h2>
                                <button
                                    className={styles.addGradeBtn}
                                    onClick={() => setShowGradeForm(true)}
                                >
                                    Add New Grade
                                </button>
                            </div>

                            <div className={styles.gradesTable}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Student</th>
                                            {classes.find(c => c.className === selectedClass)?.subjects.map(subject => (
                                                <th key={subject}>{subject}</th>
                                            ))}
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id}>
                                                <td className={styles.studentName}>{student.name}</td>
                                                {classes.find(c => c.className === selectedClass)?.subjects.map(subject => {
                                                    const grade = getGradeForStudent(student.id, subject);
                                                    return (
                                                        <td key={subject} className={styles.gradeCell}>
                                                            {grade ? (
                                                                <div className={styles.gradeDisplay}>
                                                                    <span className={styles.gradeLetter} style={{ color: getStatusColor(grade.status) }}>
                                                                        {grade.grade}
                                                                    </span>
                                                                    <span className={styles.gradePercentage}>
                                                                        {grade.percentage}%
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className={styles.noGrade}>-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className={styles.actions}>
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => handleAddGrade(student)}
                                                    >
                                                        Add Grade
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {showGradeForm && (
                        <div className={styles.modal}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h3>Add/Edit Grade</h3>
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => setShowGradeForm(false)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitGrade} className={styles.gradeForm}>
                                    <div className={styles.formGroup}>
                                        <label>Student:</label>
                                        <span className={styles.studentDisplay}>{selectedStudent?.name}</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="subject">Subject:</label>
                                        <select
                                            id="subject"
                                            value={selectedSubject}
                                            onChange={(e) => setSelectedSubject(e.target.value)}
                                            required
                                        >
                                            <option value="">Select Subject</option>
                                            {classes.find(c => c.className === selectedClass)?.subjects.map(subject => (
                                                <option key={subject} value={subject}>{subject}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="grade">Grade:</label>
                                        <select
                                            id="grade"
                                            value={gradeForm.grade}
                                            onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            <option value="A">A</option>
                                            <option value="B">B</option>
                                            <option value="C">C</option>
                                            <option value="D">D</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="percentage">Percentage:</label>
                                        <input
                                            type="number"
                                            id="percentage"
                                            min="0"
                                            max="100"
                                            value={gradeForm.percentage}
                                            onChange={(e) => setGradeForm({ ...gradeForm, percentage: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="comments">Comments:</label>
                                        <textarea
                                            id="comments"
                                            value={gradeForm.comments}
                                            onChange={(e) => setGradeForm({ ...gradeForm, comments: e.target.value })}
                                            rows="3"
                                        />
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="submit" className={styles.submitBtn}>
                                            Save Grade
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={() => setShowGradeForm(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ManageGrades;
