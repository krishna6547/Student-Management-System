import { useState, useEffect } from 'react';
import AdminHeader from "../../components/AdminHeader";

import styles from './manageSubjects.module.css'; // Updated to CSS module import

function ManageSubjects() {
    const [subjects, setSubjects] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSubjectName, setNewSubjectName] = useState('');
    const [editingSubject, setEditingSubject] = useState(null);
    const [editSubjectName, setEditSubjectName] = useState('');
    const [isEditNameModalOpen, setIsEditNameModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [error, setError] = useState('');

    const userId = localStorage.getItem("userId");

    // Fetch subjects on component mount
    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        if (!userId) {
            setError('User not authenticated');
            setIsPageLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/subject/all/${userId}`, {
                method: "GET",
                headers: {"Content-Type": "application/json"}
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setSubjects(result.subjects || []);
                setError('');
            } else {
                setError(result.message || 'Failed to fetch subjects');
                console.error('Error fetching subjects:', result.message);
            }
        } catch (error) {
            setError('Network error occurred');
            console.error('Error fetching subjects:', error);
        } finally {
            setIsPageLoading(false);
        }
    };

    const handleAddSubject = async (e) => {
        e.preventDefault();
        if (!newSubjectName.trim()) return;
        
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch("http://localhost:3000/subject/add", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: newSubjectName.trim().charAt(0).toUpperCase() + newSubjectName.trim().slice(1).toLowerCase(), // capitalize the first letter
                    userId: userId
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                const newSubject = result.subject || {
                    id: Date.now(),
                    name: newSubjectName.trim(),
                    students: 0,
                    teachers: 0
                };
                
                setSubjects(prevSubjects => [...prevSubjects, newSubject]);
                setNewSubjectName('');
                setIsAddModalOpen(false);
                
                console.log('Subject added successfully');
            } else {
                setError(result.message || 'Failed to add subject');
            }
        } catch (error) {
            setError('Network error occurred');
            console.error('Error adding subject:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditSubject = (subject) => {
        setEditingSubject(subject);
        setEditSubjectName(subject.name);
        setIsEditNameModalOpen(true);
        setError('');
    };

    const handleUpdateSubjectName = async (e) => {
        e.preventDefault();
        
        if (!editSubjectName.trim()) {
            setError('Subject name cannot be empty');
            return;
        }
        
        setIsLoading(true);
        setError('');
        
        try {
            const response = await fetch("http://localhost:3000/subject/updateName", {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    oldName: editingSubject.name,
                    newName: editSubjectName.trim(),
                    userId: userId
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                // Update the subject in local state with real counts
                setSubjects(prevSubjects => 
                    prevSubjects.map(subject => 
                        subject.id === editingSubject.id || subject.name === editingSubject.name
                            ? { 
                                ...subject, 
                                name: editSubjectName.trim(),
                                students: result.subject.students,
                                teachers: result.subject.teachers
                            }
                            : subject
                    )
                );
                
                setIsEditNameModalOpen(false);
                setEditingSubject(null);
                setEditSubjectName('');
                console.log('Subject name updated successfully');
            } else {
                setError(result.message || 'Failed to update subject name');
            }
        } catch (error) {
            setError('Network error occurred');
            console.error('Error updating subject name:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveSubject = async (subjectName) => {
        if (!window.confirm(`Are you sure you want to remove "${subjectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/subject/remove", {
                method: "DELETE",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    subjectName: subjectName,
                    userId: userId
                })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setSubjects(prevSubjects => 
                    prevSubjects.filter(subject => subject.name !== subjectName)
                );
                console.log('Subject removed successfully');
            } else {
                setError(result.message || 'Failed to remove subject');
            }
        } catch (error) {
            setError('Network error occurred');
            console.error('Error removing subject:', error);
        }
    };

    const closeModal = () => {
        setIsAddModalOpen(false);
        setNewSubjectName('');
        setError('');
    };

    const closeEditNameModal = () => {
        setIsEditNameModalOpen(false);
        setEditingSubject(null);
        setEditSubjectName('');
        setError('');
    };

    // Function to refresh subjects with real counts
    const refreshSubjects = async () => {
        await fetchSubjects();
    };

    // Show loading spinner while fetching initial data
    if (isPageLoading) {
        return (
            <>
                <AdminHeader />
                <div className={styles.manageSubjectsContainer}>
                    <div className={styles.loadingContainer}>
                        <div className={styles.spinner}></div>
                        <p>Loading subjects...</p>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            <div className={styles.manageSubjectsContainer}>
                <div className={styles.subjectsContent}>
                    <div className={styles.subjectsHeader}>
                        <div className={styles.headerLeft}>
                            <h1 className={styles.pageTitle}>Manage Subjects</h1>
                            <p className={styles.pageSubtitle}>Add, edit, and organize academic subjects</p>
                        </div>
                        <button 
                            className={styles.addSubjectBtn}
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Add Subject
                        </button>
                    </div>

                    {/* Error message display */}
                    {error && (
                        <div className={styles.errorMessage}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                            </svg>
                            {error}
                            <button onClick={() => setError('')} className={styles.errorClose}>×</button>
                        </div>
                    )}

                    <div className={styles.subjectsGrid}>
                        {subjects.map((subject, index) => (
                            <div 
                                key={subject.id || subject.name} 
                                className={styles.subjectCard}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className={styles.cardBackground}></div>
                                <div className={styles.cardActions}>
                                    <button 
                                        className={styles.editBtn}
                                        onClick={() => handleEditSubject(subject)}
                                        title="Edit Subject"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                        </svg>
                                    </button>
                                    <button 
                                        className={styles.removeBtn}
                                        onClick={() => handleRemoveSubject(subject.name)}
                                        title="Remove Subject"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className={styles.subjectIcon}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                
                                <div className={styles.subjectContent}>
                                    <h3 className={styles.subjectName}>{subject.name}</h3>
                                    <div className={styles.subjectStats}>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{subject.students || 0}</span>
                                            <span className={styles.statLabel}>Students</span>
                                        </div>
                                        <div className={styles.statDivider}></div>
                                        <div className={styles.statItem}>
                                            <span className={styles.statNumber}>{subject.teachers || 0}</span>
                                            <span className={styles.statLabel}>Teachers</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className={styles.cardGlow}></div>
                            </div>
                        ))}
                    </div>

                    {subjects.length === 0 && !error && (
                        <div className={styles.emptyState}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                            <h3>No subjects found</h3>
                            <p>Get started by adding your first subject</p>
                        </div>
                    )}
                </div>

                {/* Add Subject Modal */}
                {isAddModalOpen && (
                    <div className={styles.modalOverlay} onClick={closeModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Add New Subject</h2>
                                <button className={styles.closeBtn} onClick={closeModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {error && (
                                <div className={styles.modalError}>
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleAddSubject}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="subjectName">Subject Name</label>
                                    <input
                                        type="text"
                                        id="subjectName"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                        placeholder="Enter subject name..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                
                                <div className={styles.modalActions}>
                                    <button 
                                        type="button" 
                                        className={styles.cancelBtn} 
                                        onClick={closeModal}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={isLoading || !newSubjectName.trim()}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className={styles.spinner}></div>
                                                Adding...
                                            </>
                                        ) : (
                                            'Add Subject'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Subject Name Modal */}
                {isEditNameModalOpen && (
                    <div className={styles.modalOverlay} onClick={closeEditNameModal}>
                        <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                            <div className={styles.modalHeader}>
                                <h2>Edit Subject Name</h2>
                                <button className={styles.closeBtn} onClick={closeEditNameModal}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {error && (
                                <div className={styles.modalError}>
                                    {error}
                                </div>
                            )}
                            
                            <form onSubmit={handleUpdateSubjectName}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="editSubjectName">Subject Name</label>
                                    <input
                                        type="text"
                                        id="editSubjectName"
                                        value={editSubjectName}
                                        onChange={(e) => setEditSubjectName(e.target.value)}
                                        placeholder="Enter new subject name..."
                                        required
                                        autoFocus
                                    />
                                </div>
                                
                                <div className={styles.modalActions}>
                                    <button 
                                        type="button" 
                                        className={styles.cancelBtn} 
                                        onClick={closeEditNameModal}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className={styles.submitBtn}
                                        disabled={isLoading || !editSubjectName.trim()}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className={styles.spinner}></div>
                                                Updating...
                                            </>
                                        ) : (
                                            'Update Name'
                                        )}
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

export default ManageSubjects;
