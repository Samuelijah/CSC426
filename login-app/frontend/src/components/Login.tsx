import React, { useState, ChangeEvent, FormEvent } from 'react';
import apiService from '../services/api.services';
import { User } from '../types/auth.types';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [errors, setErrors] = useState<{
    username?: string;
    password?: string;
    email?: string;
  }>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLogin = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!formData.email.includes('@') || !formData.email.includes('.')) newErrors.email = 'Please enter a valid email address';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setMessage(null);
    
    const isValid = isLoginMode ? validateLogin() : validateSignup();
    if (!isValid) return;
    
    setIsLoading(true);
    
    try {
      let response;
      if (isLoginMode) {
        response = await apiService.login({
          username: formData.username,
          password: formData.password
        });
      } else {
        response = await apiService.register({
          username: formData.username,
          password: formData.password,
          email: formData.email
        });
      }
      
      if (response.success) {
        if (isLoginMode && response.user && response.token) {
          onLogin(response.user, response.token);
        } else {
          setMessage({ type: 'success', text: 'Account created successfully! Please login.' });
          setTimeout(() => {
            setIsLoginMode(true);
            setFormData({ username: '', password: '', email: '' });
            setMessage(null);
          }, 2000);
        }
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'An error occurred' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = (): void => {
    setFormData({ username: '', password: '', email: '' });
    setErrors({});
    setMessage(null);
  };


  return (
    <div className="split-container">
      {/* Left Panel - Welcome Section */}
      <div className="welcome-panel">
        <div className="welcome-content">
          
          <h1>Welcome Back!</h1>
          <p>To keep connected with us please login with your personal info</p>
          {isLoginMode ? (
            <button 
              className="outline-btn" 
              onClick={() => {
                setIsLoginMode(false);
                setMessage(null);
                setErrors({});
              }}
            >
              SIGN UP
            </button>
          ) : (
            <button 
              className="outline-btn" 
              onClick={() => {
                setIsLoginMode(true);
                setMessage(null);
                setErrors({});
              }}
            >
              SIGN IN
            </button>
          )}
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="form-panel">
        <div className="form-content">
          <h2>{isLoginMode ? 'Sign In' : 'Create Account'}</h2>
          <p className="form-subtitle">
            {isLoginMode ? 'or use your account' : 'or use your email for registration'}
          </p>
          
          {message && (
            <div className={`form-message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.username && <span className="error-text">{errors.username}</span>}
            </div>
            
            {!isLoginMode && (
              <div className="input-group">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>
            )}
            
            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
                disabled={isLoading}
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <div className="button-group">
              <button type="submit" className="primary-btn" disabled={isLoading}>
                {isLoading ? 'Processing...' : (isLoginMode ? 'SIGN IN' : 'SIGN UP')}
              </button>
              <button type="button" className="secondary-btn" onClick={handleReset} disabled={isLoading}>
                RESET
              </button>
            </div>
          </form>
          
          {isLoginMode && (
            <div className="demo-creds">
              <p>Demo Credentials:</p>
              <div className="creds-list">
                <span>samuel / password123</span>
                <span>admin / admin123</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;