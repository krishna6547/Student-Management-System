import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TeacherHeader.module.css'; // Reuse teacher header styles for now

const StudentHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.teacherHeader}>
      <nav>
        <Link to="/student" className={styles.logoLink}>
          <img
            src="/favicon.png"
            alt="Student Logo"
            className={styles.logoIcon}
          />
          <h1>Student Portal</h1>
        </Link>
        <button
          className={`${styles.menuToggle} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <ul className={isMobileMenuOpen ? styles.active : ''}>
          <li>
            <Link to="/student">Dashboard</Link>
          </li>
          <li>
            <Link to="/student/attendance">Attendance</Link>
          </li>
          <li>
            <Link to="/student/schedule">Schedule</Link>
          </li>
          <li>
            <Link to="/student/grades">Grades</Link>
          </li>
          <li>
            <Link to="/student/fees">Fees</Link>
          </li>
          <li>
            <Link to="/student/profile">Profile</Link>
          </li>
          <li className={styles.logoutItem}>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default StudentHeader;
