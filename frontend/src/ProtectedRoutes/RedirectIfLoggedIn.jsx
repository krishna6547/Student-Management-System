import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

function RedirectIfLoggedIn({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [redirectPath, setRedirectPath] = useState(null);

 useEffect(() => {
  const checkLoginStatus = async () => {
    const userId = localStorage.getItem('user'); // plain string, NOT JSON

    if (!userId) {
      setIsChecking(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/auth/isLoggedIn/${userId}`);
      const data = await res.json();

      console.log('Login check response:', data);

      if (res.ok && data.isLoggedIn) {
        setRedirectPath(`/${data.role}`); // e.g., /admin, /student, etc.
      } else {
        localStorage.removeItem('user');
        setIsChecking(false);
      }
    } catch (error) {
      console.error('Login check failed:', error);
      localStorage.removeItem('user');
      setIsChecking(false);
    }
  };

  checkLoginStatus();
}, []);

  if (redirectPath) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isChecking) {
    return null; // optionally show a spinner
  }

  return children;
}

export default RedirectIfLoggedIn;
