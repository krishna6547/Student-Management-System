import { useState, useEffect } from 'react';
import AdminHeader from "../../components/AdminHeader";
import styles from './manageStudents.module.css';

function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for add student
  const [studentName, setStudentName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);

  const userId = localStorage.getItem("userId");

  // Fetch students and classes on mount
  useEffect(() => {
    fetchStudents();
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  const fetchStudents = async () => {
    setIsPageLoading(true);
    if (!userId) {
      setError('User not authenticated');
      setIsPageLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/student/all/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setStudents(result.students || []);
        setError('');
      } else {
        setError(result.message || 'Unable to fetch students');
      }
    } catch (err) {
      setError('Failed to fetch students');
    } finally {
      setIsPageLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/class/all/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setClasses(result.classes || []);
      } else {
        setError(result.message || 'Unable to fetch classes');
      }
    } catch (err) {
      setError('Failed to fetch classes');
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !fatherName.trim() || !studentEmail.trim() || !password.trim() || selectedClasses.length === 0) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/student/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: studentName.trim(),
          fatherName: fatherName.trim(),
          email: studentEmail.trim(),
          password: password.trim(),
          classes: JSON.stringify(selectedClasses),
          userId
        })
      });
      const result = await response.json();
      if (response.ok) {
        setStudents(prev => [...prev, result.student || { 
          name: studentName.trim(), 
          fatherName: fatherName.trim(),
          email: studentEmail.trim(),
          classes: selectedClasses,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        }]);
        setStudentName('');
        setFatherName('');
        setStudentEmail('');
        setPassword('');
        setSelectedClasses([]);
        setIsAddModalOpen(false);
      } else {
        setError(result.message || 'Failed to add student');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (!window.confirm("Remove this student?")) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:3000/student/remove', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          userId
        })
      });
      if (response.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
      } else {
        const result = await response.json();
        setError(result?.message || 'Failed to remove student');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassToggle = (className) => {
    setSelectedClasses(prev =>
      prev.includes(className)
        ? prev.filter(c => c !== className)
        : [...prev, className]
    );
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setStudentName('');
    setFatherName('');
    setStudentEmail('');
    setPassword('');
    setSelectedClasses([]);
    setError('');
  };

  // Filter students based on selected filter
  const filteredStudents = selectedClass === 'all' 
    ? students 
    : students.filter(student => 
        student.classes && student.classes.includes(selectedClass)
      );

  // Loading state
  if (isPageLoading) {
    return (
      <>
        <AdminHeader />
        <div className={styles.manageStudentsContainer}>
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader />
      <div className={styles.manageStudentsContainer}>
        <div className={styles.studentsContent}>
          <div className={styles.studentsHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Manage Students</h1>
              <p className={styles.pageSubtitle}>Add and manage student information</p>
            </div>
            <button className={styles.addStudentBtn}
              disabled={!classes.length}
              onClick={() => setIsAddModalOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Student
            </button>
          </div>

          <div className={styles.filterRow}>
            <label htmlFor="studentFilter" className={styles.filterLabel}>Filter by Class:</label>
            <select
              id="studentFilter"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className={styles.studentFilter}
            >
              <option value="all">All Students</option>
              {classes.map(classItem =>
                <option key={classItem.id || classItem._id} value={classItem.className}>{classItem.className}</option>
              )}
            </select>
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
              {error}
              <button onClick={() => setError('')} className={styles.errorClose}>×</button>
            </div>
          )}

          <div className={styles.studentsGrid}>
            {filteredStudents.map((student) => (
              <div key={student.id} className={styles.studentCard}>
                <div className={styles.cardActions}>
                  <button className={styles.removeBtn} title="Remove"
                    onClick={() => handleRemoveStudent(student.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.studentIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </div>
                <div className={styles.studentName}>{student.name}</div>
                <div className={styles.studentDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Father:</span>
                    <span className={styles.detailValue}>{student.fatherName}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{student.email}</span>
                  </div>
                </div>
                <div className={styles.studentClasses}>
                  <span className={styles.classesLabel}>Classes:</span>
                  <div className={styles.classesList}>
                    {student.classes ? student.classes.join(', ') : 'No classes assigned'}
                  </div>
                </div>
                <div className={styles.studentStats}>
                  <span className={styles.classCount}>
                    {student.classes ? student.classes.length : 0} Classes
                  </span>
                  <span className={styles.joinDate}>
                    Joined: {student.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredStudents.length === 0 && !error && (
            <div className={styles.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              <h3>No students found</h3>
              <p>Add your first student to get started</p>
            </div>
          )}
        </div>

        {/* Add Student Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay} onClick={closeAddModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Add Student</h2>
                <button className={styles.closeBtn} onClick={closeAddModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && <div className={styles.modalError}>{error}</div>}
              <form onSubmit={handleAddStudent}>
                <div className={styles.formGroup}>
                  <label htmlFor="studentName">Student Name</label>
                  <input
                    type="text"
                    id="studentName"
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    placeholder="Enter student name..."
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="fatherName">Father's Name</label>
                  <input
                    type="text"
                    id="fatherName"
                    value={fatherName}
                    onChange={e => setFatherName(e.target.value)}
                    placeholder="Enter father's name..."
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="studentEmail">Student Email</label>
                  <input
                    type="email"
                    id="studentEmail"
                    value={studentEmail}
                    onChange={e => setStudentEmail(e.target.value)}
                    placeholder="Enter student email..."
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter password..."
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Select Classes</label>
                  <div className={styles.checkboxGroup}>
                    {classes.map(classItem => (
                      <div key={classItem.id || classItem._id} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`class-add-${classItem.className}`}
                          checked={selectedClasses.includes(classItem.className)}
                          onChange={() => handleClassToggle(classItem.className)}
                        />
                        <label htmlFor={`class-add-${classItem.className}`}>{classItem.className}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeAddModal}>Cancel</button>
                  <button type="submit" className={styles.submitBtn} disabled={isLoading || !studentName.trim() || !fatherName.trim() || !studentEmail.trim() || !password.trim() || selectedClasses.length === 0}>
                    {isLoading ? <><div className={styles.spinner}></div>Adding...</> : "Add Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ManageStudents; 