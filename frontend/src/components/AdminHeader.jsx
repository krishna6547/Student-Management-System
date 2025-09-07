import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AdminHeader.module.css';

const AdminHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate(); // ✅ Correct placement

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.adminHeader}>
      <nav>
        {/* Logo and Brand Section */}
        <Link to="/admin" className={styles.logoLink}>
          <img
            src="/favicon.png"
            alt="Admin Logo"
            className={styles.logoIcon}
          />
          <h1>Admin Panel</h1>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          className={`${styles.menuToggle} ${isMobileMenuOpen ? styles.active : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Navigation Menu */}
        <ul className={isMobileMenuOpen ? styles.active : ''}>
          <li>
            <Link to="/admin">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/students">Manage Students</Link>
          </li>
          <li>
            <Link to="/admin/teachers">Manage Teachers</Link>
          </li>
          <li>
            <Link to="/admin/subjects">Manage Subjects</Link>
          </li>
          <li>
            <Link to="/admin/classes">Manage Classes</Link>
          </li>
          <li>
            <Link to="/admin/fees">Manage Fees</Link>
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

export default AdminHeader;
