import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './TeacherHeader.module.css';

const TeacherHeader = () => {
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
        <Link to="/teacher" className={styles.logoLink}>
          <img
            src="/favicon.png"
            alt="Teacher Logo"
            className={styles.logoIcon}
          />
          <h1>Teacher Panel</h1>
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
            <Link to="/teacher">Dashboard</Link>
          </li>
          <li>
            <Link to="/teacher/attendance">Mark Attendance</Link>
          </li>
          <li>
            <Link to="/teacher/classes">My Classes</Link>
          </li>
          <li>
            <Link to="/teacher/reports">Reports</Link>
          </li>
          <li>
            <Link to="/teacher/profile">Profile</Link>
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

export default TeacherHeader;


