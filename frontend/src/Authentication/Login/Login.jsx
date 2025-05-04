import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import './Login.css';
import Cookies from 'js-cookie';

const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        setApiError('');
    };

    const validateForm = () => {
        let formErrors = {};
        
        if (!formData.email) formErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) formErrors.email = 'Email is invalid';
        
        if (!formData.password) formErrors.password = 'Password is required';
        
        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/sat/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Login failed');
            }
            const userData = await response.json();
            Cookies.set('user', JSON.stringify(userData), { expires: 7 }); // Set cookie for 7 days
            
            // Animation before navigation
            setTimeout(() => {
                navigate('/sat');
            }, 500);
            
        } catch (error) {
            console.error('Login error:', error);
            setApiError('Login failed. Please check your credentials and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFocus = (fieldName) => setFocusedField(fieldName);
    const handleBlur = () => setFocusedField(null);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.4 }
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.3,
                delay: 0.3
            } 
        },
        hover: { 
            scale: 1.03,
            boxShadow: "0 10px 20px rgba(59, 130, 246, 0.4)",
            transition: { duration: 0.3 }
        },
        tap: { scale: 0.97 },
        loading: {
            scale: [1, 1.02, 1],
            transition: { repeat: Infinity, duration: 1.5 }
        }
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-gradient"></div>
            </div>

            <motion.div
                className="login-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div className="login-header" variants={itemVariants}>
                    <div className="login-icon-container">
                        <LogIn size={28} />
                    </div>
                    <h2>Welcome Back</h2>
                    <p className="login-subtitle">Log in to your account to continue</p>
                </motion.div>

                {apiError && (
                    <motion.div 
                        className="error-container"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <AlertCircle size={18} />
                        <p className="error-message">{apiError}</p>
                    </motion.div>
                )}

                <motion.form 
                    onSubmit={handleSubmit} 
                    className="login-form"
                    variants={containerVariants}
                >
                    <motion.div 
                        className={`form-group ${focusedField === 'email' ? 'focused' : ''} ${errors.email ? 'error-field' : ''}`}
                        variants={itemVariants}
                    >
                        <label htmlFor="email">
                            <Mail size={18} className="form-icon" />
                            Email
                        </label>
                        <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={() => handleFocus('email')}
                            onBlur={handleBlur}
                            placeholder="Enter your email"
                        />
                        <div className="input-focus-effect"></div>
                        {errors.email && <p className="error">{errors.email}</p>}
                    </motion.div>

                    <motion.div 
                        className={`form-group ${focusedField === 'password' ? 'focused' : ''} ${errors.password ? 'error-field' : ''}`}
                        variants={itemVariants}
                    >
                        <label htmlFor="password">
                            <Lock size={18} className="form-icon" />
                            Password
                        </label>
                        <input 
                            type="password" 
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            onFocus={() => handleFocus('password')}
                            onBlur={handleBlur}
                            placeholder="Enter your password"
                        />
                        <div className="input-focus-effect"></div>
                        {errors.password && <p className="error">{errors.password}</p>}
                    </motion.div>

                    <motion.button 
                        type="submit" 
                        className="login-button"
                        disabled={isLoading}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        animate={isLoading ? "loading" : "visible"}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                        <LogIn size={18} className="button-icon" />
                    </motion.button>

                    <motion.div className="auth-links" variants={itemVariants}>
                        <p className="signup-link">
                            Don't have an account? <Link to="/signup">Sign up</Link>
                        </p>
                    </motion.div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default LoginPage;