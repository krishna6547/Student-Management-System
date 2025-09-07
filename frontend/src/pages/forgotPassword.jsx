import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './forgotPassword.module.css';
import Header from '../components/header';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/password/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setStep(2);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/password/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        setStep(3);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:3000/password/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
      } else {
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setNewPassword(value);
    
    if (confirmPassword && value !== confirmPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const { value } = e.target;
    setConfirmPassword(value);
    
    if (newPassword && value !== newPassword) {
      setError('Passwords do not match');
    } else {
      setError('');
    }
  };

  const canProceedToStep3 = () => {
    return newPassword && confirmPassword && 
           validatePassword(newPassword) && 
           newPassword === confirmPassword;
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h1>Forgot Password</h1>
            <p>Reset your password using OTP verification</p>
          </div>

          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <div className={`${styles.step} ${step >= 1 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepText}>Email</span>
            </div>
            <div className={`${styles.step} ${step >= 2 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepText}>OTP</span>
            </div>
            <div className={`${styles.step} ${step >= 3 ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepText}>Password</span>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className={styles.errorMessage}>
              <span>⚠️</span> {error}
            </div>
          )}
          
          {success && (
            <div className={styles.successMessage}>
              <span>✅</span> {success}
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleRequestOTP} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={loading}
                />
              </div>
              
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="otp">Enter OTP</label>
                <div className={styles.otpContainer}>
                  <input
                    type="text"
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                    required
                    disabled={loading}
                    className={styles.otpInput}
                  />
                </div>
                <p className={styles.otpInfo}>
                  We've sent a 6-digit OTP to <strong>{email}</strong>
                </p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="newPassword">New Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    id="newPassword"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={loading}
                  >
                    {showNewPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {newPassword && !validatePassword(newPassword) && (
                  <p className={styles.passwordError}>
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.passwordContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    placeholder="Confirm new password"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className={styles.passwordError}>
                    Passwords do not match
                  </p>
                )}
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={loading || !canProceedToStep3()}
                >
                  {loading ? 'Resetting Password...' : 'Reset Password'}
                </button>
                
                <button 
                  type="button" 
                  className={styles.resendButton}
                  onClick={handleResendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className={styles.successStep}>
              <div className={styles.successIcon}>✅</div>
              <h2>Password Reset Successful!</h2>
              <p>Your password has been reset successfully. You can now login with your new password.</p>
              <p className={styles.redirectInfo}>
                Redirecting to login page in 3 seconds...
              </p>
              <Link to="/login" className={styles.loginLink}>
                Go to Login
              </Link>
            </div>
          )}

          {/* Back to Login */}
          <div className={styles.backToLogin}>
            <Link to="/login" className={styles.backLink}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
