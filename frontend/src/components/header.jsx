import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            const storedUserId = localStorage.getItem('user');
            if (!storedUserId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:3000/auth/isLoggedIn/${storedUserId}`);
                const data = await res.json();

                if (res.ok && data.isLoggedIn) {
                    setUser({ id: data.userId, role: data.role });
                } else {
                    localStorage.removeItem('userId');
                }
            } catch (err) {
                console.error('Error checking login:', err);
                localStorage.removeItem('userId');
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        closeMenu();
        navigate('/');
    };

    const panelLink = user?.role ? `/${user.role}` : '/panel';

    if (loading) return null; // or show a loading spinner

    return (
        <header className={styles.header}>
            <nav className={styles.nav}>
                <Link to="/" onClick={closeMenu} className={styles.logoLink}>
                    <img 
                        src="/favicon.png" 
                        alt="School Management Logo" 
                        className={styles.logoIcon}
                    />
                    <h1 className={styles.title}>School Management</h1>
                </Link>

                <button
                    className={`${styles.menuToggle} ${isMenuOpen ? styles.active : ''}`}
                    onClick={toggleMenu}
                    aria-label="Toggle menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`${styles.navList} ${isMenuOpen ? styles.active : ''}`}>
                    <li className={styles.navItem}>
                        <Link to="/" onClick={closeMenu} className={styles.navLink}>
                            <span>Home</span>
                        </Link>
                    </li>

                    {user ? (
                        <>
                            <li className={styles.navItem}>
                                <Link to={panelLink} onClick={closeMenu} className={styles.navLink}>
                                    <span>Panel</span>
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <button className={styles.logoutButton} onClick={handleLogout}>
                                    Logout
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={styles.navItem}>
                                <Link to="/login" onClick={closeMenu} className={styles.navLink}>
                                    <span>Login</span>
                                </Link>
                            </li>
                            <li className={styles.navItem}>
                                <Link to="/register" onClick={closeMenu} className={styles.navLink}>
                                    <span>Register</span>
                                </Link>
                            </li>
                        </>
                    )}

                    <li className={styles.navItem}>
                        <Link to="/about" onClick={closeMenu} className={styles.navLink}>
                            <span>About</span>
                        </Link>
                    </li>
                    <li className={styles.navItem}>
                        <Link to="/contact" onClick={closeMenu} className={styles.navLink}>
                            <span>Contact</span>
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    );
}

export default Header;