import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './profile.module.css';
import StudentHeader from '../../components/StudentHeader';

const Profile = () => {
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        fatherName: '',
        password: '',
        confirmPassword: '',
        pfp: null
    });
    const [message, setMessage] = useState('');
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
                    setEditForm({
                        name: student.name,
                        email: student.email,
                        fatherName: student.fatherName || '',
                        password: '',
                        confirmPassword: '',
                        pfp: null
                    });
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

    const handleEdit = () => {
        setIsEditing(true);
        setMessage('');
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditForm({
            name: studentData.name,
            email: studentData.email,
            fatherName: studentData.fatherName || '',
            password: '',
            confirmPassword: '',
            pfp: null
        });
        setMessage('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (editForm.password && editForm.password !== editForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        try {
            setLoading(true);
            setMessage('');

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('name', editForm.name.trim());
            formData.append('email', editForm.email.trim());
            if (editForm.fatherName) {
                formData.append('fatherName', editForm.fatherName.trim());
            }
            if (editForm.password) {
                formData.append('password', editForm.password);
            }
            if (editForm.pfp) {
                formData.append('pfp', editForm.pfp);
            }
            formData.append('studentId', studentId);

            // Make API call to update student profile
            const response = await fetch('http://localhost:3000/student/updateProfile', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
                
                // Update local state with new data
                setStudentData(prev => ({
                    ...prev,
                    name: editForm.name,
                    email: editForm.email,
                    fatherName: editForm.fatherName,
                    pfp: result.student?.pfp || prev.pfp
                }));
            } else {
                setMessage({ type: 'error', text: result.message || 'Failed to update profile' });
            }
            
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <StudentHeader />

            <div className={styles.content}>
                <div className={styles.header}>
                    <h1>My Profile</h1>
                    <p>Manage your account information</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        {error}
                    </div>
                )}

                {message && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                        {message.text}
                    </div>
                )}

                {studentData && (
                    <div className={styles.profileCard}>
                        <div className={styles.profileHeader}>
                            <div className={styles.avatarSection}>
                                <div className={styles.avatar}>
                                    {studentData.pfp ? (
                                        <img src={`http://localhost:3000/uploads/${studentData.pfp}`} alt="Profile" />
                                    ) : (
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    )}
                                </div>
                                <div className={styles.studentInfo}>
                                    <h2>{studentData.name}</h2>
                                    <p className={styles.role}>Student</p>
                                    <p className={styles.email}>{studentData.email}</p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button onClick={handleEdit} className={styles.editBtn}>
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleSubmit} className={styles.editForm}>
                                <div className={styles.formGroup}>
                                    <label htmlFor="name">Full Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editForm.name}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="email">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={editForm.email}
                                        onChange={handleInputChange}
                                        required
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="fatherName">Father's Name</label>
                                    <input
                                        type="text"
                                        id="fatherName"
                                        name="fatherName"
                                        value={editForm.fatherName}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="password">New Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={editForm.password}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <input
                                        type="password"
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        value={editForm.confirmPassword}
                                        onChange={handleInputChange}
                                        className={styles.input}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label htmlFor="profilePicture">Profile Picture (optional)</label>
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        name="pfp"
                                        accept="image/*"
                                        onChange={(e) => setEditForm(prev => ({ ...prev, pfp: e.target.files[0] }))}
                                        className={styles.fileInput}
                                    />
                                    {studentData?.pfp && (
                                        <div className={styles.currentPfp}>
                                            <span>Current: </span>
                                            <img 
                                                src={`http://localhost:3000/uploads/${studentData.pfp}`} 
                                                alt="Current profile" 
                                                className={styles.currentPfpImage}
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formActions}>
                                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button type="button" onClick={handleCancel} className={styles.cancelBtn}>
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className={styles.profileDetails}>
                                <div className={styles.detailSection}>
                                    <h3>Enrolled Classes</h3>
                                    <div className={styles.classesList}>
                                        {studentData.classes && studentData.classes.length > 0 ? (
                                            studentData.classes.map((className, index) => (
                                                <span key={index} className={styles.classTag}>
                                                    {className}
                                                </span>
                                            ))
                                        ) : (
                                            <p className={styles.noClasses}>No classes enrolled yet</p>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h3>Account Information</h3>
                                    <div className={styles.infoGrid}>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Student ID</span>
                                            <span className={styles.infoValue}>{studentData.id}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Email</span>
                                            <span className={styles.infoValue}>{studentData.email}</span>
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Name</span>
                                            <span className={styles.infoValue}>{studentData.name}</span>
                                        </div>
                                        {studentData.fatherName && (
                                            <div className={styles.infoItem}>
                                                <span className={styles.infoLabel}>Father's Name</span>
                                                <span className={styles.infoValue}>{studentData.fatherName}</span>
                                            </div>
                                        )}
                                        <div className={styles.infoItem}>
                                            <span className={styles.infoLabel}>Enrollment Date</span>
                                            <span className={styles.infoValue}>
                                                {studentData.createdAt ? new Date(studentData.createdAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
