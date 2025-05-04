import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, CheckCircle, AlertCircle, UserPlus, Send } from 'lucide-react';
import './SignUp.css';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [verificationStep, setVerificationStep] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [apiError, setApiError] = useState('');
    const [focusedField, setFocusedField] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        if (!formData.username) formErrors.username = 'Username is required';
        if (!formData.email) formErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) formErrors.email = 'Email is invalid';
        
        if (!formData.password) formErrors.password = 'Password is required';
        else if (formData.password.length < 6) formErrors.password = 'Password must be at least 6 characters';
        
        if (formData.password !== formData.confirmPassword) {
            formErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(formErrors);
        return Object.keys(formErrors).length === 0;
    };

    const handleFocus = (fieldName) => setFocusedField(fieldName);
    const handleBlur = () => setFocusedField(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        if (!validateForm()) return;
        
        setIsSubmitting(true);

        try {
            const response = await fetch('/sat/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setApiError(errorText || 'Registration failed');
                setIsSubmitting(false);
                return;
            }

            // Delay to show animation
            setTimeout(() => {
                setVerificationStep(true);
                setIsSubmitting(false);
            }, 500);
            
        } catch (error) {
            console.error('Registration error:', error);
            setApiError('Network error. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/sat/verifyRegistration', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: formData.email,
                    code: verificationCode
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                setApiError(errorText || 'Verification failed');
                setIsSubmitting(false);
                return;
            }

            // Delay to show animation
            setTimeout(() => {
                // Navigate to sat page after successful verification
                navigate('/sat', { state: { username: formData.username } });
            }, 500);
            
        } catch (error) {
            console.error('Verification error:', error);
            setApiError('Network error. Please try again.');
            setIsSubmitting(false);
        }
    };

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
        },
        exit: {
            opacity: 0,
            y: 20,
            transition: { duration: 0.5 }
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

    const codeInputVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { 
            opacity: 1, 
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 300, 
                damping: 15 
            } 
        }
    };

    if (!verificationStep) {
        return (
            <div className="signup-container">
                <div className="signup-background">
                    <div className="signup-gradient"></div>
                </div>

                <motion.div
                    className="signup-card"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div className="signup-header" variants={itemVariants}>
                        <div className="signup-icon-container">
                            <UserPlus size={28} />
                        </div>
                        <h2>Create Account</h2>
                        <p className="signup-subtitle">Join Aquarc to start your college preparation journey</p>
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
                        className="signup-form"
                        variants={containerVariants}
                    >
                        <motion.div 
                            className={`form-group ${focusedField === 'username' ? 'focused' : ''} ${errors.username ? 'error-field' : ''}`}
                            variants={itemVariants}
                        >
                            <label htmlFor="username">
                                <User size={18} className="form-icon" />
                                Username
                            </label>
                            <input 
                                type="text" 
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                onFocus={() => handleFocus('username')}
                                onBlur={handleBlur}
                                placeholder="Choose a username"
                            />
                            <div className="input-focus-effect"></div>
                            {errors.username && <p className="error">{errors.username}</p>}
                        </motion.div>

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
                                placeholder="Create a password"
                            />
                            <div className="input-focus-effect"></div>
                            {errors.password && <p className="error">{errors.password}</p>}
                        </motion.div>

                        <motion.div 
                            className={`form-group ${focusedField === 'confirmPassword' ? 'focused' : ''} ${errors.confirmPassword ? 'error-field' : ''}`}
                            variants={itemVariants}
                        >
                            <label htmlFor="confirmPassword">
                                <CheckCircle size={18} className="form-icon" />
                                Confirm Password
                            </label>
                            <input 
                                type="password" 
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => handleFocus('confirmPassword')}
                                onBlur={handleBlur}
                                placeholder="Confirm your password"
                            />
                            <div className="input-focus-effect"></div>
                            {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                        </motion.div>

                        <motion.button 
                            type="submit" 
                            className="signup-button"
                            disabled={isSubmitting}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            animate={isSubmitting ? "loading" : "visible"}
                        >
                            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                            <UserPlus size={18} className="button-icon" />
                        </motion.button>

                        <motion.div className="auth-links" variants={itemVariants}>
                            <p className="login-link">
                                Already have an account? <Link to="/login">Login</Link>
                            </p>
                        </motion.div>
                    </motion.form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="signup-container verification-container">
            <div className="signup-background">
                <div className="signup-gradient"></div>
            </div>

            <motion.div
                className="signup-card verification-card"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div className="signup-header" variants={itemVariants}>
                    <div className="signup-icon-container verification-icon">
                        <Mail size={28} />
                    </div>
                    <h2>Verify Your Email</h2>
                    <p className="signup-subtitle">
                        We've sent a verification code to <span className="highlight-email">{formData.email}</span>
                    </p>
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
                    onSubmit={handleVerification} 
                    className="signup-form verification-form"
                    variants={containerVariants}
                >
                    <motion.div 
                        className="verification-info"
                        variants={itemVariants}
                    >
                        <p>Enter the 7-digit code we sent to your email to verify your account.</p>
                    </motion.div>

                    <motion.div 
                        className={`form-group ${focusedField === 'verificationCode' ? 'focused' : ''}`}
                        variants={codeInputVariants}
                    >
                        <label htmlFor="verificationCode">
                            <CheckCircle size={18} className="form-icon" />
                            Verification Code
                        </label>
                        <input 
                            type="text" 
                            id="verificationCode"
                            name="verificationCode"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            onFocus={() => handleFocus('verificationCode')}
                            onBlur={handleBlur}
                            placeholder="Enter 7-digit code"
                            maxLength={7}
                            className="verification-input"
                        />
                        <div className="input-focus-effect"></div>
                    </motion.div>

                    <motion.button 
                        type="submit" 
                        className="signup-button verification-button"
                        disabled={isSubmitting || !verificationCode || verificationCode.length < 7}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        animate={isSubmitting ? "loading" : "visible"}
                    >
                        {isSubmitting ? 'Verifying...' : 'Verify Email'}
                        <Send size={18} className="button-icon" />
                    </motion.button>

                    <motion.div 
                        className="resend-code"
                        variants={itemVariants}
                    >
                        <p>Didn't receive a code? <button type="button" className="resend-button">Resend Code</button></p>
                    </motion.div>
                </motion.form>
            </motion.div>
        </div>
    );
};

export default SignUpPage;