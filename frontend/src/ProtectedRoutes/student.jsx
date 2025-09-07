import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudentProtectedRoute = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAuth = async () => {
            const userId = localStorage.getItem('userId');
            const userRole = localStorage.getItem('userRole');
            
            if (!userId) {
                navigate('/login');
                return;
            }

            // Check if userRole is already stored and is student
            if (userRole === 'student') {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:3000/auth/isLoggedIn/${userId}`);
                const data = await response.json();

                if (data.isLoggedIn && data.role === 'student') {
                    setIsAuthorized(true);
                } else {
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [navigate]);

    if (isLoading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    return isAuthorized ? children : null;
};

export default StudentProtectedRoute;
