import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./login.module.css";
import Header from "../components/header";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginUser = async (email, password) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      console.log(data); // For debugging

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      return data;
    } catch (error) {
      throw new Error(error.message || 'Network error occurred');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setNotification(null);

    try {
      const result = await loginUser(formData.email, formData.password);
      setNotification({
        type: "success",
        message: result.message || "Login successful! Welcome back."
      });

      // Store user data if needed (consider using context or localStorage carefully)
      if (result.user) {
        localStorage.setItem('userId', result.user.id);
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('userName', result.user.name);
        localStorage.setItem('userEmail', result.user.email);
        // Or better: use a context provider for user state management
      }

      // Reset form
      setFormData({ email: "", password: "" });

      // Redirect after successful login based on user role
      setTimeout(() => {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else if (result.user.role === 'teacher') {
          navigate('/teacher');
        } else if (result.user.role === 'student') {
          navigate('/student');
        } else {
          navigate('/'); // fallback
        }
      }, 1500);
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      // Handle specific error messages from backend
      if (error.message.includes('Email not found')) {
        errorMessage = "No account found with this email address.";
      } else if (error.message.includes('Incorrect password')) {
        errorMessage = "Invalid password. Please try again.";
      } else if (error.message.includes('Network error')) {
        errorMessage = "Connection error. Please check your internet connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setNotification({
        type: "error",
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <div className={styles.loginWrapper}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.loginIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 3H6C4.89543 3 4 3.89543 4 5V19C4 20.1046 4.89543 21 6 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h1 className={styles.loginTitle}>Welcome Back</h1>
              <p className={styles.loginSubtitle}>
                Sign in to your account to continue your journey with us. We're glad to have you back!
              </p>
            </div>

            {notification && (
              <div className={`${styles.notification} ${styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {notification.type === "success" ? (
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
                {notification.message}
              </div>
            )}

            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="email">
                  Email Address
                </label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>
                {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel} htmlFor="password">
                  Password
                </label>
                <div className={styles.inputWrapper}>
                  <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="16" r="1" fill="currentColor" />
                    <path d="M7 11V7A5 5 0 0 1 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={togglePasswordVisibility}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C7 20 2.73 16.39 1 12A18.45 18.45 0 0 1 5.06 5.06L17.94 17.94Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4C17 4 21.27 7.61 23 12A18.5 18.5 0 0 1 19.42 16.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.01 10.01C9.5 10.7 9.5 11.71 10.01 12.42C10.5 13.1 11.33 13.5 12.17 13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && <div className={styles.errorMessage}>{errors.password}</div>}
              </div>

              <div className={styles.formOptions}>
                <div className={styles.rememberMe}>
                  <input type="checkbox" id="remember" className={styles.checkbox} />
                  <label htmlFor="remember" className={styles.checkboxLabel}>
                    Remember me
                  </label>
                </div>
                <Link to="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className={styles.loginBtn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className={styles.animateSpin} width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                      <path d="M4 12A8 8 0 0 1 12 4" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    </svg>
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className={styles.loginFooter}>
              <p className={styles.registerLink}>
                Don't have an account?
                <Link to="/register" className={styles.link}>Create one here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;