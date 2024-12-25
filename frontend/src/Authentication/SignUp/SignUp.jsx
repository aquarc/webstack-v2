import React, { useState } from 'react';
import './SignUp.css';

function SignUpPage() {
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        // Clear any previous API errors when user starts typing
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
        
        // Reset any previous errors
        setErrors({});
        setApiError('');

        // Validate form
        if (!validateForm()) return;

        try {
            // Send registration request
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
                // Handle error response
                const errorText = await response.text();
                setApiError(errorText || 'Registration failed');
                return;
            }

            // Move to verification step
            setVerificationStep(true);
        } catch (error) {
            console.error('Registration error:', error);
            setApiError('Network error. Please try again.');
        }
    };

    const handleVerification = async (e) => {
        e.preventDefault();

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
                return;
            }

            // Verification successful
            alert('Registration complete! You can now log in.');
            // Optional: Redirect to login page or reset form
            setVerificationStep(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Verification error:', error);
            setApiError('Network error. Please try again.');
        }
    };

    // Render registration form
    if (!verificationStep) {
        return (
            <div className="signup-container">
                <form onSubmit={handleSubmit} className="signup-form">
                    <h2>Sign Up</h2>
                    {apiError && <p className="error global-error">{apiError}</p>}
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
                </form>
            </div>
        );
    }

    // Render verification form
    return (
        <div className="signup-container">
            <form onSubmit={handleVerification} className="signup-form">
                <h2>Verify Your Email</h2>
                <p>A verification code has been sent to {formData.email}</p>
                {apiError && <p className="error global-error">{apiError}</p>}
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
}

export default SignUpPage;