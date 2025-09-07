import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

function AdminProtectedRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        async function checkAdminRole() {
            if (!userId) {
                setLoading(false);
                return;
            }

            // Check if userRole is already stored and is admin
            if (userRole === 'admin') {
                setIsAdmin(true);
                setLoading(false);
                return;
            }

            // Fallback: check with API if role is not stored
            try {
                const response = await fetch(`http://localhost:3000/auth/me/${userId}`);
                const data = await response.json();
                setIsAdmin(data.isAdmin);
            } catch (error) {
                console.error('Error checking admin role:', error);
            } finally {
                setLoading(false);
            }
        }

        checkAdminRole();
    }, [userId, userRole]);

    if (!userId) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner
    }

    if (!isAdmin) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default AdminProtectedRoute;
