import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './manageSchedule.module.css';
import TeacherHeader from '../../components/TeacherHeader';

const ManageSchedule = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [scheduleForm, setScheduleForm] = useState({
        day: '',
        startTime: '',
        endTime: '',
        room: ''
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
            fetchSchedules();
        }
    }, [selectedClass]);

    const fetchSchedules = async () => {
        try {
            const response = await fetch(`http://localhost:3000/schedule/class/${selectedClass}?teacherId=${teacherId}`);
            const data = await response.json();

            if (data.success) {
                setSchedules(data.schedules);
            } else {
                setSchedules([]);
            }
        } catch (error) {
            console.error('Error fetching schedules:', error);
            setError('Failed to fetch schedules');
        }
    };

    const handleAddSchedule = () => {
        setShowScheduleForm(true);
        setSelectedSubject('');
        setScheduleForm({
            day: '',
            startTime: '',
            endTime: '',
            room: ''
        });
    };

    const handleEditSchedule = (schedule) => {
        setSelectedSubject(schedule.subject);
        setShowScheduleForm(true);
        setScheduleForm({
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            room: schedule.room || ''
        });
    };

    const handleSubmitSchedule = async (e) => {
        e.preventDefault();

        if (!scheduleForm.day || !scheduleForm.startTime || !scheduleForm.endTime || !selectedSubject) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/schedule/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherId,
                    className: selectedClass,
                    subject: selectedSubject,
                    day: scheduleForm.day,
                    startTime: scheduleForm.startTime,
                    endTime: scheduleForm.endTime,
                    room: scheduleForm.room
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowScheduleForm(false);
                setSelectedSubject('');
                setScheduleForm({ day: '', startTime: '', endTime: '', room: '' });
                fetchSchedules(); // Refresh the data
            } else {
                setError(data.message || 'Failed to save schedule');
            }
        } catch (error) {
            console.error('Error saving schedule:', error);
            setError('Failed to save schedule');
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/schedule/delete/${scheduleId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ teacherId })
            });

            const data = await response.json();

            if (response.ok) {
                fetchSchedules(); // Refresh the data
            } else {
                setError(data.message || 'Failed to delete schedule');
            }
        } catch (error) {
            console.error('Error deleting schedule:', error);
            setError('Failed to delete schedule');
        }
    };

    const getDayColor = (day) => {
        const colors = {
            'Monday': '#3b82f6',
            'Tuesday': '#10b981',
            'Wednesday': '#f59e0b',
            'Thursday': '#8b5cf6',
            'Friday': '#ef4444'
        };
        return colors[day] || '#6b7280';
    };

    const formatTime = (time) => {
        // Convert 24-hour format to 12-hour format
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const groupSchedulesByDay = () => {
        const grouped = {};
        schedules.forEach(schedule => {
            if (!grouped[schedule.day]) {
                grouped[schedule.day] = [];
            }
            grouped[schedule.day].push(schedule);
        });
        return grouped;
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading schedule management...</p>
            </div>
        );
    }

    return (
        <>
            <TeacherHeader />
            <div className={styles.container}>

                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1>Manage Schedule</h1>
                        <p>Add and manage class schedules</p>
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

                    {selectedClass && (
                        <div className={styles.scheduleSection}>
                            <div className={styles.sectionHeader}>
                                <h2>Schedule for {selectedClass}</h2>
                                <button
                                    className={styles.addScheduleBtn}
                                    onClick={handleAddSchedule}
                                >
                                    Add New Schedule
                                </button>
                            </div>

                            {schedules.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                    <h3>No Schedule Available</h3>
                                    <p>Add schedules for your classes to get started.</p>
                                </div>
                            ) : (
                                <div className={styles.scheduleContainer}>
                                    {Object.entries(groupSchedulesByDay()).map(([day, daySchedules]) => (
                                        <div key={day} className={styles.daySection}>
                                            <div className={styles.dayHeader} style={{ borderLeftColor: getDayColor(day) }}>
                                                <h3>{day}</h3>
                                                <span className={styles.classCount}>
                                                    {daySchedules.length} {daySchedules.length === 1 ? 'Class' : 'Classes'}
                                                </span>
                                            </div>
                                            <div className={styles.classesList}>
                                                {daySchedules.map((schedule) => (
                                                    <div key={schedule._id} className={styles.classCard}>
                                                        <div className={styles.classHeader}>
                                                            <h4>{schedule.subject}</h4>
                                                            <span className={styles.className}>{schedule.className}</span>
                                                        </div>
                                                        <div className={styles.classDetails}>
                                                            <div className={styles.timeSlot}>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                                                                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                                <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                                                            </div>
                                                            {schedule.room && (
                                                                <div className={styles.roomSlot}>
                                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                        <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                    </svg>
                                                                    <span>Room {schedule.room}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className={styles.actions}>
                                                            <button
                                                                className={styles.editBtn}
                                                                onClick={() => handleEditSchedule(schedule)}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                className={styles.deleteBtn}
                                                                onClick={() => handleDeleteSchedule(schedule._id)}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {showScheduleForm && (
                        <div className={styles.modal}>
                            <div className={styles.modalContent}>
                                <div className={styles.modalHeader}>
                                    <h3>Add/Edit Schedule</h3>
                                    <button
                                        className={styles.closeBtn}
                                        onClick={() => setShowScheduleForm(false)}
                                    >
                                        ×
                                    </button>
                                </div>

                                <form onSubmit={handleSubmitSchedule} className={styles.scheduleForm}>
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
                                        <label htmlFor="day">Day:</label>
                                        <select
                                            id="day"
                                            value={scheduleForm.day}
                                            onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Day</option>
                                            <option value="Monday">Monday</option>
                                            <option value="Tuesday">Tuesday</option>
                                            <option value="Wednesday">Wednesday</option>
                                            <option value="Thursday">Thursday</option>
                                            <option value="Friday">Friday</option>
                                        </select>
                                    </div>

                                    <div className={styles.timeGroup}>
                                        <div className={styles.formGroup}>
                                            <label htmlFor="startTime">Start Time:</label>
                                            <input
                                                type="time"
                                                id="startTime"
                                                value={scheduleForm.startTime}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <div className={styles.formGroup}>
                                            <label htmlFor="endTime">End Time:</label>
                                            <input
                                                type="time"
                                                id="endTime"
                                                value={scheduleForm.endTime}
                                                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="room">Room (Optional):</label>
                                        <input
                                            type="text"
                                            id="room"
                                            value={scheduleForm.room}
                                            onChange={(e) => setScheduleForm({ ...scheduleForm, room: e.target.value })}
                                            placeholder="e.g., Room 101"
                                        />
                                    </div>

                                    <div className={styles.formActions}>
                                        <button type="submit" className={styles.submitBtn}>
                                            Save Schedule
                                        </button>
                                        <button
                                            type="button"
                                            className={styles.cancelBtn}
                                            onClick={() => setShowScheduleForm(false)}
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

export default ManageSchedule;
