import { useState, useEffect } from 'react';
import AdminHeader from "../../components/AdminHeader";
import styles from './manageClasses.module.css';

function ManageClasses() {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [editingClass, setEditingClass] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem("userId");

  // Fetch subjects and classes on mount
  useEffect(() => {
    fetchSubjects();
    fetchClasses();
    // eslint-disable-next-line
  }, []);

  const fetchSubjects = async () => { 
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/subject/all/${userId}`);
      const result = await response.json();
      if (response.ok) {
        setSubjects(result.subjects || []);
      } else {
        setError(result.message || 'Unable to fetch subjects');
      }
    } catch (err) {
      setError('Failed to fetch subjects');
    }
  };

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

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClassName.trim() || selectedSubjects.length === 0) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/class/add', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          className: newClassName.trim(),
          subjects: selectedSubjects,
          userId
        })
      });
      const result = await response.json();
      if (response.ok) {
        setClasses(prev => [...prev, result.class || { 
          className: newClassName.trim(), 
          id: Date.now(), 
          subjects: selectedSubjects 
        }]);
        setNewClassName('');
        setSelectedSubjects([]);
        setIsAddModalOpen(false);
      } else {
        setError(result.message || 'Failed to add class');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClass = (classItem) => {
    setEditingClass(classItem);
    setNewClassName(classItem.className);
    setSelectedSubjects(classItem.subjects || []);
    setIsEditModalOpen(true);
    setError('');
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();
    if (!editingClass || selectedSubjects.length === 0) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/class/update', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: editingClass.id,
          className: newClassName.trim(),
          subjects: selectedSubjects,
          userId
        })
      });
      const result = await response.json();
      if (response.ok) {
        setClasses(prev =>
          prev.map(c => c.id === editingClass.id ? 
            { ...c, className: newClassName.trim(), subjects: selectedSubjects } : c
          )
        );
        setIsEditModalOpen(false);
        setEditingClass(null);
        setNewClassName('');
        setSelectedSubjects([]);
      } else {
        setError(result.message || 'Failed to update class');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveClass = async (classId) => {
    if (!window.confirm("Remove this class?")) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:3000/class/remove', {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId,
          userId
        })
      });
      if (response.ok) {
        setClasses(prev => prev.filter(c => c.id !== classId));
      } else {
        const result = await response.json();
        setError(result?.message || 'Failed to remove class');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectName)
        ? prev.filter(s => s !== subjectName)
        : [...prev, subjectName]
    );
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewClassName('');
    setSelectedSubjects([]);
    setError('');
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setNewClassName('');
    setSelectedSubjects([]);
    setEditingClass(null);
    setError('');
  };

  // Filter classes based on selected filter
  const filteredClasses = selectedClass === 'all' 
    ? classes 
    : classes.filter(classItem => 
        classItem.subjects && classItem.subjects.includes(selectedClass)
      );

  // Loading state
  if (isPageLoading) {
    return (
      <>
        <AdminHeader />
        <div className={styles.manageClassesContainer}>
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
      <div className={styles.manageClassesContainer}>
        <div className={styles.classesContent}>
          <div className={styles.classesHeader}>
            <div className={styles.headerLeft}>
              <h1 className={styles.pageTitle}>Manage Classes</h1>
              <p className={styles.pageSubtitle}>Organize classes and assign subjects</p>
            </div>
            <button className={styles.addClassBtn}
              disabled={!subjects.length}
              onClick={() => setIsAddModalOpen(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Class
            </button>
          </div>

          <div className={styles.filterRow}>
            <label htmlFor="classFilter" className={styles.filterLabel}>Filter by Subject:</label>
            <select
              id="classFilter"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className={styles.classFilter}
            >
              <option value="all">All Classes</option>
              {subjects.map(subject =>
                <option key={subject.id || subject.name} value={subject.name}>{subject.name}</option>
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

          <div className={styles.classesGrid}>
            {filteredClasses.map((classItem) => (
              <div key={classItem.id || classItem.className} className={styles.classCard}>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} title="Edit" onClick={() => handleEditClass(classItem)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </button>
                  <button className={styles.removeBtn} title="Remove"
                    onClick={() => handleRemoveClass(classItem.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className={styles.classIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
                  </svg>
                </div>
                <div className={styles.className}>{classItem.className}</div>
                <div className={styles.classSubjects}>
                  {classItem.subjects ? classItem.subjects.join(', ') : 'No subjects assigned'}
                </div>
                <div className={styles.classStats}>
                  <span className={styles.subjectCount}>
                    {classItem.subjects ? classItem.subjects.length : 0} Subjects
                  </span>
                </div>
              </div>
            ))}
          </div>

          {filteredClasses.length === 0 && !error && (
            <div className={styles.emptyState}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
              </svg>
              <h3>No classes found</h3>
              <p>Add your first class to get started</p>
            </div>
          )}
        </div>

        {/* Add Class Modal */}
        {isAddModalOpen && (
          <div className={styles.modalOverlay} onClick={closeAddModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Add Class</h2>
                <button className={styles.closeBtn} onClick={closeAddModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && <div className={styles.modalError}>{error}</div>}
              <form onSubmit={handleAddClass}>
                <div className={styles.formGroup}>
                  <label htmlFor="className">Class Name</label>
                  <input
                    type="text"
                    id="className"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="Enter class name..."
                    required
                    autoFocus
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Select Subjects</label>
                  <div className={styles.checkboxGroup}>
                    {subjects.map(subject => (
                      <div key={subject.id || subject.name} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`subject-add-${subject.name}`}
                          checked={selectedSubjects.includes(subject.name)}
                          onChange={() => handleSubjectToggle(subject.name)}
                        />
                        <label htmlFor={`subject-add-${subject.name}`}>{subject.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeAddModal}>Cancel</button>
                  <button type="submit" className={styles.submitBtn} disabled={isLoading || !newClassName.trim() || selectedSubjects.length === 0}>
                    {isLoading ? <><div className={styles.spinner}></div>Adding...</> : "Add Class"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Class Modal */}
        {isEditModalOpen && (
          <div className={styles.modalOverlay} onClick={closeEditModal}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Edit Class</h2>
                <button className={styles.closeBtn} onClick={closeEditModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {error && <div className={styles.modalError}>{error}</div>}
              <form onSubmit={handleUpdateClass}>
                <div className={styles.formGroup}>
                  <label htmlFor="editClassName">Class Name</label>
                  <input
                    type="text"
                    id="editClassName"
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    placeholder="Class name"
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Select Subjects</label>
                  <div className={styles.checkboxGroup}>
                    {subjects.map(subject => (
                      <div key={subject.id || subject.name} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`subject-edit-${subject.name}`}
                          checked={selectedSubjects.includes(subject.name)}
                          onChange={() => handleSubjectToggle(subject.name)}
                        />
                        <label htmlFor={`subject-edit-${subject.name}`}>{subject.name}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.modalActions}>
                  <button type="button" className={styles.cancelBtn} onClick={closeEditModal}>Cancel</button>
                  <button type="submit" className={styles.submitBtn} disabled={isLoading || !newClassName.trim() || selectedSubjects.length === 0}>
                    {isLoading ? <><div className={styles.spinner}></div>Updating...</> : "Update"}
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

export default ManageClasses;