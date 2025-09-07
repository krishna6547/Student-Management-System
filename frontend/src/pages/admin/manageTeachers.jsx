import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AdminHeader from "../../components/AdminHeader";
import styles from './manageTeachers.module.css';

// TeacherSubjects component for collapsible subjects display
function TeacherSubjects({ classes }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  const fetchSubjectsForClasses = async (classNames) => {
    if (!classNames || classNames.length === 0) return [];

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/class/all/${userId}`);
      const result = await response.json();

      if (response.ok && result.classes) {
        const allSubjects = [];
        result.classes.forEach(classItem => {
          if (classNames.includes(classItem.className)) {
            if (classItem.subjects && Array.isArray(classItem.subjects)) {
              allSubjects.push(...classItem.subjects);
            }
          }
        });
        // Remove duplicates
        const uniqueSubjects = [...new Set(allSubjects)];
        setSubjects(uniqueSubjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isExpanded && subjects.length === 0) {
      fetchSubjectsForClasses(classes);
    }
    setIsExpanded(!isExpanded);
  };

  if (!classes || classes.length === 0) return null;

  return (
    <div className={styles.subjectsContainer}>
      <button
        className={styles.subjectsToggle}
        onClick={handleToggle}
        disabled={loading}
      >
        <svg
          className={`${styles.toggleIcon} ${isExpanded ? styles.expanded : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        <span>Subjects</span>
        {loading && <div className={styles.miniSpinner}></div>}
      </button>

      {isExpanded && (
        <div className={styles.subjectsList}>
          {subjects.length > 0 ? (
            subjects.map((subject, index) => (
              <div key={index} className={styles.subjectTag}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                {subject}
              </div>
            ))
          ) : (
            <div className={styles.noSubjects}>No subjects assigned to these classes</div>
          )}
        </div>
      )}
    </div>
  );
}

function ManageTeachers() {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
    pfp: null
  });
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchTeachers(selectedClass);
    } else {
      setTeachers([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    setIsPageLoading(true);
    if (!userId) {
      setError('User not authenticated');
      setIsPageLoading(false);
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/class/all/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setClasses(result.classes || []);
        setError('');
      } else {
        setError(result.message || 'Unable to fetch classes');
      }
    } catch (err) {
      setError('Failed to fetch classes');
    } finally {
      setIsPageLoading(false);
    }
  };

  const fetchTeachers = async (className) => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/teacher/byClass', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ className, userId })
      });
      const result = await response.json();
      if (response.ok) setTeachers(result.teachers || []);
      else setError(result.message || "Failed to load teachers");
    } catch {
      setError("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    if (!newTeacher.name.trim() || !newTeacher.email.trim() || !newTeacher.password.trim() || selectedClasses.length === 0) return;
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', newTeacher.name.trim());
    formData.append('email', newTeacher.email.trim());
    formData.append('password', newTeacher.password.trim());
    formData.append('classNames', JSON.stringify(selectedClasses));
    formData.append('userId', userId);
    if (newTeacher.pfp) {
      formData.append('pfp', newTeacher.pfp);
    }

    try {
      const response = await fetch('http://localhost:3000/teacher/add', {
        method: "POST",
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        setTeachers(prev => [...prev, result.teacher]);
        setNewTeacher({ name: '', email: '', password: '', pfp: null });
        setSelectedClasses([]);
        setIsAddModalOpen(false);
      } else {
        setError(result.message || 'Failed to add teacher');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    setEditingTeacher(teacher);
    setNewTeacher({
      name: teacher.name,
      email: teacher.email,
      password: '',
      pfp: null
    });
    setSelectedClasses(teacher.classes || []);
    setIsEditModalOpen(true);
    setError('');
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    if (!editingTeacher || !newTeacher.name.trim() || !newTeacher.email.trim() || selectedClasses.length === 0) return;
    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('teacherId', editingTeacher.id);
    formData.append('name', newTeacher.name.trim());
    formData.append('email', newTeacher.email.trim());
    if (newTeacher.password.trim()) {
      formData.append('password', newTeacher.password.trim());
    }
    formData.append('classNames', JSON.stringify(selectedClasses));
    formData.append('userId', userId);
    if (newTeacher.pfp) {
      formData.append('pfp', newTeacher.pfp);
    }

    try {
      const response = await fetch('http://localhost:3000/teacher/update', {
        method: "PUT",
        body: formData
      });
      const result = await response.json();
      if (response.ok) {
        setTeachers(prev =>
          prev.map(t => t.id === editingTeacher.id ? result.teacher : t)
        );
        setIsEditModalOpen(false);
        setEditingTeacher(null);
        setNewTeacher({ name: '', email: '', password: '', pfp: null });
        setSelectedClasses([]);
      } else {
        setError(result.message || 'Failed to update teacher');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (!window.confirm("Remove this teacher?")) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/teacher/remove', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teacherId,
          userId
        })
      });
      if (response.ok) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
      } else {
        const result = await response.json();
        setError(result?.message || 'Failed to remove teacher');
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
    setNewTeacher({ name: '', email: '', password: '', pfp: null });
    setSelectedClasses([]);
    setError('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setNewTeacher({ name: '', email: '', password: '', pfp: null });
    setSelectedClasses([]);
    setEditingTeacher(null);
    setError('');
  };

  if (isPageLoading) {
    return (
      <>
        <AdminHeader />
        <div className={styles.manageTeachersContainer}>
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
      <div className={styles.manageTeachersContainer}>
        <div className={styles.teachersContent}>
          <div className={styles.teachersHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Manage Teachers</h1>
              <p className={styles.pageSubtitle}>Assign teachers to academic classes</p>
            </div>
            <button
              className={styles.addTeacherBtn}
              disabled={!classes.length}
              onClick={() => setIsAddModalOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Teacher
            </button>
          </div>

          <div className={styles.subjectSelectRow}>
            <label htmlFor="classSelect" className={styles.subjectSelectLabel}>Select Class:</label>
            <select
              id="classSelect"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className={styles.subjectSelect}
            >
              <option value="all">All</option>
              {classes.map(classItem =>
                <option key={classItem.id || classItem.className} value={classItem.className}>{classItem.className}</option>
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

          <div className={styles.teachersGrid}>
            {teachers.map((teacher) => (
              <div key={teacher.id} className={styles.teacherCard}>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} title="Edit" onClick={() => handleEditTeacher(teacher)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button className={styles.removeBtn} title="Remove" onClick={() => handleRemoveTeacher(teacher.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.teacherIcon}>
                  {teacher.pfp ? (
                    <img
                      src={`http://localhost:3000/uploads/${teacher.pfp}`}
                      alt={teacher.name}
                      className={styles.teacherPfp}
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
                    </svg>
                  )}
                </div>
                <div className={styles.teacherName}>{teacher.name}</div>
                <div className={styles.teacherEmail}>{teacher.email}</div>
                <div className={styles.teacherClasses}>
                  {(teacher.classes || []).join(', ')}
                </div>
                <TeacherSubjects classes={teacher.classes || []} />
              </div>
            ))}
          </div>

          {teachers.length === 0 && !error && !!selectedClass && (
            <div className={styles.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a7.5 7.5 0 1115 0v.75a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.75z" />
              </svg>
              <h3>No teachers found for this class</h3>
              <p>Add your first teacher</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Teacher Modal with Portal */}
      {isAddModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={closeAddModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Add Teacher</h2>
              <button className={styles.closeBtn} onClick={closeAddModal}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className={styles.modalError}>{error}</div>}
            <form onSubmit={handleAddTeacher}>
              <div className={styles.formGroup}>
                <label htmlFor="teacherName">Teacher Name</label>
                <input
                  type="text"
                  id="teacherName"
                  value={newTeacher.name}
                  onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="Enter teacher name..."
                  required
                  autoFocus
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="teacherEmail">Email</label>
                <input
                  type="email"
                  id="teacherEmail"
                  value={newTeacher.email}
                  onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="Enter teacher email..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="teacherPassword">Password</label>
                <input
                  type="password"
                  id="teacherPassword"
                  value={newTeacher.password}
                  onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  placeholder="Enter password..."
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="teacherPfp">Profile Picture</label>
                <input
                  type="file"
                  id="teacherPfp"
                  accept="image/*"
                  onChange={e => setNewTeacher({ ...newTeacher, pfp: e.target.files[0] })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Select Classes</label>
                <div className={styles.checkboxGroup}>
                  {classes.map(classItem => (
                    <div key={classItem.id || classItem.className} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`class-${classItem.className}`}
                        checked={selectedClasses.includes(classItem.className)}
                        onChange={() => handleClassToggle(classItem.className)}
                      />
                      <label htmlFor={`class-${classItem.className}`}>{classItem.className}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeAddModal}>Cancel</button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading || !newTeacher.name.trim() || !newTeacher.email.trim() || !newTeacher.password.trim() || selectedClasses.length === 0}
                >
                  {isLoading ? <><div className={styles.spinner}></div>Adding...</> : "Add Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Teacher Modal with Portal */}
      {isEditModalOpen && createPortal(
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Edit Teacher</h2>
              <button className={styles.closeBtn} onClick={closeEditModal}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {error && <div className={styles.modalError}>{error}</div>}
            <form onSubmit={handleUpdateTeacher}>
              <div className={styles.formGroup}>
                <label htmlFor="editTeacherName">Teacher Name</label>
                <input
                  type="text"
                  id="editTeacherName"
                  value={newTeacher.name}
                  onChange={e => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  placeholder="Teacher name"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editTeacherEmail">Email</label>
                <input
                  type="email"
                  id="editTeacherEmail"
                  value={newTeacher.email}
                  onChange={e => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="Teacher email"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editTeacherPassword">New Password (optional)</label>
                <input
                  type="password"
                  id="editTeacherPassword"
                  value={newTeacher.password}
                  onChange={e => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  placeholder="Enter new password..."
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="editTeacherPfp">Profile Picture (optional)</label>
                <input
                  type="file"
                  id="editTeacherPfp"
                  accept="image/*"
                  onChange={e => setNewTeacher({ ...newTeacher, pfp: e.target.files[0] })}
                />
                {editingTeacher?.pfp && (
                  <div className={styles.currentPfp}>
                    Current: <img src={`http://localhost:3000/uploads/${editingTeacher.pfp}`} alt="Current profile" />
                  </div>
                )}
              </div>
              <div className={styles.formGroup}>
                <label>Select Classes</label>
                <div className={styles.checkboxGroup}>
                  {classes.map(classItem => (
                    <div key={classItem.id || classItem.className} className={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        id={`class-${classItem.className}`}
                        checked={selectedClasses.includes(classItem.className)}
                        onChange={() => handleClassToggle(classItem.className)}
                      />
                      <label htmlFor={`class-${classItem.className}`}>{classItem.className}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeEditModal}>Cancel</button>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading || !newTeacher.name.trim() || !newTeacher.email.trim() || selectedClasses.length === 0}
                >
                  {isLoading ? <><div className={styles.spinner}></div>Updating...</> : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default ManageTeachers;