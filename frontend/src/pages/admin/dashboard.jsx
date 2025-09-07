import { useState, useEffect } from 'react';
import AdminHeader from "../../components/AdminHeader";
import styles from './dashboard.module.css';

function Dashboard() {
    const [stats, setStats] = useState({
        teachers: 0,
        students: 0,
        classes: 0,
        subjects: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const userId = localStorage.getItem("userId");

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        if (!userId) {
            setError('User not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/dashboard/stats/${userId}`);
            const result = await response.json();
            
            if (response.ok) {
                setStats(result.stats || {
                    teachers: 0,
                    students: 0,
                    classes: 0,
                    subjects: 0
                });
                setError('');
            } else {
                setError(result.message || 'Unable to fetch dashboard stats');
            }
        } catch (err) {
            setError('Failed to fetch dashboard stats');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <>
                <AdminHeader />
                <div className={styles.dashboardContainer}>
                    <div className={styles.dashboardContent}>
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Loading dashboard...</p>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            <div className={styles.dashboardContainer}>
                <div className={styles.dashboardContent}>
                    <div className={styles.dashboardHeader}>
                        <h1 className={styles.dashboardTitle}>Welcome admin</h1>
                        <p className={styles.dashboardSubtitle}>
                            {/* Welcome to your admin panel. Monitor your school's performance at a glance. */}
                        </p>
                    </div>
                    
                    <div className={styles.statsGrid}>
                        <div className={`${styles.statCard} ${styles.teachersCard}`}>
                            <div className={styles.cardBackground}></div>
                            <div className={styles.statIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <h3 className={styles.statTitle}>Total Teachers</h3>
                                <p className={styles.statNumber}>{stats.teachers}</p>
                                <div className={styles.statTrend}>
                                    <span className={`${styles.trendIndicator} ${styles.positive}`}>↗</span>
                                    <span className={styles.trendText}>Active teachers</span>
                                </div>
                            </div>
                            <div className={styles.cardGlow}></div>
                        </div>

                        <div className={`${styles.statCard} ${styles.studentsCard}`}>
                            <div className={styles.cardBackground}></div>
                            <div className={styles.statIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <h3 className={styles.statTitle}>Total Students</h3>
                                <p className={styles.statNumber}>{stats.students}</p>
                                <div className={styles.statTrend}>
                                    <span className={`${styles.trendIndicator} ${styles.positive}`}>↗</span>
                                    <span className={styles.trendText}>Enrolled students</span>
                                </div>
                            </div>
                            <div className={styles.cardGlow}></div>
                        </div>

                        <div className={`${styles.statCard} ${styles.classesCard}`}>
                            <div className={styles.cardBackground}></div>
                            <div className={styles.statIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <h3 className={styles.statTitle}>Total Classes</h3>
                                <p className={styles.statNumber}>{stats.classes}</p>
                                <div className={styles.statTrend}>
                                    <span className={`${styles.trendIndicator} ${styles.positive}`}>↗</span>
                                    <span className={styles.trendText}>Active classes</span>
                                </div>
                            </div>
                            <div className={styles.cardGlow}></div>
                        </div>

                        <div className={`${styles.statCard} ${styles.subjectsCard}`}>
                            <div className={styles.cardBackground}></div>
                            <div className={styles.statIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <div className={styles.statContent}>
                                <h3 className={styles.statTitle}>Total Subjects</h3>
                                <p className={styles.statNumber}>{stats.subjects}</p>
                                <div className={styles.statTrend}>
                                    <span className={`${styles.trendIndicator} ${styles.neutral}`}>→</span>
                                    <span className={styles.trendText}>Available subjects</span>
                                </div>
                            </div>
                            <div className={styles.cardGlow}></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Dashboard;