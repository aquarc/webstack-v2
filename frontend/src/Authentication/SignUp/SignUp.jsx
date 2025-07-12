import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import './SignUp.css';
import GoogleLoginButton from '../../Components/GoogleLoginButton.jsx';
import Cookies from 'js-cookie';

const SignUpPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
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
    const [successMessage, setSuccessMessage] = useState('');

    // Check for OAuth success parameter
    useEffect(() => {
        if (searchParams.get('auth') === 'success') {
            setSuccessMessage('Successfully signed up with Google!');
            setTimeout(() => {
                navigate('/sat');
            }, 2000);
        }
    }, [searchParams, navigate]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setApiError('');

        if (!validateForm()) return;

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
                if (response.status === 409) {
                    setApiError('This email is already registered. Try logging in instead.');
                } else {
                    setApiError(errorText || 'Registration failed');
                }
                return;
            }

            setVerificationStep(true);
        } catch (error) {
            console.error('Registration error:', error);
            setApiError('Network error. Please try again.');
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();

        try {
            // 1. Verify the registration code
            const verifyResponse = await fetch('/sat/verifyRegistration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    code: verificationCode
                })
            });

            if (!verifyResponse.ok) {
                const errorText = await verifyResponse.text();
                setApiError(errorText || 'Verification failed');
                return;
            }

            // 2. Automatically log in after successful verification
            const loginResponse = await fetch('/sat/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                }),
                credentials: 'include'
            });

            if (!loginResponse.ok) {
                const errorText = await loginResponse.text();
                setApiError(errorText || 'Automatic login failed');
                return;
            }

            // 3. Process successful login
            const userData = await loginResponse.json();
            Cookies.set('user', JSON.stringify(userData), { expires: 7 });
            navigate('/sat');

        } catch (error) {
            console.error('Verification error:', error);
            setApiError('Network error. Please try again.');
        }
    };

    if (!verificationStep) {
        return (
            <div className="signup-container">
                <form onSubmit={handleSubmit} className="signup-form">
                    <h2>Sign Up</h2>
                    {successMessage && <p className="success-message">{successMessage}</p>}
                    {apiError && <p className="error api-error">{apiError}</p>}

                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                        />
                        {errors.username && <p className="error">{errors.username}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        {errors.email && <p className="error">{errors.email}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        {errors.password && <p className="error">{errors.password}</p>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                        {errors.confirmPassword && <p className="error">{errors.confirmPassword}</p>}
                    </div>

                    <button type="submit" className="signup-button">Sign Up</button>

                    {/* Google OAuth Button moved below main button */}
                    <div className="oauth-section">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <GoogleLoginButton text="Sign up with Google" />
                    </div>

                    <p className="login-link">
                        Already have an account? <Link to="/login">Login</Link>
                    </p>
                </form>
            </div>
        );
    }

    return (
        <div className="signup-container">
            <form onSubmit={handleVerification} className="signup-form">
                <h2>Verify Your Email</h2>
                <p className="verification-text">A verification code has been sent to {formData.email}</p>
                {apiError && <p className="error api-error">{apiError}</p>}

                <div className="form-group">
                    <label htmlFor="verificationCode">Verification Code</label>
                    <input
                        type="text"
                        id="verificationCode"
                        name="verificationCode"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Enter 7-digit code"
                    />
                </div>

                <button type="submit" className="signup-button">Verify</button>
            </form>
        </div>
    );
};

export default SignUpPage;