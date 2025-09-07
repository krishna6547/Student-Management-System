import Header from "../components/header";
import styles from './home.module.css';
import {
    FaGraduationCap,
    FaUsers,
    FaChartLine,
    FaShieldAlt,
    FaCloud,
    FaHeadset
} from 'react-icons/fa';

const Home = () => {
    return (
        <div className={styles.homeContainer}>
            <Header />
            <main className={styles.heroSection}>
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <h1 className={styles.heroTitle}>School Management System</h1>
                        <p className={styles.heroSubtitle}>
                            Your All-in-One Smart Solution for Modern, Efficient, and Paperless Schooling.
                        </p>
                        <button className={styles.purchaseBtn} onClick={() => { window.location.href = "/register" }}>
                            Get started
                        </button>
                    </div>

                    <div className={styles.heroIllustration}>
                        <div className={styles.heroImageContainer}>
                            <img
                                src="/landing.png"
                                alt="School Management System Illustration"
                                className={styles.heroImage}
                            />
                        </div>
                    </div>
                </div>
            </main>

            <section className={styles.whyChooseUs}>
                <div className={styles.container}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Why Choose us</h2>
                        <p className={styles.sectionSubtitle}>
                            Streamline your educational institution with our comprehensive management platform
                        </p>
                    </div>

                    <div className={styles.featuresGrid}>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaGraduationCap size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Complete Academic Management</h3>
                            <p className={styles.featureDescription}>
                                Manage students, teachers, classes, and academic records all in one place. Track attendance, grades, and academic progress seamlessly.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaUsers size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Multi-User Access</h3>
                            <p className={styles.featureDescription}>
                                Role-based access for administrators, teachers, students, and parents. Everyone gets the right information at the right time.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaChartLine size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Advanced Analytics</h3>
                            <p className={styles.featureDescription}>
                                Generate detailed reports on student performance, attendance and institutional metrics to make data-driven decisions.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaShieldAlt size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Secure & Compliant</h3>
                            <p className={styles.featureDescription}>
                                Built with educational data privacy in mind. FERPA compliant with robust security measures to protect sensitive student information.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaCloud size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Cloud-Based Platform</h3>
                            <p className={styles.featureDescription}>
                                Access your school data from anywhere, anytime. Automatic backups, updates, and scalable infrastructure that grows with your school.
                            </p>
                        </div>

                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>
                                <FaHeadset size={40} />
                            </div>
                            <h3 className={styles.featureTitle}>Dedicated Support</h3>
                            <p className={styles.featureDescription}>
                                Our education specialists provide comprehensive training and ongoing support to ensure your school maximizes the system's potential.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;