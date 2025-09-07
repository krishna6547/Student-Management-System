import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, School, Upload, Loader2, CheckCircle } from 'lucide-react';
import Header from '../components/header';
import styles from './register.module.css';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    schoolName: '',
    email: '',
    password: '',
    file: null
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file') {
      setIsUploading(true);
      const file = files[0];
      setTimeout(() => {
        setFormData(prev => ({
          ...prev,
          file: file
        }));
        setIsUploading(false);
      }, 2000);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.schoolName.trim()) {
      newErrors.schoolName = 'School name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.file) {
      newErrors.file = 'File is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      console.log('Form submitted:', formData);
      const formdata = new FormData();
      formdata.append('schoolName', formData.schoolName);
      formdata.append('email', formData.email);
      formdata.append('password', formData.password);
      formdata.append('logo', formData.file);

      const res = await fetch('http://localhost:3000/school/add', {
        method: 'POST',
        body: formdata
      });

      if (!res.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await res.json();
      console.log('Server response:', data);

      // Show success notification
      if (data.success) {
        setNotification({ type: 'success', message: 'Registration successful!' });
        setTimeout(() => setNotification(null), 3000);
        navigate('/login');
      }
      else {
        setNotification({ type: 'error', message: data.message || 'Failed to register. Please try again.' });
        setTimeout(() => setNotification(null), 3000);
      }

      // Reset form
      setFormData({
        schoolName: '',
        email: '',
        password: '',
        file: null
      });
      setErrors({});
    } catch (error) {
      console.error('Error submitting form:', error);
      setNotification({ type: 'error', message: 'Failed to register. Please try again.' });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.registerContainer}>
        <div className={styles.registerWrapper}>
          <div className={styles.registerCard}>
            <div className={styles.registerHeader}>
              <div className={styles.registerIcon}>
                <School size={32} />
              </div>
              <h1 className={styles.registerTitle}>Register Your School</h1>
              <p className={styles.registerSubtitle}>Join us and start your journey today</p>
            </div>

            <div className={styles.registerForm}>
              {notification && (
                <div className={`${styles.notification} ${styles[`notification${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}`]}`}>
                  <CheckCircle size={20} />
                  <span>{notification.message}</span>
                </div>
              )}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="schoolName" className={styles.formLabel}>School Name</label>
                  <div className={styles.inputWrapper}>
                    <School className={styles.inputIcon} size={20} />
                    <input
                      type="text"
                      id="schoolName"
                      name="schoolName"
                      value={formData.schoolName}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.schoolName ? styles.error : ''}`}
                      placeholder="Enter your school name"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.schoolName && <span className={styles.errorMessage}>{errors.schoolName}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Admin Email</label>
                  <div className={styles.inputWrapper}>
                    <Mail className={styles.inputIcon} size={20} />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.email ? styles.error : ''}`}
                      placeholder="Enter admin email"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <span className={styles.errorMessage}>{errors.email}</span>}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Admin Password</label>
                  <div className={styles.inputWrapper}>
                    <Lock className={styles.inputIcon} size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${styles.formInput} ${errors.password ? styles.error : ''}`}
                      placeholder="Create a password"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {errors.password && <span className={styles.errorMessage}>{errors.password}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="file" className={styles.formLabel}>Upload Logo</label>
                  <div className={styles.inputWrapper}>
                    <Upload className={styles.inputIcon} size={20} />
                    <input
                      type="file"
                      id="file"
                      name="file"
                      onChange={handleChange}
                      className={styles.formInput}
                      disabled={isLoading}
                    />
                    <label htmlFor="file" className={`${styles.customFileUpload} ${isUploading ? styles.loading : ''}`}>
                      <Upload size={20} />
                      <span className={styles.fileName}>{formData.file ? formData.file.name : 'Choose File'}</span>
                      <div className={styles.loadingCircle}></div>
                    </label>
                  </div>
                  {errors.file && <span className={styles.errorMessage}>{errors.file}</span>}
                </div>
              </div>

              <button
                type="submit"
                className={styles.registerBtn}
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className={styles.animateSpin} size={20} />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>

            <div className={styles.registerFooter}>
              <p className={styles.loginLink}>
                Already have an account?
                <a href="/login" className={styles.link}>Sign in here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;